// app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#30393e]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-900 to-blue-800 text-[#c6c4ba]">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-['Alkatra'] font-bold mb-6">
              About Us
            </h1>
            <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Thirty-seven years of friendship, adventure, and storytelling around the table
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Text Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#c6c4ba] mb-6 font-['Alkatra']">
                The Beginning
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                In January 1986 a group met for the first time to play a session of Dungeons & Dragons. 
                Out of the five people at that session, two of them are in the group today, 37 years later.
              </p>
              <p className="text-gray-300 leading-relaxed">
                At about the same time, two other members of this group were having regular games with 
                friends from school.
              </p>
            </div>

            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#c6c4ba] mb-6 font-['Alkatra']">
                Coming Together
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                These four people would eventually all meet and begin playing regular Dungeons & Dragons sessions 
                together. Through the years there have been many others who have come and gone, but we 
                remember them all.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our group has known each other for a long time. Even the newest members have known 
                one of our members for many years. We&apos;ve been together through good and bad. Marriages, 
                a divorce, job changes, and more. As I said, the group has lost some members through the 
                years who we miss, but the current group has become close.
              </p>
            </div>

            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#c6c4ba] mb-6 font-['Alkatra']">
                Evolution of Our Game
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We&apos;ve played so many editions of different games through the years. D&D 1st edition, 2nd, 3rd, 
                3.5. It was only when we hit 4th edition, and couldn&apos;t stomach the rot, that we had to go a 
                different direction. One of our new members back then, still with us 15 years later, offered 
                to be the storyteller for a game most of us had never heard of: Pathfinder. In reality it was 
                mostly the game that we had been playing for the past several years, a version of D&D 3.5, 
                so naturally we loved it.
              </p>
              <p className="text-gray-300 leading-relaxed">
                As we&apos;ve continued playing Pathfinder, we&apos;ve decided to stick to the adventure paths and share 
                storytelling duties. Currently three of us take turns running an adventure.
              </p>
            </div>

            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#c6c4ba] mb-6 font-['Alkatra']">
                Our Philosophy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you look at our house rules and ask &quot;why?&quot; on anything, know that we discussed our house rules 
                before implementing any of them and came to a consensus. We have tweaked the game to be what 
                we want to play, what we love. And that&apos;s the point, isn&apos;t it?
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="md:col-span-1">
            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-6 sticky top-8">
              <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/winter/shadowcat.jpg"
                  alt="Shadow, our beloved companion"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-lg font-bold text-[#c6c4ba] mb-2 font-['Alkatra'] text-center">
                Shadow
              </h3>
              <p className="text-gray-300 text-sm text-center">
                Our faithful companion through many adventures
              </p>
            </div>

            {/* Additional Info Card */}
            <div className="bg-black/60 border border-[#c6c4ba]/20 rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-[#c6c4ba] mb-4 font-['Alkatra']">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span className="text-sm">Founded: January 1986</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span className="text-sm">37+ years of gaming</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span className="text-sm">Current System: Pathfinder</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span className="text-sm">Shared Storytelling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-800 text-[#c6c4ba] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-['Alkatra']">Ready to Join Our Adventures?</h2>
          <p className="text-xl mb-8">
            Explore our chronicles and witness the legends we&apos;ve forged together over nearly four decades.
          </p>
          <Link 
            href="/shackles/adventure-log"
            className="inline-flex items-center px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors duration-300 shadow-lg font-['Alkatra']"
          >
            Explore Our Adventures
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}