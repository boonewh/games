'use client'

import { useMemo } from 'react'
import { renderWinterEntry } from '@/lib/winter/render'
import { WinterAdventureEntry, WinterPhoto } from '@/lib/winter/types'

interface Props {
  entry: WinterAdventureEntry
  photos: WinterPhoto[]
}

export function WinterAdventureRenderer({ entry, photos }: Props) {
  const html = useMemo(() => renderWinterEntry(entry, photos), [entry, photos])

  return (
    <article className="prose prose-invert max-w-none">
      <div
        className="winter-entry-content space-y-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}
