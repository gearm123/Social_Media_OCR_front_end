import { apiBase } from './api'
import { getAccessToken } from './authStorage'

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
