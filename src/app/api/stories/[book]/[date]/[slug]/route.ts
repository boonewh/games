import { NextResponse } from 'next/server';
import { getStory, storyKey } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ book: string; date: string; slug: string }> }
) {
  try {
    const { book, date, slug } = await params;
    const key = storyKey(book, date, slug);
    const story = await getStory(key);
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    return NextResponse.json(story);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to fetch story', detail: message }, { status: 500 });
  }
}