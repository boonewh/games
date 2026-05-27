// GM dashboard — every character in your party at a glance.
//
// - Lists parties where you're the GM. Picks the first by default.
// - For the selected party, shows every assigned character with HP, AC,
//   defenses, and active conditions.
// - Polls every 5 seconds while the page is visible (cheap; ~120 reqs/hr).
//   Pauses polling when the tab is hidden.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Character, Condition, Party, ResourcePool } from '@/lib/tracker/types'

interface DashboardCharacter extends Character {
  conditions: Condition[]
  pools: ResourcePool[]
  drs_label: string | null
  fortification_label: string | null
}

interface DashboardPayload {
  party: Party
  characters: DashboardCharacter[]
}

const POLL_MS = 5000

export default function GmDashboardPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null)
  const [partiesLoading, setPartiesLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load parties on mount, filter to GM-owned (we need user_id for that)
  const loadParties = useCallback(async () => {
    setError(null)
    try {
      // The /api/auth/session endpoint gives us the current user_id without an extra import
      const [partiesRes, sessionRes] = await Promise.all([
        fetch('/api/tracker/parties'),
        fetch('/api/auth/session')
      ])
      const partiesJson = await partiesRes.json()
      const sessionJson = await sessionRes.json()
      if (!partiesRes.ok) throw new Error(partiesJson.error ?? `HTTP ${partiesRes.status}`)

      const myUserId = sessionJson?.user?.id
      const gmParties = ((partiesJson.parties ?? []) as Party[]).filter((p) => p.gm_user_id === myUserId)
      setParties(gmParties)
      setSelectedPartyId((prev) => prev ?? gmParties[0]?.id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setPartiesLoading(false)
    }
  }, [])

  const loadDashboard = useCallback(async (partyId: string, isInitial = false) => {
    if (isInitial) setDashboardLoading(true)
    try {
      const res = await fetch(`/api/tracker/parties/${partyId}/dashboard`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setDashboard(json as DashboardPayload)
      setLastRefresh(new Date())
      setError(null)
    } catch (e) {
      // On poll errors, keep showing stale data but surface the error
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (isInitial) setDashboardLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParties()
  }, [loadParties])

  // Set up polling whenever the selected party changes
  useEffect(() => {
    if (!selectedPartyId) return

    loadDashboard(selectedPartyId, true)

    function tick() {
      if (document.hidden) return // pause when tab not visible
      if (selectedPartyId) loadDashboard(selectedPartyId)
    }

    pollTimer.current = setInterval(tick, POLL_MS)
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [selectedPartyId, loadDashboard])

  if (partiesLoading) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <div className="opacity-60">Loading dashboard…</div>
      </main>
    )
  }

  if (parties.length === 0) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <Link href="/wrath/tracker" className="text-wotr-gold underline">
          ← Roster
        </Link>
        <div className="mt-6 max-w-md">
          <h1 className="font-cinzel text-2xl text-wotr-gold mb-2">No parties to GM</h1>
          <p className="opacity-80">
            You aren&apos;t the GM of any parties yet. Head back to the roster and create one — you&apos;ll get an
            invite code to share with your players.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-dark text-parchment font-spectral">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <Link href="/wrath/tracker" className="text-sm text-wotr-gold/80 hover:text-wotr-gold underline">
              ← Roster
            </Link>
            <h1 className="font-cinzel text-3xl text-wotr-gold mt-2">GM Dashboard</h1>
          </div>
          <div className="text-right">
            {parties.length > 1 ? (
              <select
                value={selectedPartyId ?? ''}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="p-2 rounded bg-stone-dark border border-stone-light text-parchment"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-cinzel text-lg text-parchment">{dashboard?.party.name}</div>
            )}
            {lastRefresh && (
              <div className="text-[10px] uppercase tracking-wider opacity-50 mt-1">
                refreshed {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20 text-sm">
            {error}
          </div>
        )}

        {dashboardLoading ? (
          <div className="opacity-60">Loading characters…</div>
        ) : !dashboard || dashboard.characters.length === 0 ? (
          <div className="rounded border border-dashed border-stone-light p-8 text-center opacity-70">
            <div className="font-cinzel text-wotr-gold/70 mb-1">No characters in this party yet</div>
            <div className="text-sm">
              Players join via the invite code, then assign characters to the party from their roster.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {dashboard.characters.map((c) => (
              <PartyMemberCard key={c.id} character={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function PartyMemberCard({ character }: { character: DashboardCharacter }) {
  const ratio = character.max_hp > 0 ? character.current_hp / character.max_hp : 0
  const hpColor =
    ratio > 0.66
      ? 'text-emerald-400'
      : ratio > 0.33
        ? 'text-amber-300'
        : ratio > 0
          ? 'text-abyssal-red'
          : 'text-abyssal-red'
  const ratioPct = Math.max(0, Math.min(100, Math.round(ratio * 100)))

  return (
    <article className="rounded border border-stone-light bg-stone-light/40 p-4">
      <header className="flex items-baseline justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-cinzel text-lg text-parchment truncate">{character.name}</h3>
          {character.class_summary && (
            <div className="text-xs opacity-70 truncate">{character.class_summary}</div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <div className={`text-2xl font-bold tabular-nums ${hpColor}`}>
            {character.current_hp}
            <span className="opacity-50 text-base"> / {character.max_hp}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-50">HP</div>
        </div>
      </header>

      {/* HP bar */}
      <div className="w-full h-1.5 rounded bg-stone-dark mb-3 overflow-hidden">
        <div
          className={`h-full transition-all ${
            ratio > 0.66 ? 'bg-emerald-500' : ratio > 0.33 ? 'bg-amber-500' : 'bg-abyssal-red'
          }`}
          style={{ width: `${ratioPct}%` }}
        />
      </div>

      {/* AC row */}
      {(character.ac != null || character.ac_touch != null || character.ac_flat_footed != null) && (
        <div className="flex items-baseline gap-4 mb-3 px-2 py-1 rounded bg-stone-dark/40 border border-wotr-gold/20">
          <Stat label="AC" value={character.ac} highlight />
          <Stat label="Touch" value={character.ac_touch} />
          <Stat label="FF" value={character.ac_flat_footed} />
          {character.fortification_label && (
            <div className="ml-auto text-xs text-wardstone-blue">{character.fortification_label}</div>
          )}
        </div>
      )}

      {character.drs_label && (
        <div className="text-xs opacity-80 mb-2">{character.drs_label}</div>
      )}

      {character.pools.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 text-xs">
          {character.pools.map((p) => (
            <span
              key={p.id}
              className="px-1.5 py-0.5 rounded bg-stone-light/60 border border-stone-light"
              title={p.notes ?? undefined}
            >
              {p.name}{' '}
              <span className="tabular-nums text-wotr-gold font-semibold">
                {p.points_remaining}
              </span>
              <span className="opacity-60">/{p.points_max}</span>
            </span>
          ))}
        </div>
      )}

      {character.temp_hp > 0 || character.nonlethal > 0 ? (
        <div className="flex gap-2 mb-2 text-xs">
          {character.temp_hp > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-wardstone-blue/20 border border-wardstone-blue/50">
              Temp {character.temp_hp}
            </span>
          )}
          {character.nonlethal > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-700/50">
              Nonlethal {character.nonlethal}
            </span>
          )}
        </div>
      ) : null}

      {character.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {character.conditions.map((cond) => (
            <span
              key={cond.id}
              className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-abyssal-red/30 border border-abyssal-red/50 text-parchment"
              title={cond.notes ?? undefined}
            >
              {cond.type}
              {cond.duration_rounds != null && ` (${cond.duration_rounds}r)`}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider opacity-60 font-cinzel">{label}</span>
      <span className={`tabular-nums ${highlight ? 'text-wotr-gold font-bold text-lg' : 'text-parchment'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}
