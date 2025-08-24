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
            {/* Magical glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-500 opacity-70 group-hover:opacity-100"></div>
            
            {/* Logo container */}
            <div className="relative w-full h-full bg-slate-800/90 backdrop-blur-sm rounded-full border border-blue-400/30 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl">
              <Image
                src="/images/winter/pathsix-games-logo.jpg"
                alt="PathSix Games"
                fill
                className="object-cover"
                priority
              />
              
              {/* Inner glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Magical particles effect */}
            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute top-1/2 left-0 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-slate-800/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-slate-600/30">
              PathSix Games
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600/30"></div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Header - Now has full width without logo interference */}
      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-600/30 shadow-2xl">
        {/* Mystical overlay texture */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>

        <nav className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Site Title - Left side, but with padding to avoid logo */}
            <div className="hidden md:block pl-20 sm:pl-24 lg:pl-28">
              <h1 className="font-alkatra text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                PathSix Games
              </h1>
              <p className="text-sm text-slate-400 mt-1">Reign of Winter</p>
            </div>

            {/* Mobile spacer to avoid logo overlap */}
            <div className="md:hidden w-20 sm:w-24"></div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-sm rounded-full px-2 py-1 border border-slate-600/30">
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-full text-slate-200 hover:text-blue-200 hover:bg-slate-700/70 transition-all duration-300 font-medium text-sm"
                >
                  Home
                </Link>
                
                <Link 
                  href="/book/snows-of-summer" 
                  className="px-4 py-2 rounded-full text-slate-200 hover:text-blue-200 hover:bg-slate-700/70 transition-all duration-300 font-medium text-sm"
                >
                  Adventure Log
                </Link>
                
                <Link 
                  href="/dice" 
                  className="px-4 py-2 rounded-full text-slate-200 hover:text-blue-200 hover:bg-slate-700/70 transition-all duration-300 font-medium text-sm"
                >
                  Dice Roller
                </Link>

                {/* Past Adventures Dropdown */}
                <div className="relative">
                  <button
                    onClick={togglePastAdventures}
                    className="px-4 py-2 rounded-full text-slate-200 hover:text-blue-200 hover:bg-slate-700/70 transition-all duration-300 font-medium text-sm flex items-center space-x-1"
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
                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-sm border border-slate-600/30 rounded-lg shadow-2xl z-50">
                      <div className="py-2">
                        <Link 
                          href="/shackles" 
                          className="block px-4 py-2 text-sm text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300"
                          onClick={() => setIsPastAdventuresOpen(false)}
                        >
                          Skull & Shackles
                        </Link>
                        <Link 
                          href="/regent" 
                          className="block px-4 py-2 text-sm text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300"
                          onClick={() => setIsPastAdventuresOpen(false)}
                        >
                          Jade Regent
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <Link 
                  href="/rules" 
                  className="px-4 py-2 rounded-full text-slate-200 hover:text-blue-200 hover:bg-slate-700/70 transition-all duration-300 font-medium text-sm"
                >
                  Rules
                </Link>
              </div>
            </div>

            {/* Right side - Call to action button and mobile menu */}
            <div className="flex items-center space-x-3">
              {/* Call to action button */}
              <Link
                href="/book/snows-of-summer"
                className="hidden sm:block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl"
              >
                Latest Adventure
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300"
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
            <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-600/30 shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                <Link 
                  href="/" 
                  className="block px-4 py-3 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home Page
                </Link>
                
                <Link 
                  href="/book/snows-of-summer" 
                  className="block px-4 py-3 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Adventure Log
                </Link>
                
                <Link 
                  href="/dice" 
                  className="block px-4 py-3 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dice Roller
                </Link>

                {/* Mobile Past Adventures */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Past Adventures</div>
                  <Link 
                    href="/shackles" 
                    className="block px-4 py-2 ml-4 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Skull & Shackles
                  </Link>
                  <Link 
                    href="/regent" 
                    className="block px-4 py-2 ml-4 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jade Regent
                  </Link>
                </div>
                
                <Link 
                  href="/rules" 
                  className="block px-4 py-3 rounded-lg text-slate-200 hover:text-blue-200 hover:bg-slate-700/50 transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Rules Page
                </Link>

                {/* Mobile call to action */}
                <div className="pt-4 border-t border-slate-600/30 mt-4">
                  <Link 
                    href="/book/snows-of-summer" 
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
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