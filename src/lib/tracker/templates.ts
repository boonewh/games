// Character templates — pre-seeded "cool stuff" for known builds.
// Add one entry per friend's character as we gather sheets.

import type { CreateCharacterInput, AbilityCategory, ActionType, Recharge } from './types'

type TemplateAbility = NonNullable<CreateCharacterInput['seed_abilities']>[number]

export interface CharacterTemplate {
  key: string
  label: string
  description: string
  preset: Omit<CreateCharacterInput, 'name'>
}

// Korroc — Dwarf gestalt Stonelord Paladin (Mendevian Crusade) /
// Life Oracle (Elemental Imbalance, Fire) at 4th level for WotR.
//
// sort_order ranges:
//   10–19  limited-use abilities
//   20–29  at-will activated
//   30–39  spell slot trackers
//   40+    passive reminders / conditional bonuses
const KORROC_L4_ABILITIES: TemplateAbility[] = [
  {
    name: 'Lay on Hands',
    category: 'class_feature' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      'Heal 2d6. SWIFT action when used on self (you can heal yourself and still attack). Standard action on others (melee touch). Cannot harm undead. 5/day = 2 + Cha.',
    uses_max: 5,
    uses_remaining: 5,
    recharge: 'per_day' as Recharge,
    sort_order: 10
  },
  {
    name: 'Channel Positive Energy',
    category: 'class_feature' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      '2d6 heal all living / damage undead in 30-ft burst. Will save DC 15 (10 + ½ oracle level + Cha) for half. 4/day from Oracle Channel revelation.',
    uses_max: 4,
    uses_remaining: 4,
    recharge: 'per_day' as Recharge,
    sort_order: 11
  },
  {
    name: 'Stonestrike',
    category: 'class_feature' as AbilityCategory,
    action_type: 'swift' as ActionType,
    description:
      'Until START of your next turn: melee attacks count as MAGICAL and ADAMANTINE, ignore hardness up to 8 (2× paladin level), +1 atk/dmg/CMB. Bonus also applies to CMD if you or target touches ground/stone.',
    uses_max: 4,
    uses_remaining: 4,
    recharge: 'per_day' as Recharge,
    sort_order: 12
  },
  {
    name: 'Defensive Stance',
    category: 'class_feature' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      'Stand on stone/dirt/earth. Enter as standard, end as free. While in stance: +2 Str, +4 Con, +2 morale on Will, +2 dodge AC. CANNOT MOVE (5-ft step OK). 12 rounds/day total — spend one per round in stance.',
    uses_max: 12,
    uses_remaining: 12,
    recharge: 'per_day' as Recharge,
    sort_order: 13
  },
  {
    name: 'Energy Body',
    category: 'class_feature' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      'Become luminous positive-energy form. Allies touching you heal 1d6+4. Undead striking you take 1d6+4 positive damage. 4 rounds/day total.',
    uses_max: 4,
    uses_remaining: 4,
    recharge: 'per_day' as Recharge,
    sort_order: 14
  },

  {
    name: 'Detect Evil',
    category: 'class_feature' as AbilityCategory,
    action_type: 'move' as ActionType,
    description:
      'At-will. Move action to focus on one target: 1st round → presence/absence, 2nd → number + power of strongest, 3rd → power + location of each.',
    sort_order: 20
  },

  {
    name: 'Paladin 1st-level spells',
    category: 'spell' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description: '1 slot/day (0 base + Cha bonus). Prepared daily after 1 hour of prayer.',
    uses_max: 1,
    uses_remaining: 1,
    recharge: 'per_day' as Recharge,
    sort_order: 30
  },
  {
    name: 'Oracle 1st-level spells',
    category: 'spell' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      'Spontaneous. Life mystery: convert any slot to a cure spell of same level (CLW is Life bonus). 6 + 1 Cha bonus = 7/day.',
    uses_max: 7,
    uses_remaining: 7,
    recharge: 'per_day' as Recharge,
    sort_order: 31
  },
  {
    name: 'Oracle 2nd-level spells',
    category: 'spell' as AbilityCategory,
    action_type: 'standard' as ActionType,
    description:
      'Spontaneous. Life mystery: convert any slot to a cure spell of same level (CMW is Life bonus). 3 + 1 Cha bonus = 4/day.',
    uses_max: 4,
    uses_remaining: 4,
    recharge: 'per_day' as Recharge,
    sort_order: 32
  },

  {
    name: 'Stoneblood',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description:
      '25% chance to ignore a critical hit OR precision damage (auto-rolled when you check "Crit?" on damage entry). +4 to stabilize at negative HP.',
    sort_order: 40
  },
  {
    name: 'DR 2/adamantine',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description:
      'From Stonelord rocky flesh (½ paladin level). Auto-applied to physical damage. Adamantine weapons bypass it — check "Bypasses DR" if hit by one.',
    sort_order: 41
  },
  {
    name: 'Aura of Good',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: 'Strong good aura, matches paladin level (4).',
    sort_order: 42
  },
  {
    name: 'Aura of Courage',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: 'Immune to fear. Allies within 10 ft get +4 morale bonus on saves vs fear effects.',
    sort_order: 43
  },
  {
    name: 'Hardy',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: '+2 racial bonus on saves vs poison, spells, and spell-like abilities. Dwarf racial.',
    sort_order: 44
  },
  {
    name: 'Vulnerability to Cold',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description:
      'From Elemental Imbalance (Fire) curse. Take 1.5× cold damage. Auto-applied when damage type is cold.',
    sort_order: 45
  },

  {
    name: 'Defensive Training (vs Giants)',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: '+4 DODGE bonus to AC vs creatures with the giant subtype. Dwarf racial.',
    sort_order: 50
  },
  {
    name: 'Hatred (vs Orcs/Goblinoids)',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: '+1 attack roll vs creatures with the orc or goblinoid subtype. Dwarf racial.',
    sort_order: 51
  },
  {
    name: 'Stability (vs Bull Rush/Trip)',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: '+4 CMD vs bull rush and trip combat maneuvers while standing on the ground. Dwarf racial.',
    sort_order: 52
  },
  {
    name: 'Stonecunning',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description:
      '+2 Perception for unusual stonework. FREE Perception check (no action) when passing within 10 ft of stonework, even when not actively looking. Dwarf racial.',
    sort_order: 53
  },

  {
    name: 'Mendevian Crusade Code',
    category: 'reminder' as AbilityCategory,
    action_type: 'passive' as ActionType,
    description: 'Oppose demonic influence in all its forms. Seek a way to close the Worldwound.',
    sort_order: 60
  }
]

export const TEMPLATES: CharacterTemplate[] = [
  {
    key: 'none',
    label: '— None (blank character) —',
    description: 'Fill in everything manually.',
    preset: { max_hp: 0 }
  },
  {
    key: 'korroc_l4',
    label: 'Korroc — Dwarf Stonelord/Life Oracle L4',
    description:
      'Stonelord Paladin (Mendevian Crusade Oath) / Life Oracle (Elemental Imbalance, Fire). Pre-fills DR 2/adamantine, 25% fortification, cold vulnerability, and 20 ability cards.',
    preset: {
      class_summary: 'Stonelord Paladin 4 (Mendevian Crusade) / Life Oracle 4 (Elemental Imbalance, Fire)',
      level: 4,
      // 4×d10 max + (Con 14 → +2)×4 + favored class HP +1×4 = 40 + 8 + 4 = 52
      max_hp: 52,
      fortification_percent: 25,
      drs: [{ amount: 2, bypass: 'adamantine' }],
      vulnerabilities: [{ energy_type: 'cold' }],
      seed_abilities: KORROC_L4_ABILITIES
    }
  }
]
