// DM's private note for a character. Writable ONLY by the party GM (not the
// character's own player). The note is read back via the GM dashboard payload,
// which is itself GM-gated — there is no player-facing read path.
//   PUT { body: string }   — upsert (empty string clears it)

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, forbidden, json, requireSession } from '@/lib/tracker/http'
import { isPartyGmOfCharacter } from '@/lib/tracker/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireSession()
  if ('error' in auth) return auth.error
  if (!(await isPartyGmOfCharacter(auth.session.userId, id))) return forbidden()

  let body: { body?: unknown }
  try {
    body = (await req.json()) as { body?: unknown }
  } catch {
    return bad('invalid JSON body')
  }
  const text = typeof body.body === 'string' ? body.body : ''

  const { error } = await supabase
    .from('gm_note')
    .upsert(
      { character_id: id, body: text, updated_at: new Date().toISOString() },
      { onConflict: 'character_id' }
    )
  if (error) return fail(error.message)

  return json({ ok: true })
}
