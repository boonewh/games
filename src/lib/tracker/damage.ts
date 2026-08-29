// Pure damage calculator. Takes everything it needs as input — no DB calls —
// so route handlers can fetch character + defenses in one nested Supabase query,
// pass them here, and apply the result.
//
// Encodes the PF1e rules:
//   - Crits multiply base damage by the weapon's crit multiplier.
//   - Fortification (Stoneblood etc.) gives a % chance to negate a crit's
//     extra damage (rolled here; injectable RNG for tests).
//   - Physical damage is reduced by the largest applicable DR (DRs don't stack),
//     unless the attack bypasses DR.
//   - Energy damage skips DR entirely; matching vulnerability multiplies ×1.5;
//     matching resistance subtracts.
//   - Force and negative energy skip every defense: DR doesn't reduce them, and
//     PF1e energy resistance/vulnerability only ever covers the five energy
//     types, so there is nothing to check them against. They land in full.
//   - Temp HP absorbs first, then current HP.
//   - Nonlethal damage is mitigated identically (DR still reduces nonlethal
//     from a weapon) but accumulates in its own pool rather than coming off hit
//     points, so temp HP does not absorb it and current HP does not move.

import { DAMAGE_TYPE_LABEL, mitigationFor } from './types'
import type {
  Character,
  DamageReduction,
  DamageRequest,
  EnergyResistance,
  EnergyVulnerability
} from './types'

export interface DamageBreakdown {
  raw: number
  crit_multiplier: number
  crit_total: number
  fortification_roll: number | null
  fortification_negated: boolean
  vulnerability_multiplier: number
  dr_applied: number
  resist_applied: number
  applied: number
  /** Of `applied`, how much was absorbed by temp HP (the rest hit current HP). */
  temp_consumed: number
  /** True when `applied` went to the nonlethal pool instead of hit points. */
  nonlethal: boolean
}

export interface DamageContext {
  character: Pick<Character, 'current_hp' | 'temp_hp' | 'nonlethal' | 'fortification_percent'>
  drs: DamageReduction[]
  resistances: EnergyResistance[]
  vulnerabilities: EnergyVulnerability[]
  random?: () => number
}

export interface DamageResult {
  newCurrentHp: number
  newTempHp: number
  newNonlethal: number
  /** Signed change to the nonlethal pool, recorded on hp_event for undo. */
  nonlethalDelta: number
  breakdown: DamageBreakdown
  /** Human-readable summary shown to the player. */
  message: string
  /** Compact summary stored on the hp_event row for the audit trail. */
  noteSummary: string | null
}

export function calculateDamage(request: DamageRequest, ctx: DamageContext): DamageResult {
  const random = ctx.random ?? Math.random
  const raw = Math.max(0, Math.floor(request.amount))
  const multiplier = request.is_crit ? Math.max(2, Math.floor(request.crit_multiplier ?? 2)) : 1
  const critTotal = raw * multiplier

  // Fortification roll
  let fortRoll: number | null = null
  let fortNegated = false
  let workingDamage = critTotal
  if (request.is_crit && ctx.character.fortification_percent > 0) {
    fortRoll = 1 + Math.floor(random() * 100)
    if (fortRoll <= ctx.character.fortification_percent) {
      fortNegated = true
      workingDamage = raw
    }
  }

  let drApplied = 0
  let resistApplied = 0
  let vulnMultiplier = 1

  const mitigation = mitigationFor(request.damage_type)

  if (mitigation === 'dr') {
    if (!request.bypasses_dr) {
      const drMax = ctx.drs
        .filter((d) => d.enabled)
        .reduce((m, d) => Math.max(m, d.amount), 0)
      drApplied = Math.min(workingDamage, drMax)
      workingDamage -= drApplied
    }
  } else if (mitigation === 'energy') {
    const hasVuln = ctx.vulnerabilities.some(
      (v) => v.enabled && v.energy_type === request.damage_type
    )
    if (hasVuln) {
      vulnMultiplier = 1.5
      workingDamage = Math.floor(workingDamage * 1.5)
    }
    const resist = ctx.resistances.find(
      (r) => r.enabled && r.energy_type === request.damage_type
    )
    if (resist) {
      resistApplied = Math.min(workingDamage, resist.amount)
      workingDamage -= resistApplied
    }
  }
  // mitigation === 'none' (force, negative energy): nothing reduces it.

  const applied = Math.max(0, workingDamage)
  const isNonlethal = request.nonlethal === true

  // Temp HP soaks first — but only for damage that actually comes off hit
  // points. Nonlethal is a running total compared against current HP, so it
  // leaves both HP pools alone.
  let newTempHp = ctx.character.temp_hp
  let newNonlethal = ctx.character.nonlethal
  let newCurrentHp = ctx.character.current_hp
  let tempConsumed = 0
  if (isNonlethal) {
    newNonlethal += applied
  } else {
    let remaining = applied
    if (newTempHp > 0 && remaining > 0) {
      tempConsumed = Math.min(newTempHp, remaining)
      newTempHp -= tempConsumed
      remaining -= tempConsumed
    }
    newCurrentHp -= remaining
  }

  const breakdown: DamageBreakdown = {
    raw,
    crit_multiplier: multiplier,
    crit_total: critTotal,
    fortification_roll: fortRoll,
    fortification_negated: fortNegated,
    vulnerability_multiplier: vulnMultiplier,
    dr_applied: drApplied,
    resist_applied: resistApplied,
    applied,
    temp_consumed: tempConsumed,
    nonlethal: isNonlethal
  }

  // Build the friendly message
  const typeLabel = DAMAGE_TYPE_LABEL[request.damage_type] ?? request.damage_type
  const parts: string[] = []
  const hitLabel = isNonlethal ? `nonlethal ${typeLabel}` : typeLabel
  if (request.is_crit) {
    parts.push(`Crit! ${raw} × ${multiplier} = ${critTotal} ${hitLabel}.`)
  } else {
    parts.push(`Took ${raw} ${hitLabel}.`)
  }
  if (fortRoll !== null) {
    parts.push(
      `Fortification ${fortRoll}/100 ${
        fortNegated
          ? `≤ ${ctx.character.fortification_percent} — crit negated.`
          : `> ${ctx.character.fortification_percent} — crit confirmed.`
      }`
    )
  }
  if (vulnMultiplier > 1) parts.push('Vulnerable: ×1.5.')
  if (drApplied > 0) parts.push(`DR ${drApplied} reduced it.`)
  if (resistApplied > 0) parts.push(`Resist ${resistApplied} ${typeLabel}.`)
  if (request.bypasses_dr && mitigation === 'dr') parts.push('(Bypassed DR.)')
  if (mitigation === 'none') parts.push(`No defense applies to ${typeLabel}.`)
  parts.push(isNonlethal ? `Nonlethal now ${newNonlethal}.` : `Lost ${applied} HP.`)

  // Compact note for audit log
  const noteParts: string[] = []
  if (request.is_crit) noteParts.push(`crit×${multiplier}`)
  if (fortRoll !== null) {
    noteParts.push(`fort ${fortRoll}/${ctx.character.fortification_percent}${fortNegated ? '✓' : '✗'}`)
  }
  if (vulnMultiplier > 1) noteParts.push('vuln×1.5')
  if (isNonlethal) noteParts.push('nonlethal')
  if (request.note) noteParts.push(request.note)

  return {
    newCurrentHp,
    newTempHp,
    newNonlethal,
    nonlethalDelta: newNonlethal - ctx.character.nonlethal,
    breakdown,
    message: parts.join(' '),
    noteSummary: noteParts.length > 0 ? noteParts.join(' ') : null
  }
}
