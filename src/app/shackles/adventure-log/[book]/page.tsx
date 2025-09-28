// /app/shackles/adventure-log/[book]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, BookOpen, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';

// Import adventure data
import wormwoodMutinyData from '@/app/shackles/data/adventures/wormwood-mutiny.json';
import raidersOfTheFeverSeaData from '@/app/shackles/data/adventures/raiders-of-the-fever-sea.json';
import tempestRisingData from '@/app/shackles/data/adventures/tempest-rising.json';
import islandOfEmptyEyesData from '@/app/shackles/data/adventures/island-of-empty-eyes.json';
import thePriceOfInfamyData from '@/app/shackles/data/adventures/the-price-of-infamy.json';
import fromHellsHeartData from '@/app/shackles/data/adventures/from-hells-heart.json';

// Types
interface AdventureEntry {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageCaption?: string;
  isFeatured?: boolean;
  excerpt: string;
  content: string;
  tags: string[];
  charactersInvolved?: string[];
  locationsFeatured?: string[];
}

interface AdventureBook {
  title: string;
  subtitle: string;
  description: string;
  bookNumber: number;
  dateRange: string;
  sessions: number;
  keyCharacters: string[];
  keyLocations: string[];
  entries: AdventureEntry[];
}

const adventureBooks: Record<string, AdventureBook> = {
  'wormwood-mutiny': wormwoodMutinyData,
  'raiders-of-the-fever-sea': raidersOfTheFeverSeaData,
  'tempest-rising': tempestRisingData,
  'island-of-empty-eyes': islandOfEmptyEyesData,
  'the-price-of-infamy': thePriceOfInfamyData,
  'from-hells-heart': fromHellsHeartData,
};

