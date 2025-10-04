import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // 🚪 MASTER SIGNUP TOGGLE - CONTROLS ALL NEW SIGNUPS
    // ============================================================
    // This controls BOTH Google OAuth AND username/password signups
    // When false: Only existing users can sign in
    // When true: Anyone can create new accounts
    
    const { allow } = await request.json()
    await kv.set('settings:allowSignups', allow)
    
    const status = allow ? 'ENABLED' : 'DISABLED'
    return NextResponse.json({ 
      success: true, 
      allowSignups: allow,
      message: `All signups (Google + credentials) are now ${status}`
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allowSignups = await kv.get('settings:allowSignups')
    const status = allowSignups ? 'ENABLED' : 'DISABLED'
    
    return NextResponse.json({ 
      allowSignups: allowSignups || false,
      status: `All signups (Google + credentials) are ${status}`,
      note: 'Use POST with {"allow": true/false} to toggle'
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}