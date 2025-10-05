// app/(winter)/adventure-log/[book]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, BookOpen, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react'
import { StoryEntry, StoryBlock } from '@/types/story';

export const dynamic = 'force-dynamic' // reflect new files during dev

// Helper function to get a readable title from a story (same as main page)
function getStoryTitle(story: StoryEntry): string {
  // Try to find a heading block first
  const heading = story.story.find(block => block.type === 'heading')
  if (heading && 'content' in heading && typeof heading.content === 'string') {
    return heading.content
  }
  
  // Fall back to formatted slug
  return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Types for TipTap content
interface TiptapNode {
  type?: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: { level?: number; language?: string };
}

interface AdventureEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  excerpt: string;
  content: TiptapNode;
  image?: string;
  book: string;
  sessionDate: string;
}

interface AdventureBook {
  slug: string;
  title: string;
  description: string;
  bookNumber: number;
  status: 'completed' | 'current' | 'not-started';
  theme: string;
}

// Adventure book definitions
const adventureBooks: AdventureBook[] = [
  {
    slug: 'the-snows-of-summer',
    title: 'The Snows of Summer',
    description: 'Our heroes begin their journey in the border town of Heldren, where an unseasonable blizzard threatens the harvest. They must venture into the mysterious Pale Tower and confront the ice witch Radosek Pavril to save the town and uncover the first clues about Baba Yaga\'s disappearance.',
    bookNumber: 1,
    status: 'completed',
    theme: 'from-blue-900 to-cyan-800'
  },
  {
    slug: 'the-shackled-hut',
    title: 'The Shackled Hut',
    description: 'The party discovers Baba Yaga\'s legendary dancing hut, but it has been magically bound and stripped of its power. To free the hut and continue their quest, they must venture into the frozen realm of Irrisen and navigate the deadly politics of the Winter Witches.',
    bookNumber: 2,
    status: 'completed',
    theme: 'from-cyan-900 to-blue-800'
  },
  {
    slug: 'maiden-mother-crone',
    title: 'Maiden, Mother, Crone',
    description: 'The heroes journey to the capital of Irrisen, Whitethrone, where they must infiltrate the Winter Palace and confront Queen Elvanna. They discover the true scope of her plans to bring eternal winter to all of Golarion and learn more about Baba Yaga\'s fate.',
    bookNumber: 3,
    status: 'completed',
    theme: 'from-slate-900 to-cyan-800'
  },
  {
    slug: 'the-frozen-stars',
    title: 'The Frozen Stars',
    description: 'Using Baba Yaga\'s restored hut, the party travels to the planet Triaxus during its centuries-long winter. They must ally with the native dragonkin and face a dragonkin warlord while seeking clues to Baba Yaga\'s whereabouts in this alien frozen world.',
    bookNumber: 4,
    status: 'current',
    theme: 'from-indigo-900 to-slate-800'
  },
  {
    slug: 'rasputin-must-die',
    title: 'Rasputin Must Die!',
    description: 'The dancing hut transports the heroes to World War I-era Earth, where they must navigate the political intrigue of Imperial Russia. They discover that the infamous Rasputin has become one of Baba Yaga\'s riders and must stop his plans in the court of the Romanovs.',
    bookNumber: 5,
    status: 'not-started',
    theme: 'from-red-900 to-slate-800'
  },
  {
    slug: 'the-witch-queen-revenge',
    title: 'The Witch Queen\'s Revenge',
    description: 'In the epic finale, the heroes must rescue Baba Yaga herself and face Queen Elvanna in a climactic battle that will determine the fate of not just Golarion, but multiple worlds. The eternal winter\'s grip must be broken once and for all.',
    bookNumber: 6,
    status: 'not-started',
    theme: 'from-purple-900 to-blue-800'
  }
];

