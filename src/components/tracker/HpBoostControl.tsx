'use client'

import { useState } from 'react'
import type { Character } from '@/lib/tracker/types'
import { hpBoostAmount } from '@/lib/tracker/hp-boost'

interface Props {
  character: Character
  busy: boolean
  onSave: (perLevel: number, active: boolean) => Promise<boolean>
}

export function HpBoostControl({ character, busy, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const perLevel = character.hp_boost_per_level ?? 0
  const active = character.hp_boost_active ?? false
  const level = character.level ?? 0
  const amount = perLevel * Math.max(0, level)

  function configure() {
    setInput(String(perLevel || 2))
    setError(null)
    setEditing(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(input)
    if (!input.trim() || !Number.isSafeInteger(value) || value < 1 || value > 1000) {
      setError('Enter a whole number from 1 to 1000.')
      return
    }
    if (await onSave(value, active)) setEditing(false)
  }

  return (
    <div className="mt-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-oswald uppercase tracking-wider text-xs text-parchment/60">HP boost</span>
        {perLevel > 0 ? (
          <>
            <button type="button" role="switch" aria-checked={active} aria-label="HP boost"
              disabled={busy || editing || (!active && level <= 0)}
              onClick={() => { void onSave(perLevel, !active) }}
              className={`rounded-md border px-2.5 py-1 disabled:opacity-50 ${active
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                : 'border-parchment/30 text-parchment/70 hover:border-wotr-gold'}`}>
              {active ? `On · +${hpBoostAmount(character)} HP` : 'Off'}
            </button>
            <button type="button" disabled={busy} onClick={configure}
              className="text-xs text-wotr-gold underline underline-offset-2 disabled:opacity-50"
              aria-label="Configure HP boost">{perLevel} HP / level</button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={configure}
            className="text-xs text-wotr-gold underline underline-offset-2 disabled:opacity-50">Set up</button>
        )}
      </div>
      {editing && (
        <form onSubmit={save} className="mt-2 space-y-2 rounded-lg border border-wotr-gold/30 p-3">
          <label className="flex items-center justify-between gap-2">
            <span>HP per level</span>
            <input type="number" min="1" max="1000" step="1" inputMode="numeric"
              value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} autoFocus
              className="w-20 rounded border border-wotr-gold/30 bg-black/30 px-2 py-1 text-parchment" />
          </label>
          <p className="text-xs text-parchment/60">Adds to current and maximum HP while on. Base HP stays unchanged.</p>
          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="text-wotr-gold disabled:opacity-50">Save</button>
            <button type="button" disabled={busy} onClick={() => setEditing(false)} className="text-parchment/60">Cancel</button>
          </div>
        </form>
      )}
      {perLevel > 0 && !editing && (
        <p className="mt-1 text-xs text-parchment/50">
          {level > 0 ? `${perLevel} × level ${level} = +${amount} HP` : 'Set your character level in the editor to enable the boost.'}
          {active && ` · Base max ${character.max_hp}`}
        </p>
      )}
    </div>
  )
}
