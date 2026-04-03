import { apiBase } from './api'
import { getAccessToken } from './authStorage'
import {
  type BillingMeResponse,
  type PricingPlanId,
  applyGuestSnapshotFromServer,
  applySnapshotFromServer,
} from './billingStorage'
import { getOrCreateGuestBillingId } from './guestBillingId'

export type BillingStatusResponse = {
  provider?: string
  paddle_configured?: boolean
  webhook_configured?: boolean
  prices?: Partial<Record<PricingPlanId, boolean>>
  subscription_runs_per_month?: number
}

/** Public endpoint; returns null if API base is missing or the request fails. */
export async function fetchBillingStatus(): Promise<BillingStatusResponse | null> {
  const base = apiBase()
  if (!base) return null
  try {
    const r = await fetch(`${base}/billing/status`)
    if (!r.ok) return null
    return (await r.json()) as BillingStatusResponse
  } catch {
    return null
  }
}

const CHECKOUT_FETCH_MS = 60_000

function checkoutAbortSignal(): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(CHECKOUT_FETCH_MS)
  }
  return undefined
}

function mapCheckoutFetchError(e: unknown): Error {
  if (e instanceof Error && e.name === 'AbortError') {
    return new Error(
      `Checkout request timed out after ${CHECKOUT_FETCH_MS / 1000}s. Check your network, VPN, and that the API URL is reachable.`,
    )
  }
  return e instanceof Error ? e : new Error(String(e))
}

/**
 * Paddle sometimes returns `hostname.tld/path?…` without a scheme. Resolving that with
 * `new URL(s, origin)` treats the hostname as a single path segment → broken URLs like
 * `https://site.com/hostname.tld/pay` (Netlify 200 on SPA shell, checkout never loads).
 */
function looksLikeSchemelessAbsoluteHttpUrl(s: string): boolean {
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/?#]|$)/i.test(s)
}

/**
 * Resolve checkout target for navigation. Paddle may return an absolute https URL or a
 * site-relative path like `/pay?_ptxn=…` — `new URL(s)` alone fails on relative paths.
 */
function normalizeCheckoutRedirectUrl(raw: string): string {
  let s = raw.trim()
  if (!s) throw new Error('No checkout URL from server')
  if (!/^https?:\/\//i.test(s) && !s.startsWith('/') && looksLikeSchemelessAbsoluteHttpUrl(s)) {
    s = `https://${s}`
  }
  try {
    const resolved =
      s.startsWith('http://') || s.startsWith('https://') ? new URL(s) : new URL(s, window.location.origin)
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      throw new Error('Invalid checkout URL from server')
    }
    return resolved.href
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid checkout URL from server') throw e
    throw new Error('Invalid checkout URL from server')
  }
}

function parseErrorDetail(text: string): string {
  try {
    const j = JSON.parse(text) as { detail?: unknown }
    const d = j.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d) && d[0] && typeof (d[0] as { msg?: string }).msg === 'string') {
      return (d[0] as { msg: string }).msg
    }
  } catch {
    /* ignore */
  }
  return text.slice(0, 500) || 'Request failed'
}

/** Guest one-time checkout (requires email + X-Guest-Billing-Id). */
export async function startGuestBillingCheckout(plan: string, email: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const id = getOrCreateGuestBillingId()
  let r: Response
  try {
    r = await fetch(`${base}/billing/guest-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Billing-Id': id,
      },
      body: JSON.stringify({ plan, email: email.trim() }),
      signal: checkoutAbortSignal(),
    })
  } catch (e) {
    throw mapCheckoutFetchError(e)
  }
  const text = await r.text()
  if (!r.ok) {
    throw new Error(parseErrorDetail(text))
  }
  let url: string | undefined
  try {
    url = (JSON.parse(text) as { url?: string }).url
  } catch {
    throw new Error('Invalid response from billing API')
  }
  if (!url) throw new Error('No checkout URL from server')
  return normalizeCheckoutRedirectUrl(url)
}

/** Server creates a Paddle transaction; returns checkout URL (opens /pay?_ptxn=… on success). */
export async function startBillingCheckout(plan: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Sign in to purchase a plan.')

  let r: Response
  try {
    r = await fetch(`${base}/billing/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ plan }),
      signal: checkoutAbortSignal(),
    })
  } catch (e) {
    throw mapCheckoutFetchError(e)
  }
  const text = await r.text()
  if (!r.ok) {
    throw new Error(parseErrorDetail(text))
  }
  let url: string | undefined
  try {
    url = (JSON.parse(text) as { url?: string }).url
  } catch {
    throw new Error('Invalid response from billing API')
  }
  if (!url) throw new Error('No checkout URL from server')
  return normalizeCheckoutRedirectUrl(url)
}