// Helper function to extract excerpt from story blocks
function getStoryExcerpt(story: StoryBlock[], limit = 200): string {
  for (const block of story) {
    if (block.type === 'paragraph' && 'content' in block && typeof block.content === 'string') {
      const text = block.content.substring(0, limit);
      return text.length < block.content.length ? text + '...' : text;
    }
  }
  return 'No excerpt available';
}

// TipTap content renderer
function renderTiptapContent(node: TiptapNode | TiptapNode[] | null): React.ReactNode {
  if (!node) return null;
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{renderTiptapContent(n)}</React.Fragment>);

  switch (node.type) {
    case 'doc':
      return renderTiptapContent(node.content || null);
    case 'paragraph':
      return <p className="mb-4 leading-relaxed text-slate-200">{renderTiptapContent(node.content || null)}</p>;
    case 'text': {
      let el: string | React.ReactNode = node.text || '';
      if (node.marks) {
        for (const m of node.marks) {
          if (m.type === 'bold') el = <strong>{el}</strong>;
          if (m.type === 'italic') el = <em>{el}</em>;
          if (m.type === 'strike') el = <s>{el}</s>;
          if (m.type === 'code') el = <code className="rounded bg-slate-800/80 px-1 py-0.5 text-sm text-cyan-200">{el}</code>;
        }
      }
      return el;
    }
    case 'heading': {
      const level = node.attrs?.level || 2;
      const Tag = (`h${level}`) as React.ElementType;
        const sizes = {
        1: 'text-3xl md:text-4xl',
        2: 'text-2xl md:text-3xl',
        3: 'text-xl md:text-2xl',
        4: 'text-lg md:text-xl',
      } as Record<number, string>;
      return (
        <Tag className={`mt-8 mb-4 font-['Alkatra'] font-semibold text-cyan-200 ${sizes[level as number] ?? 'text-xl'}`}>
          {renderTiptapContent(node.content || null)}
        </Tag>
      );
    }
    case 'bulletList':
      return <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-200">{renderTiptapContent(node.content || null)}</ul>;
    case 'orderedList':
      return <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-200">{renderTiptapContent(node.content || null)}</ol>;
    case 'listItem':
      return <li>{renderTiptapContent(node.content || null)}</li>;
    case 'blockquote':
      return (
        <blockquote className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 text-slate-100">
          {renderTiptapContent(node.content || null)}
        </blockquote>
      );
    case 'horizontalRule':
      return <hr className="my-8 border-slate-700" />;
    case 'codeBlock':
      return (
        <pre className="mb-6 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-cyan-200">
          <code>{renderTiptapContent(node.content || null)}</code>
        </pre>
      );
    case 'hardBreak':
      return <br />;
    default:
      return null;
  }
}

export default function AdventureBookPage() {
  const { data: session } = useSession()
  // @ts-expect-error - Custom NextAuth user.id property
  const userId = session?.user?.id || null
  const { book: rawBook } = useParams<{ book: string | string[] }>();
  const bookSlug = Array.isArray(rawBook) ? rawBook[0] : rawBook;
  const pathname = usePathname();

  const [entries, setEntries] = useState<AdventureEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AdventureEntry | null>(null);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Scroll to top on route change or entry change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, selectedEntry, currentEntryIndex]);

  // Find the current book
  const book = adventureBooks.find(b => b.slug === bookSlug);

  // Load entries for this book
  useEffect(() => {
    if (!bookSlug) return;

    const loadEntries = async () => {
      setLoading(true);
      try {
        // Fetch stories for this specific book from the new API
        const response = await fetch(`/api/stories?book=${bookSlug}&limit=100&t=${Date.now()}`);
        if (response.ok) {
          const stories = await response.json();
          // Convert story format to match AdventureEntry interface expected by the UI
          const bookEntries: AdventureEntry[] = stories
            .filter((story: StoryEntry) => story && story.slug && story.book && story.date) // Filter out invalid stories
            .map((story: StoryEntry) => ({
            id: `${story.book}-${story.date}-${story.slug}`,
            title: getStoryTitle(story),
            createdAt: story.date,
            updatedAt: story.date,
            excerpt: getStoryExcerpt(story.story),
            content: { type: 'doc', content: story.story.map((block: StoryBlock) => {
              if (block.type === 'paragraph') {
                return {
                  type: 'paragraph',
                  content: [{ type: 'text', text: block.content }]
                }
              } else if (block.type === 'heading') {
                return {
                  type: 'heading',
                  attrs: { level: block.level },
                  content: [{ type: 'text', text: block.content }]
                }
              }
              return {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Unsupported content type' }]
              }
            }) },
            image: story.coverUrl,
            book: story.book,
            sessionDate: story.date
          }))
          .sort((a: AdventureEntry, b: AdventureEntry) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
          setEntries(bookEntries);
        }
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [bookSlug]);

  if (!bookSlug) {
    return null; // Still resolving on client
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <section className="relative bg-gradient-to-b from-blue-900 to-slate-800">
          <div className="relative max-w-4xl mx-auto px-6 py-16">
            <Link
              href="/adventure-log"
              className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors mb-8"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Adventure Chronicles
            </Link>
            <h1 className="text-4xl font-bold mb-2 font-['Alkatra']">Book Not Found</h1>
            <p className="text-cyan-200">We couldn&apos;t find &quot;{bookSlug}&quot;. Please choose a book from the Adventure Chronicles.</p>
          </div>
        </section>
      </div>
    );
  }

  const openEntry = (entry: AdventureEntry, index: number) => {
    setSelectedEntry(entry);
    setCurrentEntryIndex(index);
  };

  const closeEntry = () => setSelectedEntry(null);

  const deleteEntry = async (entry: AdventureEntry) => {
    if (!confirm(`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      // Parse the entry ID to extract book, date, and slug
      // Format: {book}-{date}-{slug} where date is YYYY-MM-DD
      console.log('Full entry ID:', entry.id);
      console.log('Entry book field:', entry.book);
      console.log('Entry sessionDate field:', entry.sessionDate);
      
      // Use the actual book and date from the entry object instead of parsing the ID
      const book = entry.book;
      const date = entry.sessionDate;
      
      // To get the slug, we need to reconstruct what it should be
      // Since ID = book + '-' + date + '-' + slug, we can extract the slug
      const expectedPrefix = `${book}-${date}-`;
      console.log('Expected prefix:', expectedPrefix);
      
      if (!entry.id.startsWith(expectedPrefix)) {
        throw new Error(`Entry ID doesn't match expected format. ID: ${entry.id}, Expected prefix: ${expectedPrefix}`);
      }
      
      const slug = entry.id.substring(expectedPrefix.length);
      
      console.log('Parsed components:', { 
        book, 
        date, 
        slug,
        originalId: entry.id 
      });
      
      const apiPath = `/api/stories/${encodeURIComponent(book)}/${encodeURIComponent(date)}/${encodeURIComponent(slug)}`;
      console.log('API path:', apiPath);

      const response = await fetch(apiPath, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        const updatedEntries = entries.filter(e => e.id !== entry.id);
        setEntries(updatedEntries);
        
        // If this was the selected entry, close it
        if (selectedEntry?.id === entry.id) {
          setSelectedEntry(null);
        }
        
        // Adjust current index if needed
        if (currentEntryIndex >= updatedEntries.length && updatedEntries.length > 0) {
          setCurrentEntryIndex(updatedEntries.length - 1);
        }
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  const navigateEntry = (direction: 'next' | 'prev') => {
    const newIndex =
      direction === 'next'
        ? Math.min(currentEntryIndex + 1, entries.length - 1)
        : Math.max(currentEntryIndex - 1, 0);

    setCurrentEntryIndex(newIndex);
    setSelectedEntry(entries[newIndex]);
  };

  // If viewing individual entry
  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Entry Header */}
        <div className={`relative bg-gradient-to-b ${book.theme}`}>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <button
              onClick={closeEntry}
              className="mb-4 flex items-center text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back to {book.title}
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-cyan-200">
                <Calendar size={16} className="mr-2" />
                {new Date(selectedEntry.sessionDate).toLocaleDateString()}
              </div>
              
              {userId && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/editor?id=${selectedEntry.id}`}
                    className="flex items-center px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteEntry(selectedEntry)}
                    disabled={deleting}
                    className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
                    title="Delete this entry"
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    ) : (
                      <Trash2 size={14} className="mr-1" />
                    )}
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Alkatra']">{selectedEntry.title}</h1>
          </div>
        </div>

        {/* Entry Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <article className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-lg p-8">
            {selectedEntry.image && (
              <div className="mb-8">
                <Image
                  src={selectedEntry.image}
                  alt={selectedEntry.title}
                  width={600}
                  height={400}
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              {renderTiptapContent(selectedEntry.content)}
            </div>
          </article>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigateEntry('prev')}
              disabled={currentEntryIndex === 0}
              className="flex items-center px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous Entry
            </button>

            <span className="text-slate-400">
              {currentEntryIndex + 1} of {entries.length}
            </span>

            <button
              onClick={() => navigateEntry('next')}
              disabled={currentEntryIndex === entries.length - 1}
              className="flex items-center px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Entry
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Book overview page
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Book Header */}
      <section className={`relative bg-gradient-to-b ${book.theme}`}>
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <Link
            href="/adventure-log"
            className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Adventure Chronicles
          </Link>

          <div className="text-center">
            <div className="text-4xl font-bold mb-4 font-['Alkatra']">Book {book.bookNumber}</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-['Alkatra']">{book.title}</h1>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed text-blue-100/90">{book.description}</p>

            {/* Book Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <BookOpen className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold font-['Alkatra']">{entries.length}</div>
                <div className="text-sm text-blue-200/80">Entries</div>
              </div>
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold font-['Alkatra']">
                  {book.status === 'completed' ? 'Complete' : book.status === 'current' ? 'In Progress' : 'Coming Soon'}
                </div>
                <div className="text-sm text-blue-200/80">Status</div>
              </div>
              <div className="text-center md:col-span-1 col-span-2">
                <MapPin className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold font-['Alkatra']">Winter</div>
                <div className="text-sm text-blue-200/80">Season</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Entries */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-blue-100 mb-8 text-center font-['Alkatra']">Chronicle Entries</h2>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-xl text-slate-300 mb-4">Loading chronicles...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-slate-300 mb-4">No entries chronicled yet for this book.</p>
            <p className="text-slate-400">
              {userId ? "The adventures await to be written!" : "The adventures are waiting to be chronicled."}
            </p>
            {userId && (
              <Link
                href="/editor"
                className="inline-flex items-center px-6 py-3 mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors duration-300"
              >
                Chronicle the First Adventure
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry, index) => (
              <article
                key={entry.id}
                className="bg-slate-900/60 border border-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer hover:border-cyan-400/40"
                onClick={() => openEntry(entry, index)}
              >
                <div className="md:flex">
                  {entry.image && (
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-full relative">
                        <Image
                          src={entry.image}
                          alt={entry.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className={`${entry.image ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar size={16} className="mr-2" />
                        {new Date(entry.sessionDate).toLocaleDateString()}
                      </div>
                      
                      {userId && (
                        <Link
                          href={`/editor?id=${entry.id}`}
                          className="flex items-center px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs rounded transition-colors"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering the card click
                        >
                          <Edit size={12} className="mr-1" />
                          Edit
                        </Link>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-blue-100 mb-2 hover:text-cyan-300 transition-colors font-['Alkatra']">
                      {entry.title}
                    </h3>

                    <p className="text-slate-300/80 mb-4 leading-relaxed">{entry.excerpt}</p>

                    <div className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors font-['Alkatra']">
                      Read Full Chronicle →
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}