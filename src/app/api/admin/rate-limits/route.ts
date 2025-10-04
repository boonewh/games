// app/api/admin/rate-limits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { kv } from '@vercel/kv'

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all rate limit keys for today
    const today = new Date().toISOString().split('T')[0]
    const keys = await kv.keys(`rate_limit:*:${today}`)
    
    const rateLimits = []
    for (const key of keys) {
      const data = await kv.get(key) as { attempts: number; blocked: boolean } | null
      if (data) {
        const ip = key.split(':')[1] // Extract IP from key
        rateLimits.push({
          ip,
          attempts: data.attempts,
          blocked: data.blocked,
          remaining: Math.max(0, 20 - data.attempts)
        })
      }
    }

    return NextResponse.json({ 
      rateLimits,
      date: today,
      total: rateLimits.length 
    })
  } catch (error) {
    console.error('Rate limits fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch rate limits' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    const action = searchParams.get('action')

    if (action === 'clear-all') {
      // Clear all rate limits for today
      const today = new Date().toISOString().split('T')[0]
      const keys = await kv.keys(`rate_limit:*:${today}`)
      
      for (const key of keys) {
        await kv.del(key)
      }
      
      return NextResponse.json({ 
        message: `Cleared ${keys.length} rate limit entries for ${today}` 
      })
    }

    if (ip) {
      // Clear rate limit for specific IP
      const today = new Date().toISOString().split('T')[0]
      const key = `rate_limit:${ip}:${today}`
      await kv.del(key)
      
      return NextResponse.json({ 
        message: `Cleared rate limit for IP ${ip}` 
      })
    }

    return NextResponse.json({ error: 'Missing ip or action parameter' }, { status: 400 })
  } catch (error) {
    console.error('Rate limit clear error:', error)
    return NextResponse.json({ error: 'Failed to clear rate limit' }, { status: 500 })
  }
}