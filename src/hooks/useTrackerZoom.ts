'use client'

import { useEffect, useState } from 'react'

export const ZOOM_LEVELS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.35]
export const ZOOM_DEFAULT_INDEX = 3
const LS_KEY = 'tracker-zoom-index'

export function useTrackerZoom() {
  const [index, setIndex] = useState(ZOOM_DEFAULT_INDEX)

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved !== null) {
      const idx = parseInt(saved, 10)
      if (idx >= 0 && idx < ZOOM_LEVELS.length) setIndex(idx)
    }
  }, [])

  function change(delta: number) {
    setIndex((prev) => {
      const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, prev + delta))
      localStorage.setItem(LS_KEY, String(next))
      return next
    })
  }

  function reset() {
    setIndex(ZOOM_DEFAULT_INDEX)
    localStorage.setItem(LS_KEY, String(ZOOM_DEFAULT_INDEX))
  }

  return {
    zoom: ZOOM_LEVELS[index],
    index,
    isDefault: index === ZOOM_DEFAULT_INDEX,
    isMin: index === 0,
    isMax: index === ZOOM_LEVELS.length - 1,
    change,
    reset,
  }
}
