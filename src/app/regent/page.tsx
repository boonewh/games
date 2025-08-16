'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const JadeRegentHome = () => {
  const [currentCharacter, setCurrentCharacter] = useState(0);
  
  const characters = [
    {
      name: "Aelfread",
      class: "Gestalt Inquisitor-Ninja",
      description: "Aelfread is a ghost of the battlefield, stalking his prey invisible and bringing the inquisition of Serenrae upon our foes.",
      image: "/images/regent/aelfread.png"
    },
    {
      name: "Edam",
      class: "Gestalt Paladin-Rogue",
      description: "Edam is a little guy. Small of stature, huge on pain...dealing it.",
      image: "/images/regent/edam.png"
    },
    {
      name: "Haldir",
      class: "Gestalt Wizard-Skald",
      description: "Haldir is a squishy mage. A squishy mage that has a whole lot of tricks up his sleeve. Don't mess with Haldir.",
      image: "/images/regent/haldir.png"
    },
    {
      name: "Shura",
      class: "Gestalt Cleric-Paladin",
      description: "Every party needs a healer. Every party needs a tank. Shura is our rock that heals. No really, he's a rock!",
      image: "/images/regent/shura.png"
    },
    {
      name: "Tim",
      class: "Gestalt Fighter-Bloodrager",
      description: "Tim smashes things. That saying, \"You wouldn't like him when he's angry\" Yeah. Don't get on the wrong side of his rage.",
      image: "/images/regent/tim.png"
    }
  ];

  const eventImages = [
    'adlog1.jpg', 'adlog2.jpg', 'adlog3.jpg', 
    'adlog4.jpg', 'adlog5.jpg', 'adlog6.jpg'
  ];

  // Auto-rotate characters every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) => (prev + 1) % characters.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [characters.length]);

  const handleCharacterClick = (index: number) => {
    setCurrentCharacter(index);
  };

return (
    <div className="min-h-screen bg-[#EFCAA3]">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/regent/gateHero.webp')" }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0" />
        
        {/* Top Content - Main Titles */}
        <div className="absolute top-10 left-0 right-0 z-10 flex justify-center items-center px-4" style={{ color: '#3F110B' }}>
          <div className="text-center">
            <h1 className="font-alkatra text-2xl md:text-3xl lg:text-4xl font-bold mb-3 drop-shadow-2xl">
              Welcome To Our Game Page!
            </h1>
            <h1 className="font-alkatra text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-2xl">
              &quot;The Jade Regent&quot;
            </h1>
          </div>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-10 left-0 right-0 z-10 px-4" style={{ color: '#3F110B' }}>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-alkatra text-lg md:text-xl font-bold mb-4 drop-shadow-lg">
              Our Adventures in Tian Xia Have Concluded!
            </h3>
            <p className="text-sm md:text-base mb-6 leading-relaxed drop-shadow-lg">
              Thank you for joining our party of adventurers. They have finished their quest in the Lands of Minkai 
              and have successfully restored the rightful ruler to the throne. The adventure is chronicled in the 
              Adventure Log. Enjoy, and we hope you join us in our new adventure, &quot;Skull & Shackles.&quot;
            </p>

            <h3 className="font-alkatra text-base md:text-lg font-bold mb-3 drop-shadow-lg">
              Follow Our Party&apos;s Journey!
            </h3>
            <p className="text-xs md:text-sm mb-4 drop-shadow-lg">
              Warning! Spoilers for the &quot;Jade Regent&quot; Adventure Path.
            </p>
            <button 
              className="bg-[#3F110B] hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 shadow-xl text-sm"
              onClick={() => window.location.href = '/adventure'}
            >
              Adventure Log
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Adventure Path Section */}
        <section className="mb-12">
          <article className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-900">
              The Adventure Path
            </h3>
            
            <div className="mb-6">
              <a href="/images/regent/TianXia-min.png" target="_blank" rel="noopener">
                <Image
                  src="/images/regent/TianXia-min.png"
                  alt="Tian Xia Map"
                  width={600}
                  height={400}
                  className="w-full max-w-md mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              </a>
            </div>
            
            <p className="text-gray-700 mb-4">
              We are playing the &quot;Jade Regent&quot; Adventure Path sold by Paizo, Inc.
            </p>
            
            <blockquote className="border-l-4 border-red-800 pl-6 italic text-gray-600 mb-4 bg-orange-50 p-4 rounded-r-lg">
              When a decades-old secret is exposed, an unassuming local tavern-owner and a close friend of 
              the PCs discovers her birthright is to rule one of the ancient Dragon Empires of Tian Xia—the 
              empire of Minkai. Yet the current ruler of this empire, the mysterious and increasingly cruel 
              Jade Regent, has no intention of giving up his hold over the throne. In order to save Minkai 
              from a would-be tyrant, the PCs must not only escort their friend from Varisia to Tian Xia, 
              braving the frozen horrors of the Crown of the World, but must aid her in gaining the trust 
              and support of a nation on the edge of anarchy.
            </blockquote>
            
            <cite className="text-sm text-gray-500">— Paizo Adventure Path Teaser</cite>
          </article>
        </section>

        {/* Our Game Section */}
        <section className="mb-12">
          <article className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-900">
              Our Game
            </h3>
            
            <p className="text-gray-700 mb-4">
              Our group currently consists of a storyteller and five players. Our house rules are all a result of group 
              discussion and consensus. Not everyone would enjoy our game, but we have a ton of fun. For example, if you
              read the house rules, you might notice that we banned a lot of classes, including
              the basic fighter class. This was based on our group playstyle where min-maxed fighters could dominate the 
              game. It was not done to punish a single player or even as a negative rule, but an agreement among the group 
              that by removing this class, we&apos;d have more fun as a whole.
            </p>
            
            <p className="text-gray-700 mb-4">
              Speaking of Gestalt leveling rules, they derive from the D&D 3.5 ruleset. If you have never heard of it, you can 
              read about the rules here:
            </p>
            
            <div className="mb-6 text-center">
              <a 
                href="https://www.d20srd.org/srd/variant/classes/gestaltCharacters.htm"
                target="_blank"
                rel="noopener"
                className="inline-block"
              >
                <Image
                  src="/images/regent/gestaltLink.png"
                  alt="Gestalt Link"
                  width={400}
                  height={260}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              </a>
            </div>
            
            <p className="text-center text-gray-600">
              For the full character sheets, see the{' '}
              <a href="/characters" className="text-red-800 hover:text-red-600 font-bold underline">
                characters page
              </a>.
            </p>
          </article>
        </section>

        {/* Character Showcase */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg shadow-lg p-6 md:p-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-yellow-300">
              The Cast:
            </h1>
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Character Image */}
              <div className="flex-shrink-0">
                <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={characters[currentCharacter].image}
                    alt={characters[currentCharacter].name}
                    fill
                    className="object-cover transition-all duration-500"
                  />
                </div>
              </div>
              
              {/* Character Info */}
              <div className="flex-grow text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">
                  {characters[currentCharacter].name}
                </h2>
                <h5 className="text-xl md:text-2xl mb-4 text-yellow-200">
                  {characters[currentCharacter].class}
                </h5>
                <p className="text-lg leading-relaxed">
                  {characters[currentCharacter].description}
                </p>
              </div>
            </div>
            
            {/* Character Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {characters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleCharacterClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentCharacter 
                      ? 'bg-yellow-300 scale-125' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Last Adventure Entry */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-red-900">
              An excerpt from our last adventure entry:
            </h3>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-red-800">
              The Twilight Throne Room
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              The aftermath of battle left our minds in a fog, and as clarity returned, it became starkly evident—we were no longer where we had been. The throne room around us, once a kaleidoscope of regal hues, was now a desolate expanse of greys. Ameiko, Sandru, and Edam&apos;s loyal hound lay still, as if touched by a sorcerer&apos;s cruel hand. In this eerie silence, a voice echoed with dark promise from the shadows.
            </p>
            <h3 className="text-center">
              <a 
                href="/adventure" 
                className="text-red-800 hover:text-red-600 font-bold text-lg underline transition-colors duration-300"
              >
                Click here to see the full Adventure Log
              </a>
            </h3>
          </div>
        </section>

        {/* Event Pictures */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-red-900">
            Event Pictures
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventImages.map((img, index) => (
              <div key={index} className="group">
                <a 
                  href={`/images/regent/${img}`}
                  target="_blank"
                  rel="noopener"
                  className="block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={`/images/regent/${img}`}
                      alt={`Event ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default JadeRegentHome;