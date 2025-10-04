// app/(winter)/adventure-log/page.tsx
import { listStories, listAllKey, listKey } from '@/lib/storage'
import { StoryEntry } from '@/types/story'
// TODO: Replace with NextAuth
// import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Calendar, Sparkles, PenLine, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic' // reflect new files during dev

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

// Helper function to get a readable title or excerpt from a story
function getStoryTitle(story: StoryEntry): string {
  // Try to find a heading block first
  const heading = story.story.find(block => block.type === 'heading')
  if (heading && 'content' in heading && typeof heading.content === 'string') {
    return heading.content
  }
  
  // Fall back to formatted slug
  return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper function to get a story excerpt
function getStoryExcerpt(story: StoryEntry, limit = 100): string {
  // Find the first paragraph with content
  const paragraph = story.story.find(block => 
    block.type === 'paragraph' && 'content' in block && typeof block.content === 'string'
  )
  
  if (paragraph && 'content' in paragraph && typeof paragraph.content === 'string') {
    const content = paragraph.content.trim()
    return content.length > limit ? content.substring(0, limit) + '...' : content
  }
  
  return 'No excerpt available'
}

// Hardcoded Reign of Winter adventure books
const adventureBooks = [
  {
    slug: 'the-snows-of-summer',
    title: 'The Snows of Summer',
    description: 'Our heroes begin their journey in the border town of Heldren, where an unseasonable blizzard threatens the harvest. They must venture into the mysterious Pale Tower and confront the ice witch Radosek Pavril to save the town and uncover the first clues about Baba Yaga\'s disappearance.',
    bookNumber: 1,
    coverImage: "/images/winter/pale_tower.webp",
    status: 'completed',
    theme: 'from-blue-900 to-cyan-800'
  },
  {
    slug: 'the-shackled-hut',
    title: 'The Shackled Hut',
    description: 'The party discovers Baba Yaga\'s legendary dancing hut, but it has been magically bound and stripped of its power. To free the hut and continue their quest, they must venture into the frozen realm of Irrisen and navigate the deadly politics of the Winter Witches.',
    bookNumber: 2,
    coverImage: '/images/winter/statues.jpg',
    status: 'completed',
    theme: 'from-cyan-900 to-blue-800'
  },
  {
    slug: 'maiden-mother-crone',
    title: 'Maiden, Mother, Crone',
    description: 'The heroes journey to the capital of Irrisen, Whitethrone, where they must infiltrate the Winter Palace and confront Queen Elvanna. They discover the true scope of her plans to bring eternal winter to all of Golarion and learn more about Baba Yaga\'s fate.',
    bookNumber: 3,
    coverImage: '/images/winter/third_raven.jpg',
    status: 'completed',
    theme: 'from-slate-900 to-cyan-800'
  },
  {
    slug: 'the-frozen-stars',
    title: 'The Frozen Stars',
    description: 'Using Baba Yaga\'s restored hut, the party travels to the planet Triaxus during its centuries-long winter. They must ally with the native dragonkin and face the dragon Logrivich while seeking one of Baba Yaga\'s riders in this alien frozen world.',
    bookNumber: 4,
    coverImage: '/images/winter/svet2.jpg',
    status: 'current',
    theme: 'from-indigo-900 to-slate-800'
  },
  {
    slug: 'rasputin-must-die',
    title: 'Rasputin Must Die!',
    description: 'The dancing hut transports the heroes to World War I-era Earth, where they must navigate the political intrigue of Imperial Russia. They discover that the infamous Rasputin has become one of Baba Yaga\'s riders and must stop his plans in the court of the Romanovs.',
    bookNumber: 5,
    coverImage: '/images/winter/baba_yaga_hero.jpg',
    status: 'not-started',
    theme: 'from-red-900 to-slate-800'
  },
  {
    slug: 'the-witch-queen-revenge',
    title: 'The Witch Queen\'s Revenge',
    description: 'In the epic finale, the heroes must rescue Baba Yaga herself and face Queen Elvanna in a climactic battle that will determine the fate of not just Golarion, but multiple worlds. The eternal winter\'s grip must be broken once and for all.',
    bookNumber: 6,
    coverImage: '/images/winter/baba_yaga_hero.jpg',
    status: 'not-started',
    theme: 'from-purple-900 to-blue-800'
  }
];

export default async function AdventureLogPage() {
  // TODO: Replace with NextAuth authentication
  // const { userId } = await auth() // Check if user is authenticated
  let storyData = await listStories(listAllKey(), 100) // Get all winter stories
  
  // If no stories in global list, try to get from individual book lists
  if (storyData.length === 0) {
    const allBookStories = await Promise.all(
      adventureBooks.map(book => listStories(listKey(book.slug), 100))
    )
    storyData = allBookStories.flat()
  }
  
  const stories = (storyData
    .map(item => item.value)
    .filter(Boolean) as StoryEntry[]) // Extract story objects and filter out null/undefined
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
  
  const totalEntries = stories.length
  const latestEntry = stories[0] // Most recent after sorting
  const earliestEntry = stories[stories.length - 1] // Oldest after sorting

  const journeyRange = latestEntry && earliestEntry && stories.length > 1
    ? `${dateFormatter.format(new Date(earliestEntry.date))} — ${dateFormatter.format(new Date(latestEntry.date))}`
    : latestEntry
    ? dateFormatter.format(new Date(latestEntry.date))
    : 'The long winter begins'

  // Calculate stats
  const totalSessions = stories.length // number of logged sessions/entries
  
  // Calculate stories per book for the hardcoded book display
  const storiesPerBook = adventureBooks.map(book => {
    const bookStories = stories.filter(story => story.book === book.slug)
    return {
      ...book,
      storyCount: bookStories.length,
      latestStory: bookStories[0], // Already sorted by date
      earliestStory: bookStories[bookStories.length - 1]
    }
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <Image
          src="/images/winter/baba_yaga_hero.jpg"
          alt="Icy wasteland with Baba Yaga's hut"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-cyan-200/80 mb-6">Chronicles of the Long Winter</p>
            <h1 className="text-4xl md:text-6xl font-['Alkatra'] font-bold text-blue-100 drop-shadow-lg">
              Reign of Winter Adventure Log
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/80 leading-relaxed">
              Follow our band of Pathfinders as they carve a trail through endless snow, haunted forests, and forgotten realms in
              search of Baba Yaga. Every entry is a tale of survival, sacrifice, and frostbitten heroics.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {/* TODO: Re-enable with NextAuth authentication */}
              {false && (
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
                >
                  <PenLine size={18} />
                  Record a New Chronicle
                </Link>
              )}
              <Link
                href="#entries"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-200 hover:text-cyan-100"
              >
                <BookOpen size={18} />
                Browse the Archive
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <BookOpen size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Entries</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">{totalEntries || '—'}</p>
              <p className="mt-2 text-sm text-slate-300/80">
                {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'} recorded
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <Calendar size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Chronicle Span</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">
                {totalEntries > 0 ? journeyRange : '—'}
              </p>
              <p className="mt-2 text-sm text-slate-300/80">
                From our first frostbitten steps to the latest victory.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <Sparkles size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Latest Entry</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">
                {latestEntry ? dateFormatter.format(new Date(latestEntry.date)) : 'Soon'}
              </p>
              {latestEntry && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-300">
                    &ldquo;{getStoryTitle(latestEntry)}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {getStoryExcerpt(latestEntry, 80)}
                  </p>
                </div>
              )}
              {!latestEntry && (
                <p className="mt-2 text-sm text-slate-300/80">
                  Chronicles will appear here as they are penned.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Books */}
      <section id="entries" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-blue-100 mb-4 text-center font-['Alkatra']">
          The Winter Chronicles
        </h2>
        <p className="text-lg text-slate-300/80 mb-12 text-center max-w-3xl mx-auto">
          Each book chronicles a crucial chapter in our heroes&apos; quest to save Baba Yaga and prevent eternal winter 
          from consuming all worlds. Follow their journey through frozen realms, political intrigue, and epic battles 
          that span multiple planes of existence.
        </p>
        
        <div className="grid gap-8">
          {storiesPerBook.map((book) => (
            <Link 
              key={book.slug}
              href={`/adventure-log/${book.slug}`}
              className="group block"
            >
              <article className="bg-slate-950/60 border border-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 hover:border-cyan-400/40">
                <div className="md:flex">
                  {/* Book Cover */}
                  <div className="md:w-1/3 relative">
                    <Image
                      src={book.coverImage}
                      alt={`${book.title} cover`}
                      fill
                      className="object-cover"
                    />
                    <div className={`h-64 md:h-full flex items-center justify-center text-blue-100 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/70" />
                      <div className="relative text-center p-6">
                        <div className="text-4xl font-bold mb-2 font-['Alkatra']">Book {book.bookNumber}</div>
                        <div className="text-lg font-medium font-['Alkatra']">{book.title}</div>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          book.status === 'completed' 
                            ? 'bg-green-600 text-green-100' 
                            : book.status === 'current'
                            ? 'bg-amber-600 text-amber-100'
                            : 'bg-slate-600 text-slate-300'
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
                      <h3 className="text-2xl font-bold text-blue-100 group-hover:text-cyan-300 transition-colors font-['Alkatra']">
                        {book.title}
                      </h3>
                      <ArrowRight className="text-blue-100 group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                    
                    <p className="text-slate-300/80 leading-relaxed mb-6">
                      {book.description}
                    </p>
                    
                    {/* Book Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar size={16} className="mr-2 text-cyan-400" />
                        {book.earliestStory && book.latestStory && book.storyCount > 1
                          ? `${new Date(book.earliestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(book.latestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                          : book.latestStory
                          ? new Date(book.latestStory.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Not started'
                        }
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <BookOpen size={16} className="mr-2 text-cyan-400" />
                        {book.storyCount} {book.storyCount === 1 ? 'Session' : 'Sessions'}
                      </div>
                    </div>
                    
                    <div className="text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors font-['Alkatra']">
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
      <section className="bg-gradient-to-r from-blue-900 to-slate-800 text-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 font-['Alkatra']">Ready to Brave the Winter?</h2>
          <p className="text-xl mb-8">
            Begin with the heroes&apos; first encounter with unnatural winter in Heldren and follow their 
            transformation from small-town adventurers to saviors of multiple worlds in their quest 
            to rescue Baba Yaga and break the eternal winter&apos;s hold.
          </p>
          <Link 
            href="/adventure-log/the-snows-of-summer"
            className="inline-flex items-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-colors duration-300 shadow-lg font-['Alkatra']"
          >
            Start Reading: The Snows of Summer
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}