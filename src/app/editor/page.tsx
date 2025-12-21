// src/app/editor/page.tsx 
'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'


type JSONNode = {
  type?: string
  content?: JSONNode[]
  text?: string
}

function getExcerptFromContent(json: unknown, limit = 220): string {
  if (!json || typeof json !== 'object') return ''
  const content = (json as { content?: JSONNode[] }).content
  if (!Array.isArray(content)) return ''
  for (const node of content) {
    if (node?.type === 'paragraph' && Array.isArray(node.content)) {
      const text = node.content
        .filter(child => child?.type === 'text' && typeof child.text === 'string')
        .map(child => child.text as string)
        .join('')
        .trim()
      if (text) {
        return text.slice(0, limit)
      }
    }
  }
  return ''
}

// Reign of Winter adventure books
const adventureBooks = [
  { slug: 'the-snows-of-summer', title: 'The Snows of Summer', bookNumber: 1 },
  { slug: 'the-shackled-hut', title: 'The Shackled Hut', bookNumber: 2 },
  { slug: 'maiden-mother-crone', title: 'Maiden, Mother, Crone', bookNumber: 3 },
  { slug: 'the-frozen-stars', title: 'The Frozen Stars', bookNumber: 4 },
  { slug: 'rasputin-must-die', title: 'Rasputin Must Die!', bookNumber: 5 },
  { slug: 'the-witch-queen-revenge', title: 'The Witch Queen\'s Revenge', bookNumber: 6 }
]

