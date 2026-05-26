'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Character } from '@/lib/tracker/types'

interface Props {
  character: Character
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function CharacterEditModal({ character, onClose, onSaved }: Props) {
  const router = useRouter()
  const [name, setName] = useState(character.name)
  const [classSummary, setClassSummary] = useState(character.class_summary ?? '')
  const [level, setLevel] = useState(character.level != null ? String(character.level) : '')
  const [maxHp, setMaxHp] = useState(String(character.max_hp))
  const [currentHp, setCurrentHp] = useState(String(character.current_hp))
  const [fortification, setFortification] = useState(String(character.fortification_percent))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    const max = parseInt(maxHp, 10)
    const curr = parseInt(currentHp, 10)
    const fort = parseInt(fortification, 10) || 0
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(max) || max <= 0) return setError('Max HP must be a positive number.')
    if (!Number.isFinite(curr)) return setError('Current HP must be a number.')

    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          class_summary: classSummary.trim() || null,
          level: level ? parseInt(level, 10) : null,
          max_hp: max,
          current_hp: curr,
          fortification_percent: Math.max(0, Math.min(100, fort))
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/characters/${character.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      router.push('/wrath/tracker')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">Edit {character.name}</h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="tracker-input" autoFocus />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block col-span-2">
              <span className="block text-sm opacity-80 mb-1">Class summary</span>
              <input
                value={classSummary}
                onChange={(e) => setClassSummary(e.target.value)}
                className="tracker-input"
              />
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Level</span>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="tracker-input"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Max HP</span>
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
                className="tracker-input"
              />
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Current HP</span>
              <input
                type="number"
                value={currentHp}
                onChange={(e) => setCurrentHp(e.target.value)}
                className="tracker-input"
              />
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Fortification %</span>
              <input
                type="number"
                value={fortification}
                onChange={(e) => setFortification(e.target.value)}
                className="tracker-input"
              />
            </label>
          </div>

          <div className="text-xs opacity-60">
            DRs, energy resistances, vulnerabilities, abilities, and conditions are managed in their own panels.
            Tell me if you want inline editing for those too.
          </div>

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-abyssal-red hover:text-abyssal-red/80 text-sm"
            >
              Delete character
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
          )}
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

        <style>{`
          .tracker-input {
            width: 100%;
            padding: 0.4rem 0.6rem;
            background: #0f0f10;
            border: 1px solid #1e1e1f;
            border-radius: 0.375rem;
            color: #e0d9c5;
            font-size: 0.875rem;
          }
          .tracker-input:focus {
            outline: 2px solid #c5b358;
            outline-offset: -1px;
          }
        `}</style>
      </div>
    </div>
  )
}
