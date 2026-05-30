// Single-pool resource: PATCH (edit), DELETE, POST (spend/restore/reset).

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, deleteRow, fail, json, notFound, requireChildOfCharacter, updateRow } from '@/lib/tracker/http'
import type { ResourcePool } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = [
  'name',
  'points_max',
  'points_remaining',
  'recharge',
  'notes',
  'sort_order'
] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('resource_pool', id, 'edit')
  if ('error' in auth) return auth.error

  const res = await updateRow<ResourcePool>('resource_pool', id, req, EDITABLE_FIELDS)
  if ('error' in res) return res.error
  return json({ pool: res.data })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('resource_pool', id, 'edit')
  if ('error' in auth) return auth.error

  return deleteRow('resource_pool', id)
}

interface ActionBody {
  action: 'spend' | 'restore' | 'reset'
  delta?: number
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('resource_pool', id, 'edit')
  if ('error' in auth) return auth.error

  let body: ActionBody
  try {
    body = (await req.json()) as ActionBody
  } catch {
    return bad('invalid JSON body')
  }

  const { data: current, error: getErr } = await supabase
    .from('resource_pool')
    .select('*')
    .eq('id', id)
    .single()
  if (getErr) return fail(getErr.message)
  if (!current) return notFound('pool')

  const pool = current as ResourcePool
  const delta = Math.max(1, Math.floor(body.delta ?? 1))
  let next = pool.points_remaining

  if (body.action === 'spend') {
    next = Math.max(0, next - delta)
  } else if (body.action === 'restore') {
    next = Math.min(pool.points_max, next + delta)
  } else if (body.action === 'reset') {
    next = pool.points_max
  } else {
    return bad(`unknown action: ${body.action}`)
  }

  const { data, error } = await supabase
    .from('resource_pool')
    .update({ points_remaining: next })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ pool: data as ResourcePool })
}
