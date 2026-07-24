'use client'

import { useState } from 'react'
import type { SpellPenEntry } from '@/lib/tracker/types'

interface Props {
  characterId: string
  spellPens: SpellPenEntry[]
  onChanged: () => void | Promise<void>
  className?: string
}

function signed(n: number) {
  return n >= 0 ? `+${n}` : `${n}`
}

export function SpellPenCard({ characterId, spellPens, onChanged, className }: Props) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<SpellPenEntry | null>(null)

  async function patchBonus(entryId: string, delta: number) {
    const entry = spellPens.find((p) => p.id === entryId)
    if (!entry) return
    try {
      const res = await fetch(`/api/tracker/spell-pen/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bonus: entry.bonus + delta })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      await onChanged()
    } catch (e) {
      console.error('spell pen patch failed', e)
    }
  }

  return (
    <div className={`p-[14px_16px] rounded-xl ${className ?? ''}`} style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-cinzel opacity-70">Spell Pen</div>
        <button onClick={() => setAdding(true)} className="text-xs text-wotr-gold hover:underline">
          + Add SP
        </button>
      </div>

      {spellPens.length === 0 ? (
        <div className="text-xs opacity-50 italic">No spell penetration.</div>
      ) : (
        <div className="space-y-1.5">
          {spellPens.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 p-2 rounded border border-stone-light bg-stone-dark/40"
            >
              <button
                onClick={() => setEditing(p)}
                className="flex-1 min-w-0 text-left group"
                title="Click to edit"
              >
                <div className="font-cinzel text-sm text-parchment group-hover:underline truncate">
                  {p.name}
                </div>
                {p.notes && (
                  <div className="text-[11px] italic opacity-60 truncate">{p.notes}</div>
                )}
              </button>
              <div className="text-sm tabular-nums shrink-0">
                <span className="text-wotr-gold font-bold">{signed(p.bonus)}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => patchBonus(p.id, -1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-abyssal-red/40 hover:bg-abyssal-red/60 text-parchment"
                  title="Decrease bonus by 1"
                >
                  −1
                </button>
                <button
                  onClick={() => patchBonus(p.id, 1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-parchment"
                  title="Increase bonus by 1"
                >
                  +1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <SpellPenEditModal
          characterId={characterId}
          onClose={() => setAdding(false)}
          onSaved={async () => {
            setAdding(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <SpellPenEditModal
          characterId={characterId}
          entry={editing}
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

interface SpellPenEditProps {
  characterId: string
  entry?: SpellPenEntry
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function SpellPenEditModal({ characterId, entry, onClose, onSaved }: SpellPenEditProps) {
  const isNew = !entry
  const [name, setName] = useState(entry?.name ?? '')
  const [bonus, setBonus] = useState(entry ? String(entry.bonus) : '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    const bonusNum = parseInt(bonus, 10)
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(bonusNum)) return setError('Bonus must be a number.')

    setSubmitting(true)
    try {
      const url = isNew
        ? `/api/tracker/characters/${characterId}/spell-pen`
        : `/api/tracker/spell-pen/${entry!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const body = {
        name: name.trim(),
        bonus: bonusNum,
        notes: notes.trim() || null
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  async function remove() {
    if (!entry) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/spell-pen/${entry.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
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
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">
          {isNew ? 'New spell penetration' : `Edit ${entry!.name}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spell Pen, Greater SP, vs undead…"
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Bonus</span>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. CL check vs spell resistance"
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {!isNew &&
            (!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-abyssal-red hover:text-abyssal-red/80 text-sm"
              >
                Delete SP
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-abyssal-red">Sure?</span>
                <button
                  onClick={remove}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-abyssal-red text-parchment font-semibold text-xs"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-parchment/60 hover:text-parchment text-xs"
                >
                  Cancel
                </button>
              </div>
            ))}
          <div className="flex gap-2 ml-auto">
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
              {submitting ? 'Saving…' : isNew ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
