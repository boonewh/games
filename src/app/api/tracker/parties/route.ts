// Create a party (caller becomes GM) + list parties the caller is involved in.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireSession } from '@/lib/tracker/http'
import type { Party } from '@/lib/tracker/types'

interface CreatePartyBody {
  name: string
  campaign_key?: string
}

function generateInviteCode(): string {
  // 8 hex chars from a random UUID — ~32 bits of entropy, plenty for friend groups
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

export async function GET() {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  // Parties I'm GM of OR a member of
  const { data: gmParties, error: gmErr } = await supabase
    .from('party')
    .select('*')
    .eq('gm_user_id', auth.session.userId)
  if (gmErr) return fail(gmErr.message)

  const { data: memberships, error: memErr } = await supabase
    .from('party_member')
    .select('party_id, party(*)')
    .eq('user_id', auth.session.userId)
  if (memErr) return fail(memErr.message)

  // Supabase types the nested `party` as an array (since FK relationships are
  // generically many-to-many in the typegen), but at runtime it's a single
  // object because party_id is a single FK. Cast through unknown per the
  // Supabase error suggestion.
  const memberParties: Party[] = (memberships ?? [])
    .map((m) => (m as unknown as { party: Party | null }).party)
    .filter((p): p is Party => p != null)

  // Merge and dedupe by id
  const all = new Map<string, Party>()
  for (const p of gmParties ?? []) all.set(p.id, p as Party)
  for (const p of memberParties) all.set(p.id, p)

  return json({ parties: Array.from(all.values()) })
}

export async function POST(req: NextRequest) {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  let body: CreatePartyBody
  try {
    body = (await req.json()) as CreatePartyBody
  } catch {
    return bad('invalid JSON body')
  }
  if (!body.name?.trim()) return bad('name is required')

  // Generate a unique invite code; retry once on collision
  let code = generateInviteCode()
  for (let i = 0; i < 3; i++) {
    const { data: existing } = await supabase.from('party').select('id').eq('invite_code', code).maybeSingle()
    if (!existing) break
    code = generateInviteCode()
  }

  const { data: party, error } = await supabase
    .from('party')
    .insert({
      name: body.name.trim(),
      campaign_key: body.campaign_key ?? 'wrath',
      gm_user_id: auth.session.userId,
      invite_code: code
    })
    .select()
    .single()
  if (error || !party) return fail(error?.message ?? 'insert failed')

  // GM is also a member
  await supabase.from('party_member').insert({ party_id: party.id, user_id: auth.session.userId })

  return json({ party: party as Party }, { status: 201 })
}
