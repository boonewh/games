// Shape returned by the PDF parser. Mirrors CreateCharacterInput + the nested
// seed_* arrays, so the New Character modal can populate itself directly from
// this object.

import type {
  AbilityCategory,
  ActionType,
  EnergyType,
  Recharge
} from './types'

export interface ExtractedAbility {
  name: string
  category: AbilityCategory
  action_type: ActionType | null
  description: string
  uses_max: number | null
  recharge: Recharge | null
}

export interface ExtractedSpell {
  name: string
  level: number
  casting_class: string
  school: string | null
  description: string | null
  prepared_count: number | null
}

export interface ExtractedPool {
  name: string
  points_max: number
  recharge: Recharge | null
}

export interface ExtractedCharacter {
  name: string
  class_summary: string | null
  level: number | null
  max_hp: number
  ac: number | null
  ac_touch: number | null
  ac_flat_footed: number | null
  spell_dc: number | null
  fortification_percent: number
  deity: string | null
  alignment: string | null
  save_fort: number | null
  save_ref: number | null
  save_will: number | null
  cmb: number | null
  cmd: number | null
  languages: string | null
  drs: Array<{ amount: number; bypass: string }>
  resistances: Array<{ energy_type: EnergyType; amount: number }>
  vulnerabilities: Array<{ energy_type: EnergyType }>
  abilities: ExtractedAbility[]
  spells: ExtractedSpell[]
  pools: ExtractedPool[]
}
