'use client'

import { useEffect, useRef, useState } from 'react'
import type { CharacterDetail, DamageType } from '@/lib/tracker/types'
import { DAMAGE_TYPES } from '@/lib/tracker/types'
import { CharacterEditModal } from './CharacterEditModal'
import { ConditionsBar } from './ConditionsBar'
import { PoolsCard } from './PoolsCard'
import { SpellDcsCard } from './SpellDcsCard'

interface Props {
  character: CharacterDetail
  onChanged: () => void | Promise<void>
}

export function HpPanel({ character, onChanged }: Props) {
  const [amount, setAmount] = useState('')
  const [damageType, setDamageType] = useState<DamageType>('physical')
  const [bypassesDr, setBypassesDr] = useState(false)
  const [isCrit, setIsCrit] = useState(false)
  const [critMultiplier, setCritMultiplier] = useState(2)
  const [tempHpInput, setTempHpInput] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [statusKind, setStatusKind] = useState<'info' | 'damage' | 'heal'>('info')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  const ratio = character.max_hp > 0 ? character.current_hp / character.max_hp : 0
  const hpPct = Math.max(0, Math.min(100, ratio * 100))
  const hpColor =
    character.current_hp <= 0
      ? 'var(--dmg, #cc4d42)'
      : hpPct <= 25
        ? 'var(--dmg, #cc4d42)'
        : hpPct <= 50
          ? '#d9952f'
          : 'var(--hp, #52bf80)'

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
    const parsed = parseInt(amount, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return
    try {
      const res = await postHp('damage', {
        amount: parsed,
        damage_type: damageType,
        bypasses_dr: damageType === 'physical' ? bypassesDr : undefined,
        is_crit: isCrit,
        crit_multiplier: isCrit ? critMultiplier : undefined
      })
      setStatus(res.message)
      setStatusKind('damage')
      setAmount('')
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
    const parsed = parseInt(amount, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return
    try {
      const res = await postHp('heal', { amount: parsed })
      setStatus(res.message)
      setStatusKind('heal')
      setAmount('')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function submitTempHp() {
    const parsed = parseInt(tempHpInput, 10)
    if (!Number.isFinite(parsed) || parsed < 0) return
    try {
      const res = await postHp('temp_hp', { amount: parsed })
      setStatus(res.message)
      setStatusKind('info')
      setTempHpInput('')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function commitStat(field: 'ac' | 'ac_touch' | 'ac_flat_footed' | 'spell_penetration', next: number) {
    try {
      const res = await fetch(`/api/tracker/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
      await onChanged()
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
    if (!confirm('Long rest: heal by level, clear nonlethal, and reset all per-day abilities. Continue?')) return
    try {
      const res = await postHp('long_rest', {})
      setStatus(res.message)
      setStatusKind('heal')
      await onChanged()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e))
      setStatusKind('info')
    }
  }

  async function fullHeal() {
    try {
      const res = await postHp('full_heal', {})
      setStatus(res.message)
      setStatusKind('heal')
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
    <section className="p-6 pb-0">
      {/* ===== COMBAT CONSOLE — three cards ===== */}
      <div className="flex flex-wrap gap-4 items-stretch">

        {/* ── Vitals card ── */}
        <div className="flex-[1_1_300px] bg-[--panel-2] border border-[--border] rounded-[14px] p-[18px_20px] flex flex-col"
          style={{ background: 'var(--panel-2, #1c160e)', borderColor: 'var(--border, rgba(190,158,92,0.14))' }}>
          <div className="flex items-baseline justify-between">
            <span className="font-oswald uppercase tracking-[.16em] text-[12px] text-parchment/60">Hit Points</span>
            {character.temp_hp > 0 && (
              <span className="font-oswald uppercase tracking-[.06em] text-[11px] text-wardstone-blue border border-wardstone-blue/40 bg-wardstone-blue/10 px-2 py-0.5 rounded-md">
                +{character.temp_hp} temp
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-cinzel font-semibold text-5xl leading-none" style={{ color: hpColor }}>
              {character.current_hp}
            </span>
            <span className="font-cinzel text-[22px] text-parchment/40">/ {character.max_hp}</span>
          </div>
          {/* HP bar */}
          <div className="h-[9px] rounded-full bg-black/35 border border-[rgba(190,158,92,0.14)] overflow-hidden mt-2.5">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${hpPct}%`, background: hpColor }}
            />
          </div>

          <div className="h-px bg-[rgba(190,158,92,0.14)] my-4" />

          <div className="flex items-center gap-2">
            <span className="font-cinzel font-semibold text-[23px] text-wotr-gold tracking-wide">{character.name}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-parchment/40 hover:text-wotr-gold text-[13px]"
              title="Edit character"
            >
              ✎
            </button>
          </div>
          {character.class_summary && (
            <div className="text-sm text-parchment/60 mt-1">{character.class_summary}</div>
          )}
          {character.mythic_path && (
            <div className="text-[13px] italic mt-0.5" style={{ color: 'var(--gold-dim, #8f7639)' }}>
              Mythic: {character.mythic_path}
              {character.mythic_tier != null && ` ${character.mythic_tier}`}
            </div>
          )}

          {/* Defense pills */}
          {(character.drs.length > 0 ||
            character.resistances.length > 0 ||
            character.vulnerabilities.length > 0 ||
            character.fortification_percent > 0) && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {character.drs.map((dr) => (
                  <span
                    key={`dr-${dr.id}`}
                    className="font-oswald uppercase tracking-[.04em] text-[11px] px-2.5 py-[3px] rounded-md border"
                    style={{ color: 'var(--hp, #52bf80)', background: 'rgba(82,191,128,.10)', borderColor: 'rgba(82,191,128,.35)' }}
                  >
                    DR {dr.amount}/{dr.bypass}
                  </span>
                ))}
                {character.resistances.map((r) => (
                  <span
                    key={`r-${r.id}`}
                    className="font-oswald uppercase tracking-[.04em] text-[11px] px-2.5 py-[3px] rounded-md border"
                    style={{ color: 'var(--hp, #52bf80)', background: 'rgba(82,191,128,.10)', borderColor: 'rgba(82,191,128,.35)' }}
                  >
                    Resist {r.amount} {r.energy_type}
                  </span>
                ))}
                {character.vulnerabilities.map((v) => (
                  <span
                    key={`v-${v.id}`}
                    className="font-oswald uppercase tracking-[.04em] text-[11px] px-2.5 py-[3px] rounded-md border"
                    style={{ color: 'var(--dmg, #cc4d42)', background: 'rgba(204,77,66,.10)', borderColor: 'rgba(204,77,66,.4)' }}
                  >
                    Vulnerable: {v.energy_type}
                  </span>
                ))}
                {character.fortification_percent > 0 && (
                  <span
                    className="font-oswald uppercase tracking-[.04em] text-[11px] px-2.5 py-[3px] rounded-md border"
                    style={{ color: 'var(--temp, #69a6d6)', background: 'rgba(105,166,214,.10)', borderColor: 'rgba(105,166,214,.4)' }}
                  >
                    Fortification {character.fortification_percent}%
                  </span>
                )}
              </div>
              <div className="text-[11.5px] italic mt-2" style={{ color: 'var(--faint, #6b6253)' }}>
                Auto-applied to incoming damage ↓
              </div>
            </>
          )}

          {character.nonlethal > 0 && (
            <div className="mt-2 font-oswald uppercase tracking-wider text-[11px] text-amber-300 border border-amber-700/50 bg-amber-900/30 px-2 py-0.5 rounded-md self-start">
              Nonlethal {character.nonlethal}
            </div>
          )}
        </div>

        {/* ── Apply to HP card ── */}
        <div className="flex-[3_1_420px] bg-[--panel-2] border border-[--border] rounded-[14px] p-[18px_20px] flex flex-col"
          style={{ background: 'var(--panel-2, #1c160e)', borderColor: 'var(--border, rgba(190,158,92,0.14))' }}>
          <div className="flex items-baseline justify-between gap-2.5 flex-wrap">
            <span className="font-oswald uppercase tracking-[.16em] text-[13px] text-wotr-gold">Apply to HP</span>
            <span className="text-[12px] italic" style={{ color: 'var(--faint, #6b6253)' }}>
              one amount · heal up, damage down
            </span>
          </div>

          <div className="flex gap-3 items-stretch mt-3 flex-wrap">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitDamage() } }}
              placeholder="0"
              className="flex-[1_1_160px] min-w-[130px] rounded-[10px] px-4 py-2.5 text-center outline-none font-cinzel text-[30px]"
              style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border-strong, rgba(190,158,92,0.30))', color: 'var(--ink, #e8e0d0)' }}
            />
            <div className="flex gap-2.5 flex-[2_1_260px]">
              <button
                onClick={submitDamage}
                disabled={busy}
                className="flex-1 border-none rounded-[10px] font-oswald uppercase tracking-[.08em] text-[15px] cursor-pointer px-2 flex items-center justify-center gap-2 text-white disabled:opacity-50 hover:brightness-90 active:scale-[.98]"
                style={{ background: 'var(--dmg, #cc4d42)' }}
              >
                <span className="text-[20px] leading-none">▼</span>Damage
              </button>
              <button
                onClick={submitHeal}
                disabled={busy}
                className="flex-1 border-none rounded-[10px] font-oswald uppercase tracking-[.08em] text-[15px] cursor-pointer px-2 flex items-center justify-center gap-2 text-white disabled:opacity-50 hover:brightness-90 active:scale-[.98]"
                style={{ background: 'var(--heal, #34a268)' }}
              >
                <span className="text-[20px] leading-none">▲</span>Heal
              </button>
            </div>
          </div>

          {/* Options row */}
          <div className="flex flex-wrap gap-3.5 items-center mt-3">
            <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted, #9a907c)' }}>
              <span className="font-oswald uppercase tracking-[.06em] text-[11.5px]" style={{ color: 'var(--faint, #6b6253)' }}>Type</span>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value as DamageType)}
                className="rounded-[7px] px-2.5 py-1.5 outline-none cursor-pointer text-[13px]"
                style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))', color: 'var(--ink, #e8e0d0)' }}
              >
                {DAMAGE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            {damageType === 'physical' && (
              <label className="flex items-center gap-2 font-oswald uppercase tracking-[.05em] text-[12px] cursor-pointer" style={{ color: 'var(--muted, #9a907c)' }}>
                <input
                  type="checkbox"
                  checked={bypassesDr}
                  onChange={(e) => setBypassesDr(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-wotr-gold"
                />
                Bypasses DR
              </label>
            )}
            <label className="flex items-center gap-2 font-oswald uppercase tracking-[.05em] text-[12px] cursor-pointer" style={{ color: 'var(--muted, #9a907c)' }}>
              <input
                type="checkbox"
                checked={isCrit}
                onChange={(e) => setIsCrit(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--dmg, #cc4d42)' }}
              />
              Critical hit
            </label>
            {isCrit && (
              <label className="flex items-center gap-1.5 font-oswald uppercase tracking-[.05em] text-[12px]" style={{ color: 'var(--muted, #9a907c)' }}>
                ×
                <select
                  value={critMultiplier}
                  onChange={(e) => setCritMultiplier(parseInt(e.target.value, 10))}
                  className="rounded-[7px] px-1.5 py-1 outline-none cursor-pointer text-[12px]"
                  style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))', color: 'var(--ink, #e8e0d0)' }}
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </label>
            )}
          </div>

          {/* Contextual warnings */}
          {(willBeVulnerable || (isCrit && character.fortification_percent > 0) || damageType !== 'physical') && (
            <div className="mt-2 text-xs space-y-0.5">
              {willBeVulnerable && (
                <div style={{ color: 'var(--dmg, #cc4d42)' }}>⚠ Vulnerable to {damageType} — damage will be ×1.5.</div>
              )}
              {isCrit && character.fortification_percent > 0 && (
                <div className="text-wardstone-blue">
                  Will roll fortification ({character.fortification_percent}%) for crit negation.
                </div>
              )}
              {damageType !== 'physical' && (
                <div style={{ color: 'var(--faint, #6b6253)' }}>
                  DR does not apply to {damageType}. Energy resistance is subtracted automatically.
                </div>
              )}
            </div>
          )}

          {/* Temp HP row */}
          <div className="flex items-center gap-2.5 mt-3 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--border, rgba(190,158,92,0.14))' }}>
            <span className="font-oswald uppercase tracking-[.08em] text-[11.5px]" style={{ color: 'var(--temp, #69a6d6)' }}>
              Temp HP
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={tempHpInput}
              onChange={(e) => setTempHpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitTempHp()}
              placeholder="set to…"
              className="w-24 rounded-[7px] px-2.5 py-1.5 outline-none text-[13px]"
              style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))', color: 'var(--ink, #e8e0d0)' }}
            />
            <button
              onClick={submitTempHp}
              disabled={busy}
              className="rounded-[7px] px-3.5 py-1.5 font-oswald uppercase tracking-[.06em] text-[12px] cursor-pointer disabled:opacity-50"
              style={{ border: '1px solid var(--border-strong, rgba(190,158,92,0.30))', background: 'transparent', color: 'var(--ink, #e8e0d0)' }}
            >
              Set
            </button>
            <span className="text-[12px]" style={{ color: 'var(--faint, #6b6253)' }}>
              current: {character.temp_hp}
            </span>
          </div>

          {/* Status/result log */}
          {status && (
            <div
              className="mt-3 px-3.5 py-2.5 rounded-[10px] animate-[fadeIn_.22s_ease]"
              style={{
                background: 'var(--panel-3, #241c11)',
                border: '1px solid var(--border, rgba(190,158,92,0.14))'
              }}
            >
              <span
                className="font-oswald uppercase tracking-[.07em] text-[14px] font-semibold"
                style={{
                  color: statusKind === 'damage' ? 'var(--dmg, #cc4d42)' : statusKind === 'heal' ? 'var(--heal, #34a268)' : 'var(--muted, #9a907c)'
                }}
              >
                {status}
              </span>
            </div>
          )}
        </div>

        {/* ── Quick actions card ── */}
        <div className="flex-[1_1_150px] bg-[--panel-2] border border-[--border] rounded-[14px] p-[18px_16px] flex flex-col gap-2.5"
          style={{ background: 'var(--panel-2, #1c160e)', borderColor: 'var(--border, rgba(190,158,92,0.14))' }}>
          <span className="font-oswald uppercase tracking-[.14em] text-[11.5px]" style={{ color: 'var(--muted, #9a907c)' }}>Quick</span>
          <button
            onClick={undo}
            disabled={busy}
            className="flex items-center justify-start rounded-[9px] px-3 py-2.5 font-oswald uppercase tracking-[.06em] text-[12.5px] cursor-pointer disabled:opacity-50"
            style={{ border: '1px solid var(--border, rgba(190,158,92,0.14))', background: 'var(--panel, #17130d)', color: 'var(--ink, #e8e0d0)' }}
            title="Ctrl+Z"
          >
            <span className="text-[15px] mr-2">↺</span>Undo
          </button>
          <button
            onClick={longRest}
            disabled={busy}
            className="flex items-center justify-start rounded-[9px] px-3 py-2.5 font-oswald uppercase tracking-[.06em] text-[12.5px] cursor-pointer disabled:opacity-50"
            style={{ border: '1px solid var(--border, rgba(190,158,92,0.14))', background: 'var(--panel, #17130d)', color: 'var(--ink, #e8e0d0)' }}
            title="Heal by level, clear nonlethal, reset per-day abilities"
          >
            <span className="text-[15px] mr-2">☾</span>Long Rest
          </button>
          <button
            onClick={fullHeal}
            disabled={busy}
            className="flex items-center justify-start rounded-[9px] px-3 py-2.5 font-oswald uppercase tracking-[.06em] text-[12.5px] cursor-pointer disabled:opacity-50"
            style={{ border: '1px solid rgba(52,162,104,.4)', background: 'rgba(52,162,104,.08)', color: 'var(--hp, #52bf80)' }}
            title="Set HP to full and clear nonlethal (no per-day resets)"
          >
            <span className="text-[15px] mr-2">✚</span>Full Heal
          </button>
        </div>
      </div>

      {/* ===== STATS STRIP ===== */}
      <div className="flex flex-wrap gap-4 mt-4 mb-6">
        {/* Defenses */}
        <div className="flex-[1_1_280px] rounded-xl p-[14px_16px]"
          style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))' }}>
          <span className="font-oswald uppercase tracking-[.14em] text-[11.5px]" style={{ color: 'var(--muted, #9a907c)' }}>Defenses</span>
          <div className="flex justify-around gap-2 mt-2.5">
            <DefenseStepper label="AC" value={character.ac} onCommit={(n) => commitStat('ac', n)} />
            <DefenseStepper label="Touch" value={character.ac_touch} onCommit={(n) => commitStat('ac_touch', n)} />
            <DefenseStepper label="Flat-Footed" value={character.ac_flat_footed} onCommit={(n) => commitStat('ac_flat_footed', n)} />
          </div>
        </div>

        {/* Resource pools */}
        <PoolsCard
          characterId={character.id}
          pools={character.pools}
          onChanged={onChanged}
          className="flex-[1_1_240px]"
        />

        {/* Spell DCs */}
        <SpellDcsCard
          characterId={character.id}
          spellDcs={character.spell_dc_entries}
          onChanged={onChanged}
          className="flex-[1_1_190px]"
        />

        {/* Spell Penetration */}
        <SpellPenCard
          value={character.spell_penetration}
          onCommit={(n) => commitStat('spell_penetration', n)}
        />

        {/* Conditions */}
        <ConditionsBar
          characterId={character.id}
          conditions={character.conditions}
          onChanged={onChanged}
          className="flex-[2_1_320px]"
        />
      </div>

      {editing && (
        <CharacterEditModal character={character} onClose={() => setEditing(false)} onSaved={onChanged} />
      )}
    </section>
  )
}

