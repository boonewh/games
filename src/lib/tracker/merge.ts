// Pure merge/diff engine for "Update from PDF".
//
// Given a character's current detail and a freshly parsed ExtractedCharacter,
// compute what would change — bucketed so the review UI can show it and the
// apply endpoint can act on it. No DB calls; fully unit-testable.
//
// Matching:
//   - abilities / spells / pools  → normalized name (spells also keyed by class)
//   - DR                          → normalized bypass ("DR 5/magic" keyed on "magic")
//   - resistance / vulnerability  → energy type
// The parser transcribes Hero Lab's stable names, so same-source re-parses line
// up; the review UI provides a manual re-link for the rare rename.
//
// Preservation rule (the whole point of the feature): a re-parse only carries
// DESCRIPTIVE fields. Taking the new version of a matched card updates those but
// KEEPS the character's runtime state — uses_remaining (clamped to the new max),
// enabled/hidden, sort_order, cast_count, points_remaining, notes.

import type {
  Ability,
  CharacterDetail,
  DamageReduction,
  EnergyResistance,
  EnergyType,
  EnergyVulnerability,
  ResourcePool,
  Spell
} from './types'
import type { ExtractedAbility, ExtractedCharacter, ExtractedPool, ExtractedSpell } from './extracted'

export type MergeBucket = 'unchanged' | 'changed' | 'new' | 'removed'

export interface ScalarDiff {
  field: string
  label: string
  current: string | number | null
  incoming: string | number | null
  defaultAction: 'take' | 'keep'
}

export interface ListDiff<C, I> {
  bucket: MergeBucket
  /** Normalized match key (also the manual-relink handle). */
  key: string
  /** Display label, taken from whichever side exists. */
  label: string
  current: C | null
  incoming: I | null
  /** For 'changed': which descriptive fields differ. */
  changedFields: string[]
  /** Pre-selected decision the UI starts from. */
  defaultAction: 'add' | 'take' | 'keep' | 'none'
}

type IncomingDr = { amount: number; bypass: string }
type IncomingResist = { energy_type: EnergyType; amount: number }
type IncomingVuln = { energy_type: EnergyType }

export interface MergePlan {
  scalars: ScalarDiff[]
  abilities: ListDiff<Ability, ExtractedAbility>[]
  spells: ListDiff<Spell, ExtractedSpell>[]
  pools: ListDiff<ResourcePool, ExtractedPool>[]
  drs: ListDiff<DamageReduction, IncomingDr>[]
  resistances: ListDiff<EnergyResistance, IncomingResist>[]
  vulnerabilities: ListDiff<EnergyVulnerability, IncomingVuln>[]
}

// --- helpers ---------------------------------------------------------------

/** Lowercase, drop parentheticals, collapse non-alphanumerics to single spaces. */
export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const txtEq = (a: string | null | undefined, b: string | null | undefined): boolean =>
  (a ?? '').trim() === (b ?? '').trim()

function scalarEq(a: string | number | null, b: string | number | null): boolean {
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a ?? '').trim() === String(b ?? '').trim()
  }
  return (a ?? null) === (b ?? null)
}

function diffList<C, I>(
  current: C[],
  incoming: I[],
  keyC: (c: C) => string,
  keyI: (i: I) => string,
  labelC: (c: C) => string,
  labelI: (i: I) => string,
  changed: (c: C, i: I) => string[]
): ListDiff<C, I>[] {
  const curByKey = new Map<string, C>()
  for (const c of current) curByKey.set(keyC(c), c)
  const incKeys = new Set(incoming.map(keyI))

  const out: ListDiff<C, I>[] = []

  for (const i of incoming) {
    const k = keyI(i)
    const c = curByKey.get(k)
    if (c) {
      const cf = changed(c, i)
      out.push({
        bucket: cf.length ? 'changed' : 'unchanged',
        key: k,
        label: labelI(i),
        current: c,
        incoming: i,
        changedFields: cf,
        defaultAction: cf.length ? 'take' : 'none'
      })
    } else {
      out.push({ bucket: 'new', key: k, label: labelI(i), current: null, incoming: i, changedFields: [], defaultAction: 'add' })
    }
  }

  for (const c of current) {
    if (!incKeys.has(keyC(c))) {
      out.push({ bucket: 'removed', key: keyC(c), label: labelC(c), current: c, incoming: null, changedFields: [], defaultAction: 'keep' })
    }
  }

  return out
}

// --- changed-field detectors (descriptive fields only) ---------------------

function abilityChanges(c: Ability, i: ExtractedAbility): string[] {
  const f: string[] = []
  if (!txtEq(c.name, i.name)) f.push('name')
  if (c.category !== i.category) f.push('category')
  if ((c.action_type ?? null) !== (i.action_type ?? null)) f.push('action_type')
  if (!txtEq(c.description, i.description)) f.push('description')
  if ((c.uses_max ?? null) !== (i.uses_max ?? null)) f.push('uses_max')
  if ((c.recharge ?? null) !== (i.recharge ?? null)) f.push('recharge')
  return f
}

function spellChanges(c: Spell, i: ExtractedSpell): string[] {
  const f: string[] = []
  if (!txtEq(c.name, i.name)) f.push('name')
  if (c.level !== i.level) f.push('level')
  if (!txtEq(c.school, i.school)) f.push('school')
  if (!txtEq(c.description, i.description)) f.push('description')
  if ((c.prepared_count ?? null) !== (i.prepared_count ?? null)) f.push('prepared_count')
  return f
}

function poolChanges(c: ResourcePool, i: ExtractedPool): string[] {
  const f: string[] = []
  if (!txtEq(c.name, i.name)) f.push('name')
  if (c.points_max !== i.points_max) f.push('points_max')
  if ((c.recharge ?? null) !== (i.recharge ?? null)) f.push('recharge')
  return f
}

