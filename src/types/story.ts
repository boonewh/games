export type StoryBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; level: number; content: string }
  | { type: 'image'; src: string; alt?: string }
  | Record<string, unknown>; // TipTap extensions you use

export type StoryEntry = {
  date: string; // "YYYY-MM-DD"
  book: string; // e.g. "winter"
  slug: string; // "ice-road-ambush"
  story: StoryBlock[];
  coverUrl?: string;
};

export type StoryKey = `story:${string}:${string}:${string}`; // story:{book}:{date}:{slug}