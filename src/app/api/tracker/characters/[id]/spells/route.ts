// List + create spells on a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { Spell } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface CreateSpellBody {
  name: string
  level: number
  casting_class: string
  school?: string
  description?: string
  prepared_count?: number | null
  cast_count?: number
  notes?: string
  sort_order?: number
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('spell')
    .select('*')
    .eq('character_id', id)
    .order('casting_class')
    .order('level')
    .order('name')

  if (error) return fail(error.message)
  return json({ spells: (data ?? []) as Spell[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: CreateSpellBody
  try {
    body = (await req.json()) as CreateSpellBody
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')
  if (!body.casting_class?.trim()) return bad('casting_class is required')
  if (!Number.isFinite(body.level) || body.level < 0 || body.level > 9) {
    return bad('level must be 0–9')
  }

  const { data, error } = await supabase
    .from('spell')
    .insert({
      character_id: id,
      name: body.name.trim(),
      level: body.level,
      casting_class: body.casting_class.trim().toLowerCase(),
      school: body.school?.trim().toLowerCase() || null,
      description: body.description?.trim() || null,
      prepared_count: body.prepared_count ?? null,
      cast_count: body.cast_count ?? 0,
      notes: body.notes?.trim() || null,
      sort_order: body.sort_order ?? 0
    })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ spell: data as Spell }, { status: 201 })
}
