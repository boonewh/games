// List + create ability sections for a character.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, requireCharacter } from '@/lib/tracker/http'
import type { AbilitySection } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'view')
  if ('error' in auth) return auth.error

  const { data, error } = await supabase
    .from('ability_section')
    .select('*')
    .eq('character_id', id)
    .order('sort_order')
    .order('created_at')

  if (error) return fail(error.message)
  return json({ sections: (data ?? []) as AbilitySection[] })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: { name?: string; sort_order?: number }
  try {
    body = (await req.json()) as { name?: string; sort_order?: number }
  } catch {
    return bad('invalid JSON body')
  }

  if (!body.name?.trim()) return bad('name is required')

  // Default sort_order = current max + 10
  let sortOrder = body.sort_order
  if (sortOrder == null) {
    const { data: existing } = await supabase
      .from('ability_section')
      .select('sort_order')
      .eq('character_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)
    sortOrder = ((existing?.[0]?.sort_order as number | undefined) ?? 0) + 10
  }

  const { data, error } = await supabase
    .from('ability_section')
    .insert({ character_id: id, name: body.name.trim(), sort_order: sortOrder })
    .select()
    .single()

  if (error || !data) return fail(error?.message ?? 'insert failed')
  return json({ section: data as AbilitySection }, { status: 201 })
}
