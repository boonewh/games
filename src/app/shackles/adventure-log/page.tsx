'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, BookOpen, Users, MapPin, ArrowRight, Star } from 'lucide-react';

const adventureBooks = [
  {
    slug: 'wormwood-mutiny',
    title: 'The Wormwood Mutiny',
    subtitle: 'Book 1: Press-Ganged into Piracy',
    description: 'Our heroes find themselves shanghaied aboard the pirate vessel Wormwood, where they must prove their worth or walk the plank in this opening chapter of their pirate careers.',
    bookNumber: 1,
    dateRange: 'March 2024 - April 2024',
    sessions: 7,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Captain Harrigan', 'Mr. Plugg', 'Scourge', 'Sandara Quinn'],
    keyLocations: ['The Wormwood', 'Man\'s Promise', 'Bonewrack Isle', 'Port Peril', 'The Shackles'],
    coverImage: "/images/shackles/mans-promise.jpg",
    status: 'completed',
    featuredEntry: 'The Rebellion on the Man\'s Promise',
    theme: 'from-blue-900 to-blue-800'
  },
  {
    slug: 'raiders-of-the-fever-sea',
    title: 'Raiders of the Fever Sea',
    subtitle: 'Book 2: Building a Pirate Fleet',
    description: 'Having claimed their own ship, our heroes begin building their reputation as pirates while navigating the treacherous politics of the Shackles.',
    bookNumber: 2,
    dateRange: 'April 2024 - July 2024',
    sessions: 10,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Tessa Fairwind', 'Pegsworthy', 'Lady Smythee', 'Isabella Locke'],
    keyLocations: ['Scourge\'s Bane', 'Rickety\'s Squibs', 'Tidewater Rock', 'Mancatcher Cove', 'Bloodcove', 'Quent'],
    coverImage: '/images/shackles/mancatcher_cove_cave.jpg',
    status: 'completed',
    featuredEntry: 'The Final Battle with the Thresher',
    theme: 'from-teal-900 to-teal-800'
  },
  {
    slug: 'tempest-rising',
    title: 'Tempest Rising',
    subtitle: 'Book 3: Storms and Alliances',
    description: 'Political intrigue intensifies as our pirates become embroiled in the complex web of alliances that govern the Shackles, culminating in their victory at the Free Captains\' Regatta.',
    bookNumber: 3,
    dateRange: 'July 2024 - August 2024',
    sessions: 9,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Tessa Fairwind', 'Hurricane King', 'Tsadok Goldtooth', 'Zarskia Galembar', 'Master of the Gales'],
    keyLocations: ['Port Peril', 'Quent', 'Beachcomber', 'Ollo', 'Drenchport', 'Hell Harbor', 'Rampore Isles', 'Eye of Abendego', 'Cauldron Rock'],
    coverImage: '/images/shackles/free_captains_regatta.jpg',
    status: 'completed',
    featuredEntry: 'The Free Captains\' Regatta',
    theme: 'from-slate-900 to-slate-800'
  },
  {
    slug: 'island-of-empty-eyes',
    title: 'Island of Empty Eyes',
    subtitle: 'Book 4: Secrets of the Cyclops',
    description: 'Our heroes uncover ancient mysteries on a mysterious island while facing challenges that test their growing power, culminating in claiming their own domain and earning their place on the Pirate Council.',
    bookNumber: 4,
    dateRange: 'August 2024 - November 2024',
    sessions: 10,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Ederleigh Baines', 'Bikendi Otongu', 'Sefina', 'Audessa Reyquio', 'Lord Avimar Sorrinash', 'Lady Cerise Bloodmourn', 'Captain Mase Darimar'],
    keyLocations: ['Island of Empty Eyes', 'Sumitha', 'Fort', 'Underwater Shrine', 'Pirate Council Feast', 'Sefina\'s Grotto', 'Cyclops Tower', 'Treant Grove'],
    coverImage: '/images/shackles/empty-eyes-cover.jpg',
    status: 'completed',
    featuredEntry: 'The Feast and the Fireworks',
    theme: 'from-emerald-900 to-emerald-800'
  },
  {
    slug: 'the-price-of-infamy',
    title: 'The Price of Infamy',
    subtitle: 'Book 5: Rise to Power',
    description: 'As their infamy grows, our heroes face the consequences of their actions and the price of power in the lawless Shackles, culminating in their epic confrontation with Barnabas Harrigan.',
    bookNumber: 5,
    dateRange: 'October 2024 - December 2024',
    sessions: 7,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Tessa Fairwind', 'Hurricane King', 'Barnabas Harrigan', 'Valerande Aiger', 'Pierce Jerrell', 'Merrill Pegsworthy', 'Arronax Endymion'],
    keyLocations: ['Port Peril', 'Island of Empty Eyes', 'Black Tower', 'Dagon\'s Jaws', 'Hell Harbor', 'Gannet Island', 'Harrigan\'s Fortress'],
    coverImage: '/images/shackles/price-infamy-cover.jpg',
    status: 'completed',
    featuredEntry: 'The Tyrant\'s Fall',
    theme: 'from-red-900 to-red-800'
  },
  {
    slug: 'from-hells-heart',
    title: 'From Hell\'s Heart',
    subtitle: 'Book 6: The Final Reckoning',
    description: 'The epic conclusion as our heroes face their greatest challenge and determine the future of the Shackles themselves, culminating in Kasmira\'s rise to become the Hurricane Queen.',
    bookNumber: 6,
    dateRange: 'December 2024 - February 2025',
    sessions: 6,
    keyCharacters: ['Kasmira', 'Finn', 'Red', 'Varen', 'Admiral Thrune', 'Kerdak Bonefist', 'Tessa Fairwind', 'Tsadok Goldtooth', 'Master of Gales', 'Arronax Endymion'],
    keyLocations: ['Gannet Island', 'Port Peril', 'Quent', 'Hell Harbor', 'Drenchport', 'Fort Hazard', 'Lucrehold', 'Filthy Lucre'],
    coverImage: '/images/shackles/hells-heart-cover.jpg',
    status: 'completed',
    featuredEntry: 'The Hurricane Crown',
    theme: 'from-amber-900 to-amber-800'
  }
];

