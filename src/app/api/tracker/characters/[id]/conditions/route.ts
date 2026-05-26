// List + add conditions on a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { Condition } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface CreateConditionBody {
  type: string
  duration_rounds?: number | null
  notes?: string
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('condition')
    .select('*')
    .eq('character_id', id)
    .order('applied_at', { ascending: false })

  if (error) return fail(error.message)
  return json({ conditions: (data ?? []) as Condition[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: CreateConditionBody
  try {
    body = (await req.json()) as CreateConditionBody
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.type?.trim()) return bad('type is required')

  const { data, error } = await supabase
    .from('condition')
    .insert({
      character_id: id,
      type: body.type.trim().toLowerCase(),
      duration_rounds: body.duration_rounds ?? null,
      notes: body.notes?.trim() || null
    })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ condition: data as Condition }, { status: 201 })
}
