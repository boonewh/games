// PATCH + DELETE for a specific condition.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireChildOfCharacter } from '@/lib/tracker/http'
import type { Condition } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = ['type', 'duration_rounds', 'notes'] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('condition', id, 'edit')
  if ('error' in auth) return auth.error

  let body: Partial<Condition>
  try {
    body = (await req.json()) as Partial<Condition>
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) patch[key] = (body as Record<string, unknown>)[key]
  }
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  const { data, error } = await supabase
    .from('condition')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ condition: data as Condition })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('condition', id, 'edit')
  if ('error' in auth) return auth.error

  const { error } = await supabase.from('condition').delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}
