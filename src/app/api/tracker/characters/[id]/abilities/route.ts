// List + create abilities on a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { Ability, AbilityCategory, ActionType, Recharge } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface CreateAbilityBody {
  name: string
  category: AbilityCategory
  action_type?: ActionType
  description?: string
  uses_max?: number | null
  uses_remaining?: number | null
  recharge?: Recharge
  sort_order?: number
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('ability')
    .select('*')
    .eq('character_id', id)
    .order('sort_order')
    .order('id')

  if (error) return fail(error.message)
  return json({ abilities: (data ?? []) as Ability[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: CreateAbilityBody
  try {
    body = (await req.json()) as CreateAbilityBody
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')
  if (!body.category) return bad('category is required')

  const { data, error } = await supabase
    .from('ability')
    .insert({
      character_id: id,
      name: body.name.trim(),
      category: body.category,
      action_type: body.action_type ?? null,
      description: body.description?.trim() || null,
      uses_max: body.uses_max ?? null,
      uses_remaining: body.uses_remaining ?? body.uses_max ?? null,
      recharge: body.recharge ?? null,
      sort_order: body.sort_order ?? 0
    })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ ability: data as Ability }, { status: 201 })
}
