'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Hero Section with Background */}
      <div className="relative w-full min-h-screen bg-[url('/images/shackles/heroAlt.jpg')] bg-no-repeat bg-center bg-cover lg:h-screen">
        {/* Mobile Ship Image */}
        <Image
          src="/images/shackles/heroAlt.jpg"
          alt="Ship on the sea"
          width={1200}
          height={800}
          className="lg:hidden w-full h-64 object-cover object-left"
        />

        {/* Hero Content */}
        <div className="lg:w-[60%] lg:min-h-[80vh] lg:pt-80 lg:mb-5">
          <div className="text-[#c6c4ba] text-center bg-black/50 p-5 mb-5 lg:mb-5">
            <h1 className="text-[2.3em] leading-[1.1em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center pb-4">
              Welcome To Our Game Page!
            </h1>
            <h2 className="text-[1.8em] leading-[1.1em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center pb-4">
              &quot;Skull &amp; Shackles&quot;
            </h2>
            <h3 className="text-[1.4em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] pb-4">
              The high seas adventure has concluded!
            </h3>
            <p className="text-base leading-[1.2em] mb-4">
              Welcome to our thrilling journey through the lawless Shackles, where danger and discovery intertwine! Follow our intrepid adventurer&apos;s story on how they navigated uncharted territories in search of adventure. What secrets do the Shackles hold? What challenges did our adventurers face? Dive into our adventure log and join us to uncover the story of the intrepid crew of the pirate ship, <em>Scourge&apos;s Bane</em>!
            </p>
            <h2 className="text-[1.8em] leading-[1.1em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center pb-4">
              Read About Our Party&apos;s Journey!
            </h2>
            <p className="text-base leading-[1.2em] mb-4">
              Warning! Spoilers for the &quot;Skull &amp; Shackles&quot; Adventure Path.
            </p>
            <button
              onClick={() => window.location.href = '/shackles/book1'}
              className="mx-6 my-8 w-[250px] h-10 transition-transform duration-300 ease-in-out rounded-[10px] font-['Alkatra',Georgia,'Times_New_Roman',Times,serif] text-lg text-[#c6c4ba] bg-[#30393e] border border-[#c6c4ba] cursor-pointer hover:transform hover:scale-105"
            >
              Adventure Log
            </button>
          </div>
        </div>
      </div>

      {/* Adventure Path Section */}
      <section className="w-full lg:flex lg:justify-around lg:items-center lg:shadow-[inset_0_-4px_8px_rgba(255,255,255,0.2)] lg:border-[0.25px] lg:border-[#dcdcdc] lg:bg-gradient-to-b lg:from-black lg:to-[#30393e] lg:p-5">
        <div className="lg:w-1/2 lg:px-8 p-5" id="shackles">
          <h3 className="text-[1.4em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif]">The Adventure Path</h3>
          <p className="mb-4">We are playing the &quot;Skull &amp; Shackles&quot; Adventure Path sold by Paizo, Inc.</p>
          <blockquote className="mx-[10px] my-[20px] pl-[30px] before:content-[open-quote] before:font-['Times_New_Roman',Times,serif] before:text-[1.6em] before:font-bold after:content-[close-quote] after:font-['Times_New_Roman',Times,serif] after:text-[1.6em] after:font-bold">
            There&apos;s adventure to be had on the high seas when a group of press-ganged strangers seizes a ship and becomes embroiled in the plots and politics of the Shackles—an infamous island chain dominated by pirate warlords. But as these new swashbucklers make names for themselves, rival scalawags, enemy navies, legendary sea monsters, and the infamous Hurricane King himself seek to see them walk the plank. Who will survive when there&apos;s glory to plunder?
          </blockquote>
          <cite className="block mt-2">— Paizo Adventure Path Teaser</cite>
        </div>
        <div className="lg:w-1/2 p-5">
          <Link href="/images/shackles/shackles_detail.jpg" target="_blank" className="block">
            <Image
              src="/images/shackles/the_shackles_map.jpg"
              alt="Shackles Map"
              width={600}
              height={400}
              className="w-full max-w-full"
            />
          </Link>
        </div>
      </section>

      {/* Links Section */}
      <aside className="w-full flex flex-wrap justify-around items-center p-15 gap-4 bg-[#30393e]">
        <Link href="https://www.d20srd.org/srd/variant/classes/gestaltCharacters.htm" className="flex-1 min-w-[200px] max-w-[250px]">
          <Image
            src="/images/shackles/gestalt-link.jpg"
            alt="Link to Gestalt characters rules"
            width={200}
            height={150}
            className="w-full rounded-[10px]"
          />
        </Link>
        <Link href="https://www.aonprd.com/Rules.aspx?ID=854" className="flex-1 min-w-[200px] max-w-[250px]">
          <Image
            src="/images/shackles/ship-combat-link.jpg"
            alt="Ship Combat rules"
            width={200}
            height={150}
            className="w-full rounded-[10px]"
          />
        </Link>
        <Link href="/JadeRegent/index.html" className="flex-1 min-w-[200px] max-w-[250px]">
          <Image
            src="/images/shackles/jade-regent-link.jpg"
            alt="Our last adventure"
            width={200}
            height={150}
            className="w-full rounded-[10px]"
          />
        </Link>
        <Link href="https://www.sortekanin.com/collection/items/" className="flex-1 min-w-[200px] max-w-[250px]">
          <Image
            src="/images/shackles/SorteKanin_link.jpg"
            alt="SorteKanin Treasure Database"
            width={200}
            height={150}
            className="w-full rounded-[10px]"
          />
        </Link>
      </aside>

      {/* Ship Decoration */}
      <div className="w-full flex justify-center bg-gradient-to-b from-[#30393e] to-black">
        <Image
          src="/images/shackles/ship-side.png"
          alt="Image of ship and coast"
          width={1200}
          height={700}
          className="w-full max-w-8xl"
        />
      </div>

      {/* Crew Section */}
      <div className="w-full bg-black bg-[url('/images/shackles/bane_flag.png')] bg-no-repeat bg-center bg-[length:80%] lg:bg-[length:40%] lg:bg-[center_30%] py-8 relative">
        <h1 className="text-[2.3em] leading-[1.1em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center mb-8">The Crew</h1>
        
        {/* Character Row 1 */}
        <div className="flex flex-col lg:flex-row justify-between w-full px-4 lg:px-8 mb-8">
          <figure 
            className="flex flex-col lg:flex-row w-full lg:w-[45%] mx-2 lg:mx-6 items-center relative cursor-pointer mb-6 lg:mb-0"
            onMouseEnter={() => setHoveredCharacter('kasmira')}
            onMouseLeave={() => setHoveredCharacter(null)}
          >
            <Image
              src="/images/shackles/Kasmira.jpg"
              alt="Kasmira"
              width={200}
              height={300}
              className="shadow-[10px_25px_30px_0px_rgba(128,128,128,0.6)] m-[10px] max-w-[150px] lg:max-w-[200px]"
            />
            <figcaption className="text-[1.3em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center lg:text-left">
              <p>Kasmira de la Torre</p>
              <p>Human Gunslinger/Rogue</p>
              <Link href="/images/shackles/kasmira20.pdf" target="_blank" className="underline">
                Character Sheet
              </Link>
            </figcaption>
          </figure>

          <figure 
            className="flex flex-col lg:flex-row-reverse w-full lg:w-[45%] mx-2 lg:mx-6 items-center relative cursor-pointer mb-6 lg:mb-0"
            onMouseEnter={() => setHoveredCharacter('finn')}
            onMouseLeave={() => setHoveredCharacter(null)}
          >
            <Image
              src="/images/shackles/Finn.jpg"
              alt="Finn"
              width={200}
              height={300}
              className="shadow-[10px_25px_30px_0px_rgba(128,128,128,0.6)] m-[10px] max-w-[150px] lg:max-w-[200px]"
            />
            <figcaption className="text-[1.3em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center lg:text-right">
              <p>Finn</p>
              <p>Undine Kineticist/Rogue</p>
              <Link href="/images/shackles/finn20.pdf" target="_blank" className="underline">
                Character Sheet
              </Link>
            </figcaption>
          </figure>
        </div>

        {/* Character Row 2 */}
        <div className="flex flex-col lg:flex-row justify-between w-full px-4 lg:px-8 pt-24">
          <figure 
            className="flex flex-col lg:flex-row-reverse w-full lg:w-[45%] mx-2 lg:mx-6 items-center relative cursor-pointer mb-6 lg:mb-0"
            onMouseEnter={() => setHoveredCharacter('red')}
            onMouseLeave={() => setHoveredCharacter(null)}
          >
            <Image
              src="/images/shackles/red.jpg"
              alt="Red"
              width={200}
              height={300}
              className="shadow-[10px_25px_30px_0px_rgba(128,128,128,0.6)] m-[10px] max-w-[150px] lg:max-w-[200px]"
            />
            <figcaption className="text-[1.3em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center lg:text-right">
              <p>Red</p>
              <p>Dwarven Inquisitor/War Priest</p>
              <Link href="/images/shackles/red20.pdf" target="_blank" className="underline">
                Character Sheet
              </Link>
            </figcaption>
          </figure>

          <figure 
            className="flex flex-col lg:flex-row w-full lg:w-[45%] mx-2 lg:mx-6 items-center relative cursor-pointer mb-6 lg:mb-0"
            onMouseEnter={() => setHoveredCharacter('varen')}
            onMouseLeave={() => setHoveredCharacter(null)}
          >
            <Image
              src="/images/shackles/Varen2.jpg"
              alt="Varen"
              width={200}
              height={300}
              className="shadow-[10px_25px_30px_0px_rgba(128,128,128,0.6)] m-[10px] max-w-[150px] lg:max-w-[200px]"
            />
            <figcaption className="text-[1.3em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center lg:text-left">
              <p>Varen Galashantar</p>
              <p>Aquatic Elf Gunslinger/Magus</p>
              <Link href="/images/shackles/varen20.pdf" target="_blank" className="underline">
                Character Sheet
              </Link>
            </figcaption>
          </figure>
        </div>

        {/* Hover Images - These appear on desktop hover */}
        {hoveredCharacter && (
          <div className="hidden lg:block absolute max-w-[450px] top-[10%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Image
              src={`/images/shackles/${hoveredCharacter === 'kasmira' ? 'Kasmira' : hoveredCharacter === 'finn' ? 'Finn' : hoveredCharacter === 'red' ? 'red' : 'Varen2'}.jpg`}
              alt={hoveredCharacter}
              width={450}
              height={600}
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      <hr className="border-[#c6c4ba]" />

      {/* Adventure Excerpt and Gallery */}
      <section className="w-full lg:flex bg-[#30393e]">
        <div className="w-full">
          <div className="w-full p-[40px] my-5">
            <h3 className="text-[1.4em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] mb-4">An excerpt from our last adventure entry:</h3>
            <Image
              src="/images/shackles/group.jpg"
              alt="The officers of the Scourge&apos;s Bane"
              width={300}
              height={200}
              className="hidden lg:block lg:float-right lg:w-[35%] lg:ml-5 lg:mb-[10px] w-full mx-auto"
            />
            <h2 className="text-[1.8em] leading-[1.1em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-left mb-4">February 1, 2025</h2>
            <h3 className="text-[1.4em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] mb-4">The Hurricane Crown</h3>
            <p className="mb-4">The <em>Filthy Lucre</em> was silent now, its decks slick with blood and seawater, the bodies of its last defenders sprawled in the dim lantern glow. Kasmira de la Torre holstered her pistols, exhaling as the rush of battle faded. The victory was theirs. But one thing remained undone—the treasure of Kerdak Bonefist.</p>
            <p className="mb-4">&quot;It&apos;s not enough to kill a tyrant,&quot; she said, voice firm. &quot;We need his plunder. Let the world see the spoils of the Hurricane King.&quot;</p>
            <p className="mb-4">Her crew nodded, understanding the weight of pirate tradition. Victory meant wealth, meant proof, meant glory. And so they left the <em>Filthy Lucre</em> behind and turned toward the looming silhouette of the buildings on the nearby pier.</p>
          </div>
          
          <div className="w-full p-[10px] my-5">
            <p>You can find our entire story in the <Link href="/shackles/book1" className="text-[#c6c4ba] underline">Adventure Log</Link></p>
          </div>

            <div className="w-full max-w-4xl mx-auto p-4 lg:p-8 my-5 flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
            <Link href="/images/shackles/gallery_image18.jpg" className="flex-shrink-0 mx-auto w-full max-w-md lg:max-w-lg">
                <Image
                src="/images/shackles/gallery_image18.jpg"
                alt="Mini Gallery Images"
                width={500}
                height={375}
                className="w-full h-auto object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                />
            </Link>
            <Link href="/images/shackles/gallery_image19.jpg" className="flex-shrink-0 mx-auto w-full max-w-md lg:max-w-lg">
                <Image
                src="/images/shackles/gallery_image19.jpg"
                alt="Mini Gallery Images"
                width={500}
                height={375}
                className="w-full h-auto object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                />
            </Link>
            </div>
        </div>
      </section>

      {/* Miniatures Gallery */}
      <div className="w-full px-4 my-8 mb-16 bg-[#30393e]">
        <h3 className="text-[1.4em] font-['Alkatra',Verdana,Geneva,Tahoma,sans-serif] text-center mb-8">Miniatures Gallery</h3>
        
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-8">
          <Link href="/images/shackles/gallery_image1.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image1.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
          <Link href="/images/shackles/gallery_image2.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image2.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
          <Link href="/images/shackles/gallery_image3.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image3.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
          <Link href="/images/shackles/gallery_image4.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image4.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
          <Link href="/images/shackles/gallery_image5.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image5.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
          <Link href="/images/shackles/gallery_image6.jpg" className="block">
            <Image
              src="/images/shackles/gallery_image6.jpg"
              alt="Mini Gallery Images"
              width={300}
              height={225}
              className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}