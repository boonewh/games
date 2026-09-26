import type { Character } from './types'

type Boost = Pick<Character, 'level' | 'hp_boost_per_level' | 'hp_boost_active'>

/** Real HP from a per-level effect; separate from the temporary HP pool. */
export function hpBoostAmount(character: Boost): number {
  return character.hp_boost_active
    ? (character.hp_boost_per_level ?? 0) * Math.max(0, character.level ?? 0)
    : 0
}

export function effectiveMaxHp(character: Boost & Pick<Character, 'max_hp'>): number {
  return character.max_hp + hpBoostAmount(character)
}
