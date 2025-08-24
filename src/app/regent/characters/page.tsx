'use client';

import React from 'react';
import Image from 'next/image';

const CharactersPage = () => {
  const characters = [
    {
      name: "Aelfread",
      classes: "Inquisitor & Ninja",
      image: "/images/regent/aelfread.png",
      pdfLink: "/images/regent/HeroLabAelfread.pdf",
      position: "left"
    },
    {
      name: "Edam", 
      classes: "Paladin & Rogue",
      image: "/images/regent/edam.png",
      pdfLink: "/images/regent/HeroLabEdam.pdf",
      position: "left"
    },
    {
      name: "Haldir",
      classes: "Wizard & Skald", 
      image: "/images/regent/haldir.png",
      pdfLink: "/images/regent/HeroLabHaldir.pdf",
      position: "center"
    },
    {
      name: "Shura",
      classes: "Cleric & Paladin",
      image: "/images/regent/shura.png", 
      pdfLink: "/images/regent/HeroLabShura.pdf",
      position: "right"
    },
    {
      name: "Tim",
      classes: "Fighter & Bloodrager",
      image: "/images/regent/tim.png",
      pdfLink: "/images/regent/HeroLabTim.pdf", 
      position: "right"
    }
  ];

  const leftCharacters = characters.filter(char => char.position === "left");
  const centerCharacters = characters.filter(char => char.position === "center");
  const rightCharacters = characters.filter(char => char.position === "right");

  return (
    <div className="min-h-screen bg-[#EFCAA3]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[80vh]">
          
          {/* Left Column */}
          <div className="flex flex-col items-center space-y-8">
            {leftCharacters.map((character) => (
              <div key={character.name} className="text-center">
                <a 
                  href={character.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-48 h-64 mb-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </a>
                <h3 className="text-xl font-bold text-red-900 mb-1">{character.name}</h3>
                <p className="text-gray-700">{character.classes}</p>
              </div>
            ))}
          </div>

          {/* Center Column */}
          <div className="flex flex-col items-center justify-start space-y-8">
            {/* Pathfinder Logo */}
            <div className="text-center mb-4">
              <Image
                src="/images/regent/PF2Logo.png"
                alt="Pathfinder Logo"
                width={400}
                height={200}
                className="mx-auto mb-6"
              />
              
              <h1 className="text-4xl md:text-5xl font-bold text-red-900 mb-4">
                Characters
              </h1>
              
              <p className="text-lg text-gray-700 mb-8">
                Click on a picture to see character sheets
              </p>
              
              {/* Sihedron Star */}
              <div className="mb-8">
                <Image
                  src="/images/regent/Sihedron-Rune-300x289.png"
                  alt="Sihedron Rune"
                  width={240}
                  height={240}
                  className="mx-auto opacity-80"
                />
              </div>
            </div>

            {/* Center Character */}
            {centerCharacters.map((character) => (
              <div key={character.name} className="text-center">
                <a 
                  href={character.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-48 h-64 mb-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </a>
                <h3 className="text-xl font-bold text-red-900 mb-1">{character.name}</h3>
                <p className="text-gray-700">{character.classes}</p>
              </div>
            ))}

            {/* Caravan Section */}
            <div className="text-center mt-8">
              <a 
                href="/images/regent/Hero Lab - Sandru's Caravan.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform duration-300 hover:scale-105"
              >
                <div className="relative w-128 h-80 mb-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="/images/regent/caravan.jpg"
                    alt="The Caravan"
                    fill
                    className="object-cover"
                  />
                </div>
              </a>
              <h3 className="text-lg font-bold text-red-900">The Caravan&apos;s Stats</h3>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col items-center space-y-8">
            {rightCharacters.map((character) => (
              <div key={character.name} className="text-center">
                <a 
                  href={character.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-48 h-64 mb-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </a>
                <h3 className="text-xl font-bold text-red-900 mb-1">{character.name}</h3>
                <p className="text-gray-700">{character.classes}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CharactersPage;