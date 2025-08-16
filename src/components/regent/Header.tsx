'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: 'Home Page' },
    { href: '/regent', label: 'Jade Regent Home' },
    { href: '/regent/adventure-log', label: 'Adventure Log' },
    { href: '/regent/characters', label: 'Characters' },
    { href: '/regent/about', label: 'About Us' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full">
      {/* Logo Section */}
      <div className="flex justify-left py-4 pl-20 bg-[#EFCAA3]">
        <Link href="/" className="block">
          <Image
            src="/images/regent/pathSixColorLogo.png"
            alt="The Pathfinder 6"
            width={300}
            height={80}
            className="h-16 md:h-20 w-auto"
            priority
          />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="relative shadow-lg bg-[#3F110B]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Mobile menu button */}
          <div className="flex justify-between items-center md:hidden py-4">
            <span className="text-[#EFCAA3] font-medium">Menu</span>
            <button 
              onClick={toggleMenu}
              className="text-[#EFCAA3] hover:text-yellow-300 transition-colors p-1"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex justify-center space-x-8 py-4">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className="text-[#EFCAA3] font-extrabold hover:text-yellow-300 transition-colors px-2 py-1 rounded"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Mobile Navigation Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden">
              <ul className="pb-4 space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      onClick={closeMenu}
                      className="block text-white hover:text-yellow-300 transition-colors py-2 px-4 rounded hover:bg-black hover:bg-opacity-20"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[-1] md:hidden"
            onClick={closeMenu}
          />
        )}
      </nav>
    </header>
  );
};

export default Header;