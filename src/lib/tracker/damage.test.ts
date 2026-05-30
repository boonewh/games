import { describe, it, expect } from 'vitest'
import { calculateDamage, type DamageContext } from './damage'
import type {
  DamageReduction,
  DamageRequest,
  EnergyResistance,
  EnergyType,
  EnergyVulnerability
} from './types'

// --- factories -------------------------------------------------------------

type CharState = DamageContext['character']

function char(over: Partial<CharState> = {}): CharState {
  return { current_hp: 20, temp_hp: 0, fortification_percent: 0, ...over }
}

function ctx(over: Partial<DamageContext> = {}): DamageContext {
  return { character: char(), drs: [], resistances: [], vulnerabilities: [], ...over }
}

function dr(amount: number, enabled = true): DamageReduction {
  return { id: 'dr', character_id: 'c', amount, bypass: 'adamantine', enabled }
}

function res(energy_type: EnergyType, amount: number, enabled = true): EnergyResistance {
  return { id: 'res', character_id: 'c', energy_type, amount, enabled }
}

function vuln(energy_type: EnergyType, enabled = true): EnergyVulnerability {
  return { id: 'vuln', character_id: 'c', energy_type, enabled }
}

function req(over: Partial<DamageRequest> = {}): DamageRequest {
  return { amount: 10, damage_type: 'physical', ...over }
}

// --- raw amount handling ---------------------------------------------------

describe('calculateDamage — raw amount', () => {
  it('floors fractional damage', () => {
    const r = calculateDamage(req({ amount: 7.9 }), ctx())
    expect(r.breakdown.raw).toBe(7)
    expect(r.breakdown.applied).toBe(7)
  })

  it('clamps negative damage to 0', () => {
    const r = calculateDamage(req({ amount: -5 }), ctx())
    expect(r.breakdown.raw).toBe(0)
    expect(r.breakdown.applied).toBe(0)
    expect(r.newCurrentHp).toBe(20)
  })

  it('applies plain physical damage to current HP', () => {
    const r = calculateDamage(req({ amount: 10 }), ctx({ character: char({ current_hp: 20 }) }))
    expect(r.breakdown.applied).toBe(10)
    expect(r.newCurrentHp).toBe(10)
    expect(r.breakdown.temp_consumed).toBe(0)
  })
})

// --- damage reduction ------------------------------------------------------

describe('calculateDamage — DR', () => {
  it('subtracts an enabled DR from physical damage', () => {
    const r = calculateDamage(req({ amount: 10 }), ctx({ drs: [dr(3)] }))
    expect(r.breakdown.dr_applied).toBe(3)
    expect(r.breakdown.applied).toBe(7)
  })

  it('does not stack DRs — only the largest applies', () => {
    const r = calculateDamage(req({ amount: 10 }), ctx({ drs: [dr(3), dr(5)] }))
    expect(r.breakdown.dr_applied).toBe(5)
    expect(r.breakdown.applied).toBe(5)
  })

  it('ignores disabled DR', () => {
    const r = calculateDamage(req({ amount: 10 }), ctx({ drs: [dr(5, false)] }))
    expect(r.breakdown.dr_applied).toBe(0)
    expect(r.breakdown.applied).toBe(10)
  })

  it('bypasses_dr skips DR entirely', () => {
    const r = calculateDamage(req({ amount: 10, bypasses_dr: true }), ctx({ drs: [dr(5)] }))
    expect(r.breakdown.dr_applied).toBe(0)
    expect(r.breakdown.applied).toBe(10)
  })

  it('never reduces below 0 when DR exceeds the hit', () => {
    const r = calculateDamage(req({ amount: 2 }), ctx({ drs: [dr(5)] }))
    expect(r.breakdown.applied).toBe(0)
    expect(r.newCurrentHp).toBe(20)
  })

  it('does not apply DR to energy damage', () => {
    const r = calculateDamage(req({ amount: 10, damage_type: 'fire' }), ctx({ drs: [dr(5)] }))
    expect(r.breakdown.dr_applied).toBe(0)
    expect(r.breakdown.applied).toBe(10)
  })
})

