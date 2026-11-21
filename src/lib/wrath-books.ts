// Wrath of the Righteous Adventure Path books.
// Single source of truth — imported by the adventure-log index and the
// per-book pages. Update a book's status here and both pages follow.

export type BookStatus = 'completed' | 'current' | 'not-started';

export interface AdventureBook {
  slug: string;
  title: string;
  description: string;
  bookNumber: number;
  coverImage: string;
  status: BookStatus;
  theme: string;
}

export const adventureBooks: AdventureBook[] = [
  {
    slug: 'the-worldwound-incursion',
    title: 'The Worldwound Incursion',
    description: 'The adventure begins in the city of Kenabres during the annual Armasse festival when the wardstone is shattered and the city falls under demonic assault. The heroes must survive the attack and discover they have been touched by mythic power.',
    bookNumber: 1,
    coverImage: "/images/wrath/wrath3.jpg",
    status: 'completed',
    theme: 'from-purple-950 to-stone-900'
  },
  {
    slug: 'sword-of-valor',
    title: 'Sword of Valor',
    description: 'With mythic power awakening within them, the heroes lead the charge to retake the city of Drezen and recover the legendary Sword of Valor, a sacred banner that can turn the tide of the crusade.',
    bookNumber: 2,
    coverImage: '/images/wrath/watchers.jpg',
    status: 'completed',
    theme: 'from-red-950 to-stone-900'
  },
  {
    slug: 'demon-s-heresy',
    title: "Demon's Heresy",
    description: 'Now commanders of crusader forces, the heroes must root out corruption within the crusade itself while facing new demonic threats. A conspiracy threatens everything they have fought to achieve.',
    bookNumber: 3,
    coverImage: '/images/wrath/meeting.jpg',
    status: 'completed',
    theme: 'from-amber-950 to-stone-900'
  },
  {
    slug: 'the-midnight-isles',
    title: 'The Midnight Isles',
    description: 'The heroes must venture into the Abyss itself, traveling to the Midnight Isles—the realm of Nocticula, demon lord of darkness and lust—to secure a powerful weapon against the demonic hordes.',
    bookNumber: 4,
    coverImage: '/images/wrath/wrath-hero.jpg',
    status: 'current',
    theme: 'from-indigo-950 to-stone-900'
  },
  {
    slug: 'herald-of-the-ivory-labyrinth',
    title: 'Herald of the Ivory Labyrinth',
    description: 'The crusaders discover that Iomedae\'s herald has been captured and imprisoned in the Ivory Labyrinth—Baphomet\'s endless maze. The heroes must rescue the herald before all hope is lost.',
    bookNumber: 5,
    coverImage: '/images/wrath/wrath-hero.jpg',
    status: 'not-started',
    theme: 'from-rose-950 to-stone-900'
  },
  {
    slug: 'city-of-locusts',
    title: 'City of Locusts',
    description: 'In the epic finale, the heroes assault the heart of the Worldwound itself—Iz, the City of Locusts—to face Deskari, demon lord of the Locust Host, and close the rift between worlds forever.',
    bookNumber: 6,
    coverImage: '/images/wrath/wrath-hero.jpg',
    status: 'not-started',
    theme: 'from-zinc-900 to-stone-950'
  }
];
