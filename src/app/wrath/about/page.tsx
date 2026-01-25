import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/wrath/Header';
import Footer from '@/components/wrath/Footer';

export default function WrathAboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-stone-dark font-spectral">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-purple-950 to-stone-dark text-parchment">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-cinzel font-bold mb-6 text-wotr-gold uppercase tracking-widest">
                About Us
              </h1>
              <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed text-parchment/80">
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
              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 font-cinzel uppercase tracking-wider">
                  The Beginning
                </h2>
                <p className="text-parchment/80 leading-relaxed mb-4">
                  In January 1986 a group met for the first time to play a session of Dungeons & Dragons.
                  Out of the five people at that session, two of them are in the group today, 37 years later.
                </p>
                <p className="text-parchment/80 leading-relaxed">
                  At about the same time, two other members of this group were having regular games with
                  friends from school.
                </p>
              </div>

              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 font-cinzel uppercase tracking-wider">
                  Coming Together
                </h2>
                <p className="text-parchment/80 leading-relaxed mb-4">
                  These four people would eventually all meet and begin playing regular Dungeons & Dragons sessions
                  together. Through the years there have been many others who have come and gone, but we
                  remember them all.
                </p>
                <p className="text-parchment/80 leading-relaxed">
                  Our group has known each other for a long time. Even the newest members have known
                  one of our members for many years. We&apos;ve been together through good and bad. Marriages,
                  a divorce, job changes, and more. As I said, the group has lost some members through the
                  years who we miss, but the current group has become close.
                </p>
              </div>

              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 font-cinzel uppercase tracking-wider">
                  Evolution of Our Game
                </h2>
                <p className="text-parchment/80 leading-relaxed mb-4">
                  We&apos;ve played so many editions of different games through the years. D&D 1st edition, 2nd, 3rd,
                  3.5. It was only when we hit 4th edition, and couldn&apos;t stomach the rot, that we had to go a
                  different direction. One of our new members back then, still with us 15 years later, offered
                  to be the storyteller for a game most of us had never heard of: Pathfinder. In reality it was
                  mostly the game that we had been playing for the past several years, a version of D&D 3.5,
                  so naturally we loved it.
                </p>
                <p className="text-parchment/80 leading-relaxed">
                  As we&apos;ve continued playing Pathfinder, we&apos;ve decided to stick to the adventure paths and share
                  storytelling duties. Currently three of us take turns running an adventure.
                </p>
              </div>

              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 font-cinzel uppercase tracking-wider">
                  Our Philosophy
                </h2>
                <p className="text-parchment/80 leading-relaxed">
                  If you look at our house rules and ask &quot;why?&quot; on anything, know that we discussed our house rules
                  before implementing any of them and came to a consensus. We have tweaked the game to be what
                  we want to play, what we love. And that&apos;s the point, isn&apos;t it?
                </p>
              </div>
            </div>

            {/* Image Section */}
            <div className="md:col-span-1">
              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-6 sticky top-8">
                <div className="relative w-full h-64 mb-4 rounded-sm overflow-hidden">
                  <Image
                    src="/images/wrath/placeholder-shadow.jpg"
                    alt="Shadow, our beloved companion"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-lg font-bold text-wotr-gold mb-2 font-cinzel text-center uppercase tracking-wider">
                  Shadow
                </h3>
                <p className="text-parchment/70 text-sm text-center">
                  Our faithful companion through many adventures
                </p>
              </div>

              {/* Additional Info Card */}
              <div className="bg-stone-light/40 border border-zinc-800 rounded-sm shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-wotr-gold mb-4 font-cinzel uppercase tracking-wider">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-parchment/80">
                    <span className="text-wardstone-blue mr-2">•</span>
                    <span className="text-sm">Founded: January 1986</span>
                  </div>
                  <div className="flex items-center text-parchment/80">
                    <span className="text-wardstone-blue mr-2">•</span>
                    <span className="text-sm">37+ years of gaming</span>
                  </div>
                  <div className="flex items-center text-parchment/80">
                    <span className="text-wardstone-blue mr-2">•</span>
                    <span className="text-sm">Current System: Pathfinder</span>
                  </div>
                  <div className="flex items-center text-parchment/80">
                    <span className="text-wardstone-blue mr-2">•</span>
                    <span className="text-sm">Shared Storytelling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-950 to-stone-900 text-parchment py-16 border-t border-b border-wotr-gold/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-cinzel text-wotr-gold uppercase tracking-widest">Ready to Join Our Adventures?</h2>
            <p className="text-xl mb-8 text-parchment/80">
              Explore our chronicles and witness the legends we&apos;ve forged together over nearly four decades.
            </p>
            <Link
              href="/wrath/adventure-log"
              className="inline-flex items-center px-8 py-3 bg-wotr-gold hover:bg-wotr-gold/90 text-stone-dark font-bold rounded-sm transition-colors duration-300 shadow-lg font-cinzel uppercase tracking-wider"
            >
              Explore Our Adventures
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