function DefenseStepper({
  label,
  value,
  onCommit
}: {
  label: string
  value: number | null
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState<number | null>(value)
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (commitTimer.current == null) setDraft(value)
  }, [value])

  useEffect(() => () => {
    if (commitTimer.current) clearTimeout(commitTimer.current)
  }, [])

  function bump(delta: number) {
    setDraft((prev) => {
      const next = Math.max(0, (prev ?? 0) + delta)
      if (commitTimer.current) clearTimeout(commitTimer.current)
      commitTimer.current = setTimeout(() => {
        commitTimer.current = null
        onCommit(next)
      }, 400)
      return next
    })
  }

  const btnClass =
    'w-[26px] h-[26px] rounded-[7px] border cursor-pointer text-[15px] leading-none flex items-center justify-center'

  return (
    <div className="text-center">
      <div className="font-oswald uppercase tracking-[.1em] text-[11px] whitespace-nowrap" style={{ color: 'var(--faint, #6b6253)' }}>
        {label}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <button
          type="button"
          onClick={() => bump(-1)}
          className={btnClass}
          style={{ border: '1px solid var(--border, rgba(190,158,92,0.14))', background: 'transparent', color: 'var(--muted, #9a907c)' }}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span
          className="font-cinzel text-[25px] min-w-[1.6ch] text-center"
          style={{ color: 'var(--ink, #e8e0d0)' }}
        >
          {draft ?? '—'}
        </span>
        <button
          type="button"
          onClick={() => bump(1)}
          className={btnClass}
          style={{ border: '1px solid var(--border, rgba(190,158,92,0.14))', background: 'transparent', color: 'var(--muted, #9a907c)' }}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

function SpellPenCard({
  value,
  onCommit
}: {
  value: number | null
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState<number | null>(value)
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (commitTimer.current == null) setDraft(value)
  }, [value])

  useEffect(() => () => {
    if (commitTimer.current) clearTimeout(commitTimer.current)
  }, [])

  function bump(delta: number) {
    setDraft((prev) => {
      const next = (prev ?? 0) + delta
      if (commitTimer.current) clearTimeout(commitTimer.current)
      commitTimer.current = setTimeout(() => {
        commitTimer.current = null
        onCommit(next)
      }, 400)
      return next
    })
  }

  const display = draft != null ? (draft >= 0 ? `+${draft}` : `${draft}`) : '—'

  return (
    <div className="flex-[1_1_190px] rounded-xl p-[14px_16px]"
      style={{ background: 'var(--panel, #17130d)', border: '1px solid var(--border, rgba(190,158,92,0.14))' }}>
      <div className="flex items-center justify-between">
        <span className="font-oswald uppercase tracking-[.14em] text-[11.5px]" style={{ color: 'var(--muted, #9a907c)' }}>Spell Pen.</span>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="flex-1 font-oswald uppercase tracking-[.05em] text-[12.5px]" style={{ color: 'var(--ink, #e8e0d0)' }}>
          Spell Pen
        </span>
        <span className="font-cinzel text-[20px] min-w-[1.8ch] text-center" style={{ color: 'var(--gold, #caa14e)' }}>
          {display}
        </span>
        <button
          onClick={() => bump(-1)}
          className="px-[7px] py-[2px] rounded-md font-oswald text-[11px] cursor-pointer"
          style={{ background: 'transparent', border: '1px solid rgba(204,77,66,.4)', color: 'var(--dmg, #cc4d42)' }}
        >
          −1
        </button>
        <button
          onClick={() => bump(1)}
          className="px-[7px] py-[2px] rounded-md font-oswald text-[11px] cursor-pointer"
          style={{ background: 'transparent', border: '1px solid rgba(52,162,104,.4)', color: 'var(--heal, #34a268)' }}
        >
          +1
        </button>
      </div>
      <div className="text-[11px] italic mt-2" style={{ color: 'var(--faint, #6b6253)' }}>
        CL check vs spell resistance
      </div>
    </div>
  )
}