export default function AdventureLogPage() {
  const { book: rawBook } = useParams<{ book: string | string[] }>();
  const bookSlug = Array.isArray(rawBook) ? rawBook[0] : rawBook;

  const [selectedEntry, setSelectedEntry] = useState<AdventureEntry | null>(null);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const pathname = usePathname();

 // 1) Always scroll to top on route (slug) change
 useEffect(() => {
   // 'auto' is instant; change to 'smooth' if you want animation
   window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
 }, [pathname]);

 // 2) Also scroll to top when opening an entry or switching entries
 useEffect(() => {
   window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
 }, [selectedEntry, currentEntryIndex]);

  const book = adventureBooks[bookSlug as keyof typeof adventureBooks];

  if (!bookSlug) {
    // still resolving on client (very brief)
    return null;
  }
  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-teal-800 to-blue-900">
        <section className="relative bg-gradient-to-b from-teal-900 to-blue-900 text-white">
          <div className="relative max-w-4xl mx-auto px-4 py-16">
            <Link
              href="/shackles/adventure-log" 
              scroll
              className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors mb-8"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Adventure Chronicles
            </Link>
            <h1 className="text-4xl font-bold mb-2">Book Not Found</h1>
            <p className="text-cyan-200">We couldn&apos;t find &quot;{bookSlug}&quot;. Please choose a book from the Adventure Chronicles.</p>
          </div>
        </section>
      </div>
    );
  }

  const entries = book.entries || [];

  const openEntry = (entry: AdventureEntry, index: number) => {
    setSelectedEntry(entry);
    setCurrentEntryIndex(index);
  };

  const closeEntry = () => setSelectedEntry(null);

  const navigateEntry = (direction: 'next' | 'prev') => {
    const newIndex =
      direction === 'next'
        ? Math.min(currentEntryIndex + 1, entries.length - 1)
        : Math.max(currentEntryIndex - 1, 0);

    setCurrentEntryIndex(newIndex);
    setSelectedEntry(entries[newIndex]);
  };

  // Enhanced content processing
  const processContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-teal-900">
            {paragraph.replace('## ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-teal-800">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-700">
          {paragraph}
        </p>
      );
    });
  };

  // If viewing individual entry
  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-teal-800 to-blue-900">
        {/* Entry Header */}
        <div className="relative bg-gradient-to-b from-teal-900 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={closeEntry}
              className="mb-4 flex items-center text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back to {book.title}
            </button>

            <div className="flex items-center text-sm mb-2 text-cyan-200">
              <Calendar size={16} className="mr-2" />
              {selectedEntry.date}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{selectedEntry.title}</h1>
            {selectedEntry.subtitle && <h2 className="text-xl text-cyan-300 mb-4">{selectedEntry.subtitle}</h2>}

            {selectedEntry.isFeatured && (
              <div className="flex items-center text-cyan-300 mb-4">
                <Star size={16} className="mr-2" />
                Featured Entry
              </div>
            )}
          </div>
        </div>

        {/* Entry Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {selectedEntry.image && (
              <div className="mb-8">
                <Image
                  src={selectedEntry.image}
                  alt={selectedEntry.imageCaption || selectedEntry.title}
                  width={600}
                  height={400}
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                {selectedEntry.imageCaption && (
                  <p className="text-center text-gray-600 mt-2 italic text-sm">{selectedEntry.imageCaption}</p>
                )}
              </div>
            )}

            <div className="prose prose-lg max-w-none">{processContent(selectedEntry.content)}</div>

            {/* Character & Location Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-6">
              {selectedEntry.charactersInvolved && selectedEntry.charactersInvolved.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Users size={16} className="mr-2" />
                    Key Characters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.charactersInvolved.map((character: string) => (
                      <span key={character} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {character}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.locationsFeatured && selectedEntry.locationsFeatured.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Locations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.locationsFeatured.map((location: string) => (
                      <span key={location} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigateEntry('prev')}
              disabled={currentEntryIndex === 0}
              className="flex items-center px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous Entry
            </button>

            <span className="text-gray-600">
              {currentEntryIndex + 1} of {entries.length}
            </span>

            <button
              onClick={() => navigateEntry('next')}
              disabled={currentEntryIndex === entries.length - 1}
              className="flex items-center px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  const bookThemes = {
    'wormwood-mutiny': 'from-blue-900 to-teal-800',
    'raiders-of-the-fever-sea': 'from-teal-900 to-blue-800',
    'tempest-rising': 'from-blue-800 to-teal-900',
    'island-of-empty-eyes': 'from-teal-800 to-blue-900',
    'the-price-of-infamy': 'from-blue-900 to-teal-700',
    'from-hells-heart': 'from-teal-900 to-blue-900',
  } as const;

  const currentTheme = bookThemes[bookSlug as keyof typeof bookThemes] || 'from-teal-900 to-blue-900';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-teal-800 to-blue-900">
      {/* Book Header */}
      <section className={`relative bg-gradient-to-b ${currentTheme} text-white`}>
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Link
            href="/shackles/adventure-log"
            className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Adventure Chronicles
          </Link>

          <div className="text-center">
            <div className="text-4xl font-bold mb-4">Book {book.bookNumber}</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{book.title}</h1>
            <h2 className="text-2xl text-cyan-300 mb-8">{book.subtitle}</h2>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">{book.description}</p>

            {/* Book Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold">{book.sessions}</div>
                <div className="text-sm text-gray-300">Sessions</div>
              </div>
              <div className="text-center">
                <BookOpen className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold">{entries.length}</div>
                <div className="text-sm text-gray-300">Entries</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold">{book.keyCharacters.length}</div>
                <div className="text-sm text-gray-300">Characters</div>
              </div>
              <div className="text-center">
                <MapPin className="mx-auto mb-2 text-cyan-300" size={24} />
                <div className="text-lg font-bold">{book.keyLocations.length}</div>
                <div className="text-sm text-gray-300">Locations</div>
              </div>
            </div>

            <div className="mt-8 text-cyan-200">
              <p className="text-lg">{book.dateRange}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Entries */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">Adventure Entries</h2>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-300 mb-4">No entries available yet.</p>
            <p className="text-gray-400">Check back soon for exciting adventure logs!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry, index) => (
              <article
                key={entry.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openEntry(entry, index)}
              >
                <div className="md:flex">
                  {entry.image && (
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-full relative">
                        <Image
                          src={entry.image}
                          alt={entry.imageCaption || entry.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className={`${entry.image ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        {entry.date}
                      </div>
                      {entry.isFeatured && (
                        <div className="flex items-center text-yellow-600">
                          <Star size={16} className="mr-1" />
                          <span className="text-sm font-medium">Featured</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-teal-900 mb-2 hover:text-teal-700 transition-colors">
                      {entry.title}
                    </h3>

                    {entry.subtitle && <h4 className="text-lg text-teal-700 mb-3">{entry.subtitle}</h4>}

                    <p className="text-gray-700 mb-4 leading-relaxed">{entry.excerpt}</p>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 4 && (
                          <span className="text-gray-500 text-xs">+{entry.tags.length - 4} more</span>
                        )}
                      </div>
                    )}

                    <div className="text-teal-800 font-medium hover:text-teal-600 transition-colors">
                      Read Full Entry →
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