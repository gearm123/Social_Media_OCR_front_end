/** Stable anonymous id for GET /billing/guest-status and X-Guest-Billing-Id (must match backend: 8–64 hex). */

const STORAGE_KEY = 'translate_chat_guest_billing_id_v1'
const HEX_RE = /^[a-f0-9]{8,64}$/

function randomHexId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

let memoryFallbackId: string | null = null

export function getOrCreateGuestBillingId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)?.trim().toLowerCase()
    if (raw && HEX_RE.test(raw)) return raw
    const id = randomHexId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    if (!memoryFallbackId) memoryFallbackId = randomHexId()
    return memoryFallbackId
  }
}
