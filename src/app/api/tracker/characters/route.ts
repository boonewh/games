// List / create characters for the current user.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, forbidden, json, requireSession } from '@/lib/tracker/http'
import { isPartyMember } from '@/lib/tracker/auth'
import type { CreateCharacterInput } from '@/lib/tracker/types'

export async function GET() {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('character')
    .select('*')
    .eq('user_id', auth.session.userId)
    .order('name')

  if (error) return fail(error.message)
  return json({ characters: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  let body: CreateCharacterInput
  try {
    body = (await req.json()) as CreateCharacterInput
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')
  if (!Number.isFinite(body.max_hp) || body.max_hp <= 0) {
    return bad('max_hp must be a positive number')
  }

  // Can only file a character under a party you actually belong to.
  if (body.party_id && !(await isPartyMember(auth.session.userId, body.party_id))) {
    return forbidden()
  }

  const { data: character, error } = await supabase
    .from('character')
    .insert({
      user_id: auth.session.userId,
      party_id: body.party_id ?? null,
      campaign_key: body.campaign_key ?? 'wrath',
      name: body.name.trim(),
      class_summary: body.class_summary?.trim() || null,
      level: body.level ?? null,
      max_hp: body.max_hp,
      current_hp: body.max_hp,
      fortification_percent: body.fortification_percent ?? 0,
      ac: body.ac ?? null,
      ac_touch: body.ac_touch ?? null,
      ac_flat_footed: body.ac_flat_footed ?? null,
      spell_dc: body.spell_dc ?? null,
      deity: body.deity ?? null,
      alignment: body.alignment ?? null,
      save_fort: body.save_fort ?? null,
      save_ref: body.save_ref ?? null,
      save_will: body.save_will ?? null,
      cmb: body.cmb ?? null,
      cmd: body.cmd ?? null,
      languages: body.languages ?? null
    })
    .select()
    .single()

  if (error || !character) return fail(error?.message ?? 'insert failed')

  // Nested inserts (best-effort; we don't roll back if these fail — caller can retry the resource)
  if (body.drs?.length) {
    const { error: e } = await supabase.from('damage_reduction').insert(
      body.drs.map((d) => ({ character_id: character.id, amount: d.amount, bypass: d.bypass }))
    )
    if (e) return fail(`drs: ${e.message}`)
  }
  if (body.resistances?.length) {
    const { error: e } = await supabase.from('energy_resistance').insert(
      body.resistances.map((r) => ({
        character_id: character.id,
        energy_type: r.energy_type,
        amount: r.amount
      }))
    )
    if (e) return fail(`resistances: ${e.message}`)
  }
  if (body.vulnerabilities?.length) {
    const { error: e } = await supabase.from('energy_vulnerability').insert(
      body.vulnerabilities.map((v) => ({ character_id: character.id, energy_type: v.energy_type }))
    )
    if (e) return fail(`vulnerabilities: ${e.message}`)
  }
  if (body.seed_abilities?.length) {
    const { error: e } = await supabase.from('ability').insert(
      body.seed_abilities.map((a, idx) => ({
        character_id: character.id,
        name: a.name,
        category: a.category,
        action_type: a.action_type ?? null,
        description: a.description ?? null,
        uses_max: a.uses_max ?? null,
        uses_remaining: a.uses_remaining ?? a.uses_max ?? null,
        recharge: a.recharge ?? null,
        sort_order: a.sort_order ?? (idx + 1) * 10
      }))
    )
    if (e) return fail(`abilities: ${e.message}`)
  }

  if (body.seed_spells?.length) {
    const { error: e } = await supabase.from('spell').insert(
      body.seed_spells.map((s, idx) => ({
        character_id: character.id,
        name: s.name,
        level: s.level,
        casting_class: s.casting_class.toLowerCase(),
        school: s.school?.toLowerCase() ?? null,
        description: s.description ?? null,
        prepared_count: s.prepared_count ?? null,
        sort_order: idx
      }))
    )
    if (e) return fail(`spells: ${e.message}`)
  }

  if (body.seed_pools?.length) {
    const { error: e } = await supabase.from('resource_pool').insert(
      body.seed_pools.map((p, idx) => ({
        character_id: character.id,
        name: p.name,
        points_max: p.points_max,
        points_remaining: p.points_remaining ?? p.points_max,
        recharge: p.recharge ?? null,
        notes: p.notes ?? null,
        sort_order: idx
      }))
    )
    if (e) return fail(`pools: ${e.message}`)
  }

  return json({ character }, { status: 201 })
}
