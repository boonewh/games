'use client'

import { useEffect, useState } from 'react'
import type { Condition } from '@/lib/tracker/types'
import { ALL_CONDITIONS, getConditionInfo, severityNameColor, severityStyles } from '@/lib/tracker/conditions'

interface Props {
  characterId: string
  conditions: Condition[]
  onChanged: () => void | Promise<void>
  /** Optional container classes — used by HpPanel to position in its flex row. */
  className?: string
}

export function ConditionsBar({ characterId, conditions, onChanged, className }: Props) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Condition | null>(null)

  async function quickRemove(id: string) {
    try {
      const res = await fetch(`/api/tracker/conditions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      await onChanged()
    } catch (e) {
      // surface to user via the existing error path — refetch will reveal stale state
      console.error('condition remove failed', e)
    }
  }

  return (
    <div className={`p-3 rounded border border-stone-light bg-stone-light/20 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-cinzel opacity-70">Conditions</div>
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-wotr-gold hover:underline"
        >
          + Add condition
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-xs opacity-50 italic">No active conditions.</div>
      ) : (
        <div className="grid gap-1.5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {conditions.map((c) => {
            const info = getConditionInfo(c.type)
            return (
              <div
                key={c.id}
                className="flex items-start gap-2 p-2 rounded border border-stone-light bg-stone-dark/40"
              >
                <button
                  onClick={() => setEditing(c)}
                  className="flex-1 min-w-0 text-left group"
                  title="Click to edit duration / notes"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={`font-cinzel uppercase tracking-wider text-sm group-hover:underline ${severityNameColor(info.severity)}`}
                    >
                      {c.type}
                    </span>
                    {c.duration_rounds != null && (
                      <span className="text-xs opacity-70 tabular-nums">
                        {c.duration_rounds} round{c.duration_rounds === 1 ? '' : 's'}
                      </span>
                    )}
                    {info.houseRule && (
                      <span
                        className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-wotr-gold/30 border border-wotr-gold/60 text-wotr-gold"
                        title="House rule — differs from RAW PF1e"
                      >
                        house rule
                      </span>
                    )}
                  </div>
                  <div className="text-xs leading-snug opacity-90 mt-0.5">{info.description}</div>
                  {c.notes && (
                    <div className="text-xs italic opacity-60 mt-0.5">&ldquo;{c.notes}&rdquo;</div>
                  )}
                </button>
                <button
                  onClick={() => quickRemove(c.id)}
                  className="text-parchment/40 hover:text-abyssal-red text-base leading-none px-1.5 py-0.5"
                  title="Remove condition"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <ConditionPickerModal
          characterId={characterId}
          existing={conditions}
          onClose={() => setAdding(false)}
          onAdded={async () => {
            setAdding(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <ConditionEditModal
          condition={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await onChanged()
          }}
        />
      )}
    </div>
  )
}

function ConditionPickerModal({
  characterId,
  existing,
  onClose,
  onAdded
}: {
  characterId: string
  existing: Condition[]
  onClose: () => void
  onAdded: () => void | Promise<void>
}) {
  const [filter, setFilter] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const existingTypes = new Set(existing.map((c) => c.type))
  const filtered = ALL_CONDITIONS.filter((c) =>
    !filter.trim() ||
    c.type.toLowerCase().includes(filter.trim().toLowerCase()) ||
    c.description.toLowerCase().includes(filter.trim().toLowerCase())
  )

  async function add(type: string) {
    setSubmitting(type)
    setError(null)
    try {
      const res = await fetch(`/api/tracker/characters/${characterId}/conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(null)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-2xl my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-cinzel text-2xl text-wotr-gold">Add condition</h2>
          <button onClick={onClose} className="text-parchment/60 hover:text-parchment text-sm">
            close
          </button>
        </div>

        <input
          autoFocus
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter by name or effect…"
          className="w-full mb-3 p-2 rounded bg-stone-dark border border-stone-light text-parchment"
        />

        {error && (
          <div className="mb-3 p-2 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto -mx-2 px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((c) => {
              const already = existingTypes.has(c.type)
              const isSubmitting = submitting === c.type
              return (
                <button
                  key={c.type}
                  onClick={() => !already && !isSubmitting && add(c.type)}
                  disabled={already || isSubmitting}
                  className={`text-left p-2 rounded border transition ${
                    already
                      ? 'border-stone-light bg-stone-light/20 opacity-40 cursor-not-allowed'
                      : `border-stone-light bg-stone-light/30 hover:border-wotr-gold/50 hover:bg-stone-light/60 ${severityStyles(c.severity).split(' ').filter((cls) => cls.startsWith('text-')).join(' ')}`
                  }`}
                >
                  <div className="font-cinzel uppercase tracking-wider text-sm flex items-center gap-2">
                    <span>{c.type}</span>
                    {c.houseRule && (
                      <span
                        className="text-[9px] tracking-normal px-1 py-0.5 rounded bg-wotr-gold/30 border border-wotr-gold/60 text-wotr-gold normal-case"
                        title="House rule — differs from RAW PF1e"
                      >
                        house rule
                      </span>
                    )}
                    {already && <span className="text-[10px] opacity-80">— active</span>}
                    {isSubmitting && <span className="text-[10px] opacity-80">— adding…</span>}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5 leading-snug">{c.description}</div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-sm opacity-60 italic p-2">No matches.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConditionEditModal({
  condition,
  onClose,
  onSaved
}: {
  condition: Condition
  onClose: () => void
  onSaved: () => void | Promise<void>
}) {
  const info = getConditionInfo(condition.type)
  const [duration, setDuration] = useState(
    condition.duration_rounds != null ? String(condition.duration_rounds) : ''
  )
  const [notes, setNotes] = useState(condition.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSubmitting(true)
    setError(null)
    try {
      const parsedDuration = duration.trim() ? parseInt(duration, 10) : null
      const res = await fetch(`/api/tracker/conditions/${condition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_rounds: Number.isFinite(parsedDuration as number) ? parsedDuration : null,
          notes: notes.trim() || null
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  async function tickDown() {
    const current = parseInt(duration, 10)
    if (!Number.isFinite(current)) return
    if (current <= 1) {
      await remove()
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const next = current - 1
      const res = await fetch(`/api/tracker/conditions/${condition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_rounds: next })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setDuration(String(next))
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/tracker/conditions/${condition.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-cinzel text-2xl text-wotr-gold uppercase tracking-wider">{condition.type}</h2>
          {info.houseRule && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-wotr-gold/30 border border-wotr-gold/60 text-wotr-gold uppercase tracking-wider"
              title="House rule — differs from RAW PF1e"
            >
              house rule
            </span>
          )}
        </div>
        <p className="text-sm opacity-80 mb-4">{info.description}</p>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Duration (rounds)</span>
            <div className="flex gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="indefinite"
                className="flex-1 p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
              {duration.trim() && Number.isFinite(parseInt(duration, 10)) && (
                <button
                  onClick={tickDown}
                  disabled={submitting}
                  className="px-3 py-1 text-sm rounded border border-stone-light hover:bg-stone-light/40 disabled:opacity-50"
                  title="Decrement by 1 round (auto-removes at 0)"
                >
                  −1 round
                </button>
              )}
            </div>
            <div className="text-xs opacity-60 mt-1">Leave blank for indefinite duration.</div>
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Notes</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional — source, trigger, save DC, etc."
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={remove}
            disabled={submitting}
            className="px-3 py-1.5 text-sm rounded bg-abyssal-red text-parchment font-semibold disabled:opacity-50"
          >
            Remove
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