function EditorContent_Inner() {
  const { data: session, status } = useSession()
  // @ts-expect-error - Custom NextAuth user.id property
  const userId = session?.user?.id || null
  const isLoaded = status !== 'loading'
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('id')
  const isEditing = Boolean(entryId)

  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [book, setBook] = useState(adventureBooks[0].slug) // Default to first book
  const [sessionDate, setSessionDate] = useState('') // No default date
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography.configure({
        openDoubleQuote: '"',
        closeDoubleQuote: '"',
        openSingleQuote: "'",
        closeSingleQuote: "'",
      }),
      Placeholder.configure({
        placeholder: 'Write the tale of tonight…',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[300px] p-4 bg-slate-900/40 rounded-2xl border border-slate-700 focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      try {
        const json = editor.getJSON()
        setExcerpt(getExcerptFromContent(json))
      } catch {
        setExcerpt('')
      }
    }

    handleUpdate()
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (!isEditing || !entryId || !editor) return
    let cancelled = false
    setLoading(true)
    setError(null)

    // Parse the entryId format: "book-YYYY-MM-DD-slug"
    // Use regex to match the date pattern (YYYY-MM-DD) to properly split
    const datePattern = /(\d{4}-\d{2}-\d{2})/
    const match = entryId.match(datePattern)
    
    if (!match) {
      setError('Invalid entry ID format - no date found')
      setLoading(false)
      return
    }
    
    const dateIndex = entryId.indexOf(match[1])
    const book = entryId.substring(0, dateIndex - 1) // Everything before the date (minus the hyphen)
    const date = match[1] // The matched date
    const slug = entryId.substring(dateIndex + date.length + 1) // Everything after the date (minus the hyphen)

    fetch(`/api/stories/${book}/${date}/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Story not found' : 'Failed to load story')
        }
        return res.json()
      })
      .then((story) => {
        if (cancelled) return
        
        console.log('Loaded story:', story)
        console.log('Story blocks:', story.story)
        
        // Validate that we have story content
        if (!story.story || !Array.isArray(story.story) || story.story.length === 0) {
          console.warn('Story has no content blocks')
          setError('Story loaded but has no content')
        }
        
        // Convert story back to editor format
        // Try to get title from first heading block, fallback to slug-derived title
        const headingBlock = story.story.find((block: unknown) => {
          return typeof block === 'object' && block !== null && 'type' in block && 
                 (block as { type: string }).type === 'heading'
        }) as { content?: string } | undefined
        
        const title = headingBlock?.content || 
                     story.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        setTitle(title)
        setImage(story.coverUrl ?? '')
        
        // Convert story blocks back to TipTap content
        const contentBlocks = story.story
          .map((block: unknown) => {
            if (typeof block === 'object' && block !== null && 'type' in block) {
              const typedBlock = block as { type: string; content?: string; level?: number }
              
              if (typedBlock.type === 'paragraph') {
                // TipTap doesn't allow empty text nodes, so only create text node if content is non-empty
                return {
                  type: 'paragraph',
                  content: typedBlock.content && typedBlock.content.trim() !== '' 
                    ? [{ type: 'text', text: typedBlock.content }] 
                    : []
                }
              } else if (typedBlock.type === 'heading') {
                // Same for headings - no empty text nodes
                return {
                  type: 'heading',
                  attrs: { level: typedBlock.level || 1 },
                  content: typedBlock.content && typedBlock.content.trim() !== '' 
                    ? [{ type: 'text', text: typedBlock.content }] 
                    : []
                }
              }
            }
            console.warn('Unsupported block type:', block)
            return null
          })
          .filter((block): block is { type: string; content?: unknown[]; attrs?: { level?: number } } => block !== null) // Remove any null entries
        
        const tiptapContent = {
          type: 'doc',
          content: contentBlocks.length > 0 ? contentBlocks : [
            { type: 'paragraph', content: [] } // Ensure at least one empty paragraph
          ]
        }
        
        console.log('Converted to TipTap format:', tiptapContent)
        
        setBook(story.book)
        setSessionDate(story.date)
        
        // Set editor content and log the result
        const result = editor.commands.setContent(tiptapContent)
        console.log('Editor setContent result:', result)
        console.log('Editor JSON after set:', editor.getJSON())
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load story')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [editor, entryId, isEditing])

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-300">Loading...</div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!userId) {
    return null
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Create FormData for upload (Sharp compression happens server-side)
      const formData = new FormData()
      formData.append('image', file)

      // Upload to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      setImage(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
      // Reset the input
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!editor || !sessionDate) {
      setError('Please select a session date')
      return
    }
    setSaving(true)
    setError(null)
    const content = editor?.getJSON()
    // Convert TipTap content to story blocks
    let storyBlocks = content?.content?.map((node: unknown) => {
      if (typeof node === 'object' && node !== null && 'type' in node) {
        const typedNode = node as { 
          type: string; 
          content?: Array<{ text?: string; type?: string }>; 
          attrs?: { level?: number } 
        }
        
        if (typedNode.type === 'paragraph') {
          const text = typedNode.content?.map((child) => child.text || '').join('') || ''
          return { type: 'paragraph' as const, content: text }
        } else if (typedNode.type === 'heading') {
          const text = typedNode.content?.map((child) => child.text || '').join('') || ''
          const level = typedNode.attrs?.level || 1
          return { type: 'heading' as const, level, content: text }
        }
      }
      return { type: 'paragraph' as const, content: '' } // Default fallback
    }) || []

    // Ensure the title is saved as the first heading block
    // Remove any existing heading with the same content as the title
    const titleContent = title.trim()
    if (titleContent) {
      // Remove any existing heading that matches the title
      storyBlocks = storyBlocks.filter(block => 
        !(block.type === 'heading' && block.content === titleContent)
      )
      
      // Add the title as the first heading block
      storyBlocks.unshift({
        type: 'heading' as const,
        level: 1,
        content: titleContent
      })
    }

    // When editing, preserve the original slug, date, and book from entryId
    // When creating new, generate slug from title
    let finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
    let finalDate = sessionDate
    let finalBook = book
    
    if (isEditing && entryId) {
      // Parse the entryId format: "book-YYYY-MM-DD-slug"
      const datePattern = /(\d{4}-\d{2}-\d{2})/
      const match = entryId.match(datePattern)
      
      if (match) {
        const dateIndex = entryId.indexOf(match[1])
        finalBook = entryId.substring(0, dateIndex - 1) // Everything before the date (minus the hyphen)
        finalDate = match[1] // The matched date
        finalSlug = entryId.substring(dateIndex + finalDate.length + 1) // Everything after the date (minus the hyphen)
      }
    }
    
    const payload = {
      date: finalDate,
      book: finalBook,
      slug: finalSlug,
      story: storyBlocks,
      coverUrl: image.trim() ? image.trim() : undefined,
    }

    const endpoint = '/api/stories'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error('Save failed')
      }
      await res.json() // Parse response but don't need to use it
      // Navigate to the book's adventure log
      router.push(`/adventure-log/${book}?t=${Date.now()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const selectedBook = adventureBooks.find(b => b.slug === book)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-100 font-['Alkatra'] mb-2">
            {isEditing ? 'Edit Chronicle Entry' : 'Chronicle a New Adventure'}
          </h1>
          <p className="text-slate-400">
            Record the tales of your journey through the endless winter
          </p>
        </div>

        {isEditing && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">
              Updating existing entry <span className="font-mono text-slate-300">{entryId}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Book Selection and Date */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">
              Adventure Book
            </label>
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {adventureBooks.map((book) => (
                <option key={book.slug} value={book.slug}>
                  Book {book.bookNumber}: {book.title}
                </option>
              ))}
            </select>
            {selectedBook && (
              <p className="text-xs text-slate-400 mt-1">
                Currently chronicling: Book {selectedBook.bookNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              When did this adventure take place?
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">
            Entry Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Frozen Wastes of Irrisen..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none text-lg"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">
            Chronicle Image <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60 transition ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              {image && (
                <button
                  onClick={() => setImage('')}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            {image && (
              <div className="relative">
                <Image
                  src={image}
                  alt="Chronicle preview"
                  width={320}
                  height={128}
                  className="max-w-sm h-32 object-cover rounded-lg border border-slate-600"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Image ready for chronicle
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">
            Chronicle Content
          </label>
          {editor && <EditorContent editor={editor} />}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/40 rounded-xl p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">
                Excerpt preview:
              </p>
              <p className="text-xs text-slate-500 italic">
                {excerpt ? `"${excerpt}…"` : 'Write content to see preview...'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-xs text-slate-500">Loading entry…</span>
              )}
              <button
                onClick={handleSave}
                disabled={!editor || saving || loading || !sessionDate}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-white font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 shadow-lg"
              >
                {saving ? 'Saving Chronicle…' : isEditing ? 'Update Entry' : 'Save Chronicle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function EditorLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading editor...</p>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoadingFallback />}>
      <EditorContent_Inner />
    </Suspense>
  )
}