// GM dashboard payload: every party member's character(s) with HP, defenses,
// and current conditions — everything a GM needs at-a-glance during play.
// Only the party's GM may call this endpoint.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fail, forbidden, json, notFound, requireSession } from '@/lib/tracker/http'
import type { Character, Condition } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface DashboardCharacter extends Character {
  conditions: Condition[]
  drs_label: string | null
  fortification_label: string | null
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  const { data: party, error: pErr } = await supabase
    .from('party')
    .select('id, name, campaign_key, gm_user_id')
    .eq('id', id)
    .maybeSingle()
  if (pErr) return fail(pErr.message)
  if (!party) return notFound('party')
  if (party.gm_user_id !== auth.session.userId) return forbidden()

  // All characters belonging to this party
  const { data: characters, error: cErr } = await supabase
    .from('character')
    .select(
      `*,
       damage_reduction(amount, bypass, enabled),
       condition(*)
      `
    )
    .eq('party_id', id)
    .order('name')
  if (cErr) return fail(cErr.message)

  const rows: DashboardCharacter[] = (characters ?? []).map((c) => {
    const drs = ((c as { damage_reduction: { amount: number; bypass: string; enabled: boolean }[] }).damage_reduction ?? []).filter((d) => d.enabled)
    const drsLabel = drs.length > 0 ? drs.map((d) => `DR ${d.amount}/${d.bypass}`).join(', ') : null
    const fortLabel = c.fortification_percent > 0 ? `${c.fortification_percent}% fort` : null
    return {
      ...(c as Character),
      conditions: (c as { condition: Condition[] }).condition ?? [],
      drs_label: drsLabel,
      fortification_label: fortLabel
    }
  })

  return json({ party, characters: rows })
}
