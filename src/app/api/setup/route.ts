import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create a default admin user - change these credentials!
    const defaultUser = {
      id: 'admin_1',
      username: 'admin',
      password: 'password123' // TODO: Change this password!
    }
    
    await kv.set('users:admin', defaultUser)
    await kv.set('settings:allowSignups', false) // Disable signups by default
    
    // Set up empty Google whitelist (you'll need to add emails manually)
    await kv.set('settings:allowedGoogleUsers', [])
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setup complete! Admin user created (admin/password123). Google OAuth ready - add emails to whitelist via /api/admin/google-users' 
    })
  } catch {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}