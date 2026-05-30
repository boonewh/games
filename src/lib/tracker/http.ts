// Tiny HTTP helpers shared across tracker API routes.

import { NextRequest, NextResponse } from 'next/server'
import { canEditCharacter, canViewCharacter, ensureUserProfile, getTrackerSession, type TrackerSession } from './auth'

/** Tables that expose the standard whitelist-PATCH / DELETE shape. */
type ChildTable =
  | 'ability'
  | 'condition'
  | 'resource_pool'
  | 'spell'

export const json = NextResponse.json

export const unauthorized = () => json({ error: 'unauthorized' }, { status: 401 })
export const forbidden = () => json({ error: 'forbidden' }, { status: 403 })
export const notFound = (what = 'not found') => json({ error: what }, { status: 404 })
export const bad = (msg: string) => json({ error: msg }, { status: 400 })
export const fail = (msg: string) => json({ error: msg }, { status: 500 })

/**
 * Resolve session + ensure profile + check ownership for a character resource.
 * Returns either `{ session }` on success or `{ error }` (a ready-to-return NextResponse).
 *
 * Pattern in route handlers:
 *
 *   const auth = await requireCharacter(id, 'edit')
 *   if ('error' in auth) return auth.error
 *   const { session } = auth
 *   // ...do the work...
 */
export async function requireCharacter(
  characterId: string,
  mode: 'view' | 'edit'
): Promise<{ session: TrackerSession } | { error: NextResponse }> {
  const session = await getTrackerSession()
  if (!session) return { error: unauthorized() }
  await ensureUserProfile(session)
  const allowed =
    mode === 'edit'
      ? await canEditCharacter(session.userId, characterId)
      : await canViewCharacter(session.userId, characterId)
  if (!allowed) return { error: forbidden() }
  return { session }
}

/**
 * Resolve session + ensure profile (no character ownership check).
 * For endpoints that aren't tied to a specific character (party create, list mine, etc).
 */
export async function requireSession(): Promise<
  { session: TrackerSession } | { error: NextResponse }
> {
  const session = await getTrackerSession()
  if (!session) return { error: unauthorized() }
  await ensureUserProfile(session)
  return { session }
}

/**
 * Authorize an action on a resource that lives under a character (ability, condition, etc).
 * Looks up the resource's character_id, then runs the standard character access check.
 */
export async function requireChildOfCharacter(
  table:
    | 'ability'
    | 'condition'
    | 'damage_reduction'
    | 'energy_resistance'
    | 'energy_vulnerability'
    | 'resource_pool'
    | 'spell',
  resourceId: string,
  mode: 'view' | 'edit'
): Promise<{ session: TrackerSession; characterId: string } | { error: NextResponse }> {
  const { supabase } = await import('@/lib/supabase')
  const { data, error } = await supabase
    .from(table)
    .select('character_id')
    .eq('id', resourceId)
    .maybeSingle()
  if (error) return { error: fail(error.message) }
  if (!data) return { error: notFound(table) }

  const auth = await requireCharacter(data.character_id, mode)
  if ('error' in auth) return { error: auth.error }
  return { session: auth.session, characterId: data.character_id }
}

/**
 * Standard whitelist-PATCH for a child resource: parse the JSON body, copy only
 * `editableFields` onto the patch, reject an empty patch, and apply it.
 * Caller is responsible for auth (run `requireChildOfCharacter` first) and for
 * wrapping the returned row in its own response envelope.
 */
export async function updateRow<T>(
  table: ChildTable,
  id: string,
  req: NextRequest,
  editableFields: readonly string[]
): Promise<{ data: T } | { error: NextResponse }> {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return { error: bad('invalid JSON body') }
  }

  const patch: Record<string, unknown> = {}
  for (const key of editableFields) {
    if (key in body) patch[key] = body[key]
  }
  if (Object.keys(patch).length === 0) return { error: bad('no editable fields supplied') }

  const { supabase } = await import('@/lib/supabase')
  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single()
  if (error || !data) return { error: fail(error?.message ?? 'update failed') }
  return { data: data as T }
}

/**
 * Standard hard-DELETE for a child resource by id. Caller handles auth first.
 * Returns a ready-to-return response (`{ ok: true }` or a 500).
 */
export async function deleteRow(table: ChildTable, id: string): Promise<NextResponse> {
  const { supabase } = await import('@/lib/supabase')
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}