// --- energy resistance & vulnerability -------------------------------------

describe('calculateDamage — energy resistance & vulnerability', () => {
  it('subtracts matching resistance', () => {
    const r = calculateDamage(req({ amount: 10, damage_type: 'fire' }), ctx({ resistances: [res('fire', 4)] }))
    expect(r.breakdown.resist_applied).toBe(4)
    expect(r.breakdown.applied).toBe(6)
  })

  it('ignores resistance of a different energy type', () => {
    const r = calculateDamage(req({ amount: 10, damage_type: 'fire' }), ctx({ resistances: [res('cold', 4)] }))
    expect(r.breakdown.resist_applied).toBe(0)
    expect(r.breakdown.applied).toBe(10)
  })

  it('resistance caps at the incoming damage (no negative)', () => {
    const r = calculateDamage(req({ amount: 3, damage_type: 'fire' }), ctx({ resistances: [res('fire', 10)] }))
    expect(r.breakdown.applied).toBe(0)
  })

  it('multiplies matching vulnerability by 1.5 (floored)', () => {
    const r = calculateDamage(req({ amount: 10, damage_type: 'cold' }), ctx({ vulnerabilities: [vuln('cold')] }))
    expect(r.breakdown.vulnerability_multiplier).toBe(1.5)
    expect(r.breakdown.applied).toBe(15)
  })

  it('applies vulnerability before resistance', () => {
    const r = calculateDamage(
      req({ amount: 10, damage_type: 'fire' }),
      ctx({ vulnerabilities: [vuln('fire')], resistances: [res('fire', 4)] })
    )
    // 10 -> ×1.5 = 15 -> resist 4 = 11
    expect(r.breakdown.applied).toBe(11)
  })
})

// --- crits & fortification -------------------------------------------------

describe('calculateDamage — crits & fortification', () => {
  it('multiplies by the crit multiplier', () => {
    const r = calculateDamage(req({ amount: 10, is_crit: true, crit_multiplier: 3 }), ctx())
    expect(r.breakdown.crit_multiplier).toBe(3)
    expect(r.breakdown.crit_total).toBe(30)
    expect(r.breakdown.applied).toBe(30)
  })

  it('defaults the crit multiplier to 2', () => {
    const r = calculateDamage(req({ amount: 10, is_crit: true }), ctx())
    expect(r.breakdown.crit_multiplier).toBe(2)
    expect(r.breakdown.applied).toBe(20)
  })

  it('treats a crit multiplier below 2 as 2', () => {
    const r = calculateDamage(req({ amount: 10, is_crit: true, crit_multiplier: 1 }), ctx())
    expect(r.breakdown.crit_multiplier).toBe(2)
  })

  it('negates the crit when the fortification roll lands within the percent', () => {
    // random() = 0 -> roll = 1, which is <= 25
    const r = calculateDamage(
      req({ amount: 10, is_crit: true, crit_multiplier: 2 }),
      ctx({ character: char({ fortification_percent: 25 }), random: () => 0 })
    )
    expect(r.breakdown.fortification_roll).toBe(1)
    expect(r.breakdown.fortification_negated).toBe(true)
    expect(r.breakdown.applied).toBe(10) // back to raw, not 20
  })

  it('confirms the crit when the fortification roll exceeds the percent', () => {
    // random() ~ 0.99 -> roll = 100, which is > 25
    const r = calculateDamage(
      req({ amount: 10, is_crit: true, crit_multiplier: 2 }),
      ctx({ character: char({ fortification_percent: 25 }), random: () => 0.99 })
    )
    expect(r.breakdown.fortification_roll).toBe(100)
    expect(r.breakdown.fortification_negated).toBe(false)
    expect(r.breakdown.applied).toBe(20)
  })

  it('does not roll fortification on a non-crit hit', () => {
    const r = calculateDamage(
      req({ amount: 10, is_crit: false }),
      ctx({ character: char({ fortification_percent: 100 }), random: () => 0 })
    )
    expect(r.breakdown.fortification_roll).toBeNull()
    expect(r.breakdown.applied).toBe(10)
  })
})