export async function fetchBillingMe(): Promise<BillingMeResponse> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Not signed in')
  const r = await fetch(`${base}/billing/me`, {
    headers: { Authorization: `Bearer ${t}` },
  })
  const text = await r.text()
  if (!r.ok) throw new Error(parseErrorDetail(text))
  return JSON.parse(text) as BillingMeResponse
}

/** Sync local billing snapshot from server (call after login and after each successful job). */
export async function syncBillingFromServer(): Promise<void> {
  const me = await fetchBillingMe()
  applySnapshotFromServer(me)
}

export type BillingGuestStatusResponse = {
  guest_key: string
  free_runs_used: number
  free_runs_remaining: number
  free_runs_max: number
  paid_job_credits: number
}

const GUEST_CLAIM_RETRIES = 6
const GUEST_CLAIM_RETRY_MS = 1500

/**
 * After Paddle checkout completes in the browser: server verifies the transaction with Paddle
 * and grants guest credits (covers slow/missing webhooks on small hosts).
 */
export async function claimGuestPaidTransaction(transactionId: string): Promise<BillingGuestStatusResponse> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const id = getOrCreateGuestBillingId()
  let lastMsg = 'Request failed'
  for (let attempt = 0; attempt < GUEST_CLAIM_RETRIES; attempt++) {
    let r: Response
    try {
      r = await fetch(`${base}/billing/guest-claim-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Billing-Id': id,
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      })
    } catch (e) {
      throw mapCheckoutFetchError(e)
    }
    const text = await r.text()
    if (r.ok) {
      const j = JSON.parse(text) as BillingGuestStatusResponse
      applyGuestSnapshotFromServer(j)
      return j
    }
    lastMsg = parseErrorDetail(text)
    if (r.status === 409 && attempt < GUEST_CLAIM_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, GUEST_CLAIM_RETRY_MS))
      continue
    }
    throw new Error(lastMsg)
  }
  throw new Error(lastMsg)
}

const USER_CLAIM_RETRIES = 6
const USER_CLAIM_RETRY_MS = 1500

/** Signed-in: verify Paddle txn and refresh billing (single/debug one-time purchases on /pay). */
export async function claimUserPaidTransaction(transactionId: string): Promise<void> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Sign in to claim this purchase')
  let lastMsg = 'Request failed'
  for (let attempt = 0; attempt < USER_CLAIM_RETRIES; attempt++) {
    let r: Response
    try {
      r = await fetch(`${base}/billing/user-claim-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      })
    } catch (e) {
      throw mapCheckoutFetchError(e)
    }
    const text = await r.text()
    if (r.ok) {
      await syncBillingFromServer()
      return
    }
    lastMsg = parseErrorDetail(text)
    if (r.status === 409 && attempt < USER_CLAIM_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, USER_CLAIM_RETRY_MS))
      continue
    }
    throw new Error(lastMsg)
  }
  throw new Error(lastMsg)
}

/** Anonymous users: align local snapshot with GET /billing/guest-status (after load / successful job). */
export async function syncGuestBillingFromServer(): Promise<boolean> {
  const base = apiBase()
  if (!base) return false
  const id = getOrCreateGuestBillingId()
  let r: Response
  try {
    r = await fetch(`${base}/billing/guest-status`, {
      headers: { 'X-Guest-Billing-Id': id },
    })
  } catch {
    return false
  }
  if (!r.ok) return false
  try {
    const j = (await r.json()) as BillingGuestStatusResponse
    applyGuestSnapshotFromServer(j)
    return true
  } catch {
    return false
  }
}
