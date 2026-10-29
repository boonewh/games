import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  session: vi.fn(), kv: { get: vi.fn(), set: vi.fn(), del: vi.fn(), keys: vi.fn(), lrange: vi.fn(), lpush: vi.fn(), lrem: vi.fn(), incr: vi.fn(), expire: vi.fn() },
  blob: { put: vi.fn(), list: vi.fn(), del: vi.fn() },
  listFiles: vi.fn(), uploadFile: vi.fn(), authorize: vi.fn(), download: vi.fn(), sharp: vi.fn(),
}))
vi.mock('next-auth/next', () => ({ getServerSession: mocks.session }))
vi.mock('./auth-options', () => ({ authOptions: { session: { strategy: 'jwt' } } }))
vi.mock('@vercel/kv', () => ({ kv: mocks.kv }))
vi.mock('@vercel/blob', () => mocks.blob)
vi.mock('./b2', () => ({ listFiles: mocks.listFiles, uploadFile: mocks.uploadFile }))
vi.mock('backblaze-b2', () => ({ default: class { authorize = mocks.authorize; downloadFileByName = mocks.download } }))
vi.mock('sharp', () => ({ default: mocks.sharp }))

const routes = [
  ['admin/emails', () => import('../app/api/admin/emails/route'), ['GET', 'POST']],
  ['admin/google-users', () => import('../app/api/admin/google-users/route'), ['GET', 'POST']],
  ['admin/signups', () => import('../app/api/admin/signups/route'), ['GET', 'POST']],
  ['admin/users', () => import('../app/api/admin/users/route'), ['GET', 'POST', 'DELETE']],
  ['admin/rate-limits', () => import('../app/api/admin/rate-limits/route'), ['GET', 'DELETE']],
  ['stories', () => import('../app/api/stories/route'), ['POST', 'PUT']],
  ['stories/book/date/slug', () => import('../app/api/stories/[book]/[date]/[slug]/route'), ['DELETE']],
  ['miniatures', () => import('../app/api/miniatures/route'), ['POST', 'DELETE']],
  ['upload', () => import('../app/api/upload/route'), ['POST']],
  ['vault/list', () => import('../app/api/vault/list/route'), ['GET']],
  ['vault/upload', () => import('../app/api/vault/upload/route'), ['POST']],
  ['vault/proxy', () => import('../app/api/vault/proxy/route'), ['GET']],
] as const

const context = { params: Promise.resolve({ book: 'book', date: 'date', slug: 'slug' }) }
const services = [...Object.values(mocks.kv), ...Object.values(mocks.blob), mocks.listFiles, mocks.uploadFile,
  mocks.authorize, mocks.download, mocks.sharp]
beforeEach(() => {
  vi.clearAllMocks()
  mocks.session.mockResolvedValue(null)
  vi.stubEnv('B2_APPLICATION_KEY_ID', 'local-test-key')
  vi.stubEnv('B2_APPLICATION_KEY', 'local-test-secret')
  vi.stubEnv('B2_BUCKET_NAME', 'local-test-bucket')
})

describe.each(routes)('%s access boundary', (name, load, methods) => {
  it.each(methods)('%s rejects absent and fabricated cookies before reading bodies or calling services', async method => {
    const routeModule = await load()
    // Route signatures vary only in optional params; all accept this Request/context.
    const handler = routeModule[method as keyof typeof routeModule] as (request: NextRequest, params: typeof context) => Promise<Response>
    for (const cookie of ['', 'next-auth.session-token=fabricated', '__Secure-next-auth.session-token=expired']) {
      const request = new NextRequest(`http://localhost/api/${name}?file=private.pdf`, {
        method, headers: { cookie }, ...(method === 'GET' ? {} : { body: 'not even valid JSON' }),
      })
      const result = await handler(request, context)
      expect(result.status).toBe(401)
      expect(request.bodyUsed).toBe(false)
      for (const service of services) expect(service).not.toHaveBeenCalled()
    }
  })
})

it('retired setup never reads or resets accounts/settings', async () => {
  const { POST } = await import('../app/api/setup/route')
  expect((await POST()).status).toBe(410)
  for (const service of services) expect(service).not.toHaveBeenCalled()
})

it('keeps public story and miniature reads independent of sign-in', async () => {
  mocks.kv.lrange.mockResolvedValue([])
  mocks.blob.list.mockResolvedValue({ blobs: [] })
  const stories = await import('../app/api/stories/route')
  const miniatures = await import('../app/api/miniatures/route')
  expect((await stories.GET(new NextRequest('http://localhost/api/stories?book=test'))).status).toBe(200)
  expect((await miniatures.GET(new NextRequest('http://localhost/api/miniatures'))).status).toBe(200)
  expect(mocks.session).not.toHaveBeenCalled()
})

it('keeps exactly the existing eight public character sheets readable without a session', async () => {
  mocks.authorize.mockResolvedValue({})
  mocks.download.mockResolvedValue({ data: Buffer.from('%PDF-fixture'), headers: { 'content-type': 'application/pdf' } })
  const { GET } = await import('../app/api/vault/proxy/route')
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  try {
    for (const file of ['aelira.pdf','alaric.pdf','joshua.pdf','ivan.pdf','caleth.pdf','nageru.pdf','thane.pdf','korroc.pdf']) {
      expect((await GET(new Request(`http://localhost/api/vault/proxy?file=${file}`))).status).toBe(200)
    }
    expect(mocks.session).not.toHaveBeenCalled()
    expect(mocks.download).toHaveBeenCalledTimes(8)
    mocks.download.mockClear()
    for (const file of ['private.pdf','folder/aelira.pdf','aelira.pdf/other','AELIRA.PDF']) {
      expect((await GET(new Request(`http://localhost/api/vault/proxy?file=${encodeURIComponent(file)}`))).status).toBe(401)
    }
    expect(mocks.download).not.toHaveBeenCalled()
  } finally { log.mockRestore() }
})

it('retains shared settings access for a verified signed-in member', async () => {
  mocks.session.mockResolvedValue({ user: { id: 'friend-1', email: 'friend@example.test' } })
  mocks.kv.set.mockResolvedValue('OK')
  mocks.kv.get.mockResolvedValue(false)
  const { GET, POST } = await import('../app/api/admin/signups/route')
  expect(await (await GET()).json()).toMatchObject({ allowSignups: false })
  const result = await POST(new NextRequest('http://localhost/api/admin/signups', {
    method: 'POST', body: JSON.stringify({ allow: true }),
  }))
  expect(result.status).toBe(200)
  expect(mocks.kv.set).toHaveBeenCalledWith('settings:allowSignups', true)
})

it('a verified member can still save a story and list private vault files', async () => {
  mocks.session.mockResolvedValue({ user: { id: 'friend-1' } })
  mocks.listFiles.mockResolvedValue([{ fileName: 'fixture.pdf' }])
  const stories = await import('../app/api/stories/route')
  const vault = await import('../app/api/vault/list/route')
  const result = await stories.POST(new Request('http://localhost/api/stories', {
    method: 'POST', body: JSON.stringify({ book: 'fixture', date: '2026-10-29', slug: 'story', story: [{ content: 'Fixture' }] }),
  }))
  expect(result.status).toBe(200)
  expect(mocks.kv.set).toHaveBeenCalledWith('story:fixture:2026-10-29:story', expect.any(Object))
  expect((await vault.GET()).status).toBe(200)
  expect(mocks.listFiles).toHaveBeenCalledTimes(1)
})
