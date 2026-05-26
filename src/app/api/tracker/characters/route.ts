// Vertical-slice API: list + create characters for the current user.
// All other tracker routes will follow the same shape:
//   1. resolve NextAuth session via getTrackerSession()
//   2. ensure user_profile row exists
//   3. authorize the action
//   4. talk to Supabase with the service-role client

import { NextRequest, NextResponse } from 'next/server'
import { ensureUserProfile, getTrackerSession } from '@/lib/tracker/auth'
import { supabase } from '@/lib/supabase'
import type { CreateCharacterInput } from '@/lib/tracker/types'

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function fail(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET() {
  const session = await getTrackerSession()
  if (!session) return unauthorized()
  await ensureUserProfile(session)

  const { data, error } = await supabase
    .from('character')
    .select('*')
    .eq('user_id', session.userId)
    .order('name')

  if (error) return fail(error.message)
  return NextResponse.json({ characters: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await getTrackerSession()
  if (!session) return unauthorized()
  await ensureUserProfile(session)

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

  const { data: character, error } = await supabase
    .from('character')
    .insert({
      user_id: session.userId,
      party_id: body.party_id ?? null,
      campaign_key: body.campaign_key ?? 'wrath',
      name: body.name.trim(),
      class_summary: body.class_summary?.trim() || null,
      level: body.level ?? null,
      max_hp: body.max_hp,
      current_hp: body.max_hp,
      fortification_percent: body.fortification_percent ?? 0
    })
    .select()
    .single()

  if (error || !character) return fail(error?.message ?? 'insert failed')

  // Nested inserts (DRs / resistances / vulnerabilities / seed abilities) follow.
  if (body.drs?.length) {
    const { error: e } = await supabase.from('damage_reduction').insert(
      body.drs.map((d) => ({
        character_id: character.id,
        amount: d.amount,
        bypass: d.bypass
      }))
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
      body.vulnerabilities.map((v) => ({
        character_id: character.id,
        energy_type: v.energy_type
      }))
    )
    if (e) return fail(`vulnerabilities: ${e.message}`)
  }

  if (body.seed_abilities?.length) {
    const { error: e } = await supabase.from('ability').insert(
      body.seed_abilities.map((a) => ({
        character_id: character.id,
        name: a.name,
        category: a.category,
        action_type: a.action_type ?? null,
        description: a.description ?? null,
        uses_max: a.uses_max ?? null,
        uses_remaining: a.uses_remaining ?? a.uses_max ?? null,
        recharge: a.recharge ?? null,
        sort_order: a.sort_order ?? 0
      }))
    )
    if (e) return fail(`abilities: ${e.message}`)
  }

  return NextResponse.json({ character }, { status: 201 })
}
