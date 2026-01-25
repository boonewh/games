'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, BookOpen, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react'
import { StoryEntry, StoryBlock } from '@/types/story';
import Header from '@/components/wrath/Header';
import Footer from '@/components/wrath/Footer';

export const dynamic = 'force-dynamic'

// Helper function to get a readable title from a story
function getStoryTitle(story: StoryEntry): string {
  const heading = story.story.find(block => block.type === 'heading')
  if (heading && 'content' in heading && typeof heading.content === 'string') {
    return heading.content
  }
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

// Wrath of the Righteous Adventure Path books
const adventureBooks: AdventureBook[] = [
  {
    slug: 'the-worldwound-incursion',
    title: 'The Worldwound Incursion',
    description: 'The adventure begins in the city of Kenabres during the annual Armasse festival when the wardstone is shattered and the city falls under demonic assault. The heroes must survive the attack and discover they have been touched by mythic power.',
    bookNumber: 1,
    status: 'not-started',
    theme: 'from-purple-950 to-stone-900'
  },
  {
    slug: 'sword-of-valor',
    title: 'Sword of Valor',
    description: 'With mythic power awakening within them, the heroes lead the charge to retake the city of Drezen and recover the legendary Sword of Valor, a sacred banner that can turn the tide of the crusade.',
    bookNumber: 2,
    status: 'not-started',
    theme: 'from-red-950 to-stone-900'
  },
  {
    slug: 'demon-s-heresy',
    title: "Demon's Heresy",
    description: 'Now commanders of crusader forces, the heroes must root out corruption within the crusade itself while facing new demonic threats. A conspiracy threatens everything they have fought to achieve.',
    bookNumber: 3,
    status: 'not-started',
    theme: 'from-amber-950 to-stone-900'
  },
  {
    slug: 'the-midnight-isles',
    title: 'The Midnight Isles',
    description: 'The heroes must venture into the Abyss itself, traveling to the Midnight Isles—the realm of Nocticula, demon lord of darkness and lust—to secure a powerful weapon against the demonic hordes.',
    bookNumber: 4,
    status: 'not-started',
    theme: 'from-indigo-950 to-stone-900'
  },
  {
    slug: 'herald-of-the-ivory-labyrinth',
    title: 'Herald of the Ivory Labyrinth',
    description: 'The crusaders discover that Iomedae\'s herald has been captured and imprisoned in the Ivory Labyrinth—Baphomet\'s endless maze. The heroes must rescue the herald before all hope is lost.',
    bookNumber: 5,
    status: 'not-started',
    theme: 'from-rose-950 to-stone-900'
  },
  {
    slug: 'city-of-locusts',
    title: 'City of Locusts',
    description: 'In the epic finale, the heroes assault the heart of the Worldwound itself—Iz, the City of Locusts—to face Deskari, demon lord of the Locust Host, and close the rift between worlds forever.',
    bookNumber: 6,
    status: 'not-started',
    theme: 'from-zinc-900 to-stone-950'
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

// TipTap content renderer with Wrath styling
function renderTiptapContent(node: TiptapNode | TiptapNode[] | null): React.ReactNode {
  if (!node) return null;
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{renderTiptapContent(n)}</React.Fragment>);

  switch (node.type) {
    case 'doc':
      return renderTiptapContent(node.content || null);
    case 'paragraph':
      return <p className="mb-4 leading-relaxed text-parchment/90">{renderTiptapContent(node.content || null)}</p>;
    case 'text': {
      let el: string | React.ReactNode = node.text || '';
      if (node.marks) {
        for (const m of node.marks) {
          if (m.type === 'bold') el = <strong>{el}</strong>;
          if (m.type === 'italic') el = <em>{el}</em>;
          if (m.type === 'strike') el = <s>{el}</s>;
          if (m.type === 'code') el = <code className="rounded bg-zinc-800/80 px-1 py-0.5 text-sm text-wardstone-blue">{el}</code>;
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
        <Tag className={`mt-8 mb-4 font-cinzel font-semibold text-wotr-gold ${sizes[level as number] ?? 'text-xl'}`}>
          {renderTiptapContent(node.content || null)}
        </Tag>
      );
    }
    case 'bulletList':
      return <ul className="mb-4 list-disc space-y-2 pl-6 text-parchment/90">{renderTiptapContent(node.content || null)}</ul>;
    case 'orderedList':
      return <ol className="mb-4 list-decimal space-y-2 pl-6 text-parchment/90">{renderTiptapContent(node.content || null)}</ol>;
    case 'listItem':
      return <li>{renderTiptapContent(node.content || null)}</li>;
    case 'blockquote':
      return (
        <blockquote className="mb-6 rounded-sm border border-wotr-gold/30 bg-wotr-gold/5 p-6 text-parchment">
          {renderTiptapContent(node.content || null)}
        </blockquote>
      );
    case 'horizontalRule':
      return <hr className="my-8 border-zinc-700" />;
    case 'codeBlock':
      return (
        <pre className="mb-6 overflow-x-auto rounded-sm border border-zinc-700 bg-zinc-900/80 p-4 text-sm text-wardstone-blue">
          <code>{renderTiptapContent(node.content || null)}</code>
        </pre>
      );
    case 'hardBreak':
      return <br />;
    default:
      return null;
  }
}

export default function WrathAdventureBookPage() {
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
        const response = await fetch(`/api/stories?book=${bookSlug}&limit=100&t=${Date.now()}`);
        if (response.ok) {
          const stories = await response.json();
          const bookEntries: AdventureEntry[] = stories
            .filter((story: StoryEntry) => story && story.slug && story.book && story.date)
            .map((story: StoryEntry) => ({
              id: `${story.book}-${story.date}-${story.slug}`,
              title: getStoryTitle(story),
              createdAt: story.date,
              updatedAt: story.date,
              excerpt: getStoryExcerpt(story.story),
              content: {
                type: 'doc', content: story.story.map((block: StoryBlock) => {
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
                })
              },
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
    return null;
  }

  if (!book) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-stone-dark text-parchment">
          <section className={`relative bg-gradient-to-b from-purple-950 to-stone-900`}>
            <div className="relative max-w-4xl mx-auto px-6 py-16">
              <Link
                href="/wrath/adventure-log"
                className="inline-flex items-center text-wotr-gold hover:text-wotr-gold/80 transition-colors mb-8 font-cinzel"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Crusade Chronicles
              </Link>
              <h1 className="text-4xl font-bold mb-2 font-cinzel text-wotr-gold">Book Not Found</h1>
              <p className="text-parchment/80">We couldn&apos;t find &quot;{bookSlug}&quot;. Please choose a book from the Crusade Chronicles.</p>
            </div>
          </section>
        </div>
        <Footer />
      </>
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
      const book = entry.book;
      const date = entry.sessionDate;
      const expectedPrefix = `${book}-${date}-`;

      if (!entry.id.startsWith(expectedPrefix)) {
        throw new Error(`Entry ID doesn't match expected format. ID: ${entry.id}, Expected prefix: ${expectedPrefix}`);
      }

      const slug = entry.id.substring(expectedPrefix.length);
      const apiPath = `/api/stories/${encodeURIComponent(book)}/${encodeURIComponent(date)}/${encodeURIComponent(slug)}`;

      const response = await fetch(apiPath, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedEntries = entries.filter(e => e.id !== entry.id);
        setEntries(updatedEntries);

        if (selectedEntry?.id === entry.id) {
          setSelectedEntry(null);
        }

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
      <>
        <Header />
        <div className="min-h-screen bg-stone-dark text-parchment font-spectral">
          {/* Entry Header */}
          <div className={`relative bg-gradient-to-b ${book.theme}`}>
            <div className="max-w-4xl mx-auto px-6 py-8">
              <button
                onClick={closeEntry}
                className="mb-4 flex items-center text-wotr-gold hover:text-wotr-gold/80 transition-colors font-cinzel"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back to {book.title}
              </button>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-parchment/70">
                  <Calendar size={16} className="mr-2" />
                  {new Date(selectedEntry.sessionDate).toLocaleDateString()}
                </div>

                {userId && (
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/editor?id=${selectedEntry.id}`}
                      className="flex items-center px-3 py-1 bg-wotr-gold hover:bg-wotr-gold/90 text-stone-dark text-sm rounded-sm transition-colors font-cinzel"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteEntry(selectedEntry)}
                      disabled={deleting}
                      className="flex items-center px-3 py-1 bg-red-900 hover:bg-red-800 disabled:bg-red-950 text-parchment text-sm rounded-sm transition-colors font-cinzel"
                      title="Delete this entry"
                    >
                      {deleting ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-parchment mr-1"></div>
                      ) : (
                        <Trash2 size={14} className="mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2 font-cinzel text-wotr-gold">{selectedEntry.title}</h1>
            </div>
          </div>

          {/* Entry Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <article className="bg-stone-light/20 border border-zinc-800 rounded-sm shadow-lg p-8">
              {selectedEntry.image && (
                <div className="mb-8">
                  <Image
                    src={selectedEntry.image}
                    alt={selectedEntry.title}
                    width={600}
                    height={400}
                    className="w-full max-w-md mx-auto rounded-sm shadow-md"
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
                className="flex items-center px-4 py-2 bg-zinc-800 text-parchment rounded-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cinzel"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous Entry
              </button>

              <span className="text-zinc-500 font-cinzel">
                {currentEntryIndex + 1} of {entries.length}
              </span>

              <button
                onClick={() => navigateEntry('next')}
                disabled={currentEntryIndex === entries.length - 1}
                className="flex items-center px-4 py-2 bg-zinc-800 text-parchment rounded-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cinzel"
              >
                Next Entry
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Book overview page
  return (
    <>
      <Header />
      <div className="min-h-screen bg-stone-dark text-parchment font-spectral">
        {/* Book Header */}
        <section className={`relative bg-gradient-to-b ${book.theme}`}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <Link
              href="/wrath/adventure-log"
              className="inline-flex items-center text-wotr-gold hover:text-wotr-gold/80 transition-colors mb-8 font-cinzel"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Crusade Chronicles
            </Link>

            <div className="text-center">
              <div className="text-4xl font-bold mb-4 font-cinzel text-parchment">Book {book.bookNumber}</div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 font-cinzel text-wotr-gold">{book.title}</h1>
              <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed text-parchment/80">{book.description}</p>

              {/* Book Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <BookOpen className="mx-auto mb-2 text-wardstone-blue" size={24} />
                  <div className="text-lg font-bold font-cinzel text-parchment">{entries.length}</div>
                  <div className="text-sm text-parchment/60">Entries</div>
                </div>
                <div className="text-center">
                  <Calendar className="mx-auto mb-2 text-wardstone-blue" size={24} />
                  <div className="text-lg font-bold font-cinzel text-parchment">
                    {book.status === 'completed' ? 'Complete' : book.status === 'current' ? 'In Progress' : 'Coming Soon'}
                  </div>
                  <div className="text-sm text-parchment/60">Status</div>
                </div>
                <div className="text-center md:col-span-1 col-span-2">
                  <MapPin className="mx-auto mb-2 text-wardstone-blue" size={24} />
                  <div className="text-lg font-bold font-cinzel text-parchment">Mythic</div>
                  <div className="text-sm text-parchment/60">Campaign</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Adventure Entries */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-wotr-gold mb-8 text-center font-cinzel uppercase tracking-widest">Chronicle Entries</h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wotr-gold mx-auto mb-4"></div>
              <p className="text-xl text-zinc-400 mb-4">Loading chronicles...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-zinc-400 mb-4">No entries chronicled yet for this book.</p>
              <p className="text-zinc-500">
                {userId ? "The crusade awaits its chronicler!" : "The battles are waiting to be recorded."}
              </p>
              {userId && (
                <Link
                  href="/editor"
                  className="inline-flex items-center px-6 py-3 mt-6 bg-wotr-gold hover:bg-wotr-gold/90 text-stone-dark font-bold rounded-sm transition-colors duration-300 font-cinzel uppercase tracking-wider"
                >
                  Chronicle the First Battle
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry, index) => (
                <article
                  key={entry.id}
                  className="bg-stone-light/20 border border-zinc-800 rounded-sm shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer hover:border-wotr-gold/40"
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
                        <div className="flex items-center text-sm text-zinc-500">
                          <Calendar size={16} className="mr-2" />
                          {new Date(entry.sessionDate).toLocaleDateString()}
                        </div>

                        {userId && (
                          <Link
                            href={`/editor?id=${entry.id}`}
                            className="flex items-center px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-parchment text-xs rounded-sm transition-colors font-cinzel"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit size={12} className="mr-1" />
                            Edit
                          </Link>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-parchment mb-2 hover:text-wotr-gold transition-colors font-cinzel">
                        {entry.title}
                      </h3>

                      <p className="text-zinc-400 mb-4 leading-relaxed">{entry.excerpt}</p>

                      <div className="text-wotr-gold font-medium hover:text-wotr-gold/80 transition-colors font-cinzel uppercase tracking-wider text-sm">
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
      <Footer />
    </>
  );
}
