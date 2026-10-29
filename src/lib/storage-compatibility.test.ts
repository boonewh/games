import { beforeEach, expect, it, vi } from 'vitest'
import sharp from 'sharp'
import { createRequire } from 'node:module'

const mocks = vi.hoisted(() => ({ put: vi.fn(), incr: vi.fn(), expire: vi.fn() }))
vi.mock('./require-signed-in', () => ({ requireSignedIn: vi.fn().mockResolvedValue(null) }))
vi.mock('@vercel/blob', () => ({ put: mocks.put }))
vi.mock('@vercel/kv', () => ({ kv: { incr: mocks.incr, expire: mocks.expire } }))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.put.mockResolvedValue({ url: 'https://blob.example.test/fixture' })
  mocks.incr.mockResolvedValue(1)
})

it.each(['png','jpeg','webp','gif'] as const)('signed-in image uploads retain %s support and produce WebP', async format => {
  const image = await sharp({ create: { width: 80, height: 40, channels: 3, background: '#806040' } }).toFormat(format).toBuffer()
  const form = new FormData()
  form.set('file', new File([new Uint8Array(image)], `fixture.${format}`, { type: `image/${format}` }))
  const { POST } = await import('../app/api/upload/route')
  const response = await POST(new Request('http://localhost/api/upload', { method: 'POST', body: form }))
  expect(response.status).toBe(200)
  const output = mocks.put.mock.calls[0][1] as Buffer
  const metadata = await sharp(output).metadata()
  expect(metadata).toMatchObject({ format: 'webp', width: 80, height: 40 })
  expect(mocks.put.mock.calls[0][2]).toMatchObject({ access: 'public', contentType: 'image/webp' })
})

it('miniature uploads retain their JPEG size limit after the native image update', async () => {
  const image = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#806040' } }).png().toBuffer()
  const form = new FormData()
  form.set('image', new File([new Uint8Array(image)], 'fixture.png', { type: 'image/png' }))
  const { POST } = await import('../app/api/miniatures/route')
  expect((await POST(new Request('http://localhost/api/miniatures?campaign=wrath', { method: 'POST', body: form }))).status).toBe(200)
  expect(await sharp(mocks.put.mock.calls[0][1] as Buffer).metadata()).toMatchObject({ format: 'jpeg', width: 1200, height: 600 })
})

it('patched Vercel configuration schemas retain known fields and reject invalid input', () => {
  const require = createRequire(import.meta.url)
  const { parseAuthConfig, parseGlobalConfig } = require('@vercel/cli-config')
  expect(parseAuthConfig({ token: 'synthetic-token', expiresAt: 123 })).toMatchObject({ token: 'synthetic-token', expiresAt: 123 })
  expect(parseGlobalConfig({ currentTeam: 'team-fixture', telemetry: { enabled: false } })).toMatchObject({ currentTeam: 'team-fixture', telemetry: { enabled: false } })
  expect(() => parseAuthConfig({ token: { wrong: 'shape' } })).toThrow()
})
