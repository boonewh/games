import { describe, it, expect } from 'vitest'
import { nonlethalStatus } from './nonlethal'

describe('nonlethalStatus', () => {
  it('is none while nonlethal stays below current HP', () => {
    expect(nonlethalStatus(20, 0)).toBe('none')
    expect(nonlethalStatus(20, 19)).toBe('none')
  })

  it('staggers when nonlethal equals current HP', () => {
    expect(nonlethalStatus(20, 20)).toBe('staggered')
    expect(nonlethalStatus(1, 1)).toBe('staggered')
  })

  it('knocks out when nonlethal exceeds current HP', () => {
    expect(nonlethalStatus(20, 21)).toBe('unconscious')
    expect(nonlethalStatus(3, 40)).toBe('unconscious')
  })

  it('stays none at 0 HP with no nonlethal — that is lethal damage, not this rule', () => {
    expect(nonlethalStatus(0, 0)).toBe('none')
    expect(nonlethalStatus(-7, 0)).toBe('none')
  })

  it('still knocks out a character already below 0 HP carrying nonlethal', () => {
    expect(nonlethalStatus(-2, 5)).toBe('unconscious')
  })
})
