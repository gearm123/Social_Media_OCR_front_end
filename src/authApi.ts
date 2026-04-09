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

/** Start loading auth providers as early as possible (e.g. on app mount). Errors are ignored. */
export function prefetchAuthProviders(): void {
  void fetchAuthProviders().catch(() => {})
}

export type UserMe = {
  id: string
  email: string
  username: string | null
  created_at: string
}

/** Maps `fetch` network/CORS failures to a short hint (browser often reports only "Failed to fetch"). */
async function fetchWithNetworkHint(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(
        'Could not reach the API. Common causes: CORS — set CORS_ORIGINS (or FRONTEND_URL) on the backend to this site’s exact origin (https://…, no trailing slash); wrong VITE_API_BASE_URL; or HTTPS page calling an HTTP API. Open DevTools → Console/Network for details.',
      )
    }
    throw e
  }
}

async function readErrorDetail(r: Response): Promise<string> {
  try {
    const j = (await r.json()) as { detail?: unknown }
    const d = j.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) {
      return d
        .map((x: { msg?: string }) => (typeof x === 'object' && x && 'msg' in x ? String(x.msg) : JSON.stringify(x)))
        .join('; ')
    }
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
    const r = await fetch(`${base}/auth/providers`)
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
  const r = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  if (!r.ok) throw new Error(await readErrorDetail(r))
  return r.json() as Promise<UserMe>
}

export async function authLogin(email: string, password: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

export async function authOAuthGoogle(creds: { id_token?: string; access_token?: string }): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const id = creds.id_token?.trim()
  const at = creds.access_token?.trim()
  const body = id ? { id_token: id } : { access_token: at ?? '' }
  const r = await fetchWithNetworkHint(`${base}/auth/oauth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

export async function authOAuthFacebook(accessToken: string): Promise<string> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetchWithNetworkHint(`${base}/auth/oauth/facebook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  })
  if (!r.ok) throw new Error(await readErrorDetail(r))
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

export async function fetchMe(): Promise<UserMe> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const t = getAccessToken()
  if (!t) throw new Error('Not signed in')
  const r = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${t}` },
  })
  if (!r.ok) throw new Error(await readErrorDetail(r))
  return r.json() as Promise<UserMe>
}

export function persistSession(accessToken: string): void {
  setAccessToken(accessToken)
}

