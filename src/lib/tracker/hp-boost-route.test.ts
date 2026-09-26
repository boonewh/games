import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  requireCharacter: vi.fn(),
  from: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  row: {} as Record<string, unknown>,
  last: null as null | Record<string, unknown>
}))

vi.mock('@/lib/supabase', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/lib/tracker/http', () => ({
  requireCharacter: mocks.requireCharacter,
  json: (body: unknown) => Response.json(body),
  bad: (error: string) => Response.json({ error }, { status: 400 }),
  fail: (error: string) => Response.json({ error }, { status: 500 }),
  notFound: (error: string) => Response.json({ error }, { status: 404 })
}))
vi.mock('@/lib/tracker/hp-boost', async () => import('./hp-boost'))
vi.mock('@/lib/tracker/damage', async () => import('./damage'))
vi.mock('@/lib/tracker/nonlethal', async () => import('./nonlethal'))

import { POST } from '../../app/api/tracker/characters/[id]/hp/route'

function post(body: unknown) {
  return POST(new NextRequest('http://localhost/api/tracker/characters/c1/hp', {
    method: 'POST', body: JSON.stringify(body)
  }), { params: Promise.resolve({ id: 'c1' }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireCharacter.mockResolvedValue({ session: { userId: 'u1' } })
  mocks.row = { id: 'c1', current_hp: 110, max_hp: 100, level: 10,
    hp_boost_per_level: 2, hp_boost_active: true, nonlethal: 0, temp_hp: 7 }
  mocks.last = null
  mocks.from.mockImplementation((table: string) => {
    const chain: Record<string, unknown> = {}
    for (const method of ['select', 'eq', 'neq', 'in', 'order', 'limit', 'not', 'gt', 'delete']) {
      chain[method] = () => chain
    }
    chain.update = (patch: Record<string, unknown>) => {
      mocks.update(table, patch)
      if (table === 'character') mocks.row = { ...mocks.row, ...patch }
      return chain
    }
    chain.insert = (event: unknown) => { mocks.insert(table, event); return chain }
    chain.single = async () => ({ data: table === 'character' ? mocks.row : {}, error: null })
    chain.maybeSingle = async () => ({ data: mocks.last, error: null })
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve)
    return chain
  })
})

describe('HP boost API and healing integration', () => {
  it('requires edit permission before any database access', async () => {
    mocks.requireCharacter.mockResolvedValue({ error: Response.json({}, { status: 403 }) })
    expect((await post({ action: 'hp_boost', per_level: 2, active: true })).status).toBe(403)
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it.each([
    { per_level: -1, active: true }, { per_level: 1.5, active: true },
    { per_level: '2', active: true }, { per_level: 2, active: 'true' },
    { per_level: 0, active: true }, { per_level: 1001, active: false }
  ])('rejects invalid boost input: %j', async (input) => {
    expect((await post({ action: 'hp_boost', ...input })).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('sends the explicit desired boost state without writing an old HP snapshot', async () => {
    expect((await post({ action: 'hp_boost', per_level: 2, active: false })).status).toBe(200)
    expect(mocks.update).toHaveBeenCalledWith('character', { hp_boost_per_level: 2, hp_boost_active: false })
  })

  it('heals up to the boosted maximum', async () => {
    await post({ action: 'heal', amount: 50 })
    expect(mocks.row.current_hp).toBe(120)
    expect(mocks.row.max_hp).toBe(100)
    expect(mocks.row.temp_hp).toBe(7)
  })

  it('full heal uses the boosted maximum', async () => {
    await post({ action: 'full_heal' })
    expect(mocks.row.current_hp).toBe(120)
  })

  it('long rest heals by level up to the boosted maximum', async () => {
    mocks.row.current_hp = 115
    await post({ action: 'long_rest' })
    expect(mocks.row.current_hp).toBe(120)
    expect(mocks.row.hp_boost_active).toBe(true)
  })

  it('healing uses the base cap when the boost is off', async () => {
    mocks.row.current_hp = 90
    mocks.row.hp_boost_active = false
    await post({ action: 'heal', amount: 50 })
    expect(mocks.row.current_hp).toBe(100)
  })

  it('does not partially undo a boost as though it were damage or healing', async () => {
    mocks.last = { id: 'e1', kind: 'hp_boost', applied_amount: 20 }
    const response = await post({ action: 'undo' })
    expect((await response.json()).message).toContain('HP boost control')
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
