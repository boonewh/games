// Admin tool for managing credentials (email/password) users.
//
//   GET                  — list all credentials users (passwords masked)
//   DELETE  ?email=...   — delete a single credentials user
//   POST    { email, password } — create or reset a user's password
//
// Auth: matches the existing admin/* convention — any signed-in user can call
// these. For a friend-group app this is acceptable. Tighten later if needed.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { kv } from '@vercel/kv'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

interface StoredUser {
  id: string
  email: string
  password: string
}

function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim()
}

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await kv.keys('users:*')
  const users: Array<{ id: string; email: string; passwordType: 'hashed' | 'plaintext' }> = []
  for (const key of keys) {
    const u = (await kv.get(key)) as StoredUser | null
    if (!u) continue
    users.push({
      id: u.id,
      email: u.email,
      passwordType: u.password.startsWith('$2') ? 'hashed' : 'plaintext'
    })
  }
  return NextResponse.json({ users, total: users.length })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 })

  const key = `users:${normalizeEmail(email)}`
  const existing = await kv.get(key)
  if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await kv.del(key)
  return NextResponse.json({ ok: true, deleted: key })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.email?.trim()) return NextResponse.json({ error: 'email is required' }, { status: 400 })
  if (!body.password || body.password.length < 4) {
    return NextResponse.json({ error: 'password must be at least 4 characters' }, { status: 400 })
  }

  const email = normalizeEmail(body.email)
  const key = `users:${email}`
  const existing = (await kv.get(key)) as StoredUser | null

  const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS)
  const user: StoredUser = {
    id: existing?.id ?? `user_${Date.now()}`,
    email,
    password: hashedPassword
  }
  await kv.set(key, user)

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email },
    action: existing ? 'password reset' : 'user created'
  })
}
