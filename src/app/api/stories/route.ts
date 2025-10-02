import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { listAllKey, listKey, saveStory, storyKey, getStory, listStories } from '@/lib/storage';
import type { StoryEntry } from '@/types/story';

export const runtime = 'nodejs';

type StoryRequestBody = Partial<StoryEntry> & { includeAll?: boolean };

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
    const limit = parseInt(searchParams.get('limit') || '10');

    if (book) {
      // Get stories for a specific book
      const stories = await listStories(listKey(book), limit);
      return NextResponse.json(stories);
    } else {
      // Get all stories across books
      const stories = await listStories(listAllKey(), limit);
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
      includeAll: body.includeAll,
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

    const key = storyKey(body.book!, body.date!, body.slug!);
    await kv.set(key, storyData);

    // move to top of lists  
    await kv.lrem(listKey(body.book!), 0, key);
    await kv.lpush(listKey(body.book!), key);
    if (body.includeAll) {
      await kv.lrem(listAllKey(), 0, key);
      await kv.lpush(listAllKey(), key);
    }

    return NextResponse.json({ key });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to update story', detail: message }, { status: 500 });
  }
}
