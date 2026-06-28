'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Party } from '@/lib/tracker/types'

export function PartiesSection() {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/tracker/parties')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setParties(json.parties ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return null

  const gmParties = parties.filter((p) => p.gm_user_id === userId)
  const memberParties = parties.filter((p) => p.gm_user_id !== userId)

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-cinzel text-sm uppercase tracking-wider opacity-70">Parties</h2>
        <div className="flex gap-3 text-xs">
          <button onClick={() => setCreating(true)} className="text-wotr-gold hover:underline">
            + Create party
          </button>
          <button onClick={() => setJoining(true)} className="text-wotr-gold hover:underline">
            Join by code
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-sm">
          {error}
        </div>
      )}

      {parties.length === 0 ? (
        <div className="text-sm opacity-60 italic">
          No parties yet. Create one to GM, or join a friend&apos;s with their invite code.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {gmParties.map((p) => (
            <PartyCard key={p.id} party={p} isGm />
          ))}
          {memberParties.map((p) => (
            <PartyCard key={p.id} party={p} isGm={false} />
          ))}
        </div>
      )}

      {creating && (
        <CreatePartyModal onClose={() => setCreating(false)} onCreated={load} />
      )}
      {joining && (
        <JoinPartyModal onClose={() => setJoining(false)} onJoined={load} />
      )}
    </section>
  )
}

function PartyCard({ party, isGm }: { party: Party; isGm: boolean }) {
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="p-3 rounded border border-stone-light bg-stone-light/40 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-cinzel text-base text-parchment truncate">{party.name}</div>
        <div className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">
          {isGm ? 'You are GM' : 'Member'}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isGm && (
          <>
            <Link
              href={`/wrath/tracker/gm?party=${party.id}`}
              className="text-xs px-2 py-1 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold"
            >
              GM →
            </Link>
            {party.invite_code && (
              <button
                onClick={() => setShowCode((s) => !s)}
                className="text-xs px-2 py-1 rounded border border-stone-light hover:bg-stone-light/60"
                title="Show invite code"
              >
                {showCode ? party.invite_code : 'Code'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CreatePartyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Party | null>(null)

  async function submit() {
    if (!name.trim()) return setError('Name is required.')
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/tracker/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setResult(json.party as Party)
      await onCreated()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {result ? (
          <>
            <h2 className="font-cinzel text-xl text-wotr-gold mb-2">Party created</h2>
            <div className="text-sm opacity-80 mb-3">
              Share this invite code with your players. They&apos;ll use it on the Join by code button.
            </div>
            <div className="p-4 rounded bg-stone-light/60 border border-wotr-gold/40 text-center mb-4">
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Invite code</div>
              <div className="font-cinzel text-2xl text-wotr-gold tracking-widest tabular-nums">
                {result.invite_code}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="font-cinzel text-xl text-wotr-gold mb-4">Create party</h2>
            <label className="block mb-3">
              <span className="block text-sm opacity-80 mb-1">Party name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="The Fifth Crusade"
                className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              />
            </label>
            {error && <div className="text-abyssal-red text-sm mb-3">{error}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function JoinPartyModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!code.trim()) return setError('Code is required.')
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/tracker/parties/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      await onJoined()
      // Redirect to the assign-characters page for the joined party
      window.location.href = `/wrath/tracker/join/${code.trim()}`
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-stone-dark border border-wotr-gold/30 rounded-lg shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-cinzel text-xl text-wotr-gold mb-4">Join party</h2>
        <label className="block mb-3">
          <span className="block text-sm opacity-80 mb-1">Invite code</span>
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="abc12345"
            className="w-full p-2 rounded bg-stone-dark border border-stone-light text-parchment font-cinzel tracking-widest"
          />
        </label>
        {error && <div className="text-abyssal-red text-sm mb-3">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-stone-light hover:bg-stone-light/40"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-wotr-gold/90 hover:bg-wotr-gold text-stone-dark font-semibold disabled:opacity-50"
          >
            {submitting ? 'Joining…' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}
