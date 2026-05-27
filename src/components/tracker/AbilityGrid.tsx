'use client'

import { useState } from 'react'
import type { Ability, AbilityCategory, ActionType, CharacterDetail } from '@/lib/tracker/types'
import { AbilityEditModal } from './AbilityEditModal'

interface Props {
  character: CharacterDetail
  onChanged: () => void | Promise<void>
}

const CATEGORY_LABEL: Record<AbilityCategory, string> = {
  class_feature: 'Class',
  feat: 'Feat',
  spell: 'Spell',
  sla: 'SLA',
  item: 'Item',
  reminder: 'Reminder'
}

const ACTION_STYLES: Record<ActionType, string> = {
  free: 'bg-stone-light text-parchment/80',
  swift: 'bg-amber-900/60 text-amber-100',
  move: 'bg-wardstone-blue/30 text-wardstone-blue',
  standard: 'bg-emerald-900/60 text-emerald-100',
  full: 'bg-violet-900/60 text-violet-100',
  immediate: 'bg-abyssal-red/40 text-parchment',
  reaction: 'bg-abyssal-red/40 text-parchment',
  passive: 'bg-stone-light text-parchment/60'
}

async function setHidden(abilityId: string, hidden: boolean) {
  await fetch(`/api/tracker/abilities/${abilityId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden })
  })
}

async function swapSortOrder(a: Ability, b: Ability) {
  await Promise.all([
    fetch(`/api/tracker/abilities/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sort_order: b.sort_order })
    }),
    fetch(`/api/tracker/abilities/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sort_order: a.sort_order })
    })
  ])
}

export function AbilityGrid({ character, onChanged }: Props) {
  const [parkedOpen, setParkedOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Ability | null>(null)

  const visible = character.abilities.filter((a) => !a.hidden)
  const hidden = character.abilities.filter((a) => a.hidden)

  const limited = visible.filter((a) => a.uses_max != null)
  const unlimited = visible.filter((a) => a.uses_max == null && a.action_type !== 'passive')
  const passive = visible.filter((a) => a.action_type === 'passive')

  // Next sort_order = max existing + 10. Keeps room to slot between.
  const nextSortOrder =
    character.abilities.reduce((m, a) => Math.max(m, a.sort_order), 0) + 10

  function openEdit(a: Ability) {
    setEditing(a)
  }

  return (
    <section className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="font-cinzel text-xl text-wotr-gold">Cool Stuff</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-50">
            {character.abilities.length === 0
              ? 'no abilities yet'
              : `${visible.length} active${hidden.length > 0 ? ` · ${hidden.length} parked` : ''}`}
          </span>
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-1.5 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold text-sm font-cinzel"
          >
            + New ability
          </button>
        </div>
      </div>

      {character.abilities.length === 0 ? (
        <div className="rounded border border-dashed border-stone-light p-8 text-center opacity-70">
          <div className="font-cinzel text-wotr-gold/70 mb-1">No abilities yet</div>
          <div className="text-sm">
            Pick a template when you create a character to pre-fill the cards, or click{' '}
            <span className="text-wotr-gold">+ New ability</span> to add one manually.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {limited.length > 0 && (
            <AbilitySection title="Limited use" items={limited} onEdit={openEdit} onChanged={onChanged} />
          )}
          {unlimited.length > 0 && (
            <AbilitySection title="At will" items={unlimited} onEdit={openEdit} onChanged={onChanged} />
          )}
          {passive.length > 0 && (
            <AbilitySection title="Reminders" items={passive} onEdit={openEdit} onChanged={onChanged} />
          )}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="mt-8 pt-4 border-t border-stone-light">
          <button
            onClick={() => setParkedOpen((o) => !o)}
            className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-60 hover:opacity-100 font-cinzel"
          >
            <span>{parkedOpen ? '▾' : '▸'}</span>
            <span>Parked ({hidden.length})</span>
            <span className="opacity-60 normal-case tracking-normal">— click a card to restore</span>
          </button>
          {parkedOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-3">
              {hidden.map((a) => (
                <ParkedCard key={a.id} ability={a} onChanged={onChanged} />
              ))}
            </div>
          )}
        </div>
      )}

      {creating && (
        <AbilityEditModal
          characterId={character.id}
          nextSortOrder={nextSortOrder}
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <AbilityEditModal
          characterId={character.id}
          ability={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await onChanged()
          }}
        />
      )}
    </section>
  )
}

function AbilitySection({
  title,
  items,
  onEdit,
  onChanged
}: {
  title: string
  items: Ability[]
  onEdit: (a: Ability) => void
  onChanged: () => void | Promise<void>
}) {
  async function move(a: Ability, direction: -1 | 1) {
    const idx = items.findIndex((x) => x.id === a.id)
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= items.length) return
    await swapSortOrder(a, items[targetIdx])
    await onChanged()
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((a, idx) => (
          <AbilityCard
            key={a.id}
            ability={a}
            onEdit={onEdit}
            onChanged={onChanged}
            canMoveUp={idx > 0}
            canMoveDown={idx < items.length - 1}
            onMoveUp={() => move(a, -1)}
            onMoveDown={() => move(a, 1)}
          />
        ))}
      </div>
    </div>
  )
}

function AbilityCard({
  ability,
  onEdit,
  onChanged,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown
}: {
  ability: Ability
  onEdit: (a: Ability) => void
  onChanged: () => void | Promise<void>
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void | Promise<void>
  onMoveDown: () => void | Promise<void>
}) {
  const used = ability.uses_max != null && ability.uses_remaining === 0
  const action = ability.action_type
  const actionLabel = action ? action.replace('_', ' ') : null
  const actionClass = action ? ACTION_STYLES[action] : 'bg-stone-light text-parchment/60'

  async function postAction(act: 'spend' | 'restore' | 'reset') {
    await fetch(`/api/tracker/abilities/${ability.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act })
    })
    await onChanged()
  }

  async function park() {
    await setHidden(ability.id, true)
    await onChanged()
  }

  return (
    <article
      className={`relative rounded border bg-stone-light/40 p-3 flex flex-col gap-2 ${
        used ? 'border-stone-light opacity-50' : 'border-stone-light hover:border-wotr-gold/40 transition'
      }`}
    >
      <div className="absolute top-1 right-1 flex gap-0.5">
        <button
          onClick={() => onMoveUp()}
          disabled={!canMoveUp}
          className="px-1.5 py-0.5 text-xs leading-none rounded text-parchment/30 hover:text-parchment hover:bg-stone-light/60 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Move up"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown()}
          disabled={!canMoveDown}
          className="px-1.5 py-0.5 text-xs leading-none rounded text-parchment/30 hover:text-parchment hover:bg-stone-light/60 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Move down"
        >
          ↓
        </button>
        <button
          onClick={() => onEdit(ability)}
          className="px-1.5 py-0.5 text-xs leading-none rounded text-parchment/30 hover:text-wotr-gold hover:bg-stone-light/60"
          title="Edit card"
        >
          ✎
        </button>
        <button
          onClick={park}
          className="px-1.5 py-0.5 text-xs leading-none rounded text-parchment/30 hover:text-parchment hover:bg-stone-light/60"
          title="Park this card (hide until restored)"
        >
          ✕
        </button>
      </div>

      <header className="flex items-start justify-between gap-2 pr-20">
        <div>
          <h4 className="font-cinzel text-parchment leading-tight">{ability.name}</h4>
          <div className="text-[10px] uppercase tracking-wider opacity-50 mt-0.5">
            {CATEGORY_LABEL[ability.category]}
          </div>
        </div>
        {actionLabel && (
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${actionClass}`}>
            {actionLabel}
          </span>
        )}
      </header>

      {ability.description && <p className="text-sm leading-snug opacity-90">{ability.description}</p>}

      {ability.uses_max != null && (
        <footer className="flex items-center justify-between mt-auto pt-2 border-t border-stone-light">
          <div className="text-sm">
            <span className={`font-semibold tabular-nums ${used ? 'text-abyssal-red' : 'text-wotr-gold'}`}>
              {ability.uses_remaining ?? 0}
            </span>
            <span className="opacity-60">
              {' / '}
              {ability.uses_max}
              {ability.recharge && ` · ${ability.recharge.replace('_', ' ')}`}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => postAction('spend')}
              disabled={used}
              className="px-2 py-0.5 text-xs rounded bg-abyssal-red/40 hover:bg-abyssal-red/60 text-parchment disabled:opacity-30 disabled:cursor-not-allowed"
              title="Spend a use"
            >
              −1
            </button>
            <button
              onClick={() => postAction('restore')}
              disabled={ability.uses_remaining === ability.uses_max}
              className="px-2 py-0.5 text-xs rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-parchment disabled:opacity-30 disabled:cursor-not-allowed"
              title="Restore a use"
            >
              +1
            </button>
            <button
              onClick={() => postAction('reset')}
              className="px-2 py-0.5 text-xs rounded bg-stone-light hover:bg-stone-light/70 text-parchment"
              title="Reset to max"
            >
              ↺
            </button>
          </div>
        </footer>
      )}
    </article>
  )
}

function ParkedCard({ ability, onChanged }: { ability: Ability; onChanged: () => void | Promise<void> }) {
  async function restore() {
    await setHidden(ability.id, false)
    await onChanged()
  }

  return (
    <button
      onClick={restore}
      className="text-left p-2 rounded border border-stone-light/60 bg-stone-light/20 opacity-60 hover:opacity-100 hover:border-wotr-gold/50 hover:bg-stone-light/40 transition"
      title="Click to restore"
    >
      <div className="font-cinzel text-xs text-parchment truncate">{ability.name}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5 truncate">
        {CATEGORY_LABEL[ability.category]}
        {ability.action_type && ability.action_type !== 'passive' && ` · ${ability.action_type}`}
      </div>
    </button>
  )
}
