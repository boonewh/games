// components/SidebarAndHero.tsx
import Image from "next/image";

export default function ExternalLink() {
  return (
    <aside className="flex items-center justify-between shadow-inner p-5 gap-4">
      <a
        href="https://www.d20srd.org/srd/variant/classes/gestaltCharacters.htm"
        className="flex-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/winter/gestalt-link.jpg"
          alt="Link to Gestalt characters rules"
          width={400}
          height={250}
          className="w-full rounded-lg h-auto"
        />
      </a>

      <a
        href="/shackles"
        className="flex-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/winter/shackles-link.jpg"
          alt="Ship Combat rules"
          width={400}
          height={250}
          className="w-full rounded-lg h-auto"
        />
      </a>

      <a href="/regent" className="flex-1">
        <Image
          src="/images/winter/jade-regent-link.jpg"
          alt="Our last adventure"
          width={400}
          height={250}
          className="w-full rounded-lg h-auto"
        />
      </a>

      <a
        href="https://www.sortekanin.com/collection/items/"
        className="flex-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/winter/SorteKanin_link.jpg"
          alt="SorteKanin Treasure Database"
          width={400}
          height={250}
          className="w-full rounded-lg h-auto"
        />
      </a>
    </aside>
  );
}
