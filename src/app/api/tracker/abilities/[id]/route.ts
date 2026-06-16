// Single-ability resource: PATCH (edit fields), DELETE, POST (spend/restore/reset).

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, deleteRow, fail, json, notFound, requireChildOfCharacter, updateRow } from '@/lib/tracker/http'
import type { Ability } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = [
  'name',
  'category',
  'action_type',
  'description',
  'uses_max',
  'uses_remaining',
  'recharge',
  'enabled',
  'hidden',
  'sort_order',
  'section_id'
] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('ability', id, 'edit')
  if ('error' in auth) return auth.error

  const res = await updateRow<Ability>('ability', id, req, EDITABLE_FIELDS)
  if ('error' in res) return res.error
  return json({ ability: res.data })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('ability', id, 'edit')
  if ('error' in auth) return auth.error

  return deleteRow('ability', id)
}

interface ActionBody {
  action: 'spend' | 'restore' | 'reset'
  delta?: number
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('ability', id, 'edit')
  if ('error' in auth) return auth.error

  let body: ActionBody
  try {
    body = (await req.json()) as ActionBody
  } catch {
    return bad('invalid JSON body')
  }

  const { data: current, error: getErr } = await supabase
    .from('ability')
    .select('*')
    .eq('id', id)
    .single()
  if (getErr) return fail(getErr.message)
  if (!current) return notFound('ability')

  const ability = current as Ability
  if (ability.uses_max == null && body.action !== 'reset') {
    return json({ ability })
  }

  const delta = Math.max(1, Math.floor(body.delta ?? 1))
  let next = ability.uses_remaining ?? ability.uses_max ?? 0

  if (body.action === 'spend') {
    next = Math.max(0, next - delta)
  } else if (body.action === 'restore') {
    if (ability.uses_max == null) return json({ ability })
    next = Math.min(ability.uses_max, next + delta)
  } else if (body.action === 'reset') {
    if (ability.uses_max == null) return json({ ability })
    next = ability.uses_max
  } else {
    return bad(`unknown action: ${body.action}`)
  }

  const { data, error } = await supabase
    .from('ability')
    .update({ uses_remaining: next })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ ability: data as Ability })
}
