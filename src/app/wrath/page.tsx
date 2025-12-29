import Image from "next/image";
import Header from "@/components/wrath/Header";
import Footer from "@/components/wrath/Footer";

export default function WrathPage() {
  return (
    <>
      <Header />

      {/* HERO SECTION */}
      <header className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden border-b-2 border-wotr-gold">
        {/* Main Crusader/Wardstone Image */}
        <Image
          src="/images/wrath/wrath-hero.jpg"
          alt="The Fifth Crusade"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-dark/0 via-stone-dark/40 to-stone-dark"></div>

        <div className="relative z-10 text-center px-4">
          <h1 className="font-cinzel text-5xl md:text-8xl text-wotr-gold drop-shadow-[0_0_15px_rgba(0,0,0,1)] tracking-tighter">
            WRATH <span className="text-white">OF THE</span> RIGHTEOUS
          </h1>
          {/* The Glowing Wardstone Divider */}
          <div className="h-0.5 w-64 bg-wardstone-blue mx-auto my-6 shadow-[0_0_15px_#00d4ff]"></div>
          <p className="font-cinzel text-xl md:text-2xl tracking-[0.3em] uppercase text-parchment/80">
            The Fifth Crusade
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* INTRO NARRATIVE */}
        <section className="max-w-3xl mx-auto text-center mb-24">
          <h2 className="font-cinzel text-3xl text-wotr-gold mb-6 uppercase tracking-widest">The Worldwound Incursion</h2>
          <p className="text-lg leading-relaxed italic opacity-90">
            For over a century, the demon-haunted wasteland of the Worldwound has bled into the world of mortals.
            As the magical Wardstones that hold back the tide begin to flicker and fail, a new generation of
            crusaders must take up the sword. But this war requires more than steel; it requires the power of Myths.
          </p>
        </section>

        {/* THE VANGUARD (CHARACTER PLACEHOLDERS) */}
        <section className="mb-32">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-10">
            <h2 className="font-cinzel text-2xl text-wotr-gold uppercase tracking-widest">The Vanguard</h2>
            <span className="text-xs uppercase tracking-widest text-zinc-500">Level 1 Gestalt • Mythic Tier 0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Character Card Template */}
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="group bg-stone-light/40 border border-zinc-800 hover:border-wardstone-blue transition-all duration-500 p-4">
                <div className="relative aspect-[3/4] bg-black mb-6 overflow-hidden border border-zinc-800">
                  <Image
                    src="/images/wrath/worldwound-rift.jpg"
                    alt="Placeholder"
                    fill
                    className="object-cover opacity-20 grayscale group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-cinzel text-6xl text-zinc-800 group-hover:text-wardstone-blue transition-colors">?</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-cinzel text-lg text-zinc-500 group-hover:text-parchment transition-colors uppercase tracking-widest">Awaiting Hero</h3>
                  <p className="text-sm text-zinc-600 italic">Unknown Path</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* WORLDWOUND DIVIDER - Full Width Dramatic Break */}
      <section className="relative w-full border-t-2 border-b-2 border-wardstone-blue bg-black">
        <div className="relative w-full aspect-[21/9]">
          <Image
            src="/images/wrath/worldwound-rift.jpg"
            alt="The Worldwound - Divine Light vs Abyssal Rift"
            fill
            className="object-cover"
            priority
          />
          {/* Darkening overlay for text readability */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Optional centered text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="h-px w-96 bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mb-4"></div>
              <p className="font-cinzel text-2xl md:text-4xl text-wardstone-blue drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] tracking-wider uppercase">
                The Worldwound
              </p>
              <div className="h-px w-96 bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mt-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSITION: Worldwound to Abyss - Purple Rift Gradient */}
      <div className="w-full h-32 bg-gradient-to-b from-purple-900/40 via-purple-950/60 to-black relative overflow-hidden">
        {/* Ethereal purple glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
        {/* Dramatic energy streaks */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-[10%] w-2 h-full bg-gradient-to-b from-purple-400 via-purple-500/60 to-transparent blur-md"></div>
          <div className="absolute top-0 left-[25%] w-1 h-full bg-gradient-to-b from-purple-300 via-purple-400/70 to-transparent blur-sm"></div>
          <div className="absolute top-0 left-[40%] w-3 h-full bg-gradient-to-b from-purple-500 via-purple-600/50 to-transparent blur-lg"></div>
          <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-purple-400 via-purple-500/80 to-transparent blur-md"></div>
          <div className="absolute top-0 left-[60%] w-1 h-full bg-gradient-to-b from-purple-300 via-purple-400/60 to-transparent blur-sm"></div>
          <div className="absolute top-0 left-[75%] w-2 h-full bg-gradient-to-b from-purple-500 via-purple-500/70 to-transparent blur-md"></div>
          <div className="absolute top-0 left-[90%] w-1 h-full bg-gradient-to-b from-purple-400 via-purple-400/50 to-transparent blur-sm"></div>
        </div>
      </div>

      {/* THREAT SECTION (VILLAIN CARD) - Full Width */}
      <section className="w-full bg-black mb-32 border-t border-b border-abyssal-red">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-96 lg:h-auto overflow-hidden relative border border-abyssal-red">
              <Image
                src="/images/wrath/wrath3.jpg"
                alt="The Shadow of the Abyss"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="p-10 lg:p-16 flex flex-col justify-center border-l border-abyssal-red">
              <h2 className="font-cinzel text-3xl text-red-600 mb-6 tracking-tighter">The Shadow of the Abyss</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                The storm of approaches. As the sky turns to ash, the heroes must confront the ultimate source of the corruption.
                {/*Deskari, Lord of the Locust Host, looks upon Kenabres with hunger.*/}
              </p>
              <div className="text-xs uppercase tracking-[.3em] text-abyssal-red font-bold">
                Warning: Mythic Threat Level
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* SESSION LOGS */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-cinzel text-2xl text-wotr-gold border-b border-zinc-800 pb-3 mb-8 uppercase tracking-widest">
            Chronicle of the Crusade
          </h2>
          <div className="space-y-6">
            <div className="bg-stone-light/30 border border-zinc-800 p-6 hover:border-wotr-gold/50 transition-colors">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-cinzel text-lg text-parchment">Session 1: The Fall of Kenabres</h3>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Awaiting Entry</span>
              </div>
              <p className="text-sm text-zinc-400 italic">
                The adventure begins...
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
