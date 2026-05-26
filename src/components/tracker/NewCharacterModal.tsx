'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ENERGY_TYPES, type EnergyType } from '@/lib/tracker/types'
import { TEMPLATES } from '@/lib/tracker/templates'

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
  const [templateKey, setTemplateKey] = useState('none')
  const [name, setName] = useState('')
  const [classSummary, setClassSummary] = useState('')
  const [level, setLevel] = useState('')
  const [maxHp, setMaxHp] = useState('')
  const [fortification, setFortification] = useState('0')
  const [drs, setDrs] = useState<DrRow[]>([])
  const [resistances, setResistances] = useState<ResRow[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<EnergyType[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = TEMPLATES.find((x) => x.key === templateKey)
    if (!t || t.key === 'none') return
    const p = t.preset
    if (p.class_summary != null) setClassSummary(p.class_summary)
    if (p.level != null) setLevel(String(p.level))
    if (p.max_hp) setMaxHp(String(p.max_hp))
    if (p.fortification_percent != null) setFortification(String(p.fortification_percent))
    if (p.drs) setDrs(p.drs.map((d) => ({ amount: String(d.amount), bypass: d.bypass })))
    if (p.vulnerabilities) setVulnerabilities(p.vulnerabilities.map((v) => v.energy_type))
  }, [templateKey])

  async function submit() {
    setError(null)
    const max = parseInt(maxHp, 10)
    const fort = parseInt(fortification, 10) || 0
    if (!name.trim()) return setError('Name is required.')
    if (!Number.isFinite(max) || max <= 0) return setError('Max HP must be a positive number.')

    setSubmitting(true)
    try {
      const template = TEMPLATES.find((x) => x.key === templateKey)
      const seed_abilities = template?.preset.seed_abilities

      const body = {
        name: name.trim(),
        class_summary: classSummary.trim() || undefined,
        level: level ? parseInt(level, 10) : undefined,
        max_hp: max,
        fortification_percent: fort,
        drs: drs
          .map((d) => ({ amount: parseInt(d.amount, 10), bypass: d.bypass.trim() || '—' }))
          .filter((d) => Number.isFinite(d.amount) && d.amount > 0),
        resistances: resistances
          .map((r) => ({ energy_type: r.energy_type, amount: parseInt(r.amount, 10) }))
          .filter((r) => Number.isFinite(r.amount) && r.amount > 0),
        vulnerabilities: vulnerabilities.map((energy_type) => ({ energy_type })),
        seed_abilities
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
      className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-2xl text-wotr-gold mb-4">New character</h2>

        <div className="space-y-3">
          <Field label="Template">
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
            {tplDescription && tplDescription !== 'Fill in everything manually.' && (
              <div className="text-xs opacity-70 mt-1">{tplDescription}</div>
            )}
          </Field>

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
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="tracker-input"
              />
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
                        ? 'bg-abyssal-red/30 border-abyssal-red/70 text-parchment'
                        : 'bg-stone-dark border-stone-light text-parchment/60 hover:text-parchment'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <div className="text-abyssal-red text-sm">{error}</div>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create'}
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
