// List + create resource pools on a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { Recharge, ResourcePool } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface CreatePoolBody {
  name: string
  points_max: number
  points_remaining?: number
  recharge?: Recharge
  notes?: string
  sort_order?: number
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('resource_pool')
    .select('*')
    .eq('character_id', id)
    .order('sort_order')
    .order('id')

  if (error) return fail(error.message)
  return json({ pools: (data ?? []) as ResourcePool[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: CreatePoolBody
  try {
    body = (await req.json()) as CreatePoolBody
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')
  if (!Number.isFinite(body.points_max) || body.points_max <= 0) {
    return bad('points_max must be a positive number')
  }

  const { data, error } = await supabase
    .from('resource_pool')
    .insert({
      character_id: id,
      name: body.name.trim(),
      points_max: body.points_max,
      points_remaining: body.points_remaining ?? body.points_max,
      recharge: body.recharge ?? null,
      notes: body.notes?.trim() || null,
      sort_order: body.sort_order ?? 0
    })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ pool: data as ResourcePool }, { status: 201 })
}
