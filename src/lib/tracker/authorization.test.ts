import { beforeEach, expect, it, vi } from 'vitest'

const data = vi.hoisted(() => ({ owner: 'owner', party: 'party-1' as string | null,
  gm: 'gm', membership: null as { user_id: string } | null, exists: true }))
vi.mock('../auth-options', () => ({ authOptions: {} }))
vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }))
vi.mock('../supabase', () => ({ supabase: { from: (table: string) => {
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({
    data: table === 'character' ? (data.exists ? { user_id: data.owner, party_id: data.party } : null)
      : table === 'party' ? { gm_user_id: data.gm } : data.membership, error: null,
  }) }
  return query
} } }))
import { canEditCharacter, canViewCharacter, isPartyGmOfCharacter, isPartyMember } from './auth'
beforeEach(() => { data.owner = 'owner'; data.party = 'party-1'; data.gm = 'gm'; data.membership = null; data.exists = true })

it('owners and GMs retain edit/view access; another party member cannot edit a character', async () => {
  expect(await canEditCharacter('owner', 'character')).toBe(true)
  expect(await canEditCharacter('gm', 'character')).toBe(true)
  expect(await canViewCharacter('gm', 'character')).toBe(true)
  data.membership = { user_id: 'other-member' }
  expect(await canEditCharacter('other-member', 'character')).toBe(false)
  expect(await canViewCharacter('stranger', 'character')).toBe(false)
})

it('private GM notes remain inaccessible to the character owner', async () => {
  expect(await isPartyGmOfCharacter('owner', 'character')).toBe(false)
  expect(await isPartyGmOfCharacter('gm', 'character')).toBe(true)
  data.party = null
  expect(await isPartyGmOfCharacter('gm', 'character')).toBe(false)
})

it('party assignment requires membership or GM status', async () => {
  expect(await isPartyMember('gm', 'party-1')).toBe(true)
  expect(await isPartyMember('stranger', 'party-1')).toBe(false)
  data.membership = { user_id: 'member' }
  expect(await isPartyMember('member', 'party-1')).toBe(true)
})

it('missing characters fail closed', async () => {
  data.exists = false
  expect(await canEditCharacter('owner', 'missing')).toBe(false)
  expect(await isPartyGmOfCharacter('gm', 'missing')).toBe(false)
})
