import { apiBase } from './api'
import { getAccessToken, setAccessToken } from './authStorage'

export type AuthProviders = {
  google_client_id: string
  facebook_app_id: string
}

export type UserMe = {
  id: string
  email: string
  username: string | null
  created_at: string
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
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/auth/providers`)
  if (!r.ok) throw new Error(`Auth providers failed: ${r.status}`)
  return r.json() as Promise<AuthProviders>
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
  const r = await fetch(`${base}/auth/oauth/google`, {
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
  const r = await fetch(`${base}/auth/oauth/facebook`, {
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

