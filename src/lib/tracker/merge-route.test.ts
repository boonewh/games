import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { calculateDamage } from './damage'
import { mergeSelectionAction } from './merge'
import type { DamageReduction } from './types'

const mocks = vi.hoisted(() => ({
  requireCharacter: vi.fn(),
  from: vi.fn(),
  deleted: vi.fn(),
  drs: [] as DamageReduction[],
  deleteError: null as null | { message: string }
}))

vi.mock('@/lib/supabase', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/lib/tracker/http', () => ({
  requireCharacter: mocks.requireCharacter,
  json: (body: unknown) => Response.json(body),
  bad: (error: string) => Response.json({ error }, { status: 400 }),
  fail: (error: string) => Response.json({ error }, { status: 500 }),
  notFound: (error: string) => Response.json({ error }, { status: 404 })
}))
vi.mock('@/lib/tracker/merge', async () => import('./merge'))

import { POST } from '../../app/api/tracker/characters/[id]/merge/route'

const incoming = { name: 'Nageru', max_hp: 170, drs: [], abilities: [], spells: [], pools: [] }

function post(checked?: boolean) {
  return POST(new NextRequest('http://localhost/api/tracker/characters/c1/merge', {
    method: 'POST',
    body: JSON.stringify({
      incoming,
      ...(checked === undefined ? {} : { drs: { adamantine: mergeSelectionAction('removed', checked) } })
    })
  }), { params: Promise.resolve({ id: 'c1' }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireCharacter.mockResolvedValue({ session: { userId: 'u1' } })
  mocks.drs = [{ id: 'd1', character_id: 'c1', amount: 10, bypass: 'adamantine', enabled: true }]
  mocks.deleteError = null
  mocks.from.mockImplementation((table: string) => {
    let deleting = false
    const chain = {
      select: () => chain,
      delete: () => { deleting = true; return chain },
      eq: (field: string, value: string) => {
        if (deleting) {
          mocks.deleted(table, field, value)
          if (!mocks.deleteError && table === 'damage_reduction' && field === 'id') {
            mocks.drs = mocks.drs.filter((dr) => dr.id !== value)
          }
        }
        return chain
      },
      single: async () => ({ data: { ...incoming, id: 'c1', damage_reduction: mocks.drs }, error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: mocks.deleteError }).then(resolve)
    }
    return chain
  })
})

describe('PDF review damage reduction removal', () => {
  it('deletes unchecked missing DR so subsequent physical damage is not reduced', async () => {
    const response = await post(false)
    expect(response.status).toBe(200)
    expect((await response.json()).counts.deleted).toBe(1)
    expect(mocks.deleted).toHaveBeenCalledWith('damage_reduction', 'id', 'd1')
    expect(mocks.drs).toEqual([])
    const result = calculateDamage({ amount: 10, damage_type: 'physical' }, {
      character: { current_hp: 170, temp_hp: 0, nonlethal: 0, fortification_percent: 0 },
      drs: mocks.drs,
      resistances: [],
      vulnerabilities: []
    })
    expect(result.breakdown.dr_applied).toBe(0)
    expect(result.newCurrentHp).toBe(160)
  })

  it.each([true, undefined])('preserves missing DR when kept or no decision is sent (%s)', async (checked) => {
    expect((await post(checked)).status).toBe(200)
    expect(mocks.deleted).not.toHaveBeenCalled()
    expect(mocks.drs).toHaveLength(1)
  })

  it('reports failed deletion instead of claiming the update succeeded', async () => {
    mocks.deleteError = { message: 'Delete failed' }
    const response = await post(false)
    expect(response.status).toBe(500)
    expect((await response.json()).error).toContain('Delete failed')
    expect(mocks.drs).toHaveLength(1)
  })
})
