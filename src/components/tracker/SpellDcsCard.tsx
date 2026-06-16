'use client'

import { useState } from 'react'
import type { SpellDcEntry } from '@/lib/tracker/types'

interface Props {
  characterId: string
  spellDcs: SpellDcEntry[]
  onChanged: () => void | Promise<void>
  className?: string
}

export function SpellDcsCard({ characterId, spellDcs, onChanged, className }: Props) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<SpellDcEntry | null>(null)

  async function patchDc(entryId: string, delta: number) {
    const entry = spellDcs.find((d) => d.id === entryId)
    if (!entry) return
    try {
      const res = await fetch(`/api/tracker/spell-dcs/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dc: entry.dc + delta })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      await onChanged()
    } catch (e) {
      console.error('spell dc patch failed', e)
    }
  }

  return (
    <div className={`p-3 rounded border border-stone-light bg-stone-light/20 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-cinzel opacity-70">Spell DCs</div>
        <button onClick={() => setAdding(true)} className="text-xs text-wotr-gold hover:underline">
          + Add DC
        </button>
      </div>

      {spellDcs.length === 0 ? (
        <div className="text-xs opacity-50 italic">No spell DCs.</div>
      ) : (
        <div className="space-y-1.5">
          {spellDcs.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 p-2 rounded border border-stone-light bg-stone-dark/40"
            >
              <button
                onClick={() => setEditing(d)}
                className="flex-1 min-w-0 text-left group"
                title="Click to edit"
              >
                <div className="font-cinzel text-sm text-parchment group-hover:underline truncate">
                  {d.name}
                </div>
                {d.notes && (
                  <div className="text-[11px] italic opacity-60 truncate">{d.notes}</div>
                )}
              </button>
              <div className="text-sm tabular-nums shrink-0">
                <span className="text-wotr-gold font-bold">{d.dc}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => patchDc(d.id, -1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-abyssal-red/40 hover:bg-abyssal-red/60 text-parchment"
                  title="Decrease DC by 1"
                >
                  −1
                </button>
                <button
                  onClick={() => patchDc(d.id, 1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-parchment"
                  title="Increase DC by 1"
                >
                  +1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <SpellDcEditModal
          characterId={characterId}
          onClose={() => setAdding(false)}
          onSaved={async () => {
            setAdding(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <SpellDcEditModal
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

interface SpellDcEditProps {
  characterId: string
  entry?: SpellDcEntry
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function SpellDcEditModal({ characterId, entry, onClose, onSaved }: SpellDcEditProps) {
  const isNew = !entry
  const [name, setName] = useState(entry?.name ?? '')
  const [dc, setDc] = useState(entry ? String(entry.dc) : '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    const dcNum = parseInt(dc, 10)
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(dcNum)) return setError('DC must be a number.')

    setSubmitting(true)
    try {
      const url = isNew
        ? `/api/tracker/characters/${characterId}/spell-dcs`
        : `/api/tracker/spell-dcs/${entry!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const body = {
        name: name.trim(),
        dc: dcNum,
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
      const res = await fetch(`/api/tracker/spell-dcs/${entry.id}`, { method: 'DELETE' })
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
          {isNew ? 'New spell DC' : `Edit ${entry!.name}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spell DC, Conjuration DC, Oracle DC…"
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">DC</span>
            <input
              type="number"
              value={dc}
              onChange={(e) => setDc(e.target.value)}
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. applies to all enchantment spells"
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
                Delete DC
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
