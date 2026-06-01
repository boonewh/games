'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildMergePlan, type MergeBucket } from '@/lib/tracker/merge'
import type { CharacterDetail } from '@/lib/tracker/types'
import type { ExtractedCharacter } from '@/lib/tracker/extracted'

interface Props {
  characterId: string
  incoming: ExtractedCharacter
  onClose: () => void
  onApplied: () => void | Promise<void>
}

type ItemAction = 'add' | 'take' | 'keep' | 'delete' | 'none'

// The minimal shape every per-category diff shares — lets one Section render all.
interface DiffRow {
  key: string
  bucket: MergeBucket
  label: string
  changedFields: string[]
}

const fmt = (v: string | number | null) => (v === null || v === '' ? '—' : String(v))

function toAction(bucket: MergeBucket, checked: boolean): ItemAction {
  if (bucket === 'new') return checked ? 'add' : 'none'
  if (bucket === 'changed') return checked ? 'take' : 'keep'
  if (bucket === 'removed') return checked ? 'delete' : 'keep'
  return 'none'
}

const defaultChecked = (bucket: MergeBucket) => bucket === 'new' || bucket === 'changed'

export function MergeReviewModal({ characterId, incoming, onClose, onApplied }: Props) {
  const [detail, setDetail] = useState<CharacterDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/tracker/characters/${characterId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
        if (!cancelled) setDetail(json.character as CharacterDetail)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [characterId])

  const plan = useMemo(() => (detail ? buildMergePlan(detail, incoming) : null), [detail, incoming])

  // Seed selections from the plan's defaults once it's computed.
  useEffect(() => {
    if (!plan) return
    const init: Record<string, boolean> = {}
    for (const s of plan.scalars) init[`scalar:${s.field}`] = true
    const seed = (cat: string, diffs: DiffRow[]) => {
      for (const d of diffs) {
        if (d.bucket !== 'unchanged') init[`${cat}:${d.key}`] = defaultChecked(d.bucket)
      }
    }
    seed('ability', plan.abilities)
    seed('spell', plan.spells)
    seed('pool', plan.pools)
    seed('dr', plan.drs)
    seed('resist', plan.resistances)
    seed('vuln', plan.vulnerabilities)
    setSelections(init)
  }, [plan])

  const toggle = (key: string) => setSelections((s) => ({ ...s, [key]: !s[key] }))

  const hasChanges =
    !!plan &&
    (plan.scalars.length > 0 ||
      [plan.abilities, plan.spells, plan.pools, plan.drs, plan.resistances, plan.vulnerabilities].some((list) =>
        list.some((d) => d.bucket !== 'unchanged')
      ))

  async function apply() {
    if (!plan) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const cat = (prefix: string, diffs: DiffRow[]) => {
        const m: Record<string, ItemAction> = {}
        for (const d of diffs) {
          if (d.bucket === 'unchanged') continue
          const checked = selections[`${prefix}:${d.key}`] ?? defaultChecked(d.bucket)
          m[d.key] = toAction(d.bucket, checked)
        }
        return m
      }
      const scalars: Record<string, boolean> = {}
      for (const s of plan.scalars) scalars[s.field] = selections[`scalar:${s.field}`] ?? true

      const res = await fetch(`/api/tracker/characters/${characterId}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incoming,
          scalars,
          abilities: cat('ability', plan.abilities),
          spells: cat('spell', plan.spells),
          pools: cat('pool', plan.pools),
          drs: cat('dr', plan.drs),
          resistances: cat('resist', plan.resistances),
          vulnerabilities: cat('vuln', plan.vulnerabilities)
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onApplied()
      onClose()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-[60] p-4 overflow-auto" onClick={onClose}>
      <div className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-1">Update from PDF</h2>
        <p className="text-xs opacity-60 mb-4">
          Review what the new PDF changes. Your current uses, enabled/hidden state, and ordering are preserved on
          anything you update.
        </p>

        {loadError && <div className="text-abyssal-red text-sm mb-3">Couldn&apos;t load character: {loadError}</div>}

        {!plan && !loadError && <div className="opacity-60 text-sm">Computing changes…</div>}

        {plan && !hasChanges && (
          <div className="text-sm opacity-70 italic">No changes — the PDF matches this character.</div>
        )}

        {plan && hasChanges && (
          <div className="space-y-5 max-h-[60vh] overflow-auto pr-1">
            {plan.scalars.length > 0 && (
              <section>
                <SectionTitle>Stats</SectionTitle>
                <div className="space-y-1">
                  {plan.scalars.map((s) => (
                    <label key={s.field} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-wotr-gold"
                        checked={selections[`scalar:${s.field}`] ?? true}
                        onChange={() => toggle(`scalar:${s.field}`)}
                      />
                      <span className="w-28 shrink-0 opacity-80">{s.label}</span>
                      <span className="opacity-50 line-through">{fmt(s.current)}</span>
                      <span className="opacity-40">→</span>
                      <span className="text-wotr-gold">{fmt(s.incoming)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <Section title="Abilities" prefix="ability" diffs={plan.abilities} selections={selections} toggle={toggle} />
            <Section title="Spells" prefix="spell" diffs={plan.spells} selections={selections} toggle={toggle} />
            <Section title="Pools" prefix="pool" diffs={plan.pools} selections={selections} toggle={toggle} />
            <Section title="Damage reduction" prefix="dr" diffs={plan.drs} selections={selections} toggle={toggle} />
            <Section title="Resistances" prefix="resist" diffs={plan.resistances} selections={selections} toggle={toggle} />
            <Section title="Vulnerabilities" prefix="vuln" diffs={plan.vulnerabilities} selections={selections} toggle={toggle} />
          </div>
        )}

        {submitError && <div className="text-abyssal-red text-sm mt-3">{submitError}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40">
            Cancel
          </button>
          {plan && hasChanges && (
            <button
              onClick={apply}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
            >
              {submitting ? 'Applying…' : 'Apply changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-cinzel uppercase tracking-wider text-wotr-gold/80 mb-1.5">{children}</div>
}

function Section({
  title,
  prefix,
  diffs,
  selections,
  toggle
}: {
  title: string
  prefix: string
  diffs: DiffRow[]
  selections: Record<string, boolean>
  toggle: (key: string) => void
}) {
  const actionable = diffs.filter((d) => d.bucket !== 'unchanged')
  const unchanged = diffs.length - actionable.length
  if (actionable.length === 0) return null

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-1">
        {actionable.map((d) => (
          <label key={d.key} className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-wotr-gold"
              checked={selections[`${prefix}:${d.key}`] ?? defaultChecked(d.bucket)}
              onChange={() => toggle(`${prefix}:${d.key}`)}
            />
            <BucketBadge bucket={d.bucket} />
            <span className="flex-1">
              {d.label}
              {d.bucket === 'changed' && d.changedFields.length > 0 && (
                <span className="opacity-50"> · {d.changedFields.join(', ')}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {unchanged > 0 && <div className="text-[11px] opacity-40 mt-1">+{unchanged} unchanged</div>}
    </section>
  )
}

function BucketBadge({ bucket }: { bucket: MergeBucket }) {
  const styles: Record<string, string> = {
    new: 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300',
    changed: 'bg-amber-900/40 border-amber-700/60 text-amber-200',
    removed: 'bg-abyssal-red/30 border-abyssal-red/60 text-rose-200'
  }
  const labels: Record<string, string> = { new: 'NEW', changed: 'CHANGED', removed: 'NOT IN PDF' }
  return (
    <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${styles[bucket]}`}>
      {labels[bucket]}
    </span>
  )
}
