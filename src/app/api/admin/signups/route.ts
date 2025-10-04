import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    // For now, allow any authenticated request (you can add admin check here)
    // TODO: Add proper session validation when NextAuth is working
    
    const { allow } = await request.json()
    await kv.set('settings:allowSignups', allow)
    
    return NextResponse.json({ success: true, allowSignups: allow })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allowSignups = await kv.get('settings:allowSignups')
    return NextResponse.json({ allowSignups: allowSignups || false })
  } catch {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}