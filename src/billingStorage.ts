/**
 * Client-side billing preview (localStorage). Backend + real payments will replace this later.
 * Free tier: 3 successful runs, 1 image each. Paid: subscriptions = unlimited; "single" = 1 multi-image job credit.
 */

export const FREE_RUNS_MAX = 3

const STORAGE_KEY = 'translate_chat_billing_v1'

export type BillingSnapshot = {
  freeRunsUsed: number
  unlimitedUntil: string | null
  paidJobCredits: number
}

export type PricingPlanId = 'single' | 'day' | 'month' | 'sixmo'

export type PricingPlan = {
  id: PricingPlanId
  name: string
  priceUsd: number
  priceLabel: string
  periodHint: string
  blurb: string
  featured?: boolean
}

/** Shown in UI — adjust when you connect real checkout. */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'single',
    name: 'Single full run',
    priceUsd: 4.99,
    priceLabel: '$4.99',
    periodHint: 'one-time',
    blurb: 'One full translation with multiple screenshots in a single job — good to try the full pipeline.',
  },
  {
    id: 'day',
    name: 'Day pass',
    priceUsd: 7.99,
    priceLabel: '$7.99',
    periodHint: '24 hours',
    blurb: 'Unlimited jobs and multi-image uploads for 24 hours.',
  },
  {
    id: 'month',
    name: 'Monthly',
    priceUsd: 16.99,
    priceLabel: '$16.99',
    periodHint: 'per month',
    blurb: 'Unlimited use for a month. Best for regular chat exports.',
    featured: true,
  },
  {
    id: 'sixmo',
    name: '6 months',
    priceUsd: 79.99,
    priceLabel: '$79.99',
    periodHint: 'every 6 months',
    blurb: 'Save vs monthly — unlimited translations for half a year.',
  },
]

function defaultSnapshot(): BillingSnapshot {
  return { freeRunsUsed: 0, unlimitedUntil: null, paidJobCredits: 0 }
}

export function readBillingSnapshot(): BillingSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSnapshot()
    const j = JSON.parse(raw) as Partial<BillingSnapshot>
    return {
      freeRunsUsed: Math.min(FREE_RUNS_MAX, Math.max(0, Number(j.freeRunsUsed) || 0)),
      unlimitedUntil: typeof j.unlimitedUntil === 'string' ? j.unlimitedUntil : null,
      paidJobCredits: Math.max(0, Number(j.paidJobCredits) || 0),
    }
  } catch {
    return defaultSnapshot()
  }
}

function writeSnapshot(s: BillingSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* quota / private mode */
  }
}

export function unlimitedActive(s: BillingSnapshot): boolean {
  if (!s.unlimitedUntil) return false
  const t = new Date(s.unlimitedUntil).getTime()
  return Number.isFinite(t) && t > Date.now()
}

/** Multi-image uploads + unlimited runs (subscription / day pass). */
export function hasUnlimitedAccess(s: BillingSnapshot): boolean {
  return unlimitedActive(s)
}

/** Can upload more than one image in one job. */
export function canMultiImageUpload(s: BillingSnapshot): boolean {
  return unlimitedActive(s) || s.paidJobCredits > 0
}

export function freeRunsRemaining(s: BillingSnapshot): number {
  return Math.max(0, FREE_RUNS_MAX - s.freeRunsUsed)
}

/**
 * Whether the user may start a job with the current file count.
 */
export function canStartProcess(s: BillingSnapshot, fileCount: number): boolean {
  if (fileCount < 1) return false
  if (unlimitedActive(s)) return true
  if (s.paidJobCredits > 0) return true
  return s.freeRunsUsed < FREE_RUNS_MAX && fileCount === 1
}

export function processBlockReason(
  s: BillingSnapshot,
  fileCount: number,
): 'none' | 'no_files' | 'multi_on_free' | 'free_exhausted' {
  if (fileCount < 1) return 'no_files'
  if (unlimitedActive(s) || s.paidJobCredits > 0) return 'none'
  if (fileCount > 1) return 'multi_on_free'
  if (s.freeRunsUsed >= FREE_RUNS_MAX) return 'free_exhausted'
  return 'none'
}

/** Call after a successful pipeline result (frontend-only accounting). */
export function recordSuccessfulJob(): BillingSnapshot {
  const s = readBillingSnapshot()
  if (unlimitedActive(s)) return s
  if (s.paidJobCredits > 0) {
    const next = { ...s, paidJobCredits: s.paidJobCredits - 1 }
    writeSnapshot(next)
    return next
  }
  const next = { ...s, freeRunsUsed: Math.min(FREE_RUNS_MAX, s.freeRunsUsed + 1) }
  writeSnapshot(next)
  return next
}

/** Preview checkout: applies plan locally until real payment integration. */
export function applyMockPurchase(planId: PricingPlanId): BillingSnapshot {
  const s = readBillingSnapshot()
  const now = Date.now()
  let next: BillingSnapshot = { ...s }

  switch (planId) {
    case 'single':
      next = { ...next, paidJobCredits: next.paidJobCredits + 1 }
      break
    case 'day':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      }
      break
    case 'month':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
      break
    case 'sixmo':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 183 * 24 * 60 * 60 * 1000).toISOString(),
      }
      break
    default:
      break
  }

  writeSnapshot(next)
  return next
}

export function resetBillingPreview(): void {
  writeSnapshot(defaultSnapshot())
}
