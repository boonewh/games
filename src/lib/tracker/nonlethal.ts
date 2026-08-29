// Nonlethal damage status, per PF1e.
//
//   "When your nonlethal damage equals your current hit points, you're
//    staggered. When it exceeds your current hit points, you fall unconscious."
//
// Pure so it can be unit-tested and shared by the API (which reconciles the
// auto-applied conditions) and the UI (which warns before you commit a hit).

import type { ConditionType } from './types'

export type NonlethalStatus = 'none' | 'staggered' | 'unconscious'

/**
 * Marker written to `condition.notes` on rows this module manages. Reconciliation
 * only ever adds or removes rows carrying it, so a staggered condition you applied
 * by hand (from a spell, say) is never touched.
 */
export const NONLETHAL_AUTO_NOTE = 'auto: nonlethal'

/** Conditions that reconciliation owns. */
export const NONLETHAL_CONDITIONS: ConditionType[] = ['staggered', 'unconscious']

export function nonlethalStatus(currentHp: number, nonlethal: number): NonlethalStatus {
  // With no nonlethal damage there is nothing to derive. This also keeps a
  // character at or below 0 HP from lethal damage out of the comparison, where
  // `0 > -3` would otherwise read as unconscious-from-nonlethal.
  if (nonlethal <= 0) return 'none'
  if (nonlethal > currentHp) return 'unconscious'
  if (nonlethal === currentHp) return 'staggered'
  return 'none'
}
