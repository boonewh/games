'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPastAdventuresOpen, setIsPastAdventuresOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const togglePastAdventures = () => {
    setIsPastAdventuresOpen(!isPastAdventuresOpen);
  };

  return (
    <>
      {/* Floating Logo - Fixed position, completely independent */}
      <div className="fixed top-4 left-4 z-50 group cursor-pointer">
        <Link href="/">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
            {/* Wardstone glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-wardstone-blue/30 via-wotr-gold/30 to-abyssal-red/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-500 opacity-70 group-hover:opacity-100"></div>

            {/* Logo container */}
            <div className="relative w-full h-full bg-stone-dark/90 backdrop-blur-sm rounded-full border border-wotr-gold/30 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-[0_0_20px_rgba(197,179,88,0.3)]">
              <Image
                src="/images/winter/pathsix-games-logo.jpg"
                alt="PathSix Games"
                fill
                className="object-cover"
                priority
              />

              {/* Inner glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-wardstone-blue/20 via-transparent to-wotr-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Magical particles effect - Wardstone themed */}
            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-wardstone-blue rounded-full animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-wotr-gold rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute top-1/2 left-0 w-1 h-1 bg-wardstone-blue rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-wotr-gold rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Header - Wrath themed */}
      <header className="relative bg-gradient-to-r from-stone-dark via-stone-light to-stone-dark border-b border-wotr-gold/30 shadow-2xl">
        {/* Mystical overlay texture */}
        <div className="absolute inset-0 bg-gradient-to-r from-wardstone-blue/10 via-transparent to-wotr-gold/10 pointer-events-none"></div>

        <nav className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Site Title - Left side, but with padding to avoid logo */}
            <Link href="/" className="flex items-center">
              <div className="hidden md:block pl-20 sm:pl-24 lg:pl-28">
                <h1 className="font-cinzel text-xl lg:text-4xl font-bold text-wotr-gold tracking-wide select-none">
                  PathSix Games
                </h1>
              </div>
            </Link>

            {/* Mobile spacer to avoid logo overlap */}
            <div className="md:hidden w-20 sm:w-24"></div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 bg-stone-light/50 backdrop-blur-sm rounded-full px-2 py-1 border border-zinc-800">
                <Link
                  href="/wrath/about"
                  className="px-4 py-2 rounded-full text-parchment hover:text-wardstone-blue hover:bg-stone-dark/70 transition-all duration-300 font-medium text-lg font-spectral"
                >
                  About
                </Link>

                <Link
                  href="/wrath/adventure-log"
                  className="px-4 py-2 rounded-full text-parchment hover:text-wardstone-blue hover:bg-stone-dark/70 transition-all duration-300 font-medium text-lg font-spectral"
                >
                  Adventure Log
                </Link>

                <Link
                  href="/wrath/dice"
                  className="px-4 py-2 rounded-full text-parchment hover:text-wardstone-blue hover:bg-stone-dark/70 transition-all duration-300 font-medium text-lg font-spectral"
                >
                  Dice Roller
                </Link>

                {/* Past Adventures Dropdown */}
                <div className="relative">
                  <button
                    onClick={togglePastAdventures}
                    className="px-4 py-2 rounded-full text-parchment hover:text-wardstone-blue hover:bg-stone-dark/70 transition-all duration-300 font-medium text-lg font-spectral flex items-center space-x-1"
                  >
                    <span>Past Adventures</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${isPastAdventuresOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isPastAdventuresOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-stone-light/95 backdrop-blur-sm border border-wotr-gold/30 rounded-lg shadow-2xl z-50">
                      <div className="py-2">
                        <Link
                          href="/shackles"
                          className="block px-4 py-2 text-sm text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-spectral"
                          onClick={() => setIsPastAdventuresOpen(false)}
                        >
                          Skull & Shackles
                        </Link>
                        <Link
                          href="/regent"
                          className="block px-4 py-2 text-sm text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-spectral"
                          onClick={() => setIsPastAdventuresOpen(false)}
                        >
                          Jade Regent
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/wrath/rules"
                  className="px-4 py-2 rounded-full text-parchment hover:text-wardstone-blue hover:bg-stone-dark/70 transition-all duration-300 font-medium text-lg font-spectral"
                >
                  Rules
                </Link>
              </div>
            </div>

            {/* Right side - Call to action button and mobile menu */}
            <div className="flex items-center space-x-3">

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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

      {/* Mobile Navigation Overlay - MOVED OUTSIDE HEADER for proper positioning */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Mobile Menu */}
          <div className="fixed top-16 left-4 right-4 z-50 lg:hidden">
            <div className="bg-stone-light/95 backdrop-blur-sm rounded-lg border border-wotr-gold/30 shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                <Link
                  href="/wrath"
                  className="block px-4 py-3 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home Page
                </Link>

                <Link
                  href="/wrath/about"
                  className="block px-4 py-3 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>

                <Link
                  href="/wrath/adventure-log"
                  className="block px-4 py-3 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Adventure Log
                </Link>

                <Link
                  href="/wrath/dice"
                  className="block px-4 py-3 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dice Roller
                </Link>

                {/* Mobile Past Adventures */}
                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-4 font-cinzel">Past Adventures</div>
                  <Link
                    href="/shackles"
                    className="block px-4 py-2 ml-4 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-spectral"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Skull & Shackles
                  </Link>
                  <Link
                    href="/regent"
                    className="block px-4 py-2 ml-4 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-spectral"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jade Regent
                  </Link>
                </div>

                <Link
                  href="/wrath/rules"
                  className="block px-4 py-3 rounded-lg text-parchment hover:text-wardstone-blue hover:bg-stone-dark/50 transition-all duration-300 font-medium font-spectral"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Rules Page
                </Link>

                {/* Mobile call to action */}
                <div className="pt-4 border-t border-zinc-800 mt-4">
                  <Link
                    href="/wrath/adventure-log"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-wardstone-blue to-wotr-gold text-stone-dark rounded-lg hover:from-wardstone-blue/80 hover:to-wotr-gold/80 transition-all duration-300 font-medium font-cinzel"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Latest Adventure
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
