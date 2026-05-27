'use client'

import { useEffect, useState } from 'react'
import type { CharacterDetail, DamageType } from '@/lib/tracker/types'
import { DAMAGE_TYPES } from '@/lib/tracker/types'
import { CharacterEditModal } from './CharacterEditModal'
import { ConditionsBar } from './ConditionsBar'
import { PoolsCard } from './PoolsCard'

interface Props {
  character: CharacterDetail
  onChanged: () => void | Promise<void>
}

export function HpPanel({ character, onChanged }: Props) {
  const [damageAmount, setDamageAmount] = useState('')
  const [damageType, setDamageType] = useState<DamageType>('physical')
  const [bypassesDr, setBypassesDr] = useState(false)
  const [isCrit, setIsCrit] = useState(false)
  const [critMultiplier, setCritMultiplier] = useState(2)
  const [healAmount, setHealAmount] = useState('')
  const [tempHpInput, setTempHpInput] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'info' | 'damage' | 'heal'>('info')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  const ratio = character.max_hp > 0 ? character.current_hp / character.max_hp : 0
  const hpColor =
    ratio > 0.66 ? 'text-emerald-400' : ratio > 0.33 ? 'text-amber-300' : ratio > 0 ? 'text-abyssal-red' : 'text-abyssal-red'

  const vulnTypes = new Set(character.vulnerabilities.filter((v) => v.enabled).map((v) => v.energy_type))
  const willBeVulnerable = damageType !== 'physical' && vulnTypes.has(damageType as never)

  async function postHp(action: string, body: Record<string, unknown>) {
    setBusy(true)
    try {
      const res = await fetch(`/api/tracker/characters/${character.id}/hp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      return json
    } finally {
      setBusy(false)
    }
  }

  async function submitDamage() {
    const amount = parseInt(damageAmount, 10)
    if (!Number.isFinite(amount) || amount <= 0) return
    try {
      const res = await postHp('damage', {
        amount,
        damage_type: damageType,
        bypasses_dr: damageType === 'physical' ? bypassesDr : undefined,
        is_crit: isCrit,
        crit_multiplier: isCrit ? critMultiplier : undefined
      })
      setStatus(res.message)
      setStatusKind('damage')
      setDamageAmount('')
      setBypassesDr(false)
      setIsCrit(false)
      setCritMultiplier(2)
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function submitHeal() {
    const amount = parseInt(healAmount, 10)
    if (!Number.isFinite(amount) || amount <= 0) return
    try {
      const res = await postHp('heal', { amount })
      setStatus(res.message)
      setStatusKind('heal')
      setHealAmount('')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function submitTempHp() {
    const amount = parseInt(tempHpInput, 10)
    if (!Number.isFinite(amount) || amount < 0) return
    try {
      const res = await postHp('temp_hp', { amount })
      setStatus(res.message)
      setStatusKind('info')
      setTempHpInput('')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function undo() {
    try {
      const res = await postHp('undo', {})
      setStatus(res.message)
      setStatusKind('info')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function longRest() {
    if (!confirm('Long rest: clear nonlethal and reset all per-day abilities. Continue?')) return
    try {
      const res = await postHp('long_rest', {})
      setStatus(res.message)
      setStatusKind('info')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id])

  return (
    <section className="border-b border-stone-light p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* HP + AC block */}
        <div className="flex flex-col items-center min-w-[240px] mx-auto lg:mx-0">
          <div className="text-xs uppercase tracking-wider opacity-60 font-cinzel mb-1">HP</div>
          <div className={`text-6xl font-bold tabular-nums ${hpColor}`}>
            {character.current_hp}
            <span className="opacity-50 text-3xl"> / {character.max_hp}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs justify-center">
            <Badge active={character.temp_hp > 0} label="Temp" value={character.temp_hp} color="sky" />
            <Badge active={character.nonlethal > 0} label="Nonlethal" value={character.nonlethal} color="amber" />
          </div>

          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-cinzel text-2xl text-parchment">{character.name}</h2>
              <button
                onClick={() => setEditing(true)}
                className="text-parchment/40 hover:text-wotr-gold text-sm"
                title="Edit character"
              >
                ✎
              </button>
            </div>
            {character.class_summary && <div className="text-sm opacity-70">{character.class_summary}</div>}
          </div>
        </div>

        {/* Damage + Heal */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="bg-stone-light/40 border border-stone-light rounded-lg p-4">
            <div className="text-sm font-semibold text-abyssal-red mb-2 font-cinzel uppercase tracking-wider">
              Damage
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitDamage()}
                placeholder="Amount"
                className="tracker-input flex-1 min-w-[100px]"
              />
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value as DamageType)}
                className="tracker-input w-32"
              >
                {DAMAGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                onClick={submitDamage}
                disabled={busy}
                className="px-4 py-2 rounded bg-abyssal-red hover:bg-abyssal-red/80 text-parchment font-semibold text-sm disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs opacity-80">
              {damageType === 'physical' && (
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={bypassesDr}
                    onChange={(e) => setBypassesDr(e.target.checked)}
                  />
                  Bypasses DR
                </label>
              )}
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={isCrit} onChange={(e) => setIsCrit(e.target.checked)} />
                Crit?
              </label>
              {isCrit && (
                <label className="flex items-center gap-1.5">
                  ×
                  <select
                    value={critMultiplier}
                    onChange={(e) => setCritMultiplier(parseInt(e.target.value, 10))}
                    className="tracker-input py-0 px-1 text-xs"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>
              )}
            </div>

            <div className="mt-2 text-xs space-y-0.5">
              {willBeVulnerable && (
                <div className="text-abyssal-red">⚠ Vulnerable to {damageType} — damage will be ×1.5.</div>
              )}
              {isCrit && character.fortification_percent > 0 && (
                <div className="text-wardstone-blue">
                  Will roll fortification ({character.fortification_percent}%) for crit negation.
                </div>
              )}
              {damageType !== 'physical' && (
                <div className="opacity-60">
                  DR does not apply to {damageType}. Energy resistance is subtracted automatically.
                </div>
              )}
            </div>
          </div>

          <div className="bg-stone-light/40 border border-stone-light rounded-lg p-4">
            <div className="text-sm font-semibold text-emerald-400 mb-2 font-cinzel uppercase tracking-wider">
              Heal
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={healAmount}
                onChange={(e) => setHealAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitHeal()}
                placeholder="Amount"
                className="tracker-input flex-1"
              />
              <button
                onClick={submitHeal}
                disabled={busy}
                className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-parchment font-semibold text-sm disabled:opacity-50"
              >
                Heal
              </button>
            </div>
            <div className="mt-3 text-sm font-semibold text-wardstone-blue mb-1 font-cinzel uppercase tracking-wider">
              Temp HP
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempHpInput}
                onChange={(e) => setTempHpInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitTempHp()}
                placeholder="Set to"
                className="tracker-input flex-1"
              />
              <button
                onClick={submitTempHp}
                disabled={busy}
                className="px-4 py-2 rounded border border-stone-light hover:bg-stone-light/60 text-parchment text-sm disabled:opacity-50"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AC | Conditions | Status+Buttons — three equal-height cards in one flex row. */}
      <div className="mt-4 flex flex-wrap items-stretch gap-3">
        {/* AC card (left) — content centered vertically when row stretches to match
            taller siblings (conditions, status) */}
        <div className="px-4 py-3 rounded border border-wotr-gold/40 bg-stone-light/30 flex items-center justify-around gap-5">
          <AcStat label="AC" value={character.ac} large />
          <AcStat label="Touch" value={character.ac_touch} />
          <AcStat label="FF" value={character.ac_flat_footed} />
        </div>

        {/* Resource pools (Ki, Mythic Power, etc.) */}
        <PoolsCard
          characterId={character.id}
          pools={character.pools}
          onChanged={onChanged}
          className="min-w-[220px]"
        />

        {/* Conditions (grows to fill remaining space) */}
        <ConditionsBar
          characterId={character.id}
          conditions={character.conditions}
          onChanged={onChanged}
          className="flex-1 min-w-[240px]"
        />

        {/* Status + Undo + Long Rest (right) */}
        <div
          className={`p-3 rounded border flex items-center gap-3 ${
            statusKind === 'damage'
              ? 'border-abyssal-red/50 bg-abyssal-red/15'
              : statusKind === 'heal'
                ? 'border-emerald-700/50 bg-emerald-900/20'
                : 'border-stone-light bg-stone-light/20'
          }`}
        >
          <div className="text-sm max-w-[260px] flex-1">
            {status ?? <span className="opacity-60 italic">Enter damage or heal to apply.</span>}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={undo}
              disabled={busy}
              className="px-3 py-1 text-xs rounded border border-stone-light hover:bg-stone-light/60 disabled:opacity-50"
              title="Ctrl+Z"
            >
              Undo
            </button>
            <button
              onClick={longRest}
              disabled={busy}
              className="px-3 py-1 text-xs rounded border border-stone-light hover:bg-stone-light/60 disabled:opacity-50"
              title="Reset per-day abilities and nonlethal"
            >
              Long Rest
            </button>
          </div>
        </div>
      </div>

      {(character.drs.length > 0 ||
        character.resistances.length > 0 ||
        character.vulnerabilities.length > 0 ||
        character.fortification_percent > 0) && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {character.drs.map((dr) => (
            <span
              key={`dr-${dr.id}`}
              className="px-2 py-1 rounded bg-stone-light/60 border border-stone-light text-parchment/90"
            >
              DR {dr.amount}/{dr.bypass}
            </span>
          ))}
          {character.resistances.map((r) => (
            <span
              key={`r-${r.id}`}
              className="px-2 py-1 rounded bg-stone-light/60 border border-stone-light text-parchment/90"
            >
              Resist {r.amount} {r.energy_type}
            </span>
          ))}
          {character.vulnerabilities.map((v) => (
            <span
              key={`v-${v.id}`}
              className="px-2 py-1 rounded bg-abyssal-red/20 border border-abyssal-red/50 text-parchment"
            >
              Vulnerable: {v.energy_type}
            </span>
          ))}
          {character.fortification_percent > 0 && (
            <span className="px-2 py-1 rounded bg-wardstone-blue/15 border border-wardstone-blue/40 text-parchment">
              Fortification {character.fortification_percent}%
            </span>
          )}
        </div>
      )}

      {editing && (
        <CharacterEditModal character={character} onClose={() => setEditing(false)} onSaved={onChanged} />
      )}

      <style>{`
        .tracker-input {
          padding: 0.45rem 0.6rem;
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
    </section>
  )
}

function Badge({
  active,
  label,
  value,
  color
}: {
  active: boolean
  label: string
  value: number
  color: 'sky' | 'amber'
}) {
  if (!active) return null
  const styles =
    color === 'sky'
      ? 'bg-wardstone-blue/20 border-wardstone-blue/50 text-parchment'
      : 'bg-amber-900/30 border-amber-700/50 text-parchment'
  return (
    <span className={`px-2 py-0.5 rounded border ${styles}`}>
      {label} {value}
    </span>
  )
}

function AcStat({ label, value, large }: { label: string; value: number | null; large?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider opacity-60 font-cinzel">{label}</span>
      <span className={`tabular-nums text-wotr-gold ${large ? 'text-2xl font-bold' : 'text-lg'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}
