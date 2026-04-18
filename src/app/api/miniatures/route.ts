import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import sharp from 'sharp';

export const runtime = 'nodejs';

// GET - List miniature images (optionally filtered by campaign)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaign = searchParams.get('campaign');

    const { blobs } = await list({ prefix: 'miniatures/', limit: 100 });

    const filtered = campaign
      ? blobs.filter(b => b.pathname.startsWith(`miniatures/${campaign}/`))
      : blobs.filter(b => b.pathname.split('/').length === 2); // root-level only (winter)

    const sortedBlobs = filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json(sortedBlobs);
  } catch (error) {
    console.error('Failed to fetch miniatures:', error);
    return NextResponse.json({ error: 'Failed to fetch miniatures' }, { status: 500 });
  }
}

// POST - Upload new miniature image (optionally campaign-prefixed)
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaign = searchParams.get('campaign');
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress and resize image using Sharp
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const folder = campaign ? `miniatures/${campaign}` : 'miniatures';
    const filename = `${folder}/${timestamp}-${originalName}.jpg`;

    // Upload to Vercel Blob
    const blob = await put(filename, compressedBuffer, {
      access: 'public',
      contentType: 'image/jpeg'
    });

    return NextResponse.json({ 
      url: blob.url,
      filename: blob.pathname 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove a miniature image
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Delete from Vercel Blob
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}