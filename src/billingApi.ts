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

/** Server creates a Paddle transaction; returns checkout URL (opens /pay?_ptxn=… on success). */
export async function startBillingCheckout(plan: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Sign in to purchase a plan.')

  const r = await fetch(`${base}/billing/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify({ plan }),
  })
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
  return url
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

/** Anonymous users: align local snapshot with GET /billing/guest-status (after load / successful job). */
export async function syncGuestBillingFromServer(): Promise<void> {
  const base = apiBase()
  if (!base) return
  const id = getOrCreateGuestBillingId()
  const r = await fetch(`${base}/billing/guest-status`, {
    headers: { 'X-Guest-Billing-Id': id },
  })
  if (!r.ok) return
  const j = (await r.json()) as BillingGuestStatusResponse
  applyGuestSnapshotFromServer(j)
}
