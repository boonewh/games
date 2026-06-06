// Roster — parties + your characters in this campaign.
// Click a character to enter its full view at /wrath/tracker/[id].

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Character } from '@/lib/tracker/types'
import { NewCharacterModal } from '@/components/tracker/NewCharacterModal'
import { PartiesSection } from '@/components/tracker/PartiesSection'
import { ZoomControls } from '@/components/tracker/ZoomControls'
import { useTrackerZoom } from '@/hooks/useTrackerZoom'

export default function TrackerRosterPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const zoom = useTrackerZoom()

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

  return (
    <main className="min-h-screen bg-stone-dark text-parchment font-spectral">
      <div style={{ zoom: zoom.zoom }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-baseline justify-between mb-8 border-b border-stone-light pb-4">
          <div>
            <h1 className="font-cinzel text-3xl text-wotr-gold">Character Tracker</h1>
            <p className="text-sm opacity-70 mt-1">Your characters in this campaign.</p>
          </div>
          <div className="flex items-center gap-3">
            <ZoomControls
              isMin={zoom.isMin}
              isMax={zoom.isMax}
              isDefault={zoom.isDefault}
              onChange={zoom.change}
              onReset={zoom.reset}
            />
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold font-cinzel"
            >
              + New Character
            </button>
          </div>
        </header>

        <PartiesSection />

        <section>
          <h2 className="font-cinzel text-sm uppercase tracking-wider opacity-70 mb-2">Characters</h2>

          {error && (
            <div className="mb-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-parchment">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="opacity-60">Loading characters…</div>
          ) : characters.length === 0 ? (
            <div className="rounded border border-dashed border-stone-light p-8 text-center opacity-70">
              <div className="text-lg font-cinzel text-wotr-gold/70 mb-2">No characters yet</div>
              <div>
                Click <span className="text-wotr-gold">+ New Character</span> to create one.
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {characters.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/wrath/tracker/${c.id}`}
                    className="block p-4 rounded border border-stone-light bg-stone-light/40 hover:bg-stone-light/70 hover:border-wotr-gold/60 transition"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-cinzel text-lg text-parchment">{c.name}</div>
                      <div className="text-sm tabular-nums">
                        HP <span className="text-wotr-gold">{c.current_hp}</span>
                        <span className="opacity-60"> / {c.max_hp}</span>
                      </div>
                    </div>
                    {c.class_summary && <div className="text-xs opacity-70 mt-1">{c.class_summary}</div>}
                    <div className="flex gap-2 mt-2 text-[10px] uppercase tracking-wider opacity-60">
                      {c.level && <span>Level {c.level}</span>}
                      {c.ac != null && <span>· AC {c.ac}</span>}
                      {c.fortification_percent > 0 && <span>· Fort {c.fortification_percent}%</span>}
                      {c.temp_hp > 0 && <span>· Temp {c.temp_hp}</span>}
                      {c.nonlethal > 0 && <span>· Nonlethal {c.nonlethal}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {creating && (
        <NewCharacterModal
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false)
            await load()
          }}
        />
      )}
      </div>
    </main>
  )
}
