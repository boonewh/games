// Read / edit / delete a single party.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, forbidden, json, notFound, requireSession } from '@/lib/tracker/http'
import type { Party } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  const { data: party, error } = await supabase.from('party').select('*').eq('id', id).maybeSingle()
  if (error) return fail(error.message)
  if (!party) return notFound('party')

  // Caller must be GM or a member to view
  const userId = auth.session.userId
  if (party.gm_user_id !== userId) {
    const { data: membership } = await supabase
      .from('party_member')
      .select('party_id')
      .eq('party_id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (!membership) return forbidden()
  }

  const { data: members } = await supabase.from('party_member').select('user_id, joined_at').eq('party_id', id)
  return json({ party: party as Party, members: members ?? [] })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  const { data: party } = await supabase.from('party').select('gm_user_id').eq('id', id).maybeSingle()
  if (!party) return notFound('party')
  if (party.gm_user_id !== auth.session.userId) return forbidden()

  let body: Partial<Party>
  try {
    body = (await req.json()) as Partial<Party>
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  if ('name' in body && body.name) patch.name = body.name
  if ('campaign_key' in body && body.campaign_key) patch.campaign_key = body.campaign_key
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  const { data, error } = await supabase.from('party').update(patch).eq('id', id).select().single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ party: data as Party })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  const { data: party } = await supabase.from('party').select('gm_user_id').eq('id', id).maybeSingle()
  if (!party) return notFound('party')
  if (party.gm_user_id !== auth.session.userId) return forbidden()

  const { error } = await supabase.from('party').delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}
