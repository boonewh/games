// PF1e condition reference — name + one-line effect summary.
// Shown in the picker so the player remembers what each condition does.
//
// Source: Pathfinder 1e core rulebook conditions appendix.
// Descriptions are summaries, not full rules text — they exist to jog memory.

import { PF1E_CONDITIONS, type ConditionType } from './types'

export interface ConditionInfo {
  type: ConditionType
  description: string
  /** Loose severity hint for color-coding. Not a rules term. */
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  /** True if the description above is a campaign house rule rather than RAW PF1e. */
  houseRule?: boolean
}

export const CONDITION_INFO: Record<ConditionType, ConditionInfo> = {
  blinded: {
    type: 'blinded',
    description: '−2 AC, lose Dex to AC, 50% miss chance, −4 most Str/Dex skills, opponents have total concealment.',
    severity: 'severe'
  },
  confused: {
    type: 'confused',
    description: 'Roll d% each round: 01–25 act normally, 26–50 babble, 51–75 self-harm, 76–100 attack nearest.',
    severity: 'severe'
  },
  cowering: {
    type: 'cowering',
    description: 'Flat-footed (lose Dex to AC, no AoOs), can take no actions.',
    severity: 'severe'
  },
  dazed: {
    type: 'dazed',
    description: 'No actions this round (move, standard, swift, free, immediate). Can defend normally.',
    severity: 'moderate'
  },
  dazzled: {
    type: 'dazzled',
    description: '−1 attack rolls and sight-based Perception checks.',
    severity: 'mild'
  },
  deafened: {
    type: 'deafened',
    description: '−4 initiative, 20% spell failure for verbal spells, automatic Perception fails for sound.',
    severity: 'moderate'
  },
  dying: {
    type: 'dying',
    description: 'Unconscious; lose 1 HP per round. Make Con check DC 10+|HP| each turn to stabilize.',
    severity: 'critical'
  },
  entangled: {
    type: 'entangled',
    description: '−2 attack, −4 Dex, half speed, no charge or run. Concentration check to cast spells.',
    severity: 'moderate'
  },
  exhausted: {
    type: 'exhausted',
    description: '−6 Str and Dex, half speed, no run or charge. Becomes fatigued after 1 hour rest.',
    severity: 'severe'
  },
  fascinated: {
    type: 'fascinated',
    description: 'Stands quietly, −4 to react. Obvious threats break the effect; allies can shake you free.',
    severity: 'mild'
  },
  fatigued: {
    type: 'fatigued',
    description: '−2 Str and Dex, no run or charge. 8 hours rest removes it.',
    severity: 'mild'
  },
  'flat-footed': {
    type: 'flat-footed',
    description: 'Lose Dex bonus to AC, no AoOs. Until your first turn in combat or when caught off-guard.',
    severity: 'moderate'
  },
  frightened: {
    type: 'frightened',
    description: '−4 to attacks, saves, skill checks, and ability checks. Cannot take full-round actions.',
    severity: 'severe',
    houseRule: true
  },
  grappled: {
    type: 'grappled',
    description: '−4 Dex, −2 attack and CMB (except to grapple/escape), no movement. Concentration to cast.',
    severity: 'moderate'
  },
  helpless: {
    type: 'helpless',
    description: 'Dex 0, melee attacks auto-hit and threaten crits, coup de grace possible.',
    severity: 'critical'
  },
  invisible: {
    type: 'invisible',
    description: '+2 attack, opponents lose Dex to AC vs you, total concealment. Often beneficial.',
    severity: 'mild'
  },
  nauseated: {
    type: 'nauseated',
    description: '−4 to attacks, weapon damage, saves, skill checks, and ability checks. Only one action per turn. Cannot cast spells with verbal components.',
    severity: 'severe',
    houseRule: true
  },
  panicked: {
    type: 'panicked',
    description: '−6 to attacks, saves, skill checks, and ability checks. Only one action per turn.',
    severity: 'severe',
    houseRule: true
  },
  paralyzed: {
    type: 'paralyzed',
    description: 'Helpless, no actions, Str/Dex effectively 0. Mental actions only.',
    severity: 'critical'
  },
  petrified: {
    type: 'petrified',
    description: 'Turned to solid stone. Unconscious, helpless, immune to most things, but shattering = dead.',
    severity: 'critical'
  },
  pinned: {
    type: 'pinned',
    description: 'Helpless against grappler (but not others), immobile, −4 AC vs others.',
    severity: 'severe'
  },
  prone: {
    type: 'prone',
    description: '−4 melee attack, +4 AC vs ranged, −4 AC vs melee. Standing = move provoking AoO.',
    severity: 'mild'
  },
  shaken: {
    type: 'shaken',
    description: '−2 to attacks, saves, skill checks, and ability checks.',
    severity: 'mild'
  },
  sickened: {
    type: 'sickened',
    description: '−2 to attacks, weapon damage, saves, skill checks, and ability checks.',
    severity: 'mild'
  },
  staggered: {
    type: 'staggered',
    description: 'Only one move OR one standard action per round (not both). No full-round actions.',
    severity: 'moderate'
  },
  stunned: {
    type: 'stunned',
    description: 'Drop everything held, no actions, lose Dex to AC, −2 AC. Usually 1 round.',
    severity: 'severe'
  },
  unconscious: {
    type: 'unconscious',
    description: 'Knocked out. Helpless. From 0 HP nonlethal, sleep, or specific effects.',
    severity: 'critical'
  }
}

export const ALL_CONDITIONS: ConditionInfo[] = PF1E_CONDITIONS.map((c) => CONDITION_INFO[c])

export function severityStyles(severity: ConditionInfo['severity']): string {
  switch (severity) {
    case 'mild':
      return 'bg-amber-900/30 border-amber-700/50 text-amber-100'
    case 'moderate':
      return 'bg-orange-900/40 border-orange-700/60 text-orange-100'
    case 'severe':
      return 'bg-abyssal-red/30 border-abyssal-red/60 text-parchment'
    case 'critical':
      return 'bg-abyssal-red/50 border-abyssal-red text-parchment'
  }
}

/** Just the text color portion of the severity scale — used for inline name labels. */
export function severityNameColor(severity: ConditionInfo['severity']): string {
  switch (severity) {
    case 'mild':
      return 'text-amber-200'
    case 'moderate':
      return 'text-orange-200'
    case 'severe':
      return 'text-rose-300'
    case 'critical':
      return 'text-rose-200'
  }
}

/** Look up info for any string condition type, falling back to a generic shape for unknowns. */
export function getConditionInfo(type: string): ConditionInfo {
  const known = CONDITION_INFO[type as ConditionType]
  if (known) return known
  return {
    type: type as ConditionType,
    description: 'Custom condition.',
    severity: 'mild'
  }
}
