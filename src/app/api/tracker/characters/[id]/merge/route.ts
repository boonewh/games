// Apply an "Update from PDF" merge to a character.
//   POST { incoming: ExtractedCharacter, scalars?, abilities?, spells?, pools?,
//          drs?, resistances?, vulnerabilities? }
//
// The client sends the freshly parsed character plus per-item decisions keyed by
// the merge plan's match keys. The server is the source of truth: it re-fetches
// the current character, rebuilds the plan with buildMergePlan, and applies each
// decision (falling back to the plan's default action). "take" on a matched card
// preserves runtime state via the merge helpers; "removed" defaults to keep.
//
// Convergent by design: re-running the same parse is a no-op, because applied
// items match by name on the next diff and bucket as unchanged.

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bad, fail, json, notFound, requireCharacter } from '@/lib/tracker/http'
import {
  buildMergePlan,
  mergedAbilityFields,
  mergedPoolFields,
  mergedSpellFields,
  type ListDiff
} from '@/lib/tracker/merge'
import type { Character, CharacterDetail } from '@/lib/tracker/types'
import type { ExtractedCharacter } from '@/lib/tracker/extracted'

type Ctx = { params: Promise<{ id: string }> }

type ItemAction = 'add' | 'take' | 'keep' | 'delete' | 'skip' | 'none'

interface MergeRequest {
  incoming: ExtractedCharacter
  scalars?: Record<string, boolean>
  abilities?: Record<string, ItemAction>
  spells?: Record<string, ItemAction>
  pools?: Record<string, ItemAction>
  drs?: Record<string, ItemAction>
  resistances?: Record<string, ItemAction>
  vulnerabilities?: Record<string, ItemAction>
}

interface CategoryResult {
  added: number
  updated: number
  deleted: number
  errors: string[]
}

