// Tiny HTTP helpers shared across tracker API routes.

import { NextResponse } from 'next/server'
import { canEditCharacter, canViewCharacter, ensureUserProfile, getTrackerSession, type TrackerSession } from './auth'

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
