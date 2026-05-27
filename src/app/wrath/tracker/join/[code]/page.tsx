// Join-by-link landing page.
//
// Flow:
//   1. Hit POST /api/tracker/parties/join with the code — adds caller as party_member.
//   2. Show party name + the user's existing characters with checkboxes.
//   3. On submit, PATCH each selected character's party_id.
//   4. Redirect to the roster.

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { Character, Party } from '@/lib/tracker/types'

export default function JoinPartyPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [party, setParty] = useState<Party | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const join = useCallback(async () => {
    setError(null)
    try {
      // 1. Hit the join endpoint (idempotent — re-joining is a no-op upsert)
      const joinRes = await fetch('/api/tracker/parties/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const joinJson = await joinRes.json()
      if (!joinRes.ok) throw new Error(joinJson.error ?? `HTTP ${joinRes.status}`)
      setParty(joinJson.party as Party)

      // 2. Load the user's characters so they can pick which to add
      const charsRes = await fetch('/api/tracker/characters')
      const charsJson = await charsRes.json()
      if (!charsRes.ok) throw new Error(charsJson.error ?? `HTTP ${charsRes.status}`)
      const chars = (charsJson.characters ?? []) as Character[]
      setCharacters(chars)

      // 3. Pre-select characters already assigned to this party (idempotent UI)
      const partyId = (joinJson.party as Party).id
      setSelected(new Set(chars.filter((c) => c.party_id === partyId).map((c) => c.id)))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    join()
  }, [join])

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function assign() {
    if (!party) return
    setSubmitting(true)
    setError(null)
    try {
      // PATCH each character — assign selected to this party, unassign deselected
      const ops: Promise<Response>[] = []
      for (const c of characters) {
        const shouldBeInParty = selected.has(c.id)
        const isInThisParty = c.party_id === party.id
        if (shouldBeInParty && !isInThisParty) {
          ops.push(
            fetch(`/api/tracker/characters/${c.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ party_id: party.id })
            })
          )
        } else if (!shouldBeInParty && isInThisParty) {
          ops.push(
            fetch(`/api/tracker/characters/${c.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ party_id: null })
            })
          )
        }
      }
      const results = await Promise.all(ops)
      const failed = results.find((r) => !r.ok)
      if (failed) {
        const j = await failed.json().catch(() => ({}))
        throw new Error(j.error ?? `Assignment failed (HTTP ${failed.status})`)
      }
      router.push('/wrath/tracker')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <div className="opacity-60">Joining party…</div>
      </main>
    )
  }

  if (error && !party) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <Link href="/wrath/tracker" className="text-wotr-gold underline">
          ← Roster
        </Link>
        <div className="mt-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20">{error}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-dark text-parchment font-spectral">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/wrath/tracker" className="text-sm text-wotr-gold/80 hover:text-wotr-gold underline">
          ← Roster
        </Link>

        <h1 className="font-cinzel text-3xl text-wotr-gold mt-4">Joined {party?.name}</h1>
        <p className="text-sm opacity-80 mt-1">
          Pick which of your characters belong to this party. The GM&apos;s dashboard will show them.
        </p>

        {characters.length === 0 ? (
          <div className="mt-6 rounded border border-dashed border-stone-light p-6 text-center opacity-70">
            <div className="mb-3">You don&apos;t have any characters yet.</div>
            <Link
              href="/wrath/tracker"
              className="inline-block px-4 py-2 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold"
            >
              Create a character
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-2">
              {characters.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-3 p-3 rounded border border-stone-light bg-stone-light/40 hover:bg-stone-light/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="w-4 h-4 accent-wotr-gold"
                    />
                    <div className="flex-1">
                      <div className="font-cinzel text-lg text-parchment">{c.name}</div>
                      {c.class_summary && <div className="text-xs opacity-70">{c.class_summary}</div>}
                    </div>
                    <div className="text-sm tabular-nums opacity-80">
                      HP {c.current_hp} / {c.max_hp}
                      {c.ac != null && <span className="ml-3">AC {c.ac}</span>}
                    </div>
                  </label>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mt-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20">{error}</div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Link
                href="/wrath/tracker"
                className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40"
              >
                Skip
              </Link>
              <button
                onClick={assign}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Add to party'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
