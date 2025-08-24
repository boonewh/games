// /app/adventure-log/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, BookOpen, Users, MapPin, ArrowRight, Star } from 'lucide-react';

const adventureBooks = [
  {
    slug: 'forest-spirit',
    title: 'Forest of Spirits',
    subtitle: 'Book 4: Mystical Paths and Ancient Guardians',
    description: 'Our heroes navigate the mystical Forest of Spirits, encounter the House of Withered Blossoms, and face ancient evils in their quest to reach Minkai.',
    bookNumber: 4,
    dateRange: 'April 2023 - August 2023',
    sessions: 12,
    keyCharacters: ['Aelfread', 'Edam', 'Haldir', 'Shura', 'Tim', 'Miyaro'],
    keyLocations: ['Forest of Spirits', 'House of Withered Blossoms', 'Ordu-Aganhei'],
    coverImage: '/images/regent/forest-spirits-cover.jpg',
    status: 'completed',
    featuredEntry: 'The Fall of Munasukaru',
    theme: 'from-green-900 to-green-800'
  },
  {
    slug: 'tide-of-honor',
    title: 'Tide of Honor',
    subtitle: 'Book 5: Forging Alliances in the Shadow of War',
    description: 'Our heroes enter Minkai proper, seeking allies among the noble houses and ninja clans while the Jade Regent\'s tyranny spreads across the land.',
    bookNumber: 5,
    dateRange: 'August 2023 - November 2023',
    sessions: 10,
    keyCharacters: ['Aelfread', 'Edam', 'Haldir', 'Shura', 'Tim', 'Hirabashi Jiro'],
    keyLocations: ['Ronin Camp', 'Seinaru Heikiku', 'Kiniro Kyomai', 'Enganoka'],
    coverImage: '/images/regent/execution.jpg',
    status: 'completed',
    featuredEntry: 'The Sorcerer\'s Last Gambit',
    theme: 'from-blue-900 to-blue-800'
  },
  {
    slug: 'empty-throne',
    title: 'The Empty Throne',
    subtitle: 'Book 6: The Final Chapter',
    description: 'The culmination of our heroes\' journey as they face the Jade Regent in his stronghold and restore the rightful heir to the throne of Minkai.',
    bookNumber: 6,
    dateRange: 'November 2023 - March 2024',
    sessions: 8,
    keyCharacters: ['Aelfread', 'Edam', 'Haldir', 'Shura', 'Tim', 'Ameiko'],
    keyLocations: ['Kasai', 'Imperial Shrine', 'Imperial Palace', 'Well of Demons'],
    coverImage: '/images/regent/palace.jpg',
    status: 'completed',
    featuredEntry: 'The Twilight Throne Room',
    theme: 'from-purple-900 to-purple-800'
  }
];

export default function AdventureLogIndex() {
  const totalSessions = adventureBooks.reduce((sum, book) => sum + book.sessions, 0);
  const dateRange = `${adventureBooks[0].dateRange.split(' - ')[0]} - ${adventureBooks[adventureBooks.length - 1].dateRange.split(' - ')[1]}`;

  return (
    <div className="min-h-screen bg-[#EFCAA3]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-900 to-red-800 text-white">
        <Image
          src={`/images/regent/forestSpirts.jpg`}
          alt={`Forest of Spirits cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Adventure Chronicles
            </h1>
            <h2 className="text-2xl md:text-3xl text-yellow-300 mb-8">
              The Jade Regent Campaign
            </h2>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Follow our band of heroes through their epic journey across Tian Xia, from the mystical 
              Forest of Spirits to the final confrontation in the Imperial Palace. Thirty years of 
              friendship forged in digital fire, chronicled for all to experience.
            </p>
            
            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <BookOpen className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">{adventureBooks.length}</div>
                <div className="text-sm text-gray-300">Books</div>
              </div>
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-gray-300">Sessions</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-gray-300">Heroes</div>
              </div>
              <div className="text-center">
                <MapPin className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm text-gray-300">Locations</div>
              </div>
            </div>
            
            <div className="mt-8 text-yellow-200">
              <p className="text-lg">{dateRange}</p>
              <p className="text-sm mt-2 italic">
                &ldquo;Warning! Spoilers for the Jade Regent Adventure Path ahead.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Books */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-red-900 mb-4 text-center">
          The Chronicle Unfolds
        </h2>
        <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
          Each book represents a pivotal chapter in our heroes&apos; journey. Click to explore the
          detailed adventure logs, character moments, and epic battles that shaped their destiny.
        </p>
        
        <div className="grid gap-8">
          {adventureBooks.map((book, index) => (
            <Link 
              key={book.slug}
              href={`/regent/adventure-log/${book.slug}`}
              className="group block"
            >
              <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                <div className="md:flex">
                  {/* Book Cover */}
                  <div className="md:w-1/3 relative">
                      <Image
                        src={book.coverImage}
                        alt={`${book.title} cover`}
                        fill
                        className="object-cover"
                      />
                    <div className={`h-64 md:h-full flex items-center justify-center text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/60" />
                      <div className="relative text-center p-6">
                        <div className="text-4xl font-bold mb-2">Book {book.bookNumber}</div>
                        <div className="text-lg font-medium">{book.title}</div>
                        <div className="text-sm opacity-90 mt-2">{book.subtitle}</div>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-red-900 group-hover:text-red-700 transition-colors">
                        {book.title}
                      </h3>
                      <ArrowRight className="text-red-800 group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                    
                    <h4 className="text-lg text-red-700 mb-3">{book.subtitle}</h4>
                    
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {book.description}
                    </p>
                    
                    {/* Book Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-red-800" />
                        {book.dateRange}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2 text-red-800" />
                        {book.sessions} Sessions
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-red-800" />
                        {book.keyCharacters.length} Characters
                      </div>
                    </div>
                    
                    {/* Featured Entry */}
                    <div className="flex items-center text-sm text-yellow-600 mb-4">
                      <Star size={16} className="mr-2" />
                      Featured: {book.featuredEntry}
                    </div>
                    
                    {/* Key Locations */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Key Locations:</h5>
                      <div className="flex flex-wrap gap-2">
                        {book.keyLocations.slice(0, 4).map(location => (
                          <span 
                            key={location}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {location}
                          </span>
                        ))}
                        {book.keyLocations.length > 4 && (
                          <span className="text-gray-500 text-xs">
                            +{book.keyLocations.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-red-800 font-medium group-hover:text-red-600 transition-colors">
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
      <section className="bg-gradient-to-r from-red-900 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin the Journey?</h2>
          <p className="text-xl mb-8">
            Start with Book 4 and follow our heroes as they navigate mystical forests, 
            forge crucial alliances, and ultimately face the Jade Regent himself.
          </p>
          <Link 
            href="/regent/adventure-log/forest-spirit"
            className="inline-flex items-center px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold rounded-lg transition-colors duration-300 shadow-lg"
          >
            Start Reading: Forest of Spirits
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}