import { apiBase } from './api'
import { getAccessToken, setAccessToken } from './authStorage'

export type AuthProviders = {
  google_client_id: string
  facebook_app_id: string
}

let authProvidersCache: AuthProviders | null = null
let authProvidersInflight: Promise<AuthProviders> | null = null

/** Synchronously read providers if a prefetch or prior fetch already populated the cache. */
export function getCachedAuthProviders(): AuthProviders | null {
  return authProvidersCache
}

/** Clear cached provider config (e.g. after a failed load, before Retry). */
export function invalidateAuthProvidersCache(): void {
  authProvidersCache = null
  authProvidersInflight = null
}

/** Start loading auth providers as early as possible (e.g. on app mount). Retries a few times for cold API. */
export function prefetchAuthProviders(): void {
  void (async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await fetchAuthProviders()
        return
      } catch {
        if (i < 2) await delay(700 + i * 550)
      }
    }
  })()
}

function isUnreachableApiError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('Could not reach the API')
}

export type UserMe = {
  id: string
  email: string
  username: string | null
  created_at: string
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Default cap so a hung request cannot leave the sign-in UI stuck on “Please wait…”. */
const AUTH_FETCH_TIMEOUT_MS = 26_000
/** Provider IDs load first; keep slightly shorter so OAuth buttons fail fast on cold API. */
const AUTH_PROVIDERS_TIMEOUT_MS = 14_000

function isAbortError(e: unknown): boolean {
  return (
    (e instanceof DOMException && e.name === 'AbortError') ||
    (typeof e === 'object' &&
      e !== null &&
      'name' in e &&
      (e as { name?: string }).name === 'AbortError')
  )
}

/** Maps `fetch` network/CORS failures to a short hint (browser often reports only "Failed to fetch"). */
async function fetchWithNetworkHint(
  url: string,
  init: RequestInit,
  requestLabel: string,
  timeoutMs: number = AUTH_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } catch (e) {
    if (isAbortError(e)) {
      throw new Error(
        `Request timed out (${requestLabel}). The API may be cold-starting — try again in a few seconds.`,
      )
    }
    if (e instanceof TypeError) {
      throw new Error(
        `Could not reach the API (${requestLabel}). Common causes: CORS — add this page’s exact origin to CORS_ORIGINS on Render (https://…, no trailing slash); Netlify **deploy preview** URLs need their own entry; wrong or missing VITE_API_BASE_URL; HTTPS page calling HTTP API; API cold start (retry below); or extensions blocking requests (some lists match “google” or “facebook” in the path). Check DevTools → Network for ${requestLabel}.`,
      )
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

/** Retries only when `fetch` throws (transient network / cold host). Does not fix CORS misconfiguration. */
async function fetchWithNetworkHintRetry(
  url: string,
  init: RequestInit,
  requestLabel: string,
  extraAttempts: number,
): Promise<Response> {
  let last: unknown
  const attempts = Math.max(0, extraAttempts)
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fetchWithNetworkHint(url, init, requestLabel)
    } catch (e) {
      last = e
      if (!isUnreachableApiError(e) || i === attempts) throw e
      await delay(650 + i * 400)
    }
  }
  throw last
}

async function readErrorDetail(r: Response): Promise<string> {
  try {
    const j = (await r.json()) as { detail?: unknown; message?: unknown }
    const d = j.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) {
      return d
        .map((x: { msg?: string }) => (typeof x === 'object' && x && 'msg' in x ? String(x.msg) : JSON.stringify(x)))
        .join('; ')
    }
    if (d && typeof d === 'object') {
      const o = d as Record<string, unknown>
      if (typeof o.msg === 'string') return o.msg
      if (typeof o.message === 'string') return o.message
    }
    if (typeof j.message === 'string') return j.message
    return r.statusText
  } catch {
    return r.statusText
  }
}

export async function fetchAuthProviders(): Promise<AuthProviders> {
  if (authProvidersCache) return authProvidersCache
  if (authProvidersInflight) return authProvidersInflight
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  authProvidersInflight = (async () => {
    const r = await fetchWithNetworkHint(
      `${base}/auth/providers`,
      {},
      'GET /auth/providers',
      AUTH_PROVIDERS_TIMEOUT_MS,
    )
    if (!r.ok) throw new Error(`Auth providers failed: ${r.status}`)
    return (await r.json()) as AuthProviders
  })()
  try {
    const p = await authProvidersInflight
    authProvidersCache = p
    return p
  } finally {
    authProvidersInflight = null
  }
}

export async function authRegister(username: string, email: string, password: string): Promise<UserMe> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetchWithNetworkHint(
    `${base}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    },
    'POST /auth/register',
  )
  if (!r.ok) throw new Error(await readErrorDetail(r))
  return r.json() as Promise<UserMe>
}

export async function authLogin(email: string, password: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetchWithNetworkHint(
    `${base}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    'POST /auth/login',
  )
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

/**
 * Exchange Google tokens for our JWT. Uses a short retry for flaky networks / cold API.
 * Falls back to `POST /auth/oauth/gsi` on unreachable errors (same handler; path without “google”).
 */
export async function authOAuthGoogle(creds: { id_token?: string; access_token?: string }): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const id = creds.id_token?.trim()
  const at = creds.access_token?.trim()
  const body = id ? { id_token: id } : { access_token: at ?? '' }
  const payload = JSON.stringify(body)

  const post = (segment: 'google' | 'gsi') =>
    fetchWithNetworkHintRetry(
      `${base}/auth/oauth/${segment}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      },
      `POST /auth/oauth/${segment}`,
      1,
    )

  let r: Response
  try {
    r = await post('google')
  } catch (e) {
    if (!isUnreachableApiError(e)) throw e
    r = await post('gsi')
  }
  if (r.status === 404) {
    r = await post('gsi')
  }
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

/**
 * Exchange a Facebook user access token for our JWT.
 * Tries `POST /auth/oauth/fb` first (shorter path for strict blockers), then `facebook`, and retries
 * the alternate path on network failures or HTTP 404 (older APIs without `/fb`).
 */
export async function authOAuthFacebook(accessToken: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const body = JSON.stringify({ access_token: accessToken })
  const post = (segment: 'fb' | 'facebook') =>
    fetchWithNetworkHint(
      `${base}/auth/oauth/${segment}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
      `POST /auth/oauth/${segment}`,
    )

  let r: Response
  try {
    r = await post('fb')
  } catch (e) {
    if (!isUnreachableApiError(e)) throw e
    r = await post('facebook')
  }
  if (r.status === 404) {
    r = await post('facebook')
  }
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

export async function fetchMe(): Promise<UserMe> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Not signed in')
  const r = await fetchWithNetworkHint(
    `${base}/auth/me`,
    { headers: { Authorization: `Bearer ${t}` } },
    'GET /auth/me',
  )
  if (!r.ok) throw new Error(await readErrorDetail(r))
  return r.json() as Promise<UserMe>
}

export function persistSession(accessToken: string): void {
  setAccessToken(accessToken)
}

/** Safe message for `catch (e)` when the value may not be an Error (e.g. thrown strings). */
export function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return String(e)
}

