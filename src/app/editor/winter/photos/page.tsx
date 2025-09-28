'use client'

import { useState } from 'react'
import { WinterPhotoLibrary } from '@/components/winter/editor/WinterPhotoLibrary'

export default function WinterPhotoManagerPage() {
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-cyan-100">Winter photo library</h1>
        <p className="text-sm text-slate-400">
          Upload new photos, update captions, or copy tokens for use in your adventure entries.
        </p>
        {message && <p className="mt-2 text-sm text-emerald-400">{message}</p>}
      </header>

      <WinterPhotoLibrary
        onSelect={async (photo) => {
          try {
            await navigator.clipboard.writeText(`{{photo:${photo.id}}}`)
            setMessage(`Copied token {{photo:${photo.id}}} to clipboard.`)
          } catch {
            setMessage(`Token {{photo:${photo.id}}} selected. Copy it into the story where needed.`)
          }
        }}
      />
    </div>
  )
}
