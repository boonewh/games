// Minimal smoke-test page. Confirms:
//   - the auth gate works (you got here, so you're signed in)
//   - the API can read from Supabase (the character list renders)
//   - the API can write to Supabase (the test-create button inserts a row)
//
// This is a throwaway shell — we'll replace it with the real roster UI next.

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Character } from '@/lib/tracker/types'

export default function TrackerSmokeTest() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/tracker/characters')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setCharacters(json.characters ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createTest() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/tracker/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Korroc smoke-test ${new Date().toISOString().slice(11, 19)}`,
          class_summary: 'Dwarf Gestalt Stonelord/Life Oracle',
          level: 4,
          max_hp: 52,
          fortification_percent: 25,
          drs: [{ amount: 2, bypass: 'adamantine' }],
          vulnerabilities: [{ energy_type: 'cold' }]
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-dark text-parchment p-8 font-spectral">
      <h1 className="font-cinzel text-3xl text-wotr-gold mb-2">Tracker — smoke test</h1>
      <p className="text-sm opacity-70 mb-6">
        Throwaway page to verify auth + Supabase round-trip. Real UI lands next.
      </p>

      <button
        onClick={createTest}
        disabled={creating}
        className="mb-6 px-4 py-2 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
      >
        {creating ? 'Creating…' : '+ Create a test Korroc'}
      </button>

      {error && (
        <div className="mb-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-parchment">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="opacity-60">Loading characters…</div>
      ) : characters.length === 0 ? (
        <div className="opacity-60">
          No characters yet. Click the button above to insert one.
        </div>
      ) : (
        <ul className="space-y-2">
          {characters.map((c) => (
            <li
              key={c.id}
              className="p-3 rounded border border-stone-light bg-stone-light/40 flex items-baseline justify-between"
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                {c.class_summary && <div className="text-xs opacity-70">{c.class_summary}</div>}
              </div>
              <div className="text-sm tabular-nums">
                HP <span className="text-wotr-gold">{c.current_hp}</span> / {c.max_hp}
                {c.fortification_percent > 0 && (
                  <span className="ml-3 text-xs opacity-70">fort {c.fortification_percent}%</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <pre className="mt-8 text-xs opacity-50">
        {JSON.stringify({ count: characters.length, ids: characters.map((c) => c.id) }, null, 2)}
      </pre>
    </main>
  )
}
