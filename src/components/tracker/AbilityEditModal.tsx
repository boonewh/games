'use client'

import { useState } from 'react'
import type {
  Ability,
  AbilityCategory,
  AbilitySection,
  ActionType,
  Recharge
} from '@/lib/tracker/types'

interface Props {
  characterId: string
  sections: AbilitySection[]
  ability?: Ability
  /** Next available sort_order, used when creating. */
  nextSortOrder?: number
  onClose: () => void
  onSaved: () => void | Promise<void>
}

const CATEGORY_OPTIONS: { value: AbilityCategory; label: string }[] = [
  { value: 'class_feature', label: 'Class feature' },
  { value: 'feat', label: 'Feat' },
  { value: 'spell', label: 'Spell' },
  { value: 'sla', label: 'Spell-like ability' },
  { value: 'item', label: 'Item' },
  { value: 'reminder', label: 'Reminder' }
]

const ACTION_OPTIONS: { value: ActionType | ''; label: string }[] = [
  { value: '', label: '— none —' },
  { value: 'free', label: 'free' },
  { value: 'swift', label: 'swift' },
  { value: 'move', label: 'move' },
  { value: 'standard', label: 'standard' },
  { value: 'full', label: 'full-round' },
  { value: 'immediate', label: 'immediate' },
  { value: 'reaction', label: 'reaction' },
  { value: 'passive', label: 'passive' }
]

const RECHARGE_OPTIONS: { value: Recharge | ''; label: string }[] = [
  { value: '', label: '— none —' },
  { value: 'per_day', label: 'per day (resets on Long Rest)' },
  { value: 'per_encounter', label: 'per encounter' },
  { value: 'per_round', label: 'per round' },
  { value: 'manual', label: 'manual' }
]

export function AbilityEditModal({ characterId, sections, ability, nextSortOrder, onClose, onSaved }: Props) {
  const isNew = !ability
  const [name, setName] = useState(ability?.name ?? '')
  const [category, setCategory] = useState<AbilityCategory>(ability?.category ?? 'class_feature')
  const [actionType, setActionType] = useState<ActionType | ''>(ability?.action_type ?? '')
  const [description, setDescription] = useState(ability?.description ?? '')
  const [usesMax, setUsesMax] = useState(ability?.uses_max != null ? String(ability.uses_max) : '')
  const [usesRemaining, setUsesRemaining] = useState(
    ability?.uses_remaining != null ? String(ability.uses_remaining) : ''
  )
  const [recharge, setRecharge] = useState<Recharge | ''>(ability?.recharge ?? '')
  const [sectionId, setSectionId] = useState<string>(ability?.section_id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    if (!name.trim()) return setError('Name is required.')

    const parseOptInt = (s: string): number | null => {
      if (!s.trim()) return null
      const n = parseInt(s, 10)
      return Number.isFinite(n) ? n : null
    }

    const max = parseOptInt(usesMax)
    let remaining = parseOptInt(usesRemaining)

    if (max != null) {
      if (max < 0) return setError('Max uses must be ≥ 0.')
      if (remaining == null) remaining = max
      if (remaining < 0 || remaining > max) {
        return setError('Remaining must be between 0 and max.')
      }
    } else {
      // No max — clear remaining too
      remaining = null
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        category,
        action_type: actionType || null,
        description: description.trim() || null,
        uses_max: max,
        uses_remaining: remaining,
        recharge: recharge || null,
        section_id: sectionId || null
      }
      if (isNew) {
        body.sort_order = nextSortOrder ?? 0
      }

      const url = isNew
        ? `/api/tracker/characters/${characterId}/abilities`
        : `/api/tracker/abilities/${ability!.id}`
      const method = isNew ? 'POST' : 'PATCH'

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
    if (!ability) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/abilities/${ability.id}`, { method: 'DELETE' })
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
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">
          {isNew ? 'New ability' : `Edit ${ability!.name}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lay on Hands, Power Attack, etc."
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AbilityCategory)}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Action type</span>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType | '')}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {sections.length > 0 && (
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Section</span>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              >
                <option value="">— Unsorted —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What does this do? Action economy, key rules, conditional bonuses…"
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment text-sm leading-snug"
            />
          </label>

          <div>
            <span className="text-sm opacity-80 block mb-1">Use tracking (optional)</span>
            <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Max uses</span>
                <input
                  type="number"
                  value={usesMax}
                  onChange={(e) => setUsesMax(e.target.value)}
                  placeholder="—"
                  className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
                />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Current</span>
                <input
                  type="number"
                  value={usesRemaining}
                  onChange={(e) => setUsesRemaining(e.target.value)}
                  placeholder={usesMax ? '= max' : '—'}
                  disabled={!usesMax.trim()}
                  className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Recharge</span>
                <select
                  value={recharge}
                  onChange={(e) => setRecharge(e.target.value as Recharge | '')}
                  disabled={!usesMax.trim()}
                  className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment disabled:opacity-50"
                >
                  {RECHARGE_OPTIONS.map((o) => (
                    <option key={o.value || 'none'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-xs opacity-60 mt-1">
              Leave Max blank for an at-will ability or passive reminder.
            </div>
          </div>

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {!isNew &&
            (!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-abyssal-red hover:text-abyssal-red/80 text-sm"
              >
                Delete ability
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
