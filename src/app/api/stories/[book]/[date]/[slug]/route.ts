import { NextResponse } from 'next/server';
import { getStory, storyKey } from '@/lib/storage';
import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ book: string; date: string; slug: string }> }
) {
  try {
    const { book, date, slug } = await params;
    const key = storyKey(book, date, slug);
    
    // Check if story exists
    const story = await getStory(key);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Delete associated image if it exists
    if (story && typeof story === 'object' && 'coverUrl' in story && story.coverUrl) {
      try {
        await del(story.coverUrl as string);
        console.log('Deleted associated image:', story.coverUrl);
      } catch (imageError) {
        console.error('Failed to delete associated image:', imageError);
        // Continue with story deletion even if image deletion fails
      }
    }
    
    // Delete the story
    await kv.del(key);
    
    // Remove from book list (we can't easily remove from middle of list, but that's ok)
    // The list will still have the key, but when fetched it will be null and filtered out
    
    return NextResponse.json({ success: true, message: 'Story and associated image deleted successfully' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to delete story', detail: message }, { status: 500 });
  }
}