export default function ShacklesAdventureIndex() {
  const totalSessions = adventureBooks.reduce((sum, book) => sum + book.sessions, 0);
  const dateRange = `${adventureBooks[0].dateRange.split(' - ')[0]} - ${adventureBooks[adventureBooks.length - 1].dateRange.split(' - ')[1]}`;

  return (
    <div className="min-h-screen bg-[#30393e]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-900 to-blue-800 text-[#c6c4ba]">
        <Image
          src="/images/shackles/heroAlt.jpg"
          alt="Ship on the high seas"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-['Alkatra'] font-bold mb-6">
              Adventure Chronicles
            </h1>
            <h2 className="text-2xl md:text-3xl text-yellow-300 mb-8 font-['Alkatra']">
              The Skull & Shackles Campaign
            </h2>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Follow the rise of four unlikely heroes from press-ganged prisoners aboard the pirate vessel <em>Wormwood</em> to legendary pirate lords of the Shackles. A tale of mutiny, adventure, friendship, and the pursuit of freedom on the high seas that culminates with Kasmira de la Torre claiming the Hurricane Crown itself.
            </p>
            
            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <BookOpen className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold font-['Alkatra']">{adventureBooks.length}</div>
                <div className="text-sm text-gray-300">Books</div>
              </div>
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold font-['Alkatra']">{totalSessions}</div>
                <div className="text-sm text-gray-300">Sessions</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold font-['Alkatra']">4</div>
                <div className="text-sm text-gray-300">Pirates</div>
              </div>
              <div className="text-center">
                <MapPin className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="text-2xl font-bold font-['Alkatra']">25+</div>
                <div className="text-sm text-gray-300">Locations</div>
              </div>
            </div>
            
            <div className="mt-8 text-yellow-200">
              <p className="text-lg font-['Alkatra']">{dateRange}</p>
              <p className="text-sm mt-2 italic">
                &ldquo;Warning! Spoilers for the Skull & Shackles Adventure Path ahead.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Books */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-[#c6c4ba] mb-4 text-center font-['Alkatra']">
          The Pirate Chronicles
        </h2>
        <p className="text-lg text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Each book chronicles a crucial chapter in our heroes&apos; rise from shanghaied victims 
          to masters of the Shackles. Click to explore the detailed adventure logs, epic battles, 
          and memorable moments that shaped their legend.
        </p>
        
        <div className="grid gap-8">
          {adventureBooks.map((book) => (
            <Link 
              key={book.slug}
              href={`/shackles/adventure-log/${book.slug}`}
              className="group block"
            >
              <article className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 hover:border-[#c6c4ba]/40">
                <div className="md:flex">
                  {/* Book Cover */}
                  <div className="md:w-1/3 relative">
                    <Image
                      src={book.coverImage}
                      alt={`${book.title} cover`}
                      fill
                      className="object-cover"
                    />
                    <div className={`h-64 md:h-full flex items-center justify-center text-[#c6c4ba] relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/70" />
                      <div className="relative text-center p-6">
                        <div className="text-4xl font-bold mb-2 font-['Alkatra']">Book {book.bookNumber}</div>
                        <div className="text-lg font-medium font-['Alkatra']">{book.title}</div>
                        <div className="text-sm opacity-90 mt-2">{book.subtitle}</div>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-blue-600 text-[#c6c4ba] text-xs rounded-full">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-[#c6c4ba] group-hover:text-yellow-300 transition-colors font-['Alkatra']">
                        {book.title}
                      </h3>
                      <ArrowRight className="text-[#c6c4ba] group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                    
                    <h4 className="text-lg text-yellow-400 mb-3 font-['Alkatra']">{book.subtitle}</h4>
                    
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {book.description}
                    </p>
                    
                    {/* Book Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={16} className="mr-2 text-blue-400" />
                        {book.dateRange}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <BookOpen size={16} className="mr-2 text-blue-400" />
                        {book.sessions} Sessions
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Users size={16} className="mr-2 text-blue-400" />
                        {book.keyCharacters.length} Characters
                      </div>
                    </div>
                    
                    {/* Featured Entry */}
                    <div className="flex items-center text-sm text-yellow-400 mb-4">
                      <Star size={16} className="mr-2" />
                      Featured: {book.featuredEntry}
                    </div>
                    
                    {/* Key Locations */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-[#c6c4ba] mb-2">Key Locations:</h5>
                      <div className="flex flex-wrap gap-2">
                        {book.keyLocations.slice(0, 4).map(location => (
                          <span 
                            key={location}
                            className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-600/30 rounded text-xs"
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
                    
                    <div className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors font-['Alkatra']">
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
      <section className="bg-gradient-to-r from-blue-900 to-slate-800 text-[#c6c4ba] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-['Alkatra']">Ready to Set Sail?</h2>
          <p className="text-xl mb-8">
            Begin with the crew&apos;s first fateful voyage aboard the Wormwood and follow their 
            transformation from prisoners to pirate legends of the Shackles, culminating in Kasmira&apos;s 
            rise to become the Hurricane Queen herself.
          </p>
          <Link 
            href="/shackles/adventure-log/wormwood-mutiny"
            className="inline-flex items-center px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors duration-300 shadow-lg font-['Alkatra']"
          >
            Start Reading: The Wormwood Mutiny
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}