// --- temp HP soak ----------------------------------------------------------

describe('calculateDamage — temp HP soak', () => {
  it('soaks partially with temp, spilling the rest to current', () => {
    const r = calculateDamage(req({ amount: 8 }), ctx({ character: char({ current_hp: 20, temp_hp: 5 }) }))
    expect(r.breakdown.temp_consumed).toBe(5)
    expect(r.newTempHp).toBe(0)
    expect(r.newCurrentHp).toBe(17)
  })

  it('leaves current HP untouched when temp fully absorbs the hit', () => {
    const r = calculateDamage(req({ amount: 6 }), ctx({ character: char({ current_hp: 20, temp_hp: 10 }) }))
    expect(r.breakdown.temp_consumed).toBe(6)
    expect(r.newTempHp).toBe(4)
    expect(r.newCurrentHp).toBe(20)
  })

  it('consumes temp exactly when hit equals temp', () => {
    const r = calculateDamage(req({ amount: 5 }), ctx({ character: char({ current_hp: 20, temp_hp: 5 }) }))
    expect(r.breakdown.temp_consumed).toBe(5)
    expect(r.newTempHp).toBe(0)
    expect(r.newCurrentHp).toBe(20)
  })
})

// --- undo round-trip invariant ---------------------------------------------
//
// This is the regression guard for the temp-HP undo bug: applying the undo
// formula from hp/route.ts (current += applied - temp_consumed; temp +=
// temp_consumed) must restore BOTH pools to their pre-damage values, for any
// damage split.

describe('calculateDamage — undo restores both HP pools', () => {
  const scenarios: Array<{ name: string; character: CharState; request: DamageRequest; context?: Partial<DamageContext> }> = [
    { name: 'plain hit, no temp', character: char({ current_hp: 20, temp_hp: 0 }), request: req({ amount: 7 }) },
    { name: 'partial temp absorption', character: char({ current_hp: 20, temp_hp: 5 }), request: req({ amount: 8 }) },
    { name: 'full temp absorption', character: char({ current_hp: 20, temp_hp: 10 }), request: req({ amount: 6 }) },
    { name: 'temp consumed exactly', character: char({ current_hp: 20, temp_hp: 5 }), request: req({ amount: 5 }) },
    {
      name: 'hit reduced by DR, partly soaked by temp',
      character: char({ current_hp: 20, temp_hp: 4 }),
      request: req({ amount: 10 }),
      context: { drs: [dr(3)] }
    },
    {
      name: 'vulnerable energy hit through temp',
      character: char({ current_hp: 30, temp_hp: 8 }),
      request: req({ amount: 10, damage_type: 'cold' }),
      context: { vulnerabilities: [vuln('cold')] }
    },
    {
      name: 'crit through temp',
      character: char({ current_hp: 40, temp_hp: 6 }),
      request: req({ amount: 10, is_crit: true, crit_multiplier: 3 }),
      context: {}
    }
  ]

  for (const s of scenarios) {
    it(`restores current + temp after: ${s.name}`, () => {
      const c: DamageContext = ctx({ character: s.character, ...s.context })
      const r = calculateDamage(s.request, c)

      // Undo, per hp/route.ts handleUndo:
      const restoredCurrent = r.newCurrentHp + (r.breakdown.applied - r.breakdown.temp_consumed)
      const restoredTemp = r.newTempHp + r.breakdown.temp_consumed

      expect(restoredCurrent).toBe(s.character.current_hp)
      expect(restoredTemp).toBe(s.character.temp_hp)
    })
  }

  it('temp_consumed never exceeds the applied total', () => {
    const r = calculateDamage(req({ amount: 8 }), ctx({ character: char({ temp_hp: 100 }) }))
    expect(r.breakdown.temp_consumed).toBeLessThanOrEqual(r.breakdown.applied)
  })
})
