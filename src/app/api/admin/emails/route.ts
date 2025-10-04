import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const allowedEmails = await kv.get('settings:allowedEmails') as string[] || []
    
    return NextResponse.json({ 
      allowedEmails,
      count: allowedEmails.length,
      note: allowedEmails.length === 0 ? 'No restrictions - anyone can sign up' : 'Only listed emails can sign up'
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get email whitelist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()
    
    if (!action || !email) {
      return NextResponse.json({ error: 'Missing action or email' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const currentEmails = await kv.get('settings:allowedEmails') as string[] || []
    
    let updatedEmails: string[]
    
    if (action === 'add') {
      if (currentEmails.includes(normalizedEmail)) {
        return NextResponse.json({ error: 'Email already in whitelist' }, { status: 400 })
      }
      updatedEmails = [...currentEmails, normalizedEmail].sort()
    } else if (action === 'remove') {
      updatedEmails = currentEmails.filter(e => e !== normalizedEmail)
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "add" or "remove"' }, { status: 400 })
    }
    
    await kv.set('settings:allowedEmails', updatedEmails)
    
    return NextResponse.json({ 
      success: true,
      action,
      email: normalizedEmail,
      allowedEmails: updatedEmails,
      message: `${action === 'add' ? 'Added' : 'Removed'} ${normalizedEmail} ${action === 'add' ? 'to' : 'from'} whitelist`
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update email whitelist' }, { status: 500 })
  }
}