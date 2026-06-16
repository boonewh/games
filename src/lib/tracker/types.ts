// Domain types for the Pathfinder tracker. Mirrors the Postgres schema.
// IDs are UUID strings (not integers like the standalone tracker had).

export type EnergyType = 'fire' | 'cold' | 'electricity' | 'acid' | 'sonic'
export type DamageType = 'physical' | EnergyType
export const ENERGY_TYPES: EnergyType[] = ['fire', 'cold', 'electricity', 'acid', 'sonic']
export const DAMAGE_TYPES: DamageType[] = ['physical', ...ENERGY_TYPES]

export type HpEventKind = 'damage' | 'heal' | 'temp_hp' | 'nonlethal' | 'rest' | 'undo'

export type AbilityCategory = 'class_feature' | 'feat' | 'spell' | 'sla' | 'item' | 'reminder'
export type ActionType = 'free' | 'swift' | 'move' | 'standard' | 'full' | 'immediate' | 'reaction' | 'passive'
export type Recharge = 'per_day' | 'per_encounter' | 'per_round' | 'manual'

// Pathfinder 1e conditions, alphabetized.
export const PF1E_CONDITIONS = [
  'blinded',
  'confused',
  'cowering',
  'dazed',
  'dazzled',
  'deafened',
  'dying',
  'entangled',
  'exhausted',
  'fascinated',
  'fatigued',
  'flat-footed',
  'frightened',
  'grappled',
  'helpless',
  'invisible',
  'nauseated',
  'panicked',
  'paralyzed',
  'petrified',
  'pinned',
  'prone',
  'shaken',
  'sickened',
  'staggered',
  'stunned',
  'unconscious'
] as const
export type ConditionType = (typeof PF1E_CONDITIONS)[number]

export interface UserProfile {
  user_id: string
  display_name: string | null
  is_gm: boolean
  created_at: string
}

export interface Party {
  id: string
  name: string
  campaign_key: string
  gm_user_id: string
  invite_code: string | null
  created_at: string
}

export interface PartyMember {
  party_id: string
  user_id: string
  joined_at: string
}

export interface Character {
  id: string
  user_id: string
  party_id: string | null
  campaign_key: string
  name: string
  class_summary: string | null
  level: number | null
  max_hp: number
  current_hp: number
  temp_hp: number
  nonlethal: number
  fortification_percent: number
  ac: number | null
  ac_touch: number | null
  ac_flat_footed: number | null
  // Single spell save DC (migration 009). House rule: every spell, regardless of
  // level, uses the caster's highest DC — so one number covers all of them.
  spell_dc: number | null
  // Mythic progression (migration 010). mythic_path is free text so one field
  // holds a Dual Path character, e.g. "Hierophant / Guardian"; mythic_tier is the
  // shared tier across both paths.
  mythic_path: string | null
  mythic_tier: number | null
  // DM-visibility fields (migration 007). Shown on the GM dashboard, not the
  // lean player combat screen. All optional.
  deity: string | null
  alignment: string | null
  save_fort: number | null
  save_ref: number | null
  save_will: number | null
  cmb: number | null
  cmd: number | null
  languages: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DamageReduction {
  id: string
  character_id: string
  amount: number
  bypass: string
  enabled: boolean
}

export interface EnergyResistance {
  id: string
  character_id: string
  energy_type: EnergyType
  amount: number
  enabled: boolean
}

export interface EnergyVulnerability {
  id: string
  character_id: string
  energy_type: EnergyType
  enabled: boolean
}

export interface HpEvent {
  id: string
  character_id: string
  ts: string
  kind: HpEventKind
  raw_amount: number
  applied_amount: number
  damage_type: DamageType | null
  dr_applied: number
  /** Of applied_amount, how much was absorbed by temp HP. Used to undo the split. */
  temp_consumed: number
  note: string | null
}

export interface AbilitySection {
  id: string
  character_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Ability {
  id: string
  character_id: string
  section_id: string | null
  name: string
  category: AbilityCategory
  action_type: ActionType | null
  description: string | null
  uses_max: number | null
  uses_remaining: number | null
  recharge: Recharge | null
  enabled: boolean
  hidden: boolean
  sort_order: number
}

export interface Condition {
  id: string
  character_id: string
  type: string // intentionally not typed to ConditionType to accept homebrew names
  duration_rounds: number | null
  notes: string | null
  applied_at: string
}

export interface ResourcePool {
  id: string
  character_id: string
  name: string
  points_remaining: number
  points_max: number
  recharge: Recharge | null
  notes: string | null
  sort_order: number
}

export interface SpellDcEntry {
  id: string
  character_id: string
  name: string
  dc: number
  notes: string | null
  sort_order: number
}

export interface Spell {
  id: string
  character_id: string
  name: string
  level: number
  casting_class: string
  school: string | null
  description: string | null
  /** null = spontaneous (no preparation); N = prepared N times today */
  prepared_count: number | null
  cast_count: number
  notes: string | null
  sort_order: number
}

export const SPELL_SCHOOLS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
  'universal'
] as const
export type SpellSchool = (typeof SPELL_SCHOOLS)[number]

export interface CharacterDetail extends Character {
  drs: DamageReduction[]
  resistances: EnergyResistance[]
  vulnerabilities: EnergyVulnerability[]
  sections: AbilitySection[]
  abilities: Ability[]
  conditions: Condition[]
  pools: ResourcePool[]
  spells: Spell[]
  spell_dc_entries: SpellDcEntry[]
}

export interface DamageRequest {
  amount: number
  damage_type: DamageType
  bypasses_dr?: boolean
  is_crit?: boolean
  crit_multiplier?: number
  note?: string
}

export interface CreateCharacterInput {
  name: string
  class_summary?: string
  level?: number
  max_hp: number
  fortification_percent?: number
  ac?: number
  ac_touch?: number
  ac_flat_footed?: number
  spell_dc?: number | null
  mythic_path?: string | null
  mythic_tier?: number | null
  deity?: string | null
  alignment?: string | null
  save_fort?: number | null
  save_ref?: number | null
  save_will?: number | null
  cmb?: number | null
  cmd?: number | null
  languages?: string | null
  campaign_key?: string
  party_id?: string
  drs?: Array<{ amount: number; bypass: string }>
  resistances?: Array<{ energy_type: EnergyType; amount: number }>
  vulnerabilities?: Array<{ energy_type: EnergyType }>
  seed_abilities?: Array<{
    name: string
    category: AbilityCategory
    action_type?: ActionType
    description?: string
    uses_max?: number
    uses_remaining?: number
    recharge?: Recharge
    sort_order?: number
  }>
  seed_spells?: Array<{
    name: string
    level: number
    casting_class: string
    school?: string
    description?: string
    prepared_count?: number | null
  }>
  seed_pools?: Array<{
    name: string
    points_max: number
    points_remaining?: number
    recharge?: Recharge
    notes?: string
  }>
  seed_spell_dcs?: Array<{ name: string; dc: number; notes?: string }>
}
