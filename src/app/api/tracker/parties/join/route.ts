// Join a party by invite code.
//   POST { code: "abc12345" }

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireSession } from '@/lib/tracker/http'

interface JoinBody {
  code: string
}

export async function POST(req: NextRequest) {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  let body: JoinBody
  try {
    body = (await req.json()) as JoinBody
  } catch {
    return bad('invalid JSON body')
  }
  if (!body.code?.trim()) return bad('code is required')

  const { data: party, error } = await supabase
    .from('party')
    .select('id, name, campaign_key, gm_user_id')
    .eq('invite_code', body.code.trim())
    .maybeSingle()
  if (error) return fail(error.message)
  if (!party) return notFound('party (invalid invite code)')

  const { error: insertErr } = await supabase
    .from('party_member')
    .upsert(
      { party_id: party.id, user_id: auth.session.userId },
      { onConflict: 'party_id,user_id', ignoreDuplicates: true }
    )
  if (insertErr) return fail(insertErr.message)

  return json({ party })
}
