import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()
    
    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: 'emails must be an array' }, { status: 400 })
    }
    
    await kv.set('settings:allowedGoogleUsers', emails)
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated Google user whitelist with ${emails.length} emails`,
      allowedEmails: emails 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update whitelist' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allowedUsers = await kv.get('settings:allowedGoogleUsers') as string[] || []
    return NextResponse.json({ allowedEmails: allowedUsers })
  } catch {
    return NextResponse.json({ error: 'Failed to get whitelist' }, { status: 500 })
  }
}