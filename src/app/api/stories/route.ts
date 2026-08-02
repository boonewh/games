import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { listAllKey, listKey, saveStory, storyKey, listStories } from '@/lib/storage';
import type { StoryEntry } from '@/types/story';

export const runtime = 'nodejs';

type StoryRequestBody = Partial<StoryEntry> & {
  includeAll?: boolean;
  originalBook?: string;
  originalDate?: string;
  originalSlug?: string;
};

const CAMPAIGN_BOOKS: Record<string, string[]> = {
  wrath: [
    'the-worldwound-incursion',
    'sword-of-valor',
    'demon-s-heresy',
    'the-midnight-isles',
    'herald-of-the-ivory-labyrinth',
    'city-of-locusts',
  ],
};

function valid(e: unknown): e is StoryEntry {
  return !!(e && typeof e === 'object' && e !== null &&
    'date' in e && typeof e.date === 'string' &&
    'book' in e && typeof e.book === 'string' &&
    'slug' in e && typeof e.slug === 'string' &&
    'story' in e && Array.isArray(e.story));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const book = searchParams.get('book');
    const campaign = searchParams.get('campaign');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (campaign && CAMPAIGN_BOOKS[campaign]) {
      const allResults = await Promise.all(
        CAMPAIGN_BOOKS[campaign].map(slug => listStories(listKey(slug), limit))
      );
      const stories = (allResults.flat().map(item => item.value).filter(Boolean) as StoryEntry[])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
      return NextResponse.json(stories);
    } else if (book) {
      const storiesData = await listStories(listKey(book), limit);
      const stories = storiesData.map(item => item.value);
      return NextResponse.json(stories);
    } else {
      const storiesData = await listStories(listAllKey(), limit);
      const stories = storiesData.map(item => item.value);
      return NextResponse.json(stories);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to fetch stories', detail: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StoryRequestBody;
    const storyData = { date: body.date, book: body.book, slug: body.slug, story: body.story, coverUrl: body.coverUrl };
    if (!valid(storyData)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const key = await saveStory({
      date: body.date!,
      book: body.book!,
      slug: body.slug!,
      data: storyData,
      includeAll: body.includeAll ?? true, // Default to true for winter stories
    });

    return NextResponse.json({ key });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to save story', detail: message }, { status: 500 });
  }
}

// PUT behaves like update and re-pushes this key to the list head for freshness
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as StoryRequestBody;
    const storyData = { date: body.date, book: body.book, slug: body.slug, story: body.story, coverUrl: body.coverUrl };
    if (!valid(storyData)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const hasCompleteOriginalIdentity = body.originalBook && body.originalDate && body.originalSlug;
    const hasPartialOriginalIdentity = body.originalBook || body.originalDate || body.originalSlug;
    if (hasPartialOriginalIdentity && !hasCompleteOriginalIdentity) {
      return NextResponse.json({ error: 'Incomplete original story identity' }, { status: 400 });
    }

    const key = storyKey(body.book!, body.date!, body.slug!);
    const originalKey = hasCompleteOriginalIdentity
      ? storyKey(body.originalBook!, body.originalDate!, body.originalSlug!)
      : key;

    if (originalKey !== key) {
      const [originalStory, conflictingStory] = await Promise.all([
        kv.get(originalKey),
        kv.get(key),
      ]);
      if (!originalStory) {
        return NextResponse.json({ error: 'Original story not found' }, { status: 404 });
      }
      if (conflictingStory) {
        return NextResponse.json({ error: 'A story already exists with the selected date, book, and slug' }, { status: 409 });
      }
    }

    await kv.set(key, storyData);

    // Remove both identities before re-adding the new key. This also cleans up
    // duplicate list entries left by older saves.
    await kv.lrem(listKey(body.originalBook ?? body.book!), 0, originalKey);
    await kv.lrem(listKey(body.book!), 0, key);
    await kv.lpush(listKey(body.book!), key);
    
    const includeAll = body.includeAll ?? true; // Default to true for winter stories
    if (includeAll) {
      await kv.lrem(listAllKey(), 0, originalKey);
      await kv.lrem(listAllKey(), 0, key);
      await kv.lpush(listAllKey(), key);
    }

    if (originalKey !== key) {
      await kv.del(originalKey);
    }

    return NextResponse.json({ key });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to update story', detail: message }, { status: 500 });
  }
}
