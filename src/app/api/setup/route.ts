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
    
    // ============================================================
    // 🚪 ENABLE SIGNUPS BY DEFAULT FOR INITIAL SETUP
    // ============================================================ 
    await kv.set('settings:allowSignups', true) // Enable signups so you can test
    await kv.set('settings:allowedEmails', []) // Empty whitelist = allow all emails
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setup complete! Admin user: admin/password123. Signups ENABLED with no email restrictions. Visit /admin to manage.' 
    })
  } catch {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}