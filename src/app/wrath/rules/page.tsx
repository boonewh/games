'use client'

import React from 'react';
import Image from 'next/image';
import Header from '@/components/wrath/Header';
import Footer from '@/components/wrath/Footer';

const WrathHouseRulesPage = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen relative overflow-hidden bg-stone-dark font-spectral">

        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/wrath/wrath-hero.jpg"
              alt="The Fifth Crusade Rules"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-dark/60 via-stone-dark/40 to-stone-dark/80"></div>
          </div>

          <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
            <h1 className="font-cinzel text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-wotr-gold via-wardstone-blue to-wotr-gold mb-6 uppercase tracking-widest">
              House Rules
            </h1>
            <h2 className="text-2xl sm:text-3xl text-parchment/80 mb-4 font-medium font-cinzel uppercase tracking-wider">
              Wrath of the Righteous Campaign
            </h2>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              The sacred laws that govern our mythic crusade, refined through three decades of friendship and storytelling
            </p>
          </div>
        </section>

        {/* Rules Content */}
        <section className="relative py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Introduction */}
            <div className="bg-gradient-to-br from-stone-light/80 to-stone-dark/80 backdrop-blur-sm rounded-sm border border-zinc-800 p-8 mb-12 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-stone-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-wotr-gold mb-3 font-cinzel uppercase tracking-wider">Campaign Guidelines</h3>
                  <p className="text-parchment/80 leading-relaxed">
                    These house rules have been carefully crafted to enhance our mythic storytelling experience and maintain balance throughout our Wrath of the Righteous campaign. They represent years of refinement and group consensus.
                  </p>
                </div>
              </div>
            </div>

            {/* Rules Sections */}
            <div className="space-y-8">

              {/* 1. Third Party Products */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">1</span>
                  Third Party Products
                </h2>
                <p className="text-parchment text-lg">
                  <strong className="text-wotr-gold">No third party products</strong> are permitted in this campaign.
                </p>
              </div>

              {/* 2. Character Creation */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">2</span>
                  Character Creation
                </h2>

                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-wardstone-blue mb-4 font-cinzel">Point Build System</h3>
                  <ul className="space-y-2 text-parchment/80 ml-6">
                    <li className="flex items-start">
                      <span className="text-wotr-gold mr-2">•</span>
                      <span><strong className="text-wotr-gold">25 points</strong> to distribute as desired, then apply racial bonuses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-wotr-gold mr-2">•</span>
                      <span>Initial stats (before racial traits) must be between <strong className="text-wotr-gold">10 and 17</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3. Allowed Races */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">3</span>
                  Allowed Races
                </h2>
                <ul className="space-y-2 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wardstone-blue mr-2">✓</span>
                    <span><strong className="text-wotr-gold">Core races</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wardstone-blue mr-2">✓</span>
                    <span><strong className="text-wotr-gold">Featured Races</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-abyssal-red mr-2">✗</span>
                    <span>No Uncommon or Custom races</span>
                  </li>
                </ul>
              </div>

              {/* 4. Gestalt Rules */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">4</span>
                  Gestalt Characters
                </h2>
                <p className="text-parchment/80 mb-4">We will be playing <strong className="text-wotr-gold">Gestalt</strong> characters for enhanced power and versatility.</p>

                <div className="ml-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-abyssal-red mb-4 font-cinzel">Banned Classes</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Gunslinger", "Undead Lord", "Psychic", "Spiritualist",
                        "Antipaladin", "Ninja", "Samurai", "Assassin",
                        "Any Prestige Class that advances two other classes (Ex: Mystic Theurge)"
                      ].map((className, index) => (
                        <div key={index} className="flex items-center text-parchment/80">
                          <span className="text-abyssal-red mr-2">✗</span>
                          <span>{className}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-wardstone-blue mb-4 font-cinzel">Special Allowances</h3>
                    <ul className="space-y-2 text-parchment/80">
                      <li className="flex items-start">
                        <span className="text-wardstone-blue mr-2">✓</span>
                        <span>Use <strong className="text-wotr-gold">Unchained variants</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5. Alignment */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">5</span>
                  Alignment
                </h2>
                <p className="text-parchment text-lg">
                  <strong className="text-wotr-gold">Any non-evil alignment</strong> is allowed.
                </p>
              </div>

              {/* 6. Equipment */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">6</span>
                  Equipment
                </h2>
                <ul className="space-y-3 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>All characters can have <strong className="text-wotr-gold">&quot;mundane&quot; equipment</strong> of their choosing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>No special materials or properties</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Characters still get <strong className="text-wotr-gold">starting gold</strong> on top of mundane equipment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span><strong className="text-wotr-gold">Ignore encumbrance</strong> - assumed you can drop gear at battle start</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span><strong className="text-wotr-gold">Unlimited &quot;normal&quot; ammunition</strong> except in special circumstances</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-abyssal-red mr-2">✗</span>
                    <span>No technology</span>
                  </li>
                </ul>
              </div>

              {/* 7. Character Advancement */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">7</span>
                  Character Advancement
                </h2>
                <ul className="space-y-2 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Use <strong className="text-wotr-gold">&quot;Milestone Levelling&quot;</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>All party members will be at the <strong className="text-wotr-gold">same level</strong></span>
                  </li>
                </ul>
              </div>

              {/* 8. Hit Points */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">8</span>
                  Hit Points
                </h2>
                <p className="text-parchment text-lg">
                  Use <strong className="text-wotr-gold">Maximum Hit Points</strong> for all characters.
                </p>
              </div>

              {/* 9. Spells and Magic */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">9</span>
                  Spells and Magic
                </h2>
                <ul className="space-y-3 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Use <strong className="text-wotr-gold">spell memorization</strong> per rulebooks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span><strong className="text-wotr-gold">No spell components required</strong> (players encouraged to buy Spell Component Pouch or Eschew Material Components feat)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span><strong className="text-wotr-gold">Spell Concentration is not used</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Use our <strong className="text-wotr-gold">custom spell templates</strong> instead of grid spell areas</span>
                  </li>
                </ul>
              </div>

              {/* 10. Combat */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">10</span>
                  Combat Rules
                </h2>

                <div className="space-y-6 ml-6">
                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">General</h3>
                    <p className="text-parchment/80"><strong className="text-wotr-gold">Bleed is not used</strong></p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">Critical Hits</h3>
                    <p className="text-parchment/80">A roll of <strong className="text-wotr-gold">20 is always a critical</strong>, unless a 20 is the only way you could hit the opponent. In this case, the Natural 20 is still a hit, but must be confirmed to be a critical.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">Surprise Round</h3>
                    <ul className="space-y-2 text-parchment/80">
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span>If surprised (unaware): flat-footed until your turn, no action in surprise round</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span>If not surprised: may take a Move or Standard action</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span>Still flat-footed vs. undetected opponents (Stealth/Invisible)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">Precision Damage</h3>
                    <ul className="space-y-2 text-parchment/80">
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span>If any attack qualifies for precision damage during a round, <strong className="text-wotr-gold">all attacks vs. same opponent qualify</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span>Cannot use precision damage against opponents with <strong className="text-wotr-gold">concealment</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-wotr-gold mr-2">•</span>
                        <span><strong className="text-wotr-gold">Sniping:</strong> Can grant precision damage to unseen targets; may make stealth check after attack if unmoved</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">Movement</h3>
                    <p className="text-parchment/80"><strong className="text-wotr-gold">Diagonal movement is 5&#39; per square</strong> - no square counts double</p>
                  </div>
                </div>
              </div>

              {/* 11. Skill and Ability Checks */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">11</span>
                  Skill and Ability Checks
                </h2>
                <p className="text-parchment text-lg">
                  A roll of <strong className="text-wotr-gold">20 is always a success</strong>, a roll of <strong className="text-abyssal-red">1 is always a failure</strong>.
                </p>
              </div>

              {/* 12. Poison */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">12</span>
                  Poison
                </h2>
                <ul className="space-y-2 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Characters use the <strong className="text-wotr-gold">Unchained Poison rules</strong> (See Appendix)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Encounters use the <strong className="text-wotr-gold">rules as written</strong></span>
                  </li>
                </ul>
              </div>

              {/* 13. Saving Throws */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">13</span>
                  Saving Throws
                </h2>
                <ul className="space-y-2 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wardstone-blue mr-2">✓</span>
                    <span>A <strong className="text-wotr-gold">natural 20 is always a success</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-abyssal-red mr-2">✗</span>
                    <span>A <strong className="text-abyssal-red">natural 1 is always a failure</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Items <strong className="text-wotr-gold">do not need to make a check</strong> on a natural roll of 1</span>
                  </li>
                </ul>
              </div>

              {/* 14. Spell DCs */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">14</span>
                  Spell DCs
                </h2>
                <p className="text-parchment text-lg">
                  Spell DC is based on the <strong className="text-wotr-gold">highest-level spell the caster can cast</strong>, not the spell&#39;s actual level.
                </p>
              </div>

              {/* 15. Magic Items */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">15</span>
                  Magic Items and Carried Items
                </h2>
                <p className="text-parchment text-lg">
                  <strong className="text-wotr-gold">Cannot be damaged or broken</strong> unless specifically targeted (unless their description says otherwise).
                </p>
              </div>

              {/* 16. Feats */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">16</span>
                  Feats
                </h2>
                <div className="space-y-4 ml-6">
                  <div>
                    <h3 className="text-lg font-semibold text-wardstone-blue mb-2 font-cinzel">Allowed</h3>
                    <ul className="space-y-2 text-parchment/80">
                      <li className="flex items-start">
                        <span className="text-wardstone-blue mr-2">✓</span>
                        <span>May use the Elephant in the Room <strong className="text-wotr-gold">&quot;Weapon groups&quot;</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-wardstone-blue mr-2">✓</span>
                        <span><strong className="text-wotr-gold">&quot;Bladed Brush&quot;</strong> does work with Spell Combat and Spell Strike</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-abyssal-red mb-2 font-cinzel">Banned Feats</h3>
                    <div className="flex items-center text-parchment/80">
                      <span className="text-abyssal-red mr-2">✗</span>
                      <span><strong>Leadership</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 17. Traits */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">17</span>
                  Traits
                </h2>
                <ul className="space-y-2 text-parchment/80 ml-6">
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>Must take <strong className="text-wotr-gold">at least 1 Campaign trait</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>May take a <strong className="text-wotr-gold">second trait at no cost</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wotr-gold mr-2">•</span>
                    <span>May take a <strong className="text-wotr-gold">third trait</strong>, but will also take a <strong className="text-abyssal-red">drawback of GM&#39;s choice</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-wardstone-blue mr-2">★</span>
                    <span><strong className="text-wotr-gold">Campaign Trait: Riftwarden Orphan</strong> - change the +2 on concentration checks to <strong className="text-wardstone-blue">+1 on all spell DCs</strong></span>
                  </li>
                </ul>
              </div>

              {/* 18. Fear */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">18</span>
                  Fear Effects
                </h2>
                <p className="text-parchment/80 mb-4">Modified fear stages:</p>
                <div className="space-y-3 ml-6">
                  <div className="bg-stone-dark/40 rounded-sm p-3 border border-zinc-700">
                    <h4 className="text-yellow-500 font-semibold font-cinzel">Shaken</h4>
                    <p className="text-parchment/80 text-sm"><strong className="text-wotr-gold">-2 penalty</strong> on Attack Rolls, Saving Throws, Skill Checks, Ability Checks</p>
                  </div>
                  <div className="bg-stone-dark/40 rounded-sm p-3 border border-zinc-700">
                    <h4 className="text-orange-500 font-semibold font-cinzel">Frightened</h4>
                    <p className="text-parchment/80 text-sm"><strong className="text-wotr-gold">-4 penalty</strong> on Attack Rolls, Saving Throws, Skill Checks, Ability Checks. <strong className="text-abyssal-red">Cannot take full round actions</strong></p>
                  </div>
                  <div className="bg-stone-dark/40 rounded-sm p-3 border border-zinc-700">
                    <h4 className="text-red-500 font-semibold font-cinzel">Panicked</h4>
                    <p className="text-parchment/80 text-sm"><strong className="text-wotr-gold">-6 penalty</strong> on Attack Rolls, Saving Throws, Skill Checks, Ability Checks. <strong className="text-abyssal-red">Can only take 1 action per turn</strong></p>
                  </div>
                </div>
              </div>

              {/* 19. Sickened and Nauseated */}
              <div className="bg-gradient-to-br from-stone-light/60 to-stone-dark/60 backdrop-blur-sm rounded-sm border border-zinc-800 p-8">
                <h2 className="text-2xl font-bold text-wotr-gold mb-6 flex items-center font-cinzel">
                  <span className="w-8 h-8 bg-gradient-to-br from-wotr-gold to-wardstone-blue rounded-sm flex items-center justify-center text-stone-dark font-bold text-sm mr-3">19</span>
                  Sickened and Nauseated
                </h2>
                <p className="text-parchment/80 mb-4">Modified sickness stages:</p>
                <div className="space-y-3 ml-6">
                  <div className="bg-stone-dark/40 rounded-sm p-3 border border-zinc-700">
                    <h4 className="text-green-500 font-semibold font-cinzel">Sickened</h4>
                    <p className="text-parchment/80 text-sm"><strong className="text-wotr-gold">-2 penalty</strong> on all Attack Rolls, Weapon Damage Rolls, Saving Throws, Skill Checks, and Ability Checks</p>
                  </div>
                  <div className="bg-stone-dark/40 rounded-sm p-3 border border-zinc-700">
                    <h4 className="text-yellow-500 font-semibold font-cinzel">Nauseated</h4>
                    <p className="text-parchment/80 text-sm"><strong className="text-wotr-gold">-4 penalty</strong> on all Attack Rolls, Weapon Damage Rolls, Saving Throws, Skill Checks, and Ability Checks. <strong className="text-abyssal-red">Can only take one action per turn. Cannot cast spells with verbal components</strong></p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Message */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-br from-wotr-gold/20 to-wardstone-blue/20 backdrop-blur-sm rounded-sm border border-wotr-gold/30 p-8">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-wotr-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-2xl font-bold text-wotr-gold font-cinzel uppercase tracking-wider">Rules Established</h3>
                </div>
                <p className="text-lg text-parchment/80 max-w-2xl mx-auto leading-relaxed">
                  These house rules have been refined through decades of friendship and storytelling. They serve to enhance our shared mythic narrative and ensure balanced, enjoyable gameplay for all crusaders.
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default WrathHouseRulesPage;
