// Extracted from src/app/api/auth/[...nextauth]/route.ts so other
// server-side code (tracker API routes, server components) can call
// getServerSession(authOptions) without re-defining auth config.
//
// Behavior is intentionally identical to the previous inline definition:
// Google OAuth + credentials, KV-backed allowlist + signup gating,
// rate-limited credentials sign-in, JWT session strategy with user.id on
// the session.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { kv } from '@vercel/kv'
import { headers } from 'next/headers'

// KV layout:
//   users:<email>                = { id, email, password }  (credentials users)
//   google_users:<email>         = { id, name, email, image }
//   settings:allowSignups        = true|false
//   settings:allowedEmails       = string[]
//   rate_limit:<ip>:<YYYY-MM-DD> = { attempts, blocked }

// 20 credentials login attempts per IP per day
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]
  const key = `rate_limit:${ip}:${today}`

  const rateLimitData = (await kv.get(key)) as { attempts: number; blocked: boolean } | null

  if (!rateLimitData) {
    await kv.set(key, { attempts: 1, blocked: false }, { ex: 86400 })
    return { allowed: true, remaining: 19 }
  }

  if (rateLimitData.blocked || rateLimitData.attempts >= 20) {
    return { allowed: false, remaining: 0 }
  }

  const newAttempts = rateLimitData.attempts + 1
  const blocked = newAttempts >= 20
  await kv.set(key, { attempts: newAttempts, blocked }, { ex: 86400 })

  return { allowed: !blocked, remaining: Math.max(0, 20 - newAttempts) }
}

async function resetRateLimit(ip: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await kv.del(`rate_limit:${ip}:${today}`)
}

async function getClientIP(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const remoteAddr =
    headersList.get('x-vercel-forwarded-for') ||
    headersList.get('cf-connecting-ip') ||
    forwarded?.split(',')[0] ||
    realIP ||
    '127.0.0.1'
  return remoteAddr.trim()
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'hidden' } // 'signin' or 'signup'
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null

        const clientIP = await getClientIP()
        const rateLimit = await checkRateLimit(clientIP)
        if (!rateLimit.allowed) {
          throw new Error('Too many login attempts. You have been blocked for today. Try again tomorrow.')
        }

        const action = credentials.action || 'signin'
        const email = credentials.email.toLowerCase().trim()

        if (action === 'signup') {
          const allowSignups = await kv.get('settings:allowSignups')
          if (!allowSignups) throw new Error('Signups are currently disabled')

          const allowedEmails = ((await kv.get('settings:allowedEmails')) as string[]) || []
          if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
            throw new Error('Your email is not authorized for signup')
          }

          const existingUser = await kv.get(`users:${email}`)
          if (existingUser) throw new Error('User already exists')

          const newUser = {
            id: `user_${Date.now()}`,
            email,
            password: credentials.password // TODO: hash in production
          }
          await kv.set(`users:${email}`, newUser)
          return { id: newUser.id, name: email, email }
        }

        const user = (await kv.get(`users:${email}`)) as {
          id: string
          email: string
          password: string
        } | null
        if (!user || user.password !== credentials.password) return null

        await resetRateLimit(clientIP)
        return { id: user.id, name: user.email, email: user.email }
      }
    })
  ],
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt' as const },
  callbacks: {
    async signIn({ user, account }: any) {
      const allowSignups = await kv.get('settings:allowSignups')
      const allowedEmails = ((await kv.get('settings:allowedEmails')) as string[]) || []

      if (account?.provider === 'google') {
        const existingGoogleUser = await kv.get(`google_users:${user.email}`)
        if (!allowSignups && !existingGoogleUser) return false
        if (allowSignups && !existingGoogleUser) {
          if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
            return false
          }
        }
        await kv.set(`google_users:${user.email}`, {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        })
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        if (user.email) token.email = user.email
      }
      return token
    },
    async session({ session, token }: any) {
      if (token?.id) session.user.id = token.id as string
      if (token?.email) session.user.email = token.email as string
      return session
    }
  }
}
