// Single-character resource: GET (full detail), PATCH (partial update), DELETE.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireCharacter } from '@/lib/tracker/http'
import type { Character, CharacterDetail } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = [
  'name',
  'class_summary',
  'level',
  'max_hp',
  'current_hp',
  'temp_hp',
  'nonlethal',
  'fortification_percent',
  'notes',
  'party_id'
] as const

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  // One round trip: character + every nested defense/ability/condition.
  const { data, error } = await supabase
    .from('character')
    .select(
      `
      *,
      damage_reduction(*),
      energy_resistance(*),
      energy_vulnerability(*),
      ability(*),
      condition(*)
    `
    )
    .eq('id', id)
    .order('sort_order', { referencedTable: 'ability', ascending: true })
    .order('applied_at', { referencedTable: 'condition', ascending: false })
    .single()

  if (error) return fail(error.message)
  if (!data) return notFound('character')

  // Remap nested table names to the CharacterDetail shape.
  const {
    damage_reduction,
    energy_resistance,
    energy_vulnerability,
    ability,
    condition,
    ...character
  } = data as Character & {
    damage_reduction: CharacterDetail['drs']
    energy_resistance: CharacterDetail['resistances']
    energy_vulnerability: CharacterDetail['vulnerabilities']
    ability: CharacterDetail['abilities']
    condition: CharacterDetail['conditions']
  }

  const detail: CharacterDetail = {
    ...character,
    drs: damage_reduction ?? [],
    resistances: energy_resistance ?? [],
    vulnerabilities: energy_vulnerability ?? [],
    abilities: ability ?? [],
    conditions: condition ?? []
  }

  return json({ character: detail })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: Partial<Character>
  try {
    body = (await req.json()) as Partial<Character>
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) patch[key] = (body as Record<string, unknown>)[key]
  }
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  if (typeof patch.fortification_percent === 'number') {
    patch.fortification_percent = Math.max(0, Math.min(100, Math.floor(patch.fortification_percent)))
  }

  const { data, error } = await supabase
    .from('character')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ character: data })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  const { error } = await supabase.from('character').delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}
