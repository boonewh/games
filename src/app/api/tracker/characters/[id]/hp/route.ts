// HP actions on a character. One endpoint, action discriminator in the body.
//   POST { action: 'damage', amount, damage_type, bypasses_dr?, is_crit?, crit_multiplier?, note? }
//   POST { action: 'heal',   amount, note? }
//   POST { action: 'temp_hp', amount }
//   POST { action: 'long_rest' }
//   POST { action: 'undo' }
//
// All actions return { character, message, event? } so the client gets the
// updated character + a human-readable status line in one round trip.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireCharacter } from '@/lib/tracker/http'
import { calculateDamage } from '@/lib/tracker/damage'
import type {
  Character,
  DamageReduction,
  DamageRequest,
  EnergyResistance,
  EnergyVulnerability,
  HpEvent
} from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

type Action =
  | ({ action: 'damage' } & DamageRequest)
  | { action: 'heal'; amount: number; note?: string }
  | { action: 'temp_hp'; amount: number }
  | { action: 'long_rest' }
  | { action: 'undo' }

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: Action
  try {
    body = (await req.json()) as Action
  } catch {
    return bad('invalid JSON body')
  }

  switch (body.action) {
    case 'damage':
      return await handleDamage(id, body)
    case 'heal':
      return await handleHeal(id, body.amount, body.note)
    case 'temp_hp':
      return await handleTempHp(id, body.amount)
    case 'long_rest':
      return await handleLongRest(id)
    case 'undo':
      return await handleUndo(id)
    default:
      return bad(`unknown action: ${(body as { action: string }).action}`)
  }
}

async function handleDamage(characterId: string, request: DamageRequest) {
  if (!Number.isFinite(request.amount) || request.amount < 0) return bad('amount must be a non-negative number')

  // Fetch character + all defenses in one round trip
  const { data, error } = await supabase
    .from('character')
    .select(
      `current_hp, temp_hp, fortification_percent, max_hp,
       damage_reduction(*),
       energy_resistance(*),
       energy_vulnerability(*)`
    )
    .eq('id', characterId)
    .single()

  if (error) return fail(error.message)
  if (!data) return notFound('character')

  const ctxData = data as {
    current_hp: number
    temp_hp: number
    fortification_percent: number
    max_hp: number
    damage_reduction: DamageReduction[]
    energy_resistance: EnergyResistance[]
    energy_vulnerability: EnergyVulnerability[]
  }

  const result = calculateDamage(request, {
    character: ctxData,
    drs: ctxData.damage_reduction ?? [],
    resistances: ctxData.energy_resistance ?? [],
    vulnerabilities: ctxData.energy_vulnerability ?? []
  })

  // Update character + insert event in parallel
  const [{ data: updated, error: updateErr }, { data: event, error: insertErr }] = await Promise.all([
    supabase
      .from('character')
      .update({ current_hp: result.newCurrentHp, temp_hp: result.newTempHp })
      .eq('id', characterId)
      .select()
      .single(),
    supabase
      .from('hp_event')
      .insert({
        character_id: characterId,
        kind: 'damage',
        raw_amount: result.breakdown.raw,
        applied_amount: result.breakdown.applied,
        damage_type: request.damage_type,
        dr_applied: result.breakdown.dr_applied,
        temp_consumed: result.breakdown.temp_consumed,
        note: result.noteSummary
      })
      .select()
      .single()
  ])

  if (updateErr) return fail(`update: ${updateErr.message}`)
  if (insertErr) return fail(`event: ${insertErr.message}`)

  return json({
    character: updated as Character,
    event: event as HpEvent,
    message: result.message,
    breakdown: result.breakdown
  })
}

async function handleHeal(characterId: string, amount: number, note?: string) {
  if (!Number.isFinite(amount) || amount < 0) return bad('amount must be a non-negative number')

  const { data: character, error } = await supabase
    .from('character')
    .select('current_hp, max_hp')
    .eq('id', characterId)
    .single()
  if (error) return fail(error.message)
  if (!character) return notFound('character')

  const raw = Math.floor(amount)
  const room = Math.max(0, character.max_hp - character.current_hp)
  const applied = Math.min(raw, room)
  const newCurrent = character.current_hp + applied

  const [{ data: updated, error: updateErr }, { data: event, error: insertErr }] = await Promise.all([
    supabase
      .from('character')
      .update({ current_hp: newCurrent })
      .eq('id', characterId)
      .select()
      .single(),
    supabase
      .from('hp_event')
      .insert({
        character_id: characterId,
        kind: 'heal',
        raw_amount: raw,
        applied_amount: applied,
        damage_type: null,
        dr_applied: 0,
        note: note ?? null
      })
      .select()
      .single()
  ])

  if (updateErr) return fail(`update: ${updateErr.message}`)
  if (insertErr) return fail(`event: ${insertErr.message}`)

  const message = raw === applied ? `Healed ${applied} HP.` : `Healed ${applied} HP (capped at max).`
  return json({ character: updated as Character, event: event as HpEvent, message })
}

async function handleTempHp(characterId: string, amount: number) {
  if (!Number.isFinite(amount) || amount < 0) return bad('amount must be a non-negative number')

  const value = Math.floor(amount)

  const { data: character, error } = await supabase
    .from('character')
    .select('temp_hp')
    .eq('id', characterId)
    .single()
  if (error) return fail(error.message)
  if (!character) return notFound('character')

  const delta = value - character.temp_hp

  const [{ data: updated, error: updateErr }, { data: event, error: insertErr }] = await Promise.all([
    supabase
      .from('character')
      .update({ temp_hp: value })
      .eq('id', characterId)
      .select()
      .single(),
    supabase
      .from('hp_event')
      .insert({
        character_id: characterId,
        kind: 'temp_hp',
        raw_amount: value,
        applied_amount: delta,
        damage_type: null,
        dr_applied: 0,
        note: null
      })
      .select()
      .single()
  ])

  if (updateErr) return fail(`update: ${updateErr.message}`)
  if (insertErr) return fail(`event: ${insertErr.message}`)

  return json({ character: updated as Character, event: event as HpEvent, message: `Temp HP set to ${value}.` })
}

