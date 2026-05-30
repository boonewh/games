// PATCH + DELETE for a specific condition.

import { NextRequest } from 'next/server'
import { deleteRow, json, requireChildOfCharacter, updateRow } from '@/lib/tracker/http'
import type { Condition } from '@/lib/tracker/types'

type Ctx = { params: Promise<{ id: string }> }

const EDITABLE_FIELDS = ['type', 'duration_rounds', 'notes'] as const

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('condition', id, 'edit')
  if ('error' in auth) return auth.error

  const res = await updateRow<Condition>('condition', id, req, EDITABLE_FIELDS)
  if ('error' in res) return res.error
  return json({ condition: res.data })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireChildOfCharacter('condition', id, 'edit')
  if ('error' in auth) return auth.error

  return deleteRow('condition', id)
}
