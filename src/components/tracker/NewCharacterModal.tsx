'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ENERGY_TYPES, type EnergyType } from '@/lib/tracker/types'
import { TEMPLATES } from '@/lib/tracker/templates'
import type { ExtractedCharacter } from '@/lib/tracker/extracted'

interface Props {
  onClose: () => void
  onCreated: () => void | Promise<void>
}

interface DrRow {
  amount: string
  bypass: string
}
interface ResRow {
  energy_type: EnergyType
  amount: string
}

export function NewCharacterModal({ onClose, onCreated }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastPdfFile = useRef<File | null>(null)

  const [templateKey, setTemplateKey] = useState('none')
  const [name, setName] = useState('')
  const [classSummary, setClassSummary] = useState('')
  const [level, setLevel] = useState('')
  const [maxHp, setMaxHp] = useState('')
  const [fortification, setFortification] = useState('0')
  const [ac, setAc] = useState('')
  const [acTouch, setAcTouch] = useState('')
  const [acFlatFooted, setAcFlatFooted] = useState('')
  const [spellDc, setSpellDc] = useState('')
  const [drs, setDrs] = useState<DrRow[]>([])
  const [resistances, setResistances] = useState<ResRow[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<EnergyType[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PDF-parse state
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedCharacter | null>(null)
  // Indices into extracted.{abilities,spells,pools} that the user wants to keep
  const [keptAbilityIdx, setKeptAbilityIdx] = useState<Set<number>>(new Set())
  const [keptSpellIdx, setKeptSpellIdx] = useState<Set<number>>(new Set())
  const [keptPoolIdx, setKeptPoolIdx] = useState<Set<number>>(new Set())

  // Template populate
  useEffect(() => {
    const t = TEMPLATES.find((x) => x.key === templateKey)
    if (!t || t.key === 'none') return
    const p = t.preset
    if (p.class_summary != null) setClassSummary(p.class_summary)
    if (p.level != null) setLevel(String(p.level))
    if (p.max_hp) setMaxHp(String(p.max_hp))
    if (p.fortification_percent != null) setFortification(String(p.fortification_percent))
    if (p.ac != null) setAc(String(p.ac))
    if (p.ac_touch != null) setAcTouch(String(p.ac_touch))
    if (p.ac_flat_footed != null) setAcFlatFooted(String(p.ac_flat_footed))
    if (p.spell_dc != null) setSpellDc(String(p.spell_dc))
    if (p.drs) setDrs(p.drs.map((d) => ({ amount: String(d.amount), bypass: d.bypass })))
    if (p.vulnerabilities) setVulnerabilities(p.vulnerabilities.map((v) => v.energy_type))
  }, [templateKey])

  function applyExtractedToForm(e: ExtractedCharacter) {
    if (e.name) setName(e.name)
    if (e.class_summary) setClassSummary(e.class_summary)
    if (e.level != null) setLevel(String(e.level))
    if (e.max_hp) setMaxHp(String(e.max_hp))
    setFortification(String(e.fortification_percent ?? 0))
    setAc(e.ac != null ? String(e.ac) : '')
    setAcTouch(e.ac_touch != null ? String(e.ac_touch) : '')
    setAcFlatFooted(e.ac_flat_footed != null ? String(e.ac_flat_footed) : '')
    setSpellDc(e.spell_dc != null ? String(e.spell_dc) : '')
    setDrs((e.drs ?? []).map((d) => ({ amount: String(d.amount), bypass: d.bypass })))
    setResistances((e.resistances ?? []).map((r) => ({ energy_type: r.energy_type, amount: String(r.amount) })))
    setVulnerabilities((e.vulnerabilities ?? []).map((v) => v.energy_type))
    // Default all extracted items to kept
    setKeptAbilityIdx(new Set((e.abilities ?? []).map((_, i) => i)))
    setKeptSpellIdx(new Set((e.spells ?? []).map((_, i) => i)))
    setKeptPoolIdx(new Set((e.pools ?? []).map((_, i) => i)))
  }

  async function parsePdf(file: File) {
    setParsing(true)
    setParseError(null)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      const res = await fetch('/api/tracker/parse-character-pdf', {
        method: 'POST',
        body: formData
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      const extr = json.extracted as ExtractedCharacter
      setExtracted(extr)
      applyExtractedToForm(extr)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e))
    } finally {
      setParsing(false)
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    lastPdfFile.current = file
    parsePdf(file)
  }

  function reparse() {
    if (lastPdfFile.current) parsePdf(lastPdfFile.current)
  }

  function clearExtracted() {
    setExtracted(null)
    setParseError(null)
    setKeptAbilityIdx(new Set())
    setKeptSpellIdx(new Set())
    setKeptPoolIdx(new Set())
    lastPdfFile.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function toggleKept(set: Set<number>, setter: (s: Set<number>) => void, idx: number) {
    const next = new Set(set)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setter(next)
  }

  async function submit() {
    setError(null)
    const max = parseInt(maxHp, 10)
    const fort = parseInt(fortification, 10) || 0
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(max) || max <= 0) return setError('Max HP must be a positive number.')

    setSubmitting(true)
    try {
      const parseOptInt = (s: string): number | undefined => {
        if (!s.trim()) return undefined
        const n = parseInt(s, 10)
        return Number.isFinite(n) ? n : undefined
      }

      const template = TEMPLATES.find((x) => x.key === templateKey)
      const templateSeedAbilities = template?.preset.seed_abilities

      // Build the seed lists from extracted + per-item checkboxes
      const seedAbilitiesFromPdf = extracted
        ? extracted.abilities
            .map((a, i) => (keptAbilityIdx.has(i) ? a : null))
            .filter((a): a is NonNullable<typeof a> => a !== null)
            .map((a) => ({
              name: a.name,
              category: a.category,
              action_type: a.action_type ?? undefined,
              description: a.description,
              uses_max: a.uses_max ?? undefined,
              uses_remaining: a.uses_max ?? undefined,
              recharge: a.recharge ?? undefined
            }))
        : undefined

      const seedSpells = extracted
        ? extracted.spells
            .map((s, i) => (keptSpellIdx.has(i) ? s : null))
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .map((s) => ({
              name: s.name,
              level: s.level,
              casting_class: s.casting_class,
              school: s.school ?? undefined,
              description: s.description ?? undefined,
              prepared_count: s.prepared_count
            }))
        : undefined

      const seedPools = extracted
        ? extracted.pools
            .map((p, i) => (keptPoolIdx.has(i) ? p : null))
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .map((p) => ({
              name: p.name,
              points_max: p.points_max,
              recharge: p.recharge ?? undefined
            }))
        : undefined

      const body = {
        name: name.trim(),
        class_summary: classSummary.trim() || undefined,
        level: level ? parseInt(level, 10) : undefined,
        max_hp: max,
        fortification_percent: fort,
        ac: parseOptInt(ac),
        ac_touch: parseOptInt(acTouch),
        ac_flat_footed: parseOptInt(acFlatFooted),
        spell_dc: parseOptInt(spellDc),
        // DM-detail fields flow straight from the PDF parse (reviewable/editable
        // afterward in the character editor). null when created from a template
        // or by hand.
        mythic_path: extracted?.mythic_path ?? undefined,
        mythic_tier: extracted?.mythic_tier ?? undefined,
        deity: extracted?.deity ?? undefined,
        alignment: extracted?.alignment ?? undefined,
        save_fort: extracted?.save_fort ?? undefined,
        save_ref: extracted?.save_ref ?? undefined,
        save_will: extracted?.save_will ?? undefined,
        cmb: extracted?.cmb ?? undefined,
        cmd: extracted?.cmd ?? undefined,
        languages: extracted?.languages ?? undefined,
        drs: drs
          .map((d) => ({ amount: parseInt(d.amount, 10), bypass: d.bypass.trim() || '—' }))
          .filter((d) => Number.isFinite(d.amount) && d.amount > 0),
        resistances: resistances
          .map((r) => ({ energy_type: r.energy_type, amount: parseInt(r.amount, 10) }))
          .filter((r) => Number.isFinite(r.amount) && r.amount > 0),
        vulnerabilities: vulnerabilities.map((energy_type) => ({ energy_type })),
        // PDF parse takes precedence over template if both were used
        seed_abilities: seedAbilitiesFromPdf ?? templateSeedAbilities,
        seed_spells: seedSpells,
        seed_pools: seedPools
      }

      const res = await fetch('/api/tracker/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onCreated()
      router.push(`/wrath/tracker/${json.character.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  const tplDescription = TEMPLATES.find((t) => t.key === templateKey)?.description

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-xl p-6 w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">New character</h2>

        {/* Quick-start row: template or PDF */}
        <div className="mb-4 p-3 rounded border border-wotr-gold/20 bg-stone-light/20 space-y-3">
          <div className="text-xs uppercase tracking-wider font-cinzel opacity-70">
            Quick start (optional)
          </div>
          <div className="flex flex-wrap gap-3 items-start">
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs opacity-70 mb-1">Pick a template</span>
              <select
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value)}
                className="tracker-input"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex-1 min-w-[200px]">
              <span className="block text-xs opacity-70 mb-1">…or upload a Hero Lab PDF</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="w-full px-3 py-2 rounded border border-wotr-gold/60 text-wotr-gold hover:bg-wotr-gold/10 text-sm font-cinzel disabled:opacity-50"
              >
                {parsing ? 'Parsing…' : extracted ? 'Replace PDF' : 'Upload PDF'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={onFilePicked}
                className="hidden"
              />
            </div>
          </div>
          {tplDescription && templateKey !== 'none' && !extracted && (
            <div className="text-xs opacity-70">{tplDescription}</div>
          )}
          {parseError && (
            <div className="p-2 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-sm">
              <strong>Parse failed:</strong> {parseError}
            </div>
          )}
          {extracted && (
            <div className="p-2 rounded border border-emerald-700/60 bg-emerald-900/20 text-xs">
              <strong className="text-emerald-300">PDF parsed.</strong> Form below pre-filled.
              Review the abilities/spells/pools at the bottom — uncheck anything you don&apos;t want.
              <div className="mt-2 flex gap-3">
                <button onClick={reparse} disabled={parsing} className="underline hover:text-emerald-200">
                  Re-parse this PDF
                </button>
                <button onClick={clearExtracted} className="underline hover:text-emerald-200">
                  Clear PDF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Field label="Name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="tracker-input"
              placeholder="Korroc"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Class summary" className="col-span-2">
              <input
                value={classSummary}
                onChange={(e) => setClassSummary(e.target.value)}
                className="tracker-input"
                placeholder="Fighter 5 / Rogue 3"
              />
            </Field>
            <Field label="Level">
              <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} className="tracker-input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max HP">
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
                className="tracker-input"
                placeholder="50"
              />
            </Field>
            <Field label="Fortification %">
              <input
                type="number"
                value={fortification}
                onChange={(e) => setFortification(e.target.value)}
                className="tracker-input"
                placeholder="0"
              />
            </Field>
          </div>

          <div>
            <span className="text-sm opacity-80 block mb-1">Armor Class (optional)</span>
            <div className="grid grid-cols-3 gap-3">
              <Field label="AC">
                <input
                  type="number"
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Touch">
                <input
                  type="number"
                  value={acTouch}
                  onChange={(e) => setAcTouch(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Flat-Footed">
                <input
                  type="number"
                  value={acFlatFooted}
                  onChange={(e) => setAcFlatFooted(e.target.value)}
                  className="tracker-input"
                  placeholder="—"
                />
              </Field>
            </div>
          </div>

          <Field label="Spell DC (optional)">
            <input
              type="number"
              value={spellDc}
              onChange={(e) => setSpellDc(e.target.value)}
              className="tracker-input"
              placeholder="—"
            />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm opacity-80">Damage reduction</span>
              <button
                onClick={() => setDrs((rows) => [...rows, { amount: '', bypass: '' }])}
                className="text-wotr-gold text-xs hover:underline"
              >
                + Add DR
              </button>
            </div>
            {drs.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[80px_1fr_auto] gap-2 mb-1">
                <input
                  type="number"
                  placeholder="5"
                  value={row.amount}
                  onChange={(e) =>
                    setDrs((rows) => rows.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r)))
                  }
                  className="tracker-input"
                />
                <input
                  placeholder="magic, cold iron, —"
                  value={row.bypass}
                  onChange={(e) =>
                    setDrs((rows) => rows.map((r, i) => (i === idx ? { ...r, bypass: e.target.value } : r)))
                  }
                  className="tracker-input"
                />
                <button
                  onClick={() => setDrs((rows) => rows.filter((_, i) => i !== idx))}
                  className="text-parchment/60 hover:text-abyssal-red px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm opacity-80">Energy resistance</span>
              <button
                onClick={() => setResistances((rows) => [...rows, { energy_type: 'fire', amount: '' }])}
                className="text-wotr-gold text-xs hover:underline"
              >
                + Add resistance
              </button>
            </div>
            {resistances.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[120px_80px_auto] gap-2 mb-1">
                <select
                  value={row.energy_type}
                  onChange={(e) =>
                    setResistances((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, energy_type: e.target.value as EnergyType } : r))
                    )
                  }
                  className="tracker-input"
                >
                  {ENERGY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="5"
                  value={row.amount}
                  onChange={(e) =>
                    setResistances((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r))
                    )
                  }
                  className="tracker-input"
                />
                <button
                  onClick={() => setResistances((rows) => rows.filter((_, i) => i !== idx))}
                  className="text-parchment/60 hover:text-abyssal-red px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div>
            <span className="text-sm opacity-80 block mb-1">Vulnerabilities (×1.5 damage)</span>
            <div className="flex flex-wrap gap-2">
              {ENERGY_TYPES.map((t) => {
                const on = vulnerabilities.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() =>
                      setVulnerabilities((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))
                    }
                    className={`px-2 py-1 rounded text-xs border ${
                      on
                        ? 'bg-abyssal-red/40 border-abyssal-red/70 text-parchment'
                        : 'bg-stone-dark border-stone-light text-parchment/60 hover:text-parchment'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* PDF review sections */}
          {extracted && (
            <>
              {extracted.abilities.length > 0 && (
                <ReviewSection
                  title={`Abilities (${keptAbilityIdx.size}/${extracted.abilities.length})`}
                  items={extracted.abilities.map((a, i) => ({
                    idx: i,
                    label: a.name,
                    sub: [
                      a.category,
                      a.action_type,
                      a.uses_max != null
                        ? `${a.uses_max}${a.recharge ? '/' + a.recharge.replace('_', ' ') : ''}`
                        : null
                    ]
                      .filter(Boolean)
                      .join(' · '),
                    detail: a.description
                  }))}
                  keptSet={keptAbilityIdx}
                  onToggle={(i) => toggleKept(keptAbilityIdx, setKeptAbilityIdx, i)}
                />
              )}

              {extracted.spells.length > 0 && (
                <ReviewSection
                  title={`Spells (${keptSpellIdx.size}/${extracted.spells.length})`}
                  items={extracted.spells.map((s, i) => ({
                    idx: i,
                    label: s.name,
                    sub: [
                      `L${s.level} ${s.casting_class}`,
                      s.school,
                      s.prepared_count != null ? `prepared ${s.prepared_count}` : 'spontaneous'
                    ]
                      .filter(Boolean)
                      .join(' · '),
                    detail: s.description ?? null
                  }))}
                  keptSet={keptSpellIdx}
                  onToggle={(i) => toggleKept(keptSpellIdx, setKeptSpellIdx, i)}
                />
              )}

              {extracted.pools.length > 0 && (
                <ReviewSection
                  title={`Resource pools (${keptPoolIdx.size}/${extracted.pools.length})`}
                  items={extracted.pools.map((p, i) => ({
                    idx: i,
                    label: p.name,
                    sub: `max ${p.points_max} · ${p.recharge ?? 'manual'}`,
                    detail: null
                  }))}
                  keptSet={keptPoolIdx}
                  onToggle={(i) => toggleKept(keptPoolIdx, setKeptPoolIdx, i)}
                />
              )}

              {extracted.abilities.length === 0 &&
                extracted.spells.length === 0 &&
                extracted.pools.length === 0 && (
                  <div className="text-sm opacity-60 italic">
                    Parser extracted no abilities, spells, or pools from this PDF.
                  </div>
                )}
            </>
          )}

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={submit} disabled={submitting || parsing} className="btn-primary">
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      <style>{`
        .tracker-input {
          width: 100%;
          padding: 0.4rem 0.6rem;
          background: #0b1120;
          border: 1px solid #334155;
          border-radius: 0.375rem;
          color: #f1f5f9;
          font-size: 0.875rem;
        }
        .tracker-input:focus { outline: 2px solid #c5b358; outline-offset: -1px; }
        .btn-primary {
          padding: 0.45rem 1rem; background: #059669; color: white;
          border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem;
        }
        .btn-primary:hover { background: #047857; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          padding: 0.45rem 1rem; background: transparent; color: #cbd5e1;
          border: 1px solid #334155; border-radius: 0.375rem; font-size: 0.875rem;
        }
        .btn-secondary:hover { background: #1e293b; }
      `}</style>
    </div>
  )
}

function Field({
  label,
  children,
  className
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-sm opacity-80 mb-1">{label}</span>
      {children}
    </label>
  )
}

interface ReviewItem {
  idx: number
  label: string
  sub: string
  detail: string | null
}

function ReviewSection({
  title,
  items,
  keptSet,
  onToggle
}: {
  title: string
  items: ReviewItem[]
  keptSet: Set<number>
  onToggle: (idx: number) => void
}) {
  const [open, setOpen] = useState(true)
  if (items.length === 0) return null
  return (
    <div className="border border-stone-light rounded">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-2 text-xs uppercase tracking-wider font-cinzel hover:bg-stone-light/30"
      >
        <span>
          {open ? '▾' : '▸'} {title}
        </span>
        <span className="text-[10px] opacity-60 normal-case tracking-normal">
          uncheck to skip · edit after create
        </span>
      </button>
      {open && (
        <div className="border-t border-stone-light divide-y divide-stone-light/60 max-h-64 overflow-auto">
          {items.map((item) => {
            const kept = keptSet.has(item.idx)
            return (
              <label
                key={item.idx}
                className={`flex items-start gap-2 p-2 cursor-pointer hover:bg-stone-light/20 ${kept ? '' : 'opacity-40'}`}
              >
                <input
                  type="checkbox"
                  checked={kept}
                  onChange={() => onToggle(item.idx)}
                  className="mt-1 w-4 h-4 accent-wotr-gold shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-cinzel text-sm text-parchment">{item.label}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">{item.sub}</div>
                  {item.detail && (
                    <div className="text-xs opacity-80 mt-1 leading-snug line-clamp-3">{item.detail}</div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
