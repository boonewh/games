'use client'

import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Ability, AbilityCategory, ActionType, CharacterDetail } from '@/lib/tracker/types'
import { AbilityEditModal } from './AbilityEditModal'
import { SpellsModal } from './SpellsModal'

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

/** After a drag, renumber the affected section's items to clean multiples of 10
 *  (10, 20, 30, …). Only PATCH the ones whose sort_order actually changed. */
async function applyReorder(reordered: Ability[]) {
  const updates = reordered
    .map((item, i) => ({ id: item.id, oldOrder: item.sort_order, newOrder: (i + 1) * 10 }))
    .filter((u) => u.newOrder !== u.oldOrder)
  if (updates.length === 0) return
  await Promise.all(
    updates.map((u) =>
      fetch(`/api/tracker/abilities/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: u.newOrder })
      })
    )
  )
}

export function AbilityGrid({ character, onChanged }: Props) {
  const [parkedOpen, setParkedOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Ability | null>(null)
  const [spellsOpen, setSpellsOpen] = useState(false)

  const visible = character.abilities.filter((a) => !a.hidden)
  const hidden = character.abilities.filter((a) => a.hidden)

  const limited = visible.filter((a) => a.uses_max != null)
  const unlimited = visible.filter((a) => a.uses_max == null && a.action_type !== 'passive')
  const passive = visible.filter((a) => a.action_type === 'passive')

  const nextSortOrder =
    character.abilities.reduce((m, a) => Math.max(m, a.sort_order), 0) + 10

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
            onClick={() => setSpellsOpen(true)}
            className="px-3 py-1.5 rounded border border-wotr-gold/60 text-wotr-gold hover:bg-wotr-gold/20 text-sm font-cinzel"
          >
            Spells{character.spells.length > 0 ? ` (${character.spells.length})` : ''}
          </button>
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
            <AbilitySection title="Limited use" items={limited} onEdit={setEditing} onChanged={onChanged} />
          )}
          {unlimited.length > 0 && (
            <AbilitySection title="At will" items={unlimited} onEdit={setEditing} onChanged={onChanged} />
          )}
          {passive.length > 0 && (
            <AbilitySection title="Reminders" items={passive} onEdit={setEditing} onChanged={onChanged} />
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
      {spellsOpen && (
        <SpellsModal
          characterId={character.id}
          spells={character.spells}
          onClose={() => setSpellsOpen(false)}
          onChanged={onChanged}
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
  // Local optimistic order — applied immediately on drop, then we sync with server.
  // We re-derive from props on every render so server state wins after refetch.
  const sensors = useSensors(
    // 5px movement before drag triggers — prevents accidental drags when clicking
    // buttons (−1, +1, ✎, ✕).
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((a) => a.id === active.id)
    const newIndex = items.findIndex((a) => a.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    await applyReorder(reordered)
    await onChanged()
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">{title}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((a) => a.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((a) => (
              <SortableAbilityCard key={a.id} ability={a} onEdit={onEdit} onChanged={onChanged} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableAbilityCard({
  ability,
  onEdit,
  onChanged
}: {
  ability: Ability
  onEdit: (a: Ability) => void
  onChanged: () => void | Promise<void>
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: ability.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AbilityCard
        ability={ability}
        onEdit={onEdit}
        onChanged={onChanged}
        dragHandleRef={setActivatorNodeRef}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

interface AbilityCardProps {
  ability: Ability
  onEdit: (a: Ability) => void
  onChanged: () => void | Promise<void>
  dragHandleRef?: (el: HTMLElement | null) => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
  isDragging?: boolean
}

function AbilityCard({
  ability,
  onEdit,
  onChanged,
  dragHandleRef,
  dragHandleProps,
  isDragging
}: AbilityCardProps) {
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
      className={`relative rounded border bg-stone-light/40 p-3 pl-7 flex flex-col gap-2 ${
        used ? 'border-stone-light opacity-50' : 'border-stone-light hover:border-wotr-gold/40 transition'
      } ${isDragging ? 'shadow-2xl shadow-wotr-gold/30 ring-1 ring-wotr-gold/50' : ''}`}
    >
      {/* Drag handle on the left edge */}
      <button
        ref={dragHandleRef}
        {...dragHandleProps}
        className="absolute left-1 top-1 bottom-1 px-1 flex items-center text-parchment/30 hover:text-parchment hover:bg-stone-light/60 cursor-grab active:cursor-grabbing rounded touch-none"
        title="Drag to reorder"
        aria-label={`Drag handle for ${ability.name}`}
      >
        <span className="leading-none text-sm select-none">⠿</span>
      </button>

      <div className="absolute top-1 right-1 flex gap-0.5">
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

      <header className="flex items-start justify-between gap-2 pr-12">
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