async function applyCategory<C extends { id: string }, I>(
  table: string,
  characterId: string,
  diffs: ListDiff<C, I>[],
  decisions: Record<string, ItemAction> | undefined,
  buildInsert: (i: I) => Record<string, unknown>,
  buildUpdate: (c: C, i: I) => Record<string, unknown>
): Promise<CategoryResult> {
  const r: CategoryResult = { added: 0, updated: 0, deleted: 0, errors: [] }
  for (const d of diffs) {
    const action = decisions?.[d.key] ?? d.defaultAction
    if (action === 'add' && d.incoming) {
      const { error } = await supabase.from(table).insert({ character_id: characterId, ...buildInsert(d.incoming) })
      if (error) r.errors.push(`${table} add "${d.label}": ${error.message}`)
      else r.added++
    } else if (action === 'take' && d.current && d.incoming) {
      const { error } = await supabase.from(table).update(buildUpdate(d.current, d.incoming)).eq('id', d.current.id)
      if (error) r.errors.push(`${table} update "${d.label}": ${error.message}`)
      else r.updated++
    } else if (action === 'delete' && d.current) {
      const { error } = await supabase.from(table).delete().eq('id', d.current.id)
      if (error) r.errors.push(`${table} delete "${d.label}": ${error.message}`)
      else r.deleted++
    }
  }
  return r
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const auth = await requireCharacter(id, 'edit')
  if ('error' in auth) return auth.error

  let body: MergeRequest
  try {
    body = (await req.json()) as MergeRequest
  } catch {
    return bad('invalid JSON body')
  }
  if (!body?.incoming) return bad('missing "incoming" character data')

  // Re-fetch current detail server-side (source of truth for the diff).
  const { data, error } = await supabase
    .from('character')
    .select(
      `*,
       damage_reduction(*),
       energy_resistance(*),
       energy_vulnerability(*),
       ability(*),
       resource_pool(*),
       spell(*)`
    )
    .eq('id', id)
    .single()
  if (error) return fail(error.message)
  if (!data) return notFound('character')

  const d = data as Record<string, unknown>
  const current: CharacterDetail = {
    ...(data as Character),
    drs: (d.damage_reduction as CharacterDetail['drs']) ?? [],
    resistances: (d.energy_resistance as CharacterDetail['resistances']) ?? [],
    vulnerabilities: (d.energy_vulnerability as CharacterDetail['vulnerabilities']) ?? [],
    sections: [], // not part of the merge
    abilities: (d.ability as CharacterDetail['abilities']) ?? [],
    conditions: [], // not part of the merge
    pools: (d.resource_pool as CharacterDetail['pools']) ?? [],
    spells: (d.spell as CharacterDetail['spells']) ?? [],
    spell_dc_entries: [] // not part of the merge
  }

  const plan = buildMergePlan(current, body.incoming)
  const errors: string[] = []

  // --- scalars ---
  const patch: Record<string, unknown> = {}
  let scalarCount = 0
  for (const s of plan.scalars) {
    const take = body.scalars?.[s.field] ?? true // default: take new
    if (take) {
      patch[s.field] = s.incoming
      scalarCount++
    }
  }
  if (Object.keys(patch).length > 0) {
    const { error: e } = await supabase.from('character').update(patch).eq('id', id)
    if (e) errors.push(`scalars: ${e.message}`)
  }

  // --- list categories ---
  // sort_order counters so newly-added cards land after existing ones.
  let aSort = Math.max(0, ...current.abilities.map((a) => a.sort_order ?? 0))
  let pSort = Math.max(0, ...current.pools.map((p) => p.sort_order ?? 0))
  let sSort = Math.max(0, ...current.spells.map((s) => s.sort_order ?? 0))

  const results = await Promise.all([
    applyCategory(
      'ability',
      id,
      plan.abilities,
      body.abilities,
      (i) => ({
        name: i.name,
        category: i.category,
        action_type: i.action_type ?? null,
        description: i.description ?? null,
        uses_max: i.uses_max ?? null,
        uses_remaining: i.uses_max ?? null,
        recharge: i.recharge ?? null,
        sort_order: (aSort += 10)
      }),
      (c, i) => mergedAbilityFields(c, i)
    ),
    applyCategory(
      'spell',
      id,
      plan.spells,
      body.spells,
      (i) => ({
        name: i.name,
        level: i.level,
        casting_class: i.casting_class.toLowerCase(),
        school: i.school?.toLowerCase() ?? null,
        description: i.description ?? null,
        prepared_count: i.prepared_count ?? null,
        cast_count: 0,
        sort_order: (sSort += 1)
      }),
      (c, i) => mergedSpellFields(c, i)
    ),
    applyCategory(
      'resource_pool',
      id,
      plan.pools,
      body.pools,
      (i) => ({
        name: i.name,
        points_max: i.points_max,
        points_remaining: i.points_max,
        recharge: i.recharge ?? null,
        sort_order: (pSort += 10)
      }),
      (c, i) => mergedPoolFields(c, i)
    ),
    applyCategory(
      'damage_reduction',
      id,
      plan.drs,
      body.drs,
      (i) => ({ amount: i.amount, bypass: i.bypass }),
      (_c, i) => ({ amount: i.amount, bypass: i.bypass })
    ),
    applyCategory(
      'energy_resistance',
      id,
      plan.resistances,
      body.resistances,
      (i) => ({ energy_type: i.energy_type, amount: i.amount }),
      (_c, i) => ({ amount: i.amount })
    ),
    applyCategory(
      'energy_vulnerability',
      id,
      plan.vulnerabilities,
      body.vulnerabilities,
      (i) => ({ energy_type: i.energy_type }),
      () => ({}) // vulnerabilities never bucket as "changed"
    )
  ])

  const counts = results.reduce(
    (acc, r) => {
      acc.added += r.added
      acc.updated += r.updated
      acc.deleted += r.deleted
      errors.push(...r.errors)
      return acc
    },
    { added: 0, updated: 0, deleted: 0 }
  )

  if (errors.length > 0) return fail(errors.join('; '))

  return json({ ok: true, counts: { scalars: scalarCount, ...counts } })
}
