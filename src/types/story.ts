// Inline marks the editor preserves. Add to this union as new marks are enabled.
export type StoryMark = { type: 'bold' | 'italic' | 'strike' | 'code' | string };

// A single inline text run (with optional formatting marks).
// Mirrors TipTap's text-node shape so the editor can round-trip cleanly.
export type StoryInlineNode = {
  type: 'text';
  text: string;
  marks?: StoryMark[];
};

// Block content is one of:
// - a plain string (legacy / compact form when there are no inline marks)
// - an array of inline nodes (when any run has marks, or formatting must be preserved)
export type StoryBlockContent = string | StoryInlineNode[];

export type StoryBlock =
  | { type: 'paragraph'; content: StoryBlockContent }
  | { type: 'heading'; level: number; content: StoryBlockContent }
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
