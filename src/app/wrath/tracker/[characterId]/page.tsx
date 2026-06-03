// Single-character view: HP panel + ability grid + edit modal.
// All data lives in CharacterDetail; refetched after every mutation.

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { CharacterDetail } from '@/lib/tracker/types'
import { HpPanel } from '@/components/tracker/HpPanel'
import { AbilityGrid } from '@/components/tracker/AbilityGrid'

const ZOOM_LEVELS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.35]
const ZOOM_DEFAULT_INDEX = 3
const ZOOM_LS_KEY = 'tracker-zoom-index'

export default function CharacterPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const [detail, setDetail] = useState<CharacterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoomIndex, setZoomIndex] = useState(ZOOM_DEFAULT_INDEX)

  useEffect(() => {
    const saved = localStorage.getItem(ZOOM_LS_KEY)
    if (saved !== null) {
      const idx = parseInt(saved, 10)
      if (idx >= 0 && idx < ZOOM_LEVELS.length) setZoomIndex(idx)
    }
  }, [])

  function changeZoom(delta: number) {
    setZoomIndex((prev) => {
      const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, prev + delta))
      localStorage.setItem(ZOOM_LS_KEY, String(next))
      return next
    })
  }

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
        <div className="flex items-center gap-1" title="Adjust text size">
          <button
            onClick={() => changeZoom(-1)}
            disabled={zoomIndex === 0}
            className="w-7 h-7 flex items-center justify-center rounded border border-stone-light text-parchment/60 hover:text-parchment hover:border-wotr-gold/50 disabled:opacity-25 disabled:cursor-not-allowed text-sm font-cinzel leading-none"
            aria-label="Decrease text size"
          >
            A−
          </button>
          <button
            onClick={() => changeZoom(1)}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-stone-light text-parchment/60 hover:text-parchment hover:border-wotr-gold/50 disabled:opacity-25 disabled:cursor-not-allowed text-base font-cinzel leading-none"
            aria-label="Increase text size"
          >
            A+
          </button>
        </div>
      </div>
      <div style={{ zoom: ZOOM_LEVELS[zoomIndex] }}>
        <HpPanel character={detail} onChanged={load} />
        <AbilityGrid character={detail} onChanged={load} />
      </div>
    </main>
  )
}
