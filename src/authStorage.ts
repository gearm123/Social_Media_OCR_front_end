const KEY = 'translate_chat_access_token'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSession(): void {
  setAccessToken(null)
}
