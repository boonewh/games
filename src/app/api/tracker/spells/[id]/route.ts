// Single-spell resource: PATCH (edit fields), DELETE, POST (cast/uncast/reset).

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireChildOfCharacter } from '@/lib/tracker/http'
import type { Spell } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = [
  'name',
  'level',
  'casting_class',
  'school',
  'description',
  'prepared_count',
  'cast_count',
  'notes',
  'sort_order'
] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('spell', id, 'edit')
  if ('error' in auth) return auth.error

  let body: Partial<Spell>
  try {
    body = (await req.json()) as Partial<Spell>
  } catch {
    return bad('invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) patch[key] = (body as Record<string, unknown>)[key]
  }
  if (Object.keys(patch).length === 0) return bad('no editable fields supplied')

  const { data, error } = await supabase
    .from('spell')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ spell: data as Spell })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('spell', id, 'edit')
  if ('error' in auth) return auth.error

  const { error } = await supabase.from('spell').delete().eq('id', id)
  if (error) return fail(error.message)
  return json({ ok: true })
}

interface ActionBody {
  action: 'cast' | 'uncast' | 'reset'
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('spell', id, 'edit')
  if ('error' in auth) return auth.error

  let body: ActionBody
  try {
    body = (await req.json()) as ActionBody
  } catch {
    return bad('invalid JSON body')
  }

  const { data: current, error: getErr } = await supabase
    .from('spell')
    .select('*')
    .eq('id', id)
    .single()
  if (getErr) return fail(getErr.message)
  if (!current) return notFound('spell')

  const spell = current as Spell
  let nextCast = spell.cast_count

  if (body.action === 'cast') {
    // Capped at prepared_count if it's a prepared spell; otherwise just increment
    // (spontaneous casters don't track per-spell casts the same way).
    if (spell.prepared_count != null) {
      if (nextCast >= spell.prepared_count) {
        return bad('all prepared instances already cast')
      }
      nextCast += 1
    } else {
      nextCast += 1
    }
  } else if (body.action === 'uncast') {
    nextCast = Math.max(0, nextCast - 1)
  } else if (body.action === 'reset') {
    nextCast = 0
  } else {
    return bad(`unknown action: ${body.action}`)
  }

  const { data, error } = await supabase
    .from('spell')
    .update({ cast_count: nextCast })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return fail(error?.message ?? 'update failed')
  return json({ spell: data as Spell })
}
