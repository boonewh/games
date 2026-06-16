'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Character } from '@/lib/tracker/types'
import type { ExtractedCharacter } from '@/lib/tracker/extracted'
import { MergeReviewModal } from './MergeReviewModal'

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
  const [ac, setAc] = useState(character.ac != null ? String(character.ac) : '')
  const [acTouch, setAcTouch] = useState(character.ac_touch != null ? String(character.ac_touch) : '')
  const [acFlatFooted, setAcFlatFooted] = useState(
    character.ac_flat_footed != null ? String(character.ac_flat_footed) : ''
  )
  const [mythicPath, setMythicPath] = useState(character.mythic_path ?? '')
  const [mythicTier, setMythicTier] = useState(
    character.mythic_tier != null ? String(character.mythic_tier) : ''
  )
  // DM-visibility fields (shown on the GM dashboard, not the player screen).
  const [deity, setDeity] = useState(character.deity ?? '')
  const [alignment, setAlignment] = useState(character.alignment ?? '')
  const [saveFort, setSaveFort] = useState(character.save_fort != null ? String(character.save_fort) : '')
  const [saveRef, setSaveRef] = useState(character.save_ref != null ? String(character.save_ref) : '')
  const [saveWill, setSaveWill] = useState(character.save_will != null ? String(character.save_will) : '')
  const [cmb, setCmb] = useState(character.cmb != null ? String(character.cmb) : '')
  const [cmd, setCmd] = useState(character.cmd != null ? String(character.cmd) : '')
  const [languages, setLanguages] = useState(character.languages ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // "Update from PDF" — parse, then hand off to the merge review modal.
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [merging, setMerging] = useState<ExtractedCharacter | null>(null)

  async function onPdfPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    setParseError(null)
    try {
      const fd = new FormData()
      fd.append('pdf', file)
      const res = await fetch('/api/tracker/parse-character-pdf', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setMerging(json.extracted as ExtractedCharacter)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err))
    } finally {
      setParsing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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
      const parseOptInt = (s: string): number | null => {
        if (!s.trim()) return null
        const n = parseInt(s, 10)
        return Number.isFinite(n) ? n : null
      }

      const res = await fetch(`/api/tracker/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          class_summary: classSummary.trim() || null,
          level: level ? parseInt(level, 10) : null,
          max_hp: max,
          current_hp: curr,
          fortification_percent: Math.max(0, Math.min(100, fort)),
          ac: parseOptInt(ac),
          ac_touch: parseOptInt(acTouch),
          ac_flat_footed: parseOptInt(acFlatFooted),
          mythic_path: mythicPath.trim() || null,
          mythic_tier: parseOptInt(mythicTier),
          deity: deity.trim() || null,
          alignment: alignment.trim() || null,
          save_fort: parseOptInt(saveFort),
          save_ref: parseOptInt(saveRef),
          save_will: parseOptInt(saveWill),
          cmb: parseOptInt(cmb),
          cmd: parseOptInt(cmd),
          languages: languages.trim() || null
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
    <>
    <div
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">Edit {character.name}</h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={parsing}
            className="px-3 py-1.5 text-sm rounded border border-wotr-gold/60 text-wotr-gold hover:bg-wotr-gold/10 disabled:opacity-50"
          >
            {parsing ? 'Parsing…' : 'Update from PDF'}
          </button>
          <span className="text-xs opacity-50">Re-parse a Hero Lab PDF and review what changed.</span>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={onPdfPicked} className="hidden" />
        </div>
        {parseError && <div className="text-abyssal-red text-sm mb-3">Parse failed: {parseError}</div>}

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

          <div>
            <div className="text-sm opacity-80 mb-1 font-cinzel uppercase tracking-wider text-wotr-gold/80">
              Armor Class
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">AC</span>
                <input
                  type="number"
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Touch</span>
                <input
                  type="number"
                  value={acTouch}
                  onChange={(e) => setAcTouch(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Flat-Footed</span>
                <input
                  type="number"
                  value={acFlatFooted}
                  onChange={(e) => setAcFlatFooted(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </label>
            </div>
          </div>

          <div className="text-xs opacity-50">Spell DCs are managed in the Spell DCs panel on the character screen.</div>

          <div>
            <div className="text-sm opacity-80 mb-1 font-cinzel uppercase tracking-wider text-wotr-gold/80">
              GM details
            </div>
            <div className="text-xs opacity-50 mb-2">
              Shown on the GM dashboard, not your combat screen.
            </div>
            <div className="grid grid-cols-[1fr_90px] gap-3 mb-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Mythic path</span>
                <input
                  value={mythicPath}
                  onChange={(e) => setMythicPath(e.target.value)}
                  className="tracker-input"
                  placeholder="e.g. Hierophant / Guardian"
                />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Tier</span>
                <input
                  type="number"
                  value={mythicTier}
                  onChange={(e) => setMythicTier(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Deity</span>
                <input value={deity} onChange={(e) => setDeity(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Alignment</span>
                <input
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                  className="tracker-input"
                  placeholder="e.g. LG"
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Fort</span>
                <input type="number" value={saveFort} onChange={(e) => setSaveFort(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Ref</span>
                <input type="number" value={saveRef} onChange={(e) => setSaveRef(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">Will</span>
                <input type="number" value={saveWill} onChange={(e) => setSaveWill(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">CMB</span>
                <input type="number" value={cmb} onChange={(e) => setCmb(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1">CMD</span>
                <input type="number" value={cmd} onChange={(e) => setCmd(e.target.value)} className="tracker-input" placeholder="—" />
              </label>
            </div>
            <label className="block mt-3">
              <span className="block text-xs opacity-70 mb-1">Languages</span>
              <input
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="tracker-input"
                placeholder="Common, Dwarven, …"
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

    {merging && (
      <MergeReviewModal
        characterId={character.id}
        incoming={merging}
        onClose={() => setMerging(null)}
        onApplied={async () => {
          await onSaved()
          onClose()
        }}
      />
    )}
    </>
  )
}
