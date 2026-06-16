// Rename or delete a single ability section.
// Abilities in a deleted section get section_id = null (ON DELETE SET NULL).

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireCharacter } from '@/lib/tracker/http'
import type { AbilitySection } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string; sectionId: string }> }

async function resolveSection(id: string, sectionId: string) {
  const { data, error } = await supabase
    .from('ability_section')
    .select('*')
    .eq('id', sectionId)
    .eq('character_id', id)
    .maybeSingle()
  if (error) return { error: fail(error.message) }
  if (!data) return { error: notFound('section') }
  return { section: data as AbilitySection }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id, sectionId } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  const resolved = await resolveSection(id, sectionId)
  if ('error' in resolved) return resolved.error

  let body: { name?: string; sort_order?: number }
  try {
    body = (await req.json()) as { name?: string; sort_order?: number }
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  if (body.name != null) {
    if (!body.name.trim()) return bad('name cannot be blank')
    patch.name = body.name.trim()
  }
  if (body.sort_order != null) patch.sort_order = body.sort_order
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  const { data, error } = await supabase
    .from('ability_section')
    .update(patch)
    .eq('id', sectionId)
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ section: data as AbilitySection })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id, sectionId } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  const resolved = await resolveSection(id, sectionId)
  if ('error' in resolved) return resolved.error

  const { error } = await supabase.from('ability_section').delete().eq('id', sectionId)
  if (error) return fail(error.message)
  return json({ ok: true })
}
