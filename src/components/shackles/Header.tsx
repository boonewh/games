'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SkullShacklesNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full">
      <Image 
        src="/images/shackles/PathSixLogowhite.png" 
        alt="The Pathfinder 6" 
        width={400}
        height={100}
        className="w-full lg:w-[28%] mx-auto"
        priority
      />
      
      <nav className="w-[95%] mx-auto">
        {/* Mobile Navigation Icon */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsMenuOpen(true)}
            className="block"
          >
            <Image 
              src="/images/shackles/navicon.png" 
              alt="Navigation Menu" 
              width={32}
              height={32}
            />
          </button>
        </div>

        {/* Navigation Menu */}
        <ul 
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } lg:flex lg:flex-row lg:justify-center lg:items-center list-none`}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <Image 
            src="/images/shackles/flagfill.png" 
            alt="pirate flag" 
            width={60}
            height={40}
            className="w-[15%] lg:w-[5%] lg:ml-[-2%] lg:z-[100]"
          />
          
          <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
            <Link 
              href="/" 
              className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black"
            >
              Home Page
            </Link>
          </li>
          
          <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
            <Link 
              href="/shackles" 
              className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black"
            >
              Shackles Home Page
            </Link>
          </li>
          
          <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
            <Link 
              href="/shackles/book1" 
              className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black"
            >
              Adventure Log
            </Link>
          </li>
          
          <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
            <Link 
              href="/shackles/rules" 
              className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black"
            >
              Rules Page
            </Link>
          </li>
          
          <Image 
            src="/images/shackles/flagfill.png" 
            alt="pirate flag" 
            width={60}
            height={40}
            className="w-[15%] lg:w-[5%] lg:ml-[-2%] lg:z-[100]"
          />
        </ul>
      </nav>
    </header>
  );
}