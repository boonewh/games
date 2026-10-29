import { test, expect, type Page } from '@playwright/test'
import { encode } from 'next-auth/jwt'

const story = { book: 'the-worldwound-incursion', date: '2026-10-29', slug: 'fixture', story: [
  { type: 'heading', level: 1, content: 'Fixture Chronicle' },
  { type: 'paragraph', content: 'An older plain-text story remains editable.' },
  { type: 'paragraph', content: [{ type: 'text', text: 'Marked story text', marks: [{ type: 'bold' }] }] },
] }

async function signIn(page: Page) {
  const value = await encode({ secret: 'synthetic-local-build-secret-not-real',
    token: { sub: 'friend-1', id: 'friend-1', email: 'friend@example.test', name: 'Fixture Friend' }, maxAge: 3600 })
  await page.context().addCookies([{ name: 'next-auth.session-token', value, url: 'http://127.0.0.1:3210' }])
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.hostname !== '127.0.0.1') return route.abort()
    if (url.pathname === '/api/stories') return route.fulfill({ json: [] })
    if (url.pathname.startsWith('/api/stories/')) return route.fulfill({ json: story })
    if (url.pathname === '/api/miniatures') return route.fulfill({ json: [] })
    if (url.pathname.startsWith('/api/tracker/')) return route.fulfill({ json: { characters: [], parties: [] } })
    if (url.pathname === '/api/vault/list') return route.fulfill({ json: { files: [] } })
    return route.continue()
  })
})

for (const width of [1440, 390]) {
  test(`public campaign and sign-in pages render at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const path of ['/', '/winter', '/sign-in']) {
      expect((await page.goto(path))?.status()).toBe(200)
      await expect(page.getByRole('heading').first()).toBeVisible()
      const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll('body *')].filter(element => {
          if (element.getBoundingClientRect().right <= innerWidth + 1) return false
          for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
            if (['hidden','clip','auto','scroll'].includes(getComputedStyle(parent).overflowX)) return false
          }
          return true
        }).map(element => ({ tag: element.tagName, class: element.className.toString().slice(0, 160),
          right: element.getBoundingClientRect().right, text: element.textContent?.slice(0, 60) })).slice(0, 12) }))
      await page.screenshot({ path: `test-results/games-page-${path === '/' ? 'wrath' : path.slice(1)}-${width}.png`, fullPage: true })
      expect(layout.width, JSON.stringify({ path, ...layout })).toBeLessThanOrEqual(width)
    }
    expect(errors).toEqual([])
    await page.screenshot({ path: `test-results/games-signin-${width}.png`, fullPage: true })
  })
}

test('unsigned editor and tracker requests still redirect to sign-in', async ({ page }) => {
  for (const path of ['/editor', '/wrath/tracker']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/sign-in(?:\?|$)/)
  }
})

test('the built server rejects fabricated cookies before private API side effects', async ({ request }) => {
  for (const path of ['/api/admin/emails','/api/admin/google-users','/api/admin/signups','/api/admin/users',
    '/api/admin/rate-limits','/api/vault/list','/api/vault/proxy?file=private.pdf']) {
    expect((await request.get(path, { headers: { Cookie: 'next-auth.session-token=invented' } })).status()).toBe(401)
  }
  for (const path of ['/api/admin/emails','/api/admin/google-users','/api/admin/signups','/api/admin/users',
    '/api/stories','/api/miniatures','/api/upload','/api/vault/upload']) {
    expect((await request.post(path, { headers: { Cookie: 'next-auth.session-token=invented' }, data: 'invalid' })).status()).toBe(401)
  }
  expect((await request.put('/api/stories', { data: 'invalid' })).status()).toBe(401)
  for (const path of ['/api/stories/book/date/slug','/api/miniatures?url=fixture']) {
    expect((await request.delete(path)).status()).toBe(401)
  }
  expect((await request.post('/api/setup')).status()).toBe(410)
})

test('a valid signed session opens the tracker with mocked data', async ({ page }) => {
  await signIn(page)
  await page.goto('/wrath/tracker')
  await expect(page.getByRole('heading', { name: 'Character Tracker', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '+ New Character', exact: true })).toBeVisible()
  await expect(page.getByText('Loading', { exact: true })).toHaveCount(0)
  await page.screenshot({ path: 'test-results/games-tracker-desktop.png', fullPage: true })
})

test('Tiptap retains old plain-text and formatted story content through an update', async ({ page }) => {
  await signIn(page)
  let saved: Record<string, unknown> | undefined
  await page.route('**/api/stories', async route => {
    if (route.request().method() === 'PUT') {
      saved = route.request().postDataJSON()
      return route.fulfill({ json: { key: 'fixture-saved' } })
    }
    return route.fulfill({ json: [] })
  })
  await page.goto('/editor?campaign=wrath&id=the-worldwound-incursion-2026-10-29-fixture')
  const editor = page.locator('[contenteditable="true"]')
  await expect(editor).toContainText('An older plain-text story remains editable.')
  await expect(editor.locator('strong')).toHaveText('Marked story text')
  await page.getByRole('button', { name: 'Update Entry', exact: true }).click()
  await expect.poll(() => saved).toBeTruthy()
  expect(saved).toMatchObject({ book: story.book, date: story.date, originalBook: story.book,
    originalDate: story.date, originalSlug: story.slug })
  expect(JSON.stringify(saved)).toContain('An older plain-text story remains editable.')
  expect(JSON.stringify(saved)).toContain('"bold"')
})
