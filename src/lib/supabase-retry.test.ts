import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('SUPABASE_URL', 'https://database.example.test')
  vi.stubEnv('SUPABASE_SECRET_KEY', 'synthetic-test-key')
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('does not implicitly replay a failed tracker read or mutation after the client update', async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ message: 'Temporary fixture failure' }), {
    status: 503, headers: { 'content-type': 'application/json' },
  }))
  vi.stubGlobal('fetch', fetch)
  const { supabase } = await import('./supabase')
  const requests = [
    () => supabase.from('character').select('id'),
    () => supabase.from('character').insert({ name: 'Fixture' }),
    () => supabase.from('character').update({ current_hp: 10 }).eq('id', 'fixture'),
    () => supabase.from('character').delete().eq('id', 'fixture'),
    () => supabase.rpc('apply_hp_event', { character_id: 'fixture' }),
  ]
  for (const request of requests) {
    fetch.mockClear()
    expect((await request()).status).toBe(503)
    expect(fetch).toHaveBeenCalledTimes(1)
  }
})
