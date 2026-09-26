import { describe, expect, it } from 'vitest'
import { effectiveMaxHp, hpBoostAmount } from './hp-boost'

describe('effective HP maximum', () => {
  const base = { max_hp: 100, level: 10, hp_boost_per_level: 2, hp_boost_active: false }

  it('keeps the saved amount inactive until enabled', () => {
    expect(effectiveMaxHp(base)).toBe(100)
    expect(hpBoostAmount(base)).toBe(0)
  })

  it('uses total character level and leaves the base maximum unchanged', () => {
    const boosted = { ...base, hp_boost_active: true }
    expect(effectiveMaxHp(boosted)).toBe(120)
    expect(boosted.max_hp).toBe(100)
    expect(effectiveMaxHp({ ...boosted, level: 11 })).toBe(122)
  })

  it('does not invent a level for incomplete characters', () => {
    expect(hpBoostAmount({ ...base, hp_boost_active: true, level: null })).toBe(0)
  })
})
