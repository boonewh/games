import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { encode } from 'next-auth/jwt'

const context = vi.hoisted(() => ({ cookies: {} as Record<string, string> }))
// Supply a synthetic HTTP context to the real NextAuth verifier. Crypto/session
// validation and the application's actual auth callbacks are not mocked.
vi.mock('next-auth/next', async importOriginal => {
  const actual = await importOriginal<typeof import('next-auth/next')>()
  const { IncomingMessage, ServerResponse } = await import('node:http')
  const { Socket } = await import('node:net')
  return { ...actual, getServerSession: (options: import('next-auth').NextAuthOptions) => {
    const request = Object.assign(new IncomingMessage(new Socket()), { cookies: context.cookies })
    return actual.getServerSession(request, new ServerResponse(request), options)
  } }
})
const kv = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() }))
vi.mock('@vercel/kv', () => ({ kv }))
import { requireSignedIn } from './require-signed-in'

const secret = 'synthetic-test-secret-not-a-real-credential'
beforeEach(() => {
  context.cookies = {}
  vi.clearAllMocks()
  vi.stubEnv('NEXTAUTH_SECRET', secret)
  vi.stubEnv('NEXTAUTH_URL', 'https://games.example.test')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs() })

it('requires an authentic encrypted NextAuth session, not a cookie name', async () => {
  for (const value of ['', 'invented', 'header.payload.signature']) {
    context.cookies = { '__Secure-next-auth.session-token': value }
    expect((await requireSignedIn())?.status).toBe(401)
  }
  expect(kv.get).not.toHaveBeenCalled()
  expect(kv.set).not.toHaveBeenCalled()
})

it('accepts a real encrypted session and its chunked-cookie form without touching storage', async () => {
  const jwt = await encode({ secret, token: { sub: 'friend-1', id: 'friend-1', email: 'friend@example.test' }, maxAge: 3600 })
  context.cookies = { '__Secure-next-auth.session-token': jwt }
  expect(await requireSignedIn()).toBeNull()
  context.cookies = { '__Secure-next-auth.session-token.0': jwt.slice(0, 80), '__Secure-next-auth.session-token.1': jwt.slice(80) }
  expect(await requireSignedIn()).toBeNull()
  expect(kv.get).not.toHaveBeenCalled()
  expect(kv.set).not.toHaveBeenCalled()
})

it('rejects expired sessions and tokens encrypted with another secret', async () => {
  for (const jwt of [
    await encode({ secret, token: { id: 'friend-1' }, maxAge: -120 }),
    await encode({ secret: 'wrong-synthetic-secret', token: { id: 'friend-1' }, maxAge: 3600 }),
  ]) {
    context.cookies = { '__Secure-next-auth.session-token': jwt }
    expect((await requireSignedIn())?.status).toBe(401)
  }
})
