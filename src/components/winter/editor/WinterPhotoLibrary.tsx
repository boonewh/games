'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { WinterPhoto } from '@/lib/winter/types'

interface Props {
  onSelect: (photo: WinterPhoto) => void
}

async function fetchPhotos(): Promise<WinterPhoto[]> {
  const response = await fetch('/api/winter/photos', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load photos')
  }

  const data = await response.json()
  return data.photos as WinterPhoto[]
}

export function WinterPhotoLibrary({ onSelect }: Props) {
  const [photos, setPhotos] = useState<WinterPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [credit, setCredit] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const items = await fetchPhotos()
        setPhotos(items)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load photos'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const sortedPhotos = useMemo(
    () =>
      [...photos].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [photos],
  )

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError('Select a file to upload')
      return
    }

    try {
      setError(null)
      const formData = new FormData()
      formData.set('file', file)
      formData.set('alt', alt)
      formData.set('caption', caption)
      formData.set('credit', credit)

      const response = await fetch('/api/winter/photos', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload photo')
      }

      const payload = await response.json()
      setPhotos((current) => [payload.photo as WinterPhoto, ...current])
      setFile(null)
      setAlt('')
      setCaption('')
      setCredit('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload photo'
      setError(message)
    }
  }

  async function handleMetadataSave(photo: WinterPhoto, updates: Partial<WinterPhoto>) {
    try {
      setBusyId(photo.id)
      const response = await fetch(`/api/winter/photos/${photo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update photo metadata')
      }

      const payload = await response.json()
      setPhotos((items) => items.map((item) => (item.id === photo.id ? (payload.photo as WinterPhoto) : item)))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update photo'
      setError(message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <h3 className="text-lg font-semibold text-slate-200">Add a new photo</h3>
        <form onSubmit={handleUpload} className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col text-sm text-slate-300">
            Image file
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-1 rounded border border-slate-700 bg-slate-800/80 p-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col text-sm text-slate-300">
            Alt text
            <input
              type="text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              className="mt-1 rounded border border-slate-700 bg-slate-800/80 p-2 text-sm"
              placeholder="Describe the image"
              required
            />
          </label>
          <label className="flex flex-col text-sm text-slate-300">
            Caption
            <input
              type="text"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-1 rounded border border-slate-700 bg-slate-800/80 p-2 text-sm"
              placeholder="Optional caption"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-300">
            Credit
            <input
              type="text"
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
              className="mt-1 rounded border border-slate-700 bg-slate-800/80 p-2 text-sm"
              placeholder="Optional credit"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Upload photo
            </button>
          </div>
        </form>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading photo library…</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedPhotos.map((photo) => (
            <li key={photo.id} className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <div className="relative h-40 w-full overflow-hidden rounded">
                <Image
                  src={photo.relativePath}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 320px, (min-width: 768px) 280px, 100vw"
                />
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">{photo.alt}</p>
                {photo.caption && <p className="text-slate-400">{photo.caption}</p>}
                {photo.credit && <p className="text-xs text-slate-500">{photo.credit}</p>}
                <p className="text-xs text-slate-500">Token: {`{{photo:${photo.id}}}`}</p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onSelect(photo)}
                  className="w-full rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  Insert into entry
                </button>
                <details className="rounded border border-slate-700 bg-slate-800/60">
                  <summary className="cursor-pointer px-3 py-1 text-sm text-slate-200">Edit metadata</summary>
                  <MetadataEditor
                    photo={photo}
                    busy={busyId === photo.id}
                    onSave={handleMetadataSave}
                  />
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface MetadataEditorProps {
  photo: WinterPhoto
  busy: boolean
  onSave: (photo: WinterPhoto, updates: Partial<WinterPhoto>) => void
}

function MetadataEditor({ photo, busy, onSave }: MetadataEditorProps) {
  const [alt, setAlt] = useState(photo.alt)
  const [caption, setCaption] = useState(photo.caption ?? '')
  const [credit, setCredit] = useState(photo.credit ?? '')

  useEffect(() => {
    setAlt(photo.alt)
    setCaption(photo.caption ?? '')
    setCredit(photo.credit ?? '')
  }, [photo])

  return (
    <form
      className="space-y-2 px-3 py-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(photo, { alt, caption, credit })
      }}
    >
      <label className="flex flex-col text-xs text-slate-400">
        Alt text
        <input
          type="text"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-1 text-sm"
          required
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Caption
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-1 text-sm"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Credit
        <input
          type="text"
          value={credit}
          onChange={(event) => setCredit(event.target.value)}
          className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-1 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
      >
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
