import { type Page, expect } from '@playwright/test'

const THIRD_PARTY_HOST_RE =
  /googletagmanager|google-analytics|google\.com|gstatic\.com|googleapis\.com|facebook\.net|facebook\.com|flagcdn\.com|paddle\.com|onrender\.com|doubleclick|analytics\.google|productwing\.com|submitmysaas\.com/i

export function isFirstPartyUrl(url: string, origin: string): boolean {
  try {
    const parsed = new URL(url)
    if (THIRD_PARTY_HOST_RE.test(parsed.host)) return false
    return parsed.origin === origin
  } catch {
    return false
  }
}

export function attachPageGuards(page: Page, origin: string) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const failedRequests: string[] = []

  page.on('pageerror', (err) => {
    pageErrors.push(err.message)
  })

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (/Failed to load resource/i.test(text) && THIRD_PARTY_HOST_RE.test(text)) return
    if (/net::ERR_/i.test(text) && THIRD_PARTY_HOST_RE.test(text)) return
    consoleErrors.push(text)
  })

  page.on('response', (res) => {
    const status = res.status()
    if (status < 400) return
    const url = res.url()
    if (!isFirstPartyUrl(url, origin)) return
    failedRequests.push(`${status} ${url}`)
  })

  return {
    pageErrors,
    consoleErrors,
    failedRequests,
    assertClean() {
      expect(pageErrors, `page errors:\n${pageErrors.join('\n')}`).toEqual([])
      expect(failedRequests, `failed first-party requests:\n${failedRequests.join('\n')}`).toEqual([])
      const seriousConsole = consoleErrors.filter(
        (line) =>
          !/Failed to fetch|NetworkError|Could not reach the API|Load failed/i.test(line) &&
          !/WebSocket connection|failed to connect to websocket|vite.*websocket/i.test(line),
      )
      expect(seriousConsole, `console errors:\n${seriousConsole.join('\n')}`).toEqual([])
    },
  }
}

export async function gotoReady(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.locator('h1').first().waitFor({ state: 'visible' })
  return response
}

export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
