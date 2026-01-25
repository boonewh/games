'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { StoryEntry } from '@/types/story'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Calendar, Sparkles, PenLine, ArrowRight } from 'lucide-react'
import Header from '@/components/wrath/Header'
import Footer from '@/components/wrath/Footer'

// Helper function to get a readable title or excerpt from a story
function getStoryTitle(story: StoryEntry): string {
  const heading = story.story.find(block => block.type === 'heading')
  if (heading && 'content' in heading && typeof heading.content === 'string') {
    return heading.content
  }
  return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper function to get a story excerpt
function getStoryExcerpt(story: StoryEntry, limit = 100): string {
  const paragraph = story.story.find(block =>
    block.type === 'paragraph' && 'content' in block && typeof block.content === 'string'
  )

  if (paragraph && 'content' in paragraph && typeof paragraph.content === 'string') {
    const content = paragraph.content.trim()
    return content.length > limit ? content.substring(0, limit) + '...' : content
  }

  return 'No excerpt available'
}

// Wrath of the Righteous Adventure Path books
type BookStatus = 'completed' | 'current' | 'not-started';

interface AdventureBook {
  slug: string;
  title: string;
  description: string;
  bookNumber: number;
  coverImage: string;
  status: BookStatus;
  theme: string;
}

const adventureBooks: AdventureBook[] = [
  {
    slug: 'the-worldwound-incursion',
    title: 'The Worldwound Incursion',
    description: 'The adventure begins in the city of Kenabres during the annual Armasse festival when the wardstone is shattered and the city falls under demonic assault. The heroes must survive the attack and discover they have been touched by mythic power.',
    bookNumber: 1,
    coverImage: "/images/wrath/placeholder-book1.jpg",
    status: 'not-started',
    theme: 'from-purple-950 to-stone-900'
  },
  {
    slug: 'sword-of-valor',
    title: 'Sword of Valor',
    description: 'With mythic power awakening within them, the heroes lead the charge to retake the city of Drezen and recover the legendary Sword of Valor, a sacred banner that can turn the tide of the crusade.',
    bookNumber: 2,
    coverImage: '/images/wrath/placeholder-book2.jpg',
    status: 'not-started',
    theme: 'from-red-950 to-stone-900'
  },
  {
    slug: 'demon-s-heresy',
    title: "Demon's Heresy",
    description: 'Now commanders of crusader forces, the heroes must root out corruption within the crusade itself while facing new demonic threats. A conspiracy threatens everything they have fought to achieve.',
    bookNumber: 3,
    coverImage: '/images/wrath/placeholder-book3.jpg',
    status: 'not-started',
    theme: 'from-amber-950 to-stone-900'
  },
  {
    slug: 'the-midnight-isles',
    title: 'The Midnight Isles',
    description: 'The heroes must venture into the Abyss itself, traveling to the Midnight Isles—the realm of Nocticula, demon lord of darkness and lust—to secure a powerful weapon against the demonic hordes.',
    bookNumber: 4,
    coverImage: '/images/wrath/placeholder-book4.jpg',
    status: 'not-started',
    theme: 'from-indigo-950 to-stone-900'
  },
  {
    slug: 'herald-of-the-ivory-labyrinth',
    title: 'Herald of the Ivory Labyrinth',
    description: 'The crusaders discover that Iomedae\'s herald has been captured and imprisoned in the Ivory Labyrinth—Baphomet\'s endless maze. The heroes must rescue the herald before all hope is lost.',
    bookNumber: 5,
    coverImage: '/images/wrath/placeholder-book5.jpg',
    status: 'not-started',
    theme: 'from-rose-950 to-stone-900'
  },
  {
    slug: 'city-of-locusts',
    title: 'City of Locusts',
    description: 'In the epic finale, the heroes assault the heart of the Worldwound itself—Iz, the City of Locusts—to face Deskari, demon lord of the Locust Host, and close the rift between worlds forever.',
    bookNumber: 6,
    coverImage: '/images/wrath/placeholder-book6.jpg',
    status: 'not-started',
    theme: 'from-zinc-900 to-stone-950'
  }
];

export default function WrathAdventureLogPage() {
  const { data: session } = useSession()
  // @ts-expect-error - Custom NextAuth user.id property
  const userId = session?.user?.id || null

  const [stories, setStories] = useState<StoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [booksWithCounts, setBooksWithCounts] = useState<(typeof adventureBooks[0] & { storyCount: number; latestStory?: StoryEntry; earliestStory?: StoryEntry })[]>([])

  useEffect(() => {
    const loadStories = async () => {
      try {
        let stories: StoryEntry[] = []

        // Fetch stories for wrath adventure books
        const allBookPromises = adventureBooks.map(async book => {
          try {
            const response = await fetch(`/api/stories?book=${book.slug}&limit=100`)
            if (response.ok) {
              const bookStories = await response.json()
              return Array.isArray(bookStories) ? bookStories : []
            }
          } catch (error) {
            console.error(`Failed to fetch stories for book ${book.slug}:`, error)
          }
          return []
        })

        const allBookStories = await Promise.all(allBookPromises)
        stories = allBookStories.flat()

        if (stories.length > 0) {
          const sortedStories = stories
            .filter((story): story is StoryEntry => Boolean(story) && typeof story === 'object' && story !== null && 'book' in story && 'date' in story)
            .sort((a: StoryEntry, b: StoryEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setStories(sortedStories)

          const counts = adventureBooks.map(book => {
            const bookStories = sortedStories.filter((story: StoryEntry) => story && story.book === book.slug)
            return {
              ...book,
              storyCount: bookStories.length,
              latestStory: bookStories[0],
              earliestStory: bookStories[bookStories.length - 1]
            }
          })
          setBooksWithCounts(counts)
        } else {
          setStories([])
          setBooksWithCounts(adventureBooks.map(book => ({
            ...book,
            storyCount: 0,
            latestStory: undefined,
            earliestStory: undefined
          })))
        }
      } catch (error) {
        console.error('Failed to load stories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [])

  const totalEntries = stories.length
  const latestEntry = stories[0]
  const earliestEntry = stories[stories.length - 1]

  const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })
  const journeyRange = latestEntry && earliestEntry && stories.length > 1
    ? `${dateFormatter.format(new Date(earliestEntry.date))} — ${dateFormatter.format(new Date(latestEntry.date))}`
    : latestEntry
    ? dateFormatter.format(new Date(latestEntry.date))
    : 'The crusade awaits'

  const totalSessions = stories.length

  const storiesPerBook = booksWithCounts.length > 0 ? booksWithCounts : adventureBooks.map(book => {
    const bookStories = stories.filter(story => story.book === book.slug)
    return {
      ...book,
      storyCount: bookStories.length,
      latestStory: bookStories[0],
      earliestStory: bookStories[bookStories.length - 1]
    }
  })

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-stone-dark text-parchment flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wotr-gold mx-auto mb-4"></div>
            <p className="text-lg text-zinc-400">Loading crusade chronicles...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-stone-dark text-parchment font-spectral">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-dark to-stone-dark">
          <Image
            src="/images/wrath/wrath-hero.jpg"
            alt="The Fifth Crusade"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-stone-dark/60" />

          <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
            <div className="max-w-3xl">
              <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-wotr-gold/80 mb-6">Chronicles of the Fifth Crusade</p>
              <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-wotr-gold drop-shadow-lg">
                Wrath of the Righteous Adventure Log
              </h1>
              <p className="mt-6 text-lg md:text-xl text-parchment/80 leading-relaxed">
                Follow the mythic heroes as they rise from the ashes of Kenabres to lead the Fifth Crusade against
                the demonic hordes of the Worldwound. Every entry chronicles their battles, sacrifices, and the
                divine power that transforms them into legends.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {userId && (
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-2 rounded-sm bg-wotr-gold px-5 py-2.5 text-sm font-semibold text-stone-dark shadow-lg shadow-wotr-gold/20 transition hover:bg-wotr-gold/90 font-cinzel uppercase tracking-wider"
                  >
                    <PenLine size={18} />
                    Record a New Chronicle
                  </Link>
                )}
                <Link
                  href="#entries"
                  className="inline-flex items-center gap-2 rounded-sm border border-wardstone-blue/60 px-5 py-2.5 text-sm font-semibold text-wardstone-blue transition hover:border-wardstone-blue hover:text-wardstone-blue/80 font-cinzel uppercase tracking-wider"
                >
                  <BookOpen size={18} />
                  Browse the Archive
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative border-y border-zinc-800 bg-stone-light/30 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-sm border border-zinc-800 bg-stone-dark/70 p-6 shadow-lg">
                <div className="flex items-center gap-3 text-wotr-gold">
                  <BookOpen size={24} />
                  <span className="text-sm uppercase tracking-[0.2em] text-wotr-gold/70 font-cinzel">Entries</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-parchment font-cinzel">{totalEntries || '—'}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'} recorded
                </p>
              </div>

              <div className="rounded-sm border border-zinc-800 bg-stone-dark/70 p-6 shadow-lg">
                <div className="flex items-center gap-3 text-wotr-gold">
                  <Calendar size={24} />
                  <span className="text-sm uppercase tracking-[0.2em] text-wotr-gold/70 font-cinzel">Chronicle Span</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-parchment font-cinzel">
                  {totalEntries > 0 ? journeyRange : '—'}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  From the first battle cry to the latest victory.
                </p>
              </div>

              <div className="rounded-sm border border-zinc-800 bg-stone-dark/70 p-6 shadow-lg">
                <div className="flex items-center gap-3 text-wotr-gold">
                  <Sparkles size={24} />
                  <span className="text-sm uppercase tracking-[0.2em] text-wotr-gold/70 font-cinzel">Latest Entry</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-parchment font-cinzel">
                  {latestEntry ? dateFormatter.format(new Date(latestEntry.date)) : 'Soon'}
                </p>
                {latestEntry && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-zinc-300">
                      &ldquo;{getStoryTitle(latestEntry)}&rdquo;
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {getStoryExcerpt(latestEntry, 80)}
                    </p>
                  </div>
                )}
                {!latestEntry && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Chronicles will appear here as they are penned.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Adventure Books */}
        <section id="entries" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-wotr-gold mb-4 text-center font-cinzel uppercase tracking-widest">
            The Crusade Chronicles
          </h2>
          <p className="text-lg text-zinc-400 mb-12 text-center max-w-3xl mx-auto">
            Each book chronicles a crucial chapter in the heroes&apos; mythic journey to close the Worldwound
            and defeat the demon lord Deskari. Follow their ascension from mortal adventurers to legendary
            champions touched by divine power.
          </p>

          <div className="grid gap-8">
            {storiesPerBook.map((book) => (
              <Link
                key={book.slug}
                href={`/wrath/adventure-log/${book.slug}`}
                className="group block"
              >
                <article className="bg-stone-dark/60 border border-zinc-800 rounded-sm shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 hover:border-wotr-gold/40">
                  <div className="md:flex">
                    {/* Book Cover */}
                    <div className="md:w-1/3 relative">
                      <div className={`h-64 md:h-full flex items-center justify-center text-parchment relative overflow-hidden bg-gradient-to-br ${book.theme}`}>
                        {/* Placeholder overlay */}
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative text-center p-6">
                          <div className="text-4xl font-bold mb-2 font-cinzel">Book {book.bookNumber}</div>
                          <div className="text-lg font-medium font-cinzel">{book.title}</div>
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-2 py-1 text-xs rounded-sm font-cinzel uppercase tracking-wider ${
                            book.status === 'completed'
                              ? 'bg-green-900 text-green-200 border border-green-700'
                              : book.status === 'current'
                              ? 'bg-amber-900 text-amber-200 border border-amber-700'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {book.status === 'completed'
                              ? 'Completed'
                              : book.status === 'current'
                              ? 'Current'
                              : 'Not Started'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-parchment group-hover:text-wotr-gold transition-colors font-cinzel">
                          {book.title}
                        </h3>
                        <ArrowRight className="text-parchment group-hover:translate-x-1 group-hover:text-wotr-gold transition-all" size={24} />
                      </div>

                      <p className="text-zinc-400 leading-relaxed mb-6">
                        {book.description}
                      </p>

                      {/* Book Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-sm text-zinc-500">
                          <Calendar size={16} className="mr-2 text-wardstone-blue" />
                          {book.earliestStory && book.latestStory && book.storyCount > 1
                            ? `${new Date(book.earliestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(book.latestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                            : book.latestStory
                            ? new Date(book.latestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : 'Not started'
                          }
                        </div>
                        <div className="flex items-center text-sm text-zinc-500">
                          <BookOpen size={16} className="mr-2 text-wardstone-blue" />
                          {book.storyCount} {book.storyCount === 1 ? 'Session' : 'Sessions'}
                        </div>
                      </div>

                      <div className="text-wotr-gold font-medium group-hover:text-wotr-gold/80 transition-colors font-cinzel uppercase tracking-wider text-sm">
                        Explore this Chronicle →
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-950 to-stone-900 text-parchment py-16 border-t border-b border-wotr-gold/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 font-cinzel uppercase tracking-widest text-wotr-gold">Ready to Join the Crusade?</h2>
            <p className="text-xl mb-8 text-zinc-300">
              Begin with the fall of Kenabres and the awakening of mythic power. Follow the heroes as they
              rise from the ashes to lead the Fifth Crusade against the demon lord Deskari and close the
              Worldwound forever.
            </p>
            <Link
              href="/wrath/adventure-log/the-worldwound-incursion"
              className="inline-flex items-center px-8 py-3 bg-wotr-gold hover:bg-wotr-gold/90 text-stone-dark font-bold rounded-sm transition-colors duration-300 shadow-lg font-cinzel uppercase tracking-wider"
            >
              Start Reading: The Worldwound Incursion
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