// --- plan builder ----------------------------------------------------------

const SCALAR_FIELDS: Array<{ field: string; label: string }> = [
  { field: 'name', label: 'Name' },
  { field: 'class_summary', label: 'Class' },
  { field: 'level', label: 'Level' },
  { field: 'max_hp', label: 'Max HP' },
  { field: 'ac', label: 'AC' },
  { field: 'ac_touch', label: 'Touch' },
  { field: 'ac_flat_footed', label: 'Flat-Footed' },
  { field: 'spell_dc', label: 'Spell DC' },
  { field: 'mythic_path', label: 'Mythic Path' },
  { field: 'mythic_tier', label: 'Mythic Tier' },
  { field: 'fortification_percent', label: 'Fortification %' },
  { field: 'deity', label: 'Deity' },
  { field: 'alignment', label: 'Alignment' },
  { field: 'save_fort', label: 'Fort' },
  { field: 'save_ref', label: 'Ref' },
  { field: 'save_will', label: 'Will' },
  { field: 'cmb', label: 'CMB' },
  { field: 'cmd', label: 'CMD' },
  { field: 'languages', label: 'Languages' }
]

function diffScalars(current: CharacterDetail, incoming: ExtractedCharacter): ScalarDiff[] {
  const cur = current as unknown as Record<string, string | number | null>
  const inc = incoming as unknown as Record<string, string | number | null>
  const out: ScalarDiff[] = []
  for (const { field, label } of SCALAR_FIELDS) {
    const c = cur[field] ?? null
    const i = inc[field] ?? null
    if (!scalarEq(c, i)) out.push({ field, label, current: c, incoming: i, defaultAction: 'take' })
  }
  return out
}

const spellKey = (name: string, casting_class: string) => `${normalizeName(name)}|${casting_class.toLowerCase()}`

export function buildMergePlan(current: CharacterDetail, incoming: ExtractedCharacter): MergePlan {
  return {
    scalars: diffScalars(current, incoming),
    abilities: diffList<Ability, ExtractedAbility>(
      current.abilities,
      incoming.abilities ?? [],
      (c) => normalizeName(c.name),
      (i) => normalizeName(i.name),
      (c) => c.name,
      (i) => i.name,
      abilityChanges
    ),
    spells: diffList<Spell, ExtractedSpell>(
      current.spells,
      incoming.spells ?? [],
      (c) => spellKey(c.name, c.casting_class),
      (i) => spellKey(i.name, i.casting_class),
      (c) => c.name,
      (i) => i.name,
      spellChanges
    ),
    pools: diffList<ResourcePool, ExtractedPool>(
      current.pools,
      incoming.pools ?? [],
      (c) => normalizeName(c.name),
      (i) => normalizeName(i.name),
      (c) => c.name,
      (i) => i.name,
      poolChanges
    ),
    drs: diffList<DamageReduction, IncomingDr>(
      current.drs,
      incoming.drs ?? [],
      (c) => normalizeName(c.bypass),
      (i) => normalizeName(i.bypass),
      (c) => `DR ${c.amount}/${c.bypass}`,
      (i) => `DR ${i.amount}/${i.bypass}`,
      (c, i) => (c.amount !== i.amount ? ['amount'] : [])
    ),
    resistances: diffList<EnergyResistance, IncomingResist>(
      current.resistances,
      incoming.resistances ?? [],
      (c) => c.energy_type,
      (i) => i.energy_type,
      (c) => `Resist ${c.amount} ${c.energy_type}`,
      (i) => `Resist ${i.amount} ${i.energy_type}`,
      (c, i) => (c.amount !== i.amount ? ['amount'] : [])
    ),
    vulnerabilities: diffList<EnergyVulnerability, IncomingVuln>(
      current.vulnerabilities,
      incoming.vulnerabilities ?? [],
      (c) => c.energy_type,
      (i) => i.energy_type,
      (c) => `Vulnerable ${c.energy_type}`,
      (i) => `Vulnerable ${i.energy_type}`,
      () => [] // vulnerabilities carry no amount — a match is always unchanged
    )
  }
}

// --- preservation merges (descriptive update, runtime preserved) -----------
// Each returns ONLY the fields to write on a "take new" of a matched card.
// Fields not returned (enabled, hidden, sort_order, notes, …) are left as-is.

export function mergedAbilityFields(current: Ability, incoming: ExtractedAbility) {
  const uses_max = incoming.uses_max ?? null
  const uses_remaining =
    uses_max == null ? null : Math.min(current.uses_remaining ?? uses_max, uses_max)
  return {
    name: incoming.name,
    category: incoming.category,
    action_type: incoming.action_type ?? null,
    description: incoming.description ?? null,
    uses_max,
    recharge: incoming.recharge ?? null,
    uses_remaining
  }
}

export function mergedSpellFields(current: Spell, incoming: ExtractedSpell) {
  const prepared_count = incoming.prepared_count ?? null
  // Preserve cast_count, but don't let it exceed a now-lower prepared cap.
  const cast_count = prepared_count == null ? current.cast_count : Math.min(current.cast_count, prepared_count)
  return {
    name: incoming.name,
    level: incoming.level,
    casting_class: incoming.casting_class.toLowerCase(),
    school: incoming.school?.toLowerCase() ?? null,
    description: incoming.description ?? null,
    prepared_count,
    cast_count
  }
}

export function mergedPoolFields(current: ResourcePool, incoming: ExtractedPool) {
  const points_max = incoming.points_max
  return {
    name: incoming.name,
    points_max,
    recharge: incoming.recharge ?? null,
    points_remaining: Math.min(current.points_remaining, points_max)
  }
}
