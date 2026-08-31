import { test, expect } from '@playwright/test'
import { GUIDE_WORKFLOW_STEPS } from '../src/guideWorkflowSteps'
import { INTENT_LANDINGS, USES_HUB_PATH } from '../src/intentLandings'
import { attachPageGuards, gotoReady } from './helpers'

const CONTENT_PAGES: { path: string; h1: string | RegExp; title: RegExp }[] = [
  { path: '/', h1: /Translate/, title: /Translate chat screenshots/i },
  { path: '/how-to', h1: 'How to use Translate Chat', title: /How to/i },
  { path: '/faq', h1: 'Common questions', title: /FAQ/i },
  { path: USES_HUB_PATH, h1: 'Translation guides', title: /Translation guides/i },
  { path: '/demonstration', h1: 'Demonstration', title: /Demonstration/i },
  { path: '/contact', h1: 'Contact us', title: /Contact us/i },
  { path: '/feedback', h1: 'Feedback', title: /Feedback/i },
  { path: '/privacy', h1: 'Privacy', title: /Privacy/i },
  { path: '/terms', h1: 'Terms of use', title: /Terms/i },
  { path: '/pay', h1: 'Checkout', title: /Checkout|Translate Chat/i },
  ...INTENT_LANDINGS.map((entry) => ({
    path: entry.path,
    h1: entry.h1,
    title: new RegExp(entry.seoTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  })),
]

test.describe('public pages', () => {
  for (const pageDef of CONTENT_PAGES) {
    test(`${pageDef.path} renders without first-party errors`, async ({ page, baseURL }) => {
      const guards = attachPageGuards(page, new URL(baseURL!).origin)
      const response = await gotoReady(page, pageDef.path)
      expect(response?.ok(), `${pageDef.path} HTTP ${response?.status()}`).toBeTruthy()
      await expect(page.locator('h1').first()).toHaveText(pageDef.h1)
      await expect(page).toHaveTitle(pageDef.title)
      guards.assertClean()
    })
  }

  test('guide workflow videos and demonstration gif are reachable', async ({ request, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const assets = [
      ...GUIDE_WORKFLOW_STEPS.flatMap((step) => [step.mainSrc, step.microSrc].filter(Boolean)),
      '/demonstration-chat-reconstruction.gif',
      '/translate-chat-mark.svg',
      '/og-image.png',
      '/apple-touch-icon.png',
      '/manifest.webmanifest',
    ] as string[]

    for (const asset of assets) {
      const res = await request.get(new URL(asset, origin).href)
      expect(res.status(), `${asset} → ${res.status()}`).toBeLessThan(400)
    }
  })

  test('internal links from content pages do not 404', async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const seen = new Set<string>()
    const broken: string[] = []

    for (const pageDef of CONTENT_PAGES) {
      await gotoReady(page, pageDef.path)
      const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors
          .map((a) => (a as HTMLAnchorElement).getAttribute('href') || '')
          .filter((href) => href.startsWith('/') && !href.startsWith('//')),
      )
      for (const href of hrefs) {
        const path = href.split('?')[0].split('#')[0] || '/'
        if (seen.has(path)) continue
        seen.add(path)
        const res = await page.request.get(new URL(path, origin).href)
        if (res.status() >= 400) broken.push(`${path} → ${res.status()} (from ${pageDef.path})`)
      }
    }

    expect(broken, broken.join('\n')).toEqual([])
  })
})
