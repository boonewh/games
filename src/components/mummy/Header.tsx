'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Main nav points at on-page sections (this is a single-scroll landing page).
const SECTIONS = [
  { href: '/mummy#party', label: 'The Four' },
  { href: '/mummy#map', label: 'The Map' },
  { href: '/mummy#log', label: 'Chronicle' },
  { href: '/mummy#gallery', label: 'Plates' },
];

const PAST_ADVENTURES = [
  { href: '/regent', label: 'Jade Regent' },
  { href: '/shackles', label: 'Skull & Shackles' },
  { href: '/winter', label: 'Reign of Winter' },
  { href: '/wrath', label: 'Wrath of the Righteous' },
];

const RESOURCES = [
  { href: 'https://www.aonprd.com/', label: 'Archives of Nethys' },
  { href: 'https://www.d20pfsrd.com/extras/community-creations/fgf-houserules/vcg-gestalt-multiclassing/', label: 'Gestalt Characters' },
  { href: 'https://www.sortekanin.com/collection/items/', label: "SorteKanin's Treasure Generator" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPastAdventuresOpen, setIsPastAdventuresOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Floating Logo — fixed, independent */}
      <div className="fixed top-4 left-4 z-50 group cursor-pointer">
        <Link href="/">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
            {/* Portal glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-mm-teal/30 via-mm-amber/30 to-mm-gold/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-500 opacity-70 group-hover:opacity-100"></div>

            <div className="relative w-full h-full bg-mm-night/90 backdrop-blur-sm rounded-full border border-mm-gold/30 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-[0_0_20px_rgba(43,224,201,0.3)]">
              <Image
                src="/images/winter/pathsix-games-logo.jpg"
                alt="PathSix Games"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-mm-teal/20 via-transparent to-mm-amber/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Portal motes on hover */}
            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-mm-teal rounded-full animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-mm-amber rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-1/2 left-0 w-1 h-1 bg-mm-teal rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-mm-gold rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${scrolled ? 'bg-gradient-to-r from-mm-night via-mm-dusk-alt to-mm-night border-b border-mm-gold/30 shadow-2xl' : 'bg-transparent border-b border-transparent'}`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-mm-teal/10 via-transparent to-mm-amber/10 pointer-events-none transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>

        <nav className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Site Title */}
            <Link href="/" className="flex items-center">
              <div className="hidden md:block pl-20 sm:pl-24 lg:pl-28">
                <h1 className="font-cinzel text-xl lg:text-4xl font-bold text-mm-stone tracking-wide select-none">
                  PathSix Games
                </h1>
              </div>
            </Link>

            {/* Mobile spacer to clear the floating logo */}
            <div className="md:hidden w-20 sm:w-24"></div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 bg-mm-dusk-alt/50 backdrop-blur-sm rounded-full px-2 py-1 border border-mm-cardline">
                {SECTIONS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="px-4 py-2 rounded-full text-mm-ink hover:text-mm-teal hover:bg-mm-night/70 transition-all duration-300 font-medium text-lg font-spectral"
                  >
                    {s.label}
                  </Link>
                ))}

                {/* Past Adventures Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsPastAdventuresOpen(!isPastAdventuresOpen)}
                    className="px-4 py-2 rounded-full text-mm-ink hover:text-mm-teal hover:bg-mm-night/70 transition-all duration-300 font-medium text-lg font-spectral flex items-center space-x-1"
                  >
                    <span>Past Adventures</span>
                    <svg className={`w-3 h-3 transition-transform duration-200 ${isPastAdventuresOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isPastAdventuresOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-mm-dusk-alt/95 backdrop-blur-sm border border-mm-gold/30 rounded-lg shadow-2xl z-50">
                      <div className="py-2">
                        {PAST_ADVENTURES.map((a) => (
                          <Link
                            key={a.href}
                            href={a.href}
                            className="block px-4 py-2 text-sm text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-spectral"
                            onClick={() => setIsPastAdventuresOpen(false)}
                          >
                            {a.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                    className="px-4 py-2 rounded-full text-mm-ink hover:text-mm-teal hover:bg-mm-night/70 transition-all duration-300 font-medium text-lg font-spectral flex items-center space-x-1"
                  >
                    <span>Resources</span>
                    <svg className={`w-3 h-3 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isResourcesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-mm-dusk-alt/95 backdrop-blur-sm border border-mm-gold/30 rounded-lg shadow-2xl z-50">
                      <div className="py-2">
                        {RESOURCES.map((r) => (
                          <a
                            key={r.href}
                            href={r.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-sm text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-spectral"
                            onClick={() => setIsResourcesOpen(false)}
                          >
                            {r.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300"
                aria-label="Toggle navigation menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className="fixed top-16 left-4 right-4 z-50 lg:hidden">
            <div className="bg-mm-dusk-alt/95 backdrop-blur-sm rounded-lg border border-mm-gold/30 shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                <Link
                  href="/"
                  className="block px-4 py-3 rounded-lg text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home Page
                </Link>

                {SECTIONS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-4 py-3 rounded-lg text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-medium font-spectral"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}

                {/* Mobile Past Adventures */}
                <div>
                  <div className="text-xs font-semibold text-mm-ink-soft uppercase tracking-wider mb-3 px-4 font-cinzel">Past Adventures</div>
                  {PAST_ADVENTURES.map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="block px-4 py-2 ml-4 rounded-lg text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-spectral"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Resources */}
                <div>
                  <div className="text-xs font-semibold text-mm-ink-soft uppercase tracking-wider mb-3 px-4 font-cinzel">Resources</div>
                  {RESOURCES.map((r) => (
                    <a
                      key={r.href}
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 ml-4 rounded-lg text-mm-ink hover:text-mm-teal hover:bg-mm-night/50 transition-all duration-300 font-spectral"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {r.label}
                    </a>
                  ))}
                </div>

                <div className="pt-4 border-t border-mm-cardline mt-4">
                  <Link
                    href="/mummy#log"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-mm-teal to-mm-amber text-mm-night rounded-lg hover:from-mm-teal/80 hover:to-mm-amber/80 transition-all duration-300 font-medium font-cinzel"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Latest Dispatch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
