// /types/adventure.ts
export interface AdventureEntry {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageCaption?: string;
  isFeatured?: boolean;
  excerpt: string;
  content: string;
  tags: string[];
  charactersInvolved?: string[];
  locationsFeatured?: string[];
}

export interface AdventureBook {
  title: string;
  subtitle: string;
  description: string;
  coverImage?: string;
  bookNumber: number;
  dateRange: string;
  sessions: number;
  keyCharacters: string[];
  keyLocations: string[];
  entries: AdventureEntry[];
}