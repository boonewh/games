'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Spell, SpellSchool } from '@/lib/tracker/types'
import { SPELL_SCHOOLS } from '@/lib/tracker/types'

interface Props {
  characterId: string
  spells: Spell[]
  initialClass?: string
  initialLevel?: number
  onClose: () => void
  onChanged: () => void | Promise<void>
}

function aonSpellUrl(name: string): string {
  return `https://www.aonprd.com/SpellDisplay.aspx?ItemName=${encodeURIComponent(name)}`
}

const ORDINAL = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']

export function SpellsModal({
  characterId,
  spells,
  initialClass,
  initialLevel,
  onClose,
  onChanged
}: Props) {
  // Unique casting classes the character has spells in
  const classes = useMemo(
    () => Array.from(new Set(spells.map((s) => s.casting_class))).sort(),
    [spells]
  )

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (initialClass && classes.includes(initialClass)) return initialClass
    return classes[0] ?? ''
  })

  // Spells in the selected class
  const classSpells = useMemo(
    () => spells.filter((s) => s.casting_class === selectedClass),
    [spells, selectedClass]
  )

  // Levels present in the selected class
  const levels = useMemo(
    () => Array.from(new Set(classSpells.map((s) => s.level))).sort((a, b) => a - b),
    [classSpells]
  )

  const [selectedLevel, setSelectedLevel] = useState<number>(() => {
    if (initialLevel != null && levels.includes(initialLevel)) return initialLevel
    return levels[0] ?? 0
  })

  // When class changes, pick a sensible default level
  useEffect(() => {
    if (!levels.includes(selectedLevel)) {
      setSelectedLevel(levels[0] ?? 0)
    }
  }, [selectedClass, levels, selectedLevel])

  const levelSpells = classSpells
    .filter((s) => s.level === selectedLevel)
    .sort((a, b) => a.name.localeCompare(b.name))

  const [addingNew, setAddingNew] = useState(false)
  const [editing, setEditing] = useState<Spell | null>(null)

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl w-full max-w-3xl my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between p-6 pb-3 border-b border-stone-light">
          <h2 className="font-cinzel text-2xl text-wotr-gold">Spells</h2>
          <button onClick={onClose} className="text-parchment/60 hover:text-parchment text-sm">
            close
          </button>
        </div>

        {/* Class selector (only when multiple classes) */}
        {classes.length > 1 && (
          <div className="px-6 pt-3 flex gap-2 flex-wrap">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-3 py-1 rounded text-sm font-cinzel capitalize ${
                  c === selectedClass
                    ? 'bg-wotr-gold/90 text-stone-dark font-semibold'
                    : 'border border-stone-light text-parchment hover:bg-stone-light/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Level tabs (only if any spells in this class) */}
        {levels.length > 0 && (
          <div className="px-6 pt-3 flex gap-1 flex-wrap items-center">
            {levels.map((lvl) => {
              const levelSpellsForCount = classSpells.filter((s) => s.level === lvl)
              const totalPrepared = levelSpellsForCount.reduce(
                (sum, s) => sum + (s.prepared_count ?? 0),
                0
              )
              const totalCast = levelSpellsForCount.reduce((sum, s) => sum + s.cast_count, 0)
              const remaining = totalPrepared - totalCast
              const hasPrepared = totalPrepared > 0
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded text-xs font-cinzel ${
                    lvl === selectedLevel
                      ? 'bg-wotr-gold/90 text-stone-dark font-semibold'
                      : 'border border-stone-light text-parchment hover:bg-stone-light/40'
                  }`}
                >
                  {ORDINAL[lvl] ?? `L${lvl}`}
                  {hasPrepared && (
                    <span className="ml-1 opacity-70 tabular-nums">
                      ({remaining}/{totalPrepared})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Spell list for the selected class+level */}
        <div className="flex-1 overflow-auto p-6 pt-4">
          {classes.length === 0 ? (
            <div className="rounded border border-dashed border-stone-light p-8 text-center opacity-70">
              <div className="font-cinzel text-wotr-gold/70 mb-2">No spells yet</div>
              <div className="text-sm">
                Click <span className="text-wotr-gold">+ Add spell</span> below to add one manually.
                <br />
                (Eventually, your Hero Lab PDF will populate this automatically.)
              </div>
            </div>
          ) : levelSpells.length === 0 ? (
            <div className="text-sm opacity-60 italic">
              No {ORDINAL[selectedLevel]}-level spells for {selectedClass} yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {levelSpells.map((spell) => (
                <SpellRow
                  key={spell.id}
                  spell={spell}
                  onEdit={() => setEditing(spell)}
                  onChanged={onChanged}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-light flex items-center justify-between gap-3">
          <div className="text-xs opacity-60">
            Casting from this modal doesn&apos;t auto-decrement the slot card on the HP bar — click −1 on
            the slot card separately for now.
          </div>
          <button
            onClick={() => setAddingNew(true)}
            className="px-3 py-1.5 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold text-sm font-cinzel shrink-0"
          >
            + Add spell
          </button>
        </div>
      </div>

      {addingNew && (
        <SpellEditModal
          characterId={characterId}
          defaultClass={selectedClass}
          defaultLevel={selectedLevel}
          onClose={() => setAddingNew(false)}
          onSaved={async () => {
            setAddingNew(false)
            await onChanged()
          }}
        />
      )}
      {editing && (
        <SpellEditModal
          characterId={characterId}
          spell={editing}
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

function SpellRow({
  spell,
  onEdit,
  onChanged
}: {
  spell: Spell
  onEdit: () => void
  onChanged: () => void | Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const prepared = spell.prepared_count
  const cast = spell.cast_count
  const remaining = prepared != null ? Math.max(0, prepared - cast) : null
  const exhausted = remaining === 0
  const isSpontaneous = prepared == null

  async function postAction(action: 'cast' | 'uncast' | 'reset') {
    await fetch(`/api/tracker/spells/${spell.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
    await onChanged()
  }

  return (
    <li
      className={`rounded border p-3 transition ${
        exhausted ? 'border-stone-light bg-stone-light/20 opacity-60' : 'border-stone-light bg-stone-light/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 min-w-0 text-left group"
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-cinzel text-parchment group-hover:text-wotr-gold">{spell.name}</span>
            {spell.school && (
              <span className="text-[10px] uppercase tracking-wider opacity-60">{spell.school}</span>
            )}
            {!isSpontaneous && (
              <span className="text-xs tabular-nums opacity-70">
                {remaining}/{prepared} prepared
              </span>
            )}
          </div>
          {spell.description && !expanded && (
            <div className="text-xs opacity-70 mt-0.5 line-clamp-1">{spell.description}</div>
          )}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {isSpontaneous ? (
            <button
              onClick={() => postAction('cast')}
              className="px-2 py-1 text-xs rounded bg-wotr-gold/80 hover:bg-wotr-gold text-stone-dark font-semibold"
              title="Mark cast (does not decrement slot — click −1 on the slot card)"
            >
              Cast
            </button>
          ) : (
            <>
              <button
                onClick={() => postAction('cast')}
                disabled={exhausted}
                className="px-2 py-1 text-xs rounded bg-wotr-gold/80 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                title="Cast one of the prepared instances"
              >
                Cast
              </button>
              {cast > 0 && (
                <button
                  onClick={() => postAction('uncast')}
                  className="px-1.5 py-1 text-xs rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-parchment"
                  title="Undo a cast"
                >
                  +1
                </button>
              )}
            </>
          )}
          <a
            href={aonSpellUrl(spell.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-1.5 py-1 text-xs rounded text-parchment/40 hover:text-wotr-gold hover:bg-stone-light/60"
            title="Open on Archives of Nethys"
          >
            ↗
          </a>
          <button
            onClick={onEdit}
            className="px-1.5 py-1 text-xs rounded text-parchment/40 hover:text-wotr-gold hover:bg-stone-light/60"
            title="Edit spell"
          >
            ✎
          </button>
        </div>
      </div>
      {expanded && spell.description && (
        <div className="mt-2 pt-2 border-t border-stone-light text-sm opacity-90 leading-snug whitespace-pre-wrap">
          {spell.description}
        </div>
      )}
      {expanded && spell.notes && (
        <div className="mt-1 text-xs italic opacity-60">&ldquo;{spell.notes}&rdquo;</div>
      )}
    </li>
  )
}

interface SpellEditProps {
  characterId: string
  spell?: Spell
  defaultClass?: string
  defaultLevel?: number
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function SpellEditModal({
  characterId,
  spell,
  defaultClass,
  defaultLevel,
  onClose,
  onSaved
}: SpellEditProps) {
  const isNew = !spell
  const [name, setName] = useState(spell?.name ?? '')
  const [level, setLevel] = useState(String(spell?.level ?? defaultLevel ?? 0))
  const [castingClass, setCastingClass] = useState(spell?.casting_class ?? defaultClass ?? '')
  const [school, setSchool] = useState<SpellSchool | ''>((spell?.school as SpellSchool | null) ?? '')
  const [description, setDescription] = useState(spell?.description ?? '')
  const [preparedCount, setPreparedCount] = useState(
    spell?.prepared_count != null ? String(spell.prepared_count) : ''
  )
  const [notes, setNotes] = useState(spell?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function save() {
    setError(null)
    if (!name.trim()) return setError('Name is required.')
    if (!castingClass.trim()) return setError('Casting class is required.')
    const lvl = parseInt(level, 10)
    if (!Number.isFinite(lvl) || lvl < 0 || lvl > 9) return setError('Level must be 0–9.')

    const preparedNum = preparedCount.trim() ? parseInt(preparedCount, 10) : null
    if (preparedNum != null && (!Number.isFinite(preparedNum) || preparedNum < 0)) {
      return setError('Prepared count must be a non-negative number or blank.')
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        level: lvl,
        casting_class: castingClass.trim().toLowerCase(),
        school: school || null,
        description: description.trim() || null,
        prepared_count: preparedNum,
        notes: notes.trim() || null
      }
      const url = isNew
        ? `/api/tracker/characters/${characterId}/spells`
        : `/api/tracker/spells/${spell!.id}`
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
    if (!spell) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tracker/spells/${spell.id}`, { method: 'DELETE' })
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
      className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-[60] p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">
          {isNew ? 'New spell' : `Edit ${spell!.name}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Magic Missile, Cure Light Wounds, etc."
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Level</span>
              <input
                type="number"
                min={0}
                max={9}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
            <label className="block col-span-2">
              <span className="block text-sm opacity-80 mb-1">Casting class</span>
              <input
                value={castingClass}
                onChange={(e) => setCastingClass(e.target.value)}
                placeholder="paladin, oracle, wizard…"
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">School</span>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value as SpellSchool | '')}
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment capitalize"
              >
                <option value="">— none —</option>
                {SPELL_SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm opacity-80 mb-1">Prepared today</span>
              <input
                type="number"
                min={0}
                value={preparedCount}
                onChange={(e) => setPreparedCount(e.target.value)}
                placeholder="blank = spontaneous"
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short rules summary."
              className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment text-sm leading-snug"
            />
          </label>

          <label className="block">
            <span className="block text-sm opacity-80 mb-1">Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="DC, special metamagic, etc."
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
                Delete spell
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
