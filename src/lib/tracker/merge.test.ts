import { describe, it, expect } from 'vitest'
import {
  buildMergePlan,
  normalizeName,
  mergedAbilityFields,
  mergedSpellFields,
  mergedPoolFields,
  type ListDiff
} from './merge'
import type { Ability, CharacterDetail, ResourcePool, Spell } from './types'
import type { ExtractedAbility, ExtractedCharacter, ExtractedPool, ExtractedSpell } from './extracted'

// --- factories -------------------------------------------------------------

function detail(over: Partial<CharacterDetail> = {}): CharacterDetail {
  return {
    id: 'c1',
    user_id: 'u1',
    party_id: null,
    campaign_key: 'wrath',
    name: 'Korroc',
    class_summary: 'Paladin 4',
    level: 4,
    max_hp: 40,
    current_hp: 30,
    temp_hp: 0,
    nonlethal: 0,
    fortification_percent: 0,
    ac: 20,
    ac_touch: 11,
    ac_flat_footed: 19,
    spell_dc: null,
    mythic_path: null,
    mythic_tier: null,
    deity: null,
    alignment: null,
    save_fort: null,
    save_ref: null,
    save_will: null,
    cmb: null,
    cmd: null,
    spell_penetration: null,
    languages: null,
    notes: null,
    created_at: 't',
    updated_at: 't',
    drs: [],
    resistances: [],
    vulnerabilities: [],
    abilities: [],
    conditions: [],
    pools: [],
    spells: [],
    spell_dc_entries: [],
    spell_pen_entries: [],
    ...over
  }
}

function ability(over: Partial<Ability> = {}): Ability {
  return {
    id: 'a1',
    character_id: 'c1',
    name: 'Lay on Hands',
    category: 'class_feature',
    action_type: 'standard',
    description: 'Heal 2d6.',
    uses_max: 5,
    uses_remaining: 2,
    recharge: 'per_day',
    enabled: true,
    hidden: false,
    sort_order: 10,
    ...over
  }
}

function exAbility(over: Partial<ExtractedAbility> = {}): ExtractedAbility {
  return {
    name: 'Lay on Hands',
    category: 'class_feature',
    action_type: 'standard',
    description: 'Heal 2d6.',
    uses_max: 5,
    recharge: 'per_day',
    ...over
  }
}

function spell(over: Partial<Spell> = {}): Spell {
  return {
    id: 's1',
    character_id: 'c1',
    name: 'Cure Light Wounds',
    level: 1,
    casting_class: 'paladin',
    school: 'conjuration',
    description: 'Heal 1d8+1.',
    prepared_count: 2,
    cast_count: 1,
    notes: null,
    sort_order: 0,
    ...over
  }
}

function exSpell(over: Partial<ExtractedSpell> = {}): ExtractedSpell {
  return {
    name: 'Cure Light Wounds',
    level: 1,
    casting_class: 'paladin',
    school: 'conjuration',
    description: 'Heal 1d8+1.',
    prepared_count: 2,
    ...over
  }
}

function pool(over: Partial<ResourcePool> = {}): ResourcePool {
  return {
    id: 'p1',
    character_id: 'c1',
    name: 'Ki Pool',
    points_remaining: 3,
    points_max: 5,
    recharge: 'per_day',
    notes: null,
    sort_order: 0,
    ...over
  }
}

function exPool(over: Partial<ExtractedPool> = {}): ExtractedPool {
  return { name: 'Ki Pool', points_max: 5, recharge: 'per_day', ...over }
}

function extracted(over: Partial<ExtractedCharacter> = {}): ExtractedCharacter {
  return {
    name: 'Korroc',
    class_summary: 'Paladin 4',
    level: 4,
    max_hp: 40,
    ac: 20,
    ac_touch: 11,
    ac_flat_footed: 19,
    spell_dcs: [],
    mythic_path: null,
    mythic_tier: null,
    fortification_percent: 0,
    deity: null,
    alignment: null,
    save_fort: null,
    save_ref: null,
    save_will: null,
    cmb: null,
    cmd: null,
    spell_penetration: null,
    languages: null,
    drs: [],
    resistances: [],
    vulnerabilities: [],
    abilities: [],
    spells: [],
    pools: [],
    ...over
  }
}

function byBucket<C, I>(diffs: ListDiff<C, I>[], bucket: string) {
  return diffs.filter((d) => d.bucket === bucket)
}

// --- normalizeName ---------------------------------------------------------

describe('normalizeName', () => {
  it('lowercases, strips parentheticals and punctuation, collapses spaces', () => {
    expect(normalizeName('Lay on Hands')).toBe('lay on hands')
    expect(normalizeName('Lay On Hands (Su)')).toBe('lay on hands')
    expect(normalizeName('  Smite\tEvil! ')).toBe('smite evil')
    expect(normalizeName('Lay on Hands')).toBe(normalizeName('lay-on-hands'))
  })
})

// --- scalars ---------------------------------------------------------------

describe('buildMergePlan — scalars', () => {
  it('reports only changed scalar fields', () => {
    const plan = buildMergePlan(
      detail({ max_hp: 40, level: 4, save_fort: 5 }),
      extracted({ max_hp: 52, level: 5, save_fort: 7 })
    )
    const fields = plan.scalars.map((s) => s.field).sort()
    expect(fields).toEqual(['level', 'max_hp', 'save_fort'])
    expect(plan.scalars.every((s) => s.defaultAction === 'take')).toBe(true)
  })

  it('treats null and absent-equivalent values as unchanged', () => {
    const plan = buildMergePlan(detail({ deity: null }), extracted({ deity: null }))
    expect(plan.scalars.find((s) => s.field === 'deity')).toBeUndefined()
  })

  it('flags a newly-parsed value over a null current', () => {
    const plan = buildMergePlan(detail({ alignment: null }), extracted({ alignment: 'LG' }))
    const d = plan.scalars.find((s) => s.field === 'alignment')
    expect(d).toMatchObject({ current: null, incoming: 'LG' })
  })

  it('produces no scalar diffs when everything matches', () => {
    expect(buildMergePlan(detail(), extracted()).scalars).toEqual([])
  })
})

// --- abilities -------------------------------------------------------------

describe('buildMergePlan — abilities', () => {
  it('matches by normalized name despite case/parenthetical drift', () => {
    const plan = buildMergePlan(
      detail({ abilities: [ability({ name: 'Lay on Hands' })] }),
      extracted({ abilities: [exAbility({ name: 'Lay On Hands (Su)' })] })
    )
    expect(plan.abilities).toHaveLength(1)
    expect(plan.abilities[0].bucket).toBe('changed') // name differs raw → a change, but still matched
    expect(byBucket(plan.abilities, 'new')).toHaveLength(0)
    expect(byBucket(plan.abilities, 'removed')).toHaveLength(0)
  })

  it('marks an identical ability unchanged with no default action', () => {
    const plan = buildMergePlan(
      detail({ abilities: [ability()] }),
      extracted({ abilities: [exAbility()] })
    )
    expect(plan.abilities[0].bucket).toBe('unchanged')
    expect(plan.abilities[0].defaultAction).toBe('none')
  })

  it('detects a changed ability and lists the changed fields', () => {
    const plan = buildMergePlan(
      detail({ abilities: [ability({ uses_max: 5, description: 'Heal 2d6.' })] }),
      extracted({ abilities: [exAbility({ uses_max: 6, description: 'Heal 3d6.' })] })
    )
    const d = plan.abilities[0]
    expect(d.bucket).toBe('changed')
    expect(d.defaultAction).toBe('take')
    expect(d.changedFields.sort()).toEqual(['description', 'uses_max'])
  })

  it('buckets a brand-new ability as new (default add)', () => {
    const plan = buildMergePlan(
      detail({ abilities: [] }),
      extracted({ abilities: [exAbility({ name: 'Stonestrike' })] })
    )
    expect(plan.abilities[0]).toMatchObject({ bucket: 'new', defaultAction: 'add', current: null })
  })

  it('buckets a hand-added ability (absent from the PDF) as removed, default keep', () => {
    const plan = buildMergePlan(
      detail({ abilities: [ability({ name: 'Homebrew Boon' })] }),
      extracted({ abilities: [] })
    )
    expect(plan.abilities[0]).toMatchObject({ bucket: 'removed', defaultAction: 'keep', incoming: null })
  })
})

// --- spells (keyed by name + class) ----------------------------------------

describe('buildMergePlan — spells', () => {
  it('keeps same-named spells on different classes as separate items', () => {
    const plan = buildMergePlan(
      detail({ spells: [spell({ name: 'Cure Light Wounds', casting_class: 'paladin' })] }),
      extracted({ spells: [exSpell({ name: 'Cure Light Wounds', casting_class: 'oracle' })] })
    )
    expect(byBucket(plan.spells, 'new')).toHaveLength(1) // oracle CLW is new
    expect(byBucket(plan.spells, 'removed')).toHaveLength(1) // paladin CLW is removed
  })

  it('detects a changed prepared_count', () => {
    const plan = buildMergePlan(
      detail({ spells: [spell({ prepared_count: 2 })] }),
      extracted({ spells: [exSpell({ prepared_count: 3 })] })
    )
    expect(plan.spells[0].bucket).toBe('changed')
    expect(plan.spells[0].changedFields).toContain('prepared_count')
  })
})

// --- defenses --------------------------------------------------------------

describe('buildMergePlan — defenses', () => {
  it('matches DR by bypass and flags an amount change', () => {
    const plan = buildMergePlan(
      detail({ drs: [{ id: 'd1', character_id: 'c1', amount: 2, bypass: 'adamantine', enabled: true }] }),
      extracted({ drs: [{ amount: 5, bypass: 'adamantine' }] })
    )
    expect(plan.drs[0].bucket).toBe('changed')
    expect(plan.drs[0].changedFields).toEqual(['amount'])
  })

  it('matches resistance by energy type', () => {
    const plan = buildMergePlan(
      detail({ resistances: [{ id: 'r1', character_id: 'c1', energy_type: 'fire', amount: 5, enabled: true }] }),
      extracted({ resistances: [{ energy_type: 'fire', amount: 10 }] })
    )
    expect(plan.resistances[0].bucket).toBe('changed')
  })

  it('treats a matched vulnerability as always unchanged', () => {
    const plan = buildMergePlan(
      detail({ vulnerabilities: [{ id: 'v1', character_id: 'c1', energy_type: 'cold', enabled: true }] }),
      extracted({ vulnerabilities: [{ energy_type: 'cold' }] })
    )
    expect(plan.vulnerabilities[0].bucket).toBe('unchanged')
  })

  it('buckets a new vulnerability and a removed one correctly', () => {
    const plan = buildMergePlan(
      detail({ vulnerabilities: [{ id: 'v1', character_id: 'c1', energy_type: 'cold', enabled: true }] }),
      extracted({ vulnerabilities: [{ energy_type: 'fire' }] })
    )
    expect(byBucket(plan.vulnerabilities, 'new').map((d) => d.incoming?.energy_type)).toEqual(['fire'])
    expect(byBucket(plan.vulnerabilities, 'removed').map((d) => d.current?.energy_type)).toEqual(['cold'])
  })
})

// --- preservation merges ---------------------------------------------------

describe('preservation — mergedAbilityFields', () => {
  it('updates descriptive fields but never returns runtime/UI state', () => {
    const out = mergedAbilityFields(
      ability({ uses_remaining: 2, enabled: false, hidden: true, sort_order: 99 }),
      exAbility({ description: 'New text.', uses_max: 6 })
    )
    expect(out.description).toBe('New text.')
    expect(out.uses_max).toBe(6)
    // runtime/UI fields must NOT be in the update payload (left untouched in DB)
    expect(out).not.toHaveProperty('enabled')
    expect(out).not.toHaveProperty('hidden')
    expect(out).not.toHaveProperty('sort_order')
  })

  it('preserves uses_remaining, clamped down to a lowered max', () => {
    expect(mergedAbilityFields(ability({ uses_remaining: 5 }), exAbility({ uses_max: 3 })).uses_remaining).toBe(3)
    expect(mergedAbilityFields(ability({ uses_remaining: 2 }), exAbility({ uses_max: 6 })).uses_remaining).toBe(2)
  })

  it('nulls remaining when the ability becomes unlimited-use', () => {
    expect(mergedAbilityFields(ability({ uses_remaining: 4 }), exAbility({ uses_max: null })).uses_remaining).toBeNull()
  })
})

describe('preservation — mergedSpellFields & mergedPoolFields', () => {
  it('preserves cast_count, clamped to a lowered prepared cap', () => {
    expect(mergedSpellFields(spell({ cast_count: 2 }), exSpell({ prepared_count: 1 })).cast_count).toBe(1)
    expect(mergedSpellFields(spell({ cast_count: 1 }), exSpell({ prepared_count: 3 })).cast_count).toBe(1)
  })

  it('keeps cast_count as-is for spontaneous (null prepared_count)', () => {
    expect(mergedSpellFields(spell({ cast_count: 4 }), exSpell({ prepared_count: null })).cast_count).toBe(4)
  })

  it('preserves points_remaining, clamped to a lowered max', () => {
    expect(mergedPoolFields(pool({ points_remaining: 5 }), exPool({ points_max: 3 })).points_remaining).toBe(3)
    expect(mergedPoolFields(pool({ points_remaining: 2 }), exPool({ points_max: 8 })).points_remaining).toBe(2)
  })
})
