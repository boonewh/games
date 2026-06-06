// Single-character view: HP panel + ability grid + edit modal.
// All data lives in CharacterDetail; refetched after every mutation.

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { CharacterDetail } from '@/lib/tracker/types'
import { HpPanel } from '@/components/tracker/HpPanel'
import { AbilityGrid } from '@/components/tracker/AbilityGrid'
import { ZoomControls } from '@/components/tracker/ZoomControls'
import { useTrackerZoom } from '@/hooks/useTrackerZoom'

export default function CharacterPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const [detail, setDetail] = useState<CharacterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const zoom = useTrackerZoom()

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/tracker/characters/${characterId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setDetail(json.character)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [characterId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <div className="opacity-60">Loading character…</div>
      </main>
    )
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-stone-dark text-parchment font-spectral p-8">
        <Link href="/wrath/tracker" className="text-sm text-wotr-gold underline">
          ← Back to roster
        </Link>
        <div className="mt-4 p-3 rounded border border-abyssal-red/60 bg-abyssal-red/20">
          {error ?? 'Character not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-dark text-parchment font-spectral">
      <div className="px-4 pt-4 flex items-center justify-between">
        <Link href="/wrath/tracker" className="text-sm text-wotr-gold/80 hover:text-wotr-gold underline">
          ← Roster
        </Link>
        <ZoomControls
          isMin={zoom.isMin}
          isMax={zoom.isMax}
          isDefault={zoom.isDefault}
          onChange={zoom.change}
          onReset={zoom.reset}
        />
      </div>
      <div style={{ zoom: zoom.zoom }}>
        <HpPanel character={detail} onChanged={load} />
        <AbilityGrid character={detail} onChanged={load} />
      </div>
    </main>
  )
}
