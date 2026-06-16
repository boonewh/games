// Single-character resource: GET (full detail), PATCH (partial update), DELETE.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, forbidden, json, notFound, requireCharacter } from '@/lib/tracker/http'
import { isPartyMember } from '@/lib/tracker/auth'
import type { AbilitySection, Character, CharacterDetail, SpellDcEntry } from '@/lib/tracker/types'

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
  'ac',
  'ac_touch',
  'ac_flat_footed',
  'spell_dc',
  'mythic_path',
  'mythic_tier',
  'deity',
  'alignment',
  'save_fort',
  'save_ref',
  'save_will',
  'cmb',
  'cmd',
  'languages',
  'notes',
  'party_id'
] as const

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  // One round trip: character + every nested defense/ability/condition/pool/spell.
  const { data, error } = await supabase
    .from('character')
    .select(
      `
      *,
      damage_reduction(*),
      energy_resistance(*),
      energy_vulnerability(*),
      ability_section(*),
      ability(*),
      condition(*),
      resource_pool(*),
      spell(*),
      spell_dc_entry(*)
    `
    )
    .eq('id', id)
    .order('sort_order', { referencedTable: 'ability_section', ascending: true })
    .order('sort_order', { referencedTable: 'ability', ascending: true })
    .order('applied_at', { referencedTable: 'condition', ascending: false })
    .order('sort_order', { referencedTable: 'resource_pool', ascending: true })
    .order('level', { referencedTable: 'spell', ascending: true })
    .order('name', { referencedTable: 'spell', ascending: true })
    .order('sort_order', { referencedTable: 'spell_dc_entry', ascending: true })
    .single()

  if (error) return fail(error.message)
  if (!data) return notFound('character')

  // Remap nested table names to the CharacterDetail shape.
  const {
    damage_reduction,
    energy_resistance,
    energy_vulnerability,
    ability_section,
    ability,
    condition,
    resource_pool,
    spell,
    spell_dc_entry,
    ...character
  } = data as Character & {
    damage_reduction: CharacterDetail['drs']
    energy_resistance: CharacterDetail['resistances']
    energy_vulnerability: CharacterDetail['vulnerabilities']
    ability_section: AbilitySection[]
    ability: CharacterDetail['abilities']
    condition: CharacterDetail['conditions']
    resource_pool: CharacterDetail['pools']
    spell: CharacterDetail['spells']
    spell_dc_entry: SpellDcEntry[]
  }

  const detail: CharacterDetail = {
    ...character,
    drs: damage_reduction ?? [],
    resistances: energy_resistance ?? [],
    vulnerabilities: energy_vulnerability ?? [],
    sections: ability_section ?? [],
    abilities: ability ?? [],
    conditions: condition ?? [],
    pools: resource_pool ?? [],
    spells: spell ?? [],
    spell_dc_entries: spell_dc_entry ?? []
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

  // Reassigning into a party requires membership; clearing it (null) is always allowed.
  if (patch.party_id && !(await isPartyMember(auth.session.userId, patch.party_id as string))) {
    return forbidden()
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
