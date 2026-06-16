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
import type { Ability, AbilityCategory, AbilitySection, ActionType, CharacterDetail } from '@/lib/tracker/types'
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
  const [newSectionName, setNewSectionName] = useState('')
  const [addingSectionOpen, setAddingSectionOpen] = useState(false)
  const [savingSection, setSavingSection] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const visible = character.abilities.filter((a) => !a.hidden)
  const hidden = character.abilities.filter((a) => a.hidden)

  const nextSortOrder = character.abilities.reduce((m, a) => Math.max(m, a.sort_order), 0) + 10

  async function createSection() {
    if (!newSectionName.trim()) return
    setSavingSection(true)
    try {
      await fetch(`/api/tracker/characters/${character.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName.trim() })
      })
      setNewSectionName('')
      setAddingSectionOpen(false)
      await onChanged()
    } finally {
      setSavingSection(false)
    }
  }

  async function renameSection(sectionId: string, name: string) {
    if (!name.trim()) return
    await fetch(`/api/tracker/characters/${character.id}/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })
    setRenamingId(null)
    await onChanged()
  }

  async function deleteSection(sectionId: string) {
    await fetch(`/api/tracker/characters/${character.id}/sections/${sectionId}`, {
      method: 'DELETE'
    })
    setDeletingId(null)
    await onChanged()
  }

  return (
    <section className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="font-cinzel text-xl text-wotr-gold">Cool Stuff</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs opacity-50">
            {character.abilities.length === 0
              ? 'no abilities yet'
              : `${visible.length} active${hidden.length > 0 ? ` · ${hidden.length} parked` : ''}`}
          </span>
          <button
            onClick={() => setAddingSectionOpen((o) => !o)}
            className="px-3 py-1.5 rounded border border-stone-light text-parchment/70 hover:text-parchment hover:border-wotr-gold/50 text-sm font-cinzel"
          >
            + New Section
          </button>
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

      {/* New-section form */}
      {addingSectionOpen && (
        <div className="mb-4 flex items-center gap-2">
          <input
            autoFocus
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createSection()
              if (e.key === 'Escape') { setAddingSectionOpen(false); setNewSectionName('') }
            }}
            placeholder="Section name…"
            className="flex-1 max-w-xs p-2 rounded bg-stone-dark border border-stone-light text-parchment text-sm"
          />
          <button
            onClick={createSection}
            disabled={savingSection || !newSectionName.trim()}
            className="px-3 py-2 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold text-sm disabled:opacity-50"
          >
            {savingSection ? '…' : 'Add'}
          </button>
          <button
            onClick={() => { setAddingSectionOpen(false); setNewSectionName('') }}
            className="px-3 py-2 rounded border border-stone-light text-parchment/60 hover:text-parchment text-sm"
          >
            Cancel
          </button>
        </div>
      )}

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
          {/* User-defined sections */}
          {character.sections.map((sec) => {
            const items = visible.filter((a) => a.section_id === sec.id)
            return (
              <div key={sec.id}>
                {/* Section header with rename / delete */}
                <div className="flex items-center gap-2 mb-2">
                  {renamingId === sec.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameSection(sec.id, renameValue)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      onBlur={() => renameSection(sec.id, renameValue)}
                      className="text-xs font-cinzel uppercase tracking-wider bg-stone-dark border border-wotr-gold/40 rounded px-2 py-0.5 text-parchment w-40"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-wider opacity-70 font-cinzel">{sec.name}</span>
                  )}
                  <button
                    onClick={() => { setRenamingId(sec.id); setRenameValue(sec.name) }}
                    className="text-parchment/30 hover:text-wotr-gold text-xs px-1"
                    title="Rename section"
                  >
                    ✎
                  </button>
                  {deletingId === sec.id ? (
                    <span className="flex items-center gap-1 text-xs">
                      <span className="text-abyssal-red">Delete section?</span>
                      <button
                        onClick={() => deleteSection(sec.id)}
                        className="px-2 py-0.5 rounded bg-abyssal-red text-parchment"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-0.5 rounded border border-stone-light text-parchment/60"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeletingId(sec.id)}
                      className="text-parchment/20 hover:text-abyssal-red text-xs px-1"
                      title="Delete section (abilities move to Unsorted)"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {items.length === 0 ? (
                  <div className="rounded border border-dashed border-stone-light/40 p-4 text-center text-xs opacity-50">
                    No cards here — edit an ability and pick this section.
                  </div>
                ) : (
                  <AbilitySectionGrid
                    items={items}
                    onEdit={setEditing}
                    onChanged={onChanged}
                  />
                )}
              </div>
            )
          })}

          {/* Auto-buckets for abilities not yet moved to a custom section */}
          {(() => {
            const unassigned = visible.filter((a) => a.section_id == null)
            if (unassigned.length === 0) return null
            const limited = unassigned.filter((a) => a.uses_max != null)
            const atWill = unassigned.filter((a) => a.uses_max == null && a.action_type !== 'passive')
            const passive = unassigned.filter((a) => a.action_type === 'passive')
            return (
              <>
                {limited.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">Limited use</div>
                    <AbilitySectionGrid items={limited} onEdit={setEditing} onChanged={onChanged} />
                  </div>
                )}
                {atWill.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">At will</div>
                    <AbilitySectionGrid items={atWill} onEdit={setEditing} onChanged={onChanged} />
                  </div>
                )}
                {passive.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2 font-cinzel">Reminders</div>
                    <AbilitySectionGrid items={passive} onEdit={setEditing} onChanged={onChanged} />
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Parked */}
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
          sections={character.sections}
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
          sections={character.sections}
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

function AbilitySectionGrid({
  items,
  onEdit,
  onChanged
}: {
  items: Ability[]
  onEdit: (a: Ability) => void
  onChanged: () => void | Promise<void>
}) {
  const sensors = useSensors(
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((a) => a.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((a) => (
            <SortableAbilityCard key={a.id} ability={a} onEdit={onEdit} onChanged={onChanged} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
