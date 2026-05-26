'use client'

import type { Ability, AbilityCategory, ActionType, CharacterDetail } from '@/lib/tracker/types'

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

export function AbilityGrid({ character, onChanged }: Props) {
  const limited = character.abilities.filter((a) => a.uses_max != null)
  const unlimited = character.abilities.filter((a) => a.uses_max == null && a.action_type !== 'passive')
  const passive = character.abilities.filter((a) => a.action_type === 'passive')

  return (
    <section className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-cinzel text-xl text-wotr-gold">Cool Stuff</h3>
        <span className="text-xs opacity-50">
          {character.abilities.length === 0 ? 'no abilities yet' : `${character.abilities.length} cards`}
        </span>
      </div>

      {character.abilities.length === 0 ? (
        <div className="rounded border border-dashed border-stone-light p-8 text-center opacity-70">
          <div className="font-cinzel text-wotr-gold/70 mb-1">No abilities yet</div>
          <div className="text-sm">
            Pick a template when you create a character to pre-fill the cards, or come back and I'll add more.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {limited.length > 0 && <AbilitySection title="Limited use" items={limited} onChanged={onChanged} />}
          {unlimited.length > 0 && <AbilitySection title="At will" items={unlimited} onChanged={onChanged} />}
          {passive.length > 0 && <AbilitySection title="Reminders" items={passive} onChanged={onChanged} />}
        </div>
      )}
    </section>
  )
}

function AbilitySection({
  title,
  items,
  onChanged
}: {
  title: string
  items: Ability[]
  onChanged: () => void | Promise<void>
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((a) => (
          <AbilityCard key={a.id} ability={a} onChanged={onChanged} />
        ))}
      </div>
    </div>
  )
}

function AbilityCard({ ability, onChanged }: { ability: Ability; onChanged: () => void | Promise<void> }) {
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

  return (
    <article
      className={`rounded border bg-stone-light/40 p-3 flex flex-col gap-2 ${
        used ? 'border-stone-light opacity-50' : 'border-stone-light hover:border-wotr-gold/40 transition'
      }`}
    >
      <header className="flex items-start justify-between gap-2">
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
