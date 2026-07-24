// Single spell penetration entry: PATCH (edit), DELETE.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireCharacter } from '@/lib/tracker/http'
import type { SpellPenEntry } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = ['name', 'bonus', 'notes', 'sort_order'] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params

  // Look up entry to get character_id for auth check
  const { data: entry, error: lookupErr } = await supabase
    .from('spell_pen_entry')
    .select('character_id')
    .eq('id', id)
    .single()
  if (lookupErr || !entry) return notFound('spell_pen_entry')

  const auth = await requireCharacter(entry.character_id as string, 'edit')
  if ('error' in auth) return auth.error

  let body: Partial<SpellPenEntry>
  try {
    body = (await req.json()) as Partial<SpellPenEntry>
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) patch[key] = (body as Record<string, unknown>)[key]
  }
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  const { data, error } = await supabase
    .from('spell_pen_entry')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ spell_pen: data as SpellPenEntry })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params

  // Look up entry to get character_id for auth check
  const { data: entry, error: lookupErr } = await supabase
    .from('spell_pen_entry')
    .select('character_id')
    .eq('id', id)
    .single()
  if (lookupErr || !entry) return notFound('spell_pen_entry')

  const auth = await requireCharacter(entry.character_id as string, 'edit')
  if ('error' in auth) return auth.error

  const { error } = await supabase.from('spell_pen_entry').delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}
