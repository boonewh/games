'use client'

import { useState } from 'react'
import type { Recharge, ResourcePool } from '@/lib/tracker/types'

interface Props {
  characterId: string
  pools: ResourcePool[]
  onChanged: () => void | Promise<void>
  className?: string
}

export function PoolsCard({ characterId, pools, onChanged, className }: Props) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<ResourcePool | null>(null)

  async function postAction(poolId: string, action: 'spend' | 'restore' | 'reset') {
    try {
      const res = await fetch(`/api/tracker/pools/${poolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      await onChanged()
    } catch (e) {
      console.error('pool action failed', e)
    }
  }

  return (
    <div className={`p-[14px_16px] rounded-xl ${className ?? ''}`} style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-cinzel opacity-70">Resources</div>
        <button onClick={() => setAdding(true)} className="text-xs text-wotr-gold hover:underline">
          + Add pool
        </button>
      </div>

      {pools.length === 0 ? (
        <div className="text-xs opacity-50 italic">No resource pools.</div>
      ) : (
        <div className="space-y-1.5">
          {pools.map((p) => {
            const depleted = p.points_remaining === 0
            const full = p.points_remaining === p.points_max
            return (
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
                  <span className={depleted ? 'text-abyssal-red font-bold' : 'text-wotr-gold font-bold'}>
                    {p.points_remaining}
                  </span>
                  <span className="opacity-60"> / {p.points_max}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => postAction(p.id, 'spend')}
                    disabled={depleted}
                    className="px-1.5 py-0.5 text-xs rounded bg-abyssal-red/40 hover:bg-abyssal-red/60 text-parchment disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Spend a point"
                  >
                    −1
                  </button>
                  <button
                    onClick={() => postAction(p.id, 'restore')}
                    disabled={full}
                    className="px-1.5 py-0.5 text-xs rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-parchment disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Restore a point"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => postAction(p.id, 'reset')}
                    disabled={full}
                    className="px-1.5 py-0.5 text-xs rounded bg-stone-light hover:bg-stone-light/70 text-parchment disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Reset to max"
                  >
                    ↺
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <PoolEditModal
          characterId={characterId}
          onClose={() => setAdding(false)}
          onSaved={async () => {
            setAdding(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <PoolEditModal
          characterId={characterId}
          pool={editing}
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

interface PoolEditProps {
  characterId: string
  pool?: ResourcePool
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function PoolEditModal({ characterId, pool, onClose, onSaved }: PoolEditProps) {
  const isNew = !pool
  const [name, setName] = useState(pool?.name ?? '')
  const [pointsMax, setPointsMax] = useState(pool ? String(pool.points_max) : '')
  const [pointsRemaining, setPointsRemaining] = useState(
    pool ? String(pool.points_remaining) : ''
  )
  const [recharge, setRecharge] = useState<Recharge | ''>(pool?.recharge ?? 'per_day')
  const [notes, setNotes] = useState(pool?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    const max = parseInt(pointsMax, 10)
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(max) || max <= 0) return setError('Max points must be positive.')

    const remaining = pointsRemaining.trim() ? parseInt(pointsRemaining, 10) : max
    if (!Number.isFinite(remaining) || remaining < 0 || remaining > max) {
      return setError('Remaining must be between 0 and max.')
    }

    setSubmitting(true)
    try {
      const url = isNew
        ? `/api/tracker/characters/${characterId}/pools`
        : `/api/tracker/pools/${pool!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const body = {
        name: name.trim(),
        points_max: max,
        points_remaining: remaining,
        recharge: recharge || null,
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
    if (!pool) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/pools/${pool.id}`, { method: 'DELETE' })
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
          {isNew ? 'New resource pool' : `Edit ${pool!.name}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ki Pool, Arcane Pool, Mythic Power…"
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Max points</span>
              <input
                type="number"
                value={pointsMax}
                onChange={(e) => setPointsMax(e.target.value)}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Current</span>
              <input
                type="number"
                value={pointsRemaining}
                onChange={(e) => setPointsRemaining(e.target.value)}
                placeholder={isNew ? '= max' : ''}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Recharge</span>
            <select
              value={recharge}
              onChange={(e) => setRecharge(e.target.value as Recharge | '')}
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            >
              <option value="">— manual only —</option>
              <option value="per_day">per day (resets on Long Rest)</option>
              <option value="per_encounter">per encounter</option>
              <option value="per_round">per round</option>
              <option value="manual">manual</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="1 to flurry, 2 to stunning fist…"
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
                Delete pool
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
