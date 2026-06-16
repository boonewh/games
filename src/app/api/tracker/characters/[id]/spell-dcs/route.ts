// List + create spell DC entries on a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { SpellDcEntry } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

interface CreateSpellDcBody {
  name: string
  dc: number
  notes?: string
  sort_order?: number
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('spell_dc_entry')
    .select('*')
    .eq('character_id', id)
    .order('sort_order')
    .order('id')

  if (error) return fail(error.message)
  return json({ spell_dcs: (data ?? []) as SpellDcEntry[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: CreateSpellDcBody
  try {
    body = (await req.json()) as CreateSpellDcBody
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')
  if (!Number.isFinite(body.dc)) return bad('dc must be a number')

  // Default sort_order = current max + 10
  let sortOrder = body.sort_order
  if (sortOrder == null) {
    const { data: maxRow } = await supabase
      .from('spell_dc_entry')
      .select('sort_order')
      .eq('character_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()
    sortOrder = (maxRow?.sort_order ?? 0) + 10
  }

  const { data, error } = await supabase
    .from('spell_dc_entry')
    .insert({
      character_id: id,
      name: body.name.trim(),
      dc: body.dc,
      notes: body.notes?.trim() || null,
      sort_order: sortOrder
    })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ spell_dc: data as SpellDcEntry }, { status: 201 })
}