async function handleLongRest(characterId: string) {
  const { data: updated, error: updateErr } = await supabase
    .from('character')
    .update({ nonlethal: 0 })
    .eq('id', characterId)
    .select()
    .single()
  if (updateErr) return fail(`update: ${updateErr.message}`)

  // Reset per-day uses to their max via a select-then-loop pattern.
  // (Supabase-js doesn't expose Postgres' column-self-reference for a single
  // UPDATE ability SET uses_remaining = uses_max, so we read and PATCH each.)
  const { data: perDayAbilities } = await supabase
    .from('ability')
    .select('id, uses_max')
    .eq('character_id', characterId)
    .eq('recharge', 'per_day')
    .not('uses_max', 'is', null)

  let abilityCount = 0
  if (perDayAbilities?.length) {
    for (const a of perDayAbilities) {
      await supabase.from('ability').update({ uses_remaining: a.uses_max }).eq('id', a.id)
    }
    abilityCount = perDayAbilities.length
  }

  // Also reset per-day resource pools to their max.
  const { data: perDayPools } = await supabase
    .from('resource_pool')
    .select('id, points_max')
    .eq('character_id', characterId)
    .eq('recharge', 'per_day')

  let poolCount = 0
  if (perDayPools?.length) {
    for (const p of perDayPools) {
      await supabase.from('resource_pool').update({ points_remaining: p.points_max }).eq('id', p.id)
    }
    poolCount = perDayPools.length
  }

  // Also reset cast_count to 0 on any spells that have been cast (prepared casters).
  const { data: castSpells } = await supabase
    .from('spell')
    .select('id')
    .eq('character_id', characterId)
    .gt('cast_count', 0)

  let spellCastCount = 0
  if (castSpells?.length) {
    await supabase
      .from('spell')
      .update({ cast_count: 0 })
      .eq('character_id', characterId)
      .gt('cast_count', 0)
    spellCastCount = castSpells.length
  }

  const { data: event, error: insertErr } = await supabase
    .from('hp_event')
    .insert({
      character_id: characterId,
      kind: 'rest',
      raw_amount: 0,
      applied_amount: 0,
      damage_type: null,
      dr_applied: 0,
      note: 'long rest'
    })
    .select()
    .single()
  if (insertErr) return fail(`event: ${insertErr.message}`)

  const summary = [
    `Long rest: cleared nonlethal`,
    abilityCount > 0 && `reset ${abilityCount} per-day abilities`,
    poolCount > 0 && `reset ${poolCount} per-day pools`,
    spellCastCount > 0 && `reset ${spellCastCount} spell casts`
  ]
    .filter(Boolean)
    .join(', ') + '.'

  return json({
    character: updated as Character,
    event: event as HpEvent,
    message: summary
  })
}

async function handleUndo(characterId: string) {
  // Most recent non-undo event
  const { data: last, error: findErr } = await supabase
    .from('hp_event')
    .select('*')
    .eq('character_id', characterId)
    .neq('kind', 'undo')
    .order('ts', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (findErr) return fail(findErr.message)

  const { data: character, error: charErr } = await supabase
    .from('character')
    .select('*')
    .eq('id', characterId)
    .single()
  if (charErr || !character) return fail(charErr?.message ?? 'character missing')

  if (!last) {
    return json({ character, event: null, message: 'Nothing to undo.' })
  }
  if (last.kind === 'rest') {
    return json({ character, event: null, message: 'Long rest cannot be undone automatically.' })
  }

  // Has this event already been undone?
  const { data: already } = await supabase
    .from('hp_event')
    .select('id')
    .eq('character_id', characterId)
    .eq('kind', 'undo')
    .eq('note', String(last.id))
    .maybeSingle()
  if (already) {
    return json({ character, event: null, message: 'Last event was already undone.' })
  }

  let newCurrent = character.current_hp
  let newTemp = character.temp_hp
  if (last.kind === 'damage') {
    // Damage hit temp HP first, then current. Restore each pool by the amount it lost:
    // temp absorbed `temp_consumed`, current took the rest (`applied_amount - temp_consumed`).
    const tempConsumed = last.temp_consumed ?? 0
    newCurrent += last.applied_amount - tempConsumed
    newTemp += tempConsumed
  } else if (last.kind === 'heal') newCurrent -= last.applied_amount
  else if (last.kind === 'temp_hp') newTemp -= last.applied_amount

  const [{ data: updated, error: updateErr }, { data: undoEvent, error: insertErr }] = await Promise.all([
    supabase
      .from('character')
      .update({ current_hp: newCurrent, temp_hp: newTemp })
      .eq('id', characterId)
      .select()
      .single(),
    supabase
      .from('hp_event')
      .insert({
        character_id: characterId,
        kind: 'undo',
        raw_amount: 0,
        applied_amount: 0,
        damage_type: null,
        dr_applied: 0,
        note: String(last.id)
      })
      .select()
      .single()
  ])

  if (updateErr) return fail(`update: ${updateErr.message}`)
  if (insertErr) return fail(`event: ${insertErr.message}`)

  return json({
    character: updated as Character,
    event: undoEvent as HpEvent,
    undone: last,
    message: `Undid last ${last.kind}.`
  })
}
