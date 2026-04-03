/**
 * Billing snapshot: synced from GET /billing/me when signed in, else local defaults.
 */

/** Must match backend ``USER_FREE_RUNS_MAX`` / guest messaging (currently 1 free single-image run). */
export const FREE_RUNS_MAX = 1

const STORAGE_KEY = 'translate_chat_billing_v1'

export type BillingSnapshot = {
  freeRunsUsed: number
  /** From GET /billing/me or guest-status when present; defaults to FREE_RUNS_MAX. */
  freeRunsMax?: number
  /** Paddle subscription period end (access_until). Quota resets each calendar month while this is in the future. */
  unlimitedUntil: string | null
  paidJobCredits: number
  subscriptionRunsCap: number
  subscriptionRunsUsedThisMonth: number
}

/** Effective free-try cap (server may send guest/user max separately). */
export function freeRunsCap(s: BillingSnapshot): number {
  const n = Number(s.freeRunsMax)
  if (Number.isFinite(n) && n >= 1) return Math.floor(n)
  return FREE_RUNS_MAX
}

export type PricingPlanId = 'single' | 'debug' | 'month' | 'sixmo' | 'year'

/** One-time purchases (guests may buy without an account). */
export function isOneTimePlan(id: PricingPlanId): boolean {
  return id === 'single' || id === 'debug'
}

/** Recurring plans (require a signed-in account). */
export function isSubscriptionPlan(id: PricingPlanId): boolean {
  return id === 'month' || id === 'sixmo' || id === 'year'
}

export type PricingPlan = {
  id: PricingPlanId
  name: string
  priceUsd: number
  priceLabel: string
  periodHint: string
  blurb: string
  featured?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'single',
    name: 'Single full run',
    priceUsd: 2.99,
    priceLabel: '$2.99',
    periodHint: 'one-time',
    blurb: 'One multi-image job. No subscription.',
  },
  {
    id: 'debug',
    name: 'Debug (test)',
    priceUsd: 0.1,
    priceLabel: '$0.10',
    periodHint: 'one-time',
    blurb: 'Cheap live checkout test — grants one full-run credit like Single. Use before wider launch.',
  },
  {
    id: 'month',
    name: 'Monthly',
    priceUsd: 8,
    priceLabel: '$8',
    periodHint: 'per month',
    blurb: 'Recurring monthly. Included runs per calendar month, then wait or buy a single run.',
    featured: true,
  },
  {
    id: 'sixmo',
    name: '6 months',
    priceUsd: 36,
    priceLabel: '$36',
    periodHint: 'every 6 months',
    blurb: '$6/mo effective — billed $36 every six months. Same monthly run quota.',
  },
  {
    id: 'year',
    name: 'Annual',
    priceUsd: 48,
    priceLabel: '$48',
    periodHint: 'per year',
    blurb: '$4/mo effective — full year charged upfront, renews yearly. Same monthly run quota.',
  },
]

/**
 * Plans shown in the pricing UI. Debug is listed first while visible so checkout is easy to test.
 * Set `VITE_SHOW_DEBUG_PRICE=false` before production builds to hide the debug tier.
 */
export function getVisiblePricingPlans(): PricingPlan[] {
  const hideDebug = import.meta.env.VITE_SHOW_DEBUG_PRICE === 'false'
  const list = hideDebug ? PRICING_PLANS.filter((p) => p.id !== 'debug') : [...PRICING_PLANS]
  if (!hideDebug) {
    const debug = list.find((p) => p.id === 'debug')
    const rest = list.filter((p) => p.id !== 'debug')
    if (debug) return [debug, ...rest]
  }
  return list
}

export type BillingMeResponse = {
  access_until: string | null
  subscription_active?: boolean
  subscription_runs_cap: number
  subscription_runs_used_this_month: number
  subscription_runs_remaining: number
  paid_job_credits: number
  free_runs_used: number
  free_runs_max?: number
}

function defaultSnapshot(): BillingSnapshot {
  return {
    freeRunsUsed: 0,
    unlimitedUntil: null,
    paidJobCredits: 0,
    subscriptionRunsCap: 7,
    subscriptionRunsUsedThisMonth: 0,
  }
}

export function readBillingSnapshot(): BillingSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSnapshot()
    const j = JSON.parse(raw) as Partial<BillingSnapshot>
    const maxRaw = Number(j.freeRunsMax)
    const freeRunsMax =
      Number.isFinite(maxRaw) && maxRaw >= 1 ? Math.floor(maxRaw) : undefined
    const cap = freeRunsCap({ ...defaultSnapshot(), freeRunsMax })
    return {
      freeRunsUsed: Math.min(cap, Math.max(0, Number(j.freeRunsUsed) || 0)),
      freeRunsMax,
      unlimitedUntil: typeof j.unlimitedUntil === 'string' ? j.unlimitedUntil : null,
      paidJobCredits: Math.max(0, Number(j.paidJobCredits) || 0),
      subscriptionRunsCap: Math.max(1, Number(j.subscriptionRunsCap) || 7),
      subscriptionRunsUsedThisMonth: Math.max(0, Number(j.subscriptionRunsUsedThisMonth) || 0),
    }
  } catch {
    return defaultSnapshot()
  }
}

export function writeSnapshot(s: BillingSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* quota / private mode */
  }
}

/** Subscription paid through this instant (Paddle access_until). */
export function subscriptionPeriodActive(s: BillingSnapshot): boolean {
  if (!s.unlimitedUntil) return false
  const t = new Date(s.unlimitedUntil).getTime()
  return Number.isFinite(t) && t > Date.now()
}

export function subscriptionRunsRemaining(s: BillingSnapshot): number {
  if (!subscriptionPeriodActive(s)) return 0
  const cap = s.subscriptionRunsCap ?? 7
  const used = s.subscriptionRunsUsedThisMonth ?? 0
  return Math.max(0, cap - used)
}

/** Active subscription with at least one run left this month. */
export function hasSubscriptionAccess(s: BillingSnapshot): boolean {
  return subscriptionPeriodActive(s) && subscriptionRunsRemaining(s) > 0
}

/** @deprecated use subscriptionPeriodActive */
export function unlimitedActive(s: BillingSnapshot): boolean {
  return subscriptionPeriodActive(s)
}

export function hasUnlimitedAccess(s: BillingSnapshot): boolean {
  return hasSubscriptionAccess(s)
}

export function canMultiImageUpload(s: BillingSnapshot): boolean {
  return s.paidJobCredits > 0 || hasSubscriptionAccess(s)
}

export function freeRunsRemaining(s: BillingSnapshot): number {
  const cap = freeRunsCap(s)
  return Math.max(0, cap - s.freeRunsUsed)
}

export function canStartProcess(s: BillingSnapshot, fileCount: number): boolean {
  if (fileCount < 1) return false
  if (hasSubscriptionAccess(s)) return true
  if (s.paidJobCredits > 0) return true
  const cap = freeRunsCap(s)
  return s.freeRunsUsed < cap && fileCount === 1
}

export type ProcessBlockReason =
  | 'none'
  | 'no_files'
  | 'multi_on_free'
  | 'free_exhausted'
  | 'quota_exhausted'

export function processBlockReason(s: BillingSnapshot, fileCount: number): ProcessBlockReason {
  if (fileCount < 1) return 'no_files'
  if (subscriptionPeriodActive(s) && subscriptionRunsRemaining(s) <= 0 && s.paidJobCredits <= 0) {
    return 'quota_exhausted'
  }
  if (hasSubscriptionAccess(s) || s.paidJobCredits > 0) return 'none'
  if (fileCount > 1) return 'multi_on_free'
  if (s.freeRunsUsed >= freeRunsCap(s)) return 'free_exhausted'
  return 'none'
}

export function billingMeToSnapshot(me: BillingMeResponse): BillingSnapshot {
  const capRaw = Number(me.free_runs_max)
  const freeRunsMax =
    Number.isFinite(capRaw) && capRaw >= 1 ? Math.floor(capRaw) : undefined
  return {
    freeRunsUsed: me.free_runs_used,
    freeRunsMax,
    unlimitedUntil: me.access_until,
    paidJobCredits: me.paid_job_credits,
    subscriptionRunsCap: Math.max(1, me.subscription_runs_cap || 7),
    subscriptionRunsUsedThisMonth: Math.max(0, me.subscription_runs_used_this_month || 0),
  }
}

export function applySnapshotFromServer(me: BillingMeResponse): BillingSnapshot {
  const next = billingMeToSnapshot(me)
  writeSnapshot(next)
  return next
}

/** Apply GET /billing/guest-status for anonymous users (server is source of truth). */
export function applyGuestSnapshotFromServer(g: {
  free_runs_used: number
  paid_job_credits: number
  free_runs_max?: number
}): BillingSnapshot {
  const cap = Math.max(1, Number(g.free_runs_max) || FREE_RUNS_MAX)
  const base = defaultSnapshot()
  const next: BillingSnapshot = {
    ...base,
    freeRunsMax: cap,
    freeRunsUsed: Math.min(cap, Math.max(0, Number(g.free_runs_used) || 0)),
    paidJobCredits: Math.max(0, Number(g.paid_job_credits) || 0),
  }
  writeSnapshot(next)
  return next
}

/** Subscription period only applies when signed in (guests never have server-side subscriptions in this app). */
export function subscriptionPeriodActiveForSession(s: BillingSnapshot, signedIn: boolean): boolean {
  return signedIn && subscriptionPeriodActive(s)
}

export function hasSubscriptionAccessForSession(s: BillingSnapshot, signedIn: boolean): boolean {
  return signedIn && hasSubscriptionAccess(s)
}

export function canMultiImageUploadForSession(s: BillingSnapshot, signedIn: boolean): boolean {
  if (!signedIn) return s.paidJobCredits > 0
  return canMultiImageUpload(s)
}

export function hasPaidJobAccessForSession(s: BillingSnapshot, signedIn: boolean): boolean {
  return hasSubscriptionAccessForSession(s, signedIn) || s.paidJobCredits > 0
}

/** Signed-in subscriber with an active period but no runs left this month and no credits. */
export function subscriptionQuotaStuckForSession(s: BillingSnapshot, signedIn: boolean): boolean {
  return (
    signedIn &&
    subscriptionPeriodActive(s) &&
    !hasSubscriptionAccess(s) &&
    s.paidJobCredits <= 0
  )
}

export function processBlockReasonForSession(
  s: BillingSnapshot,
  fileCount: number,
  signedIn: boolean,
): ProcessBlockReason {
  if (fileCount < 1) return 'no_files'
  if (
    signedIn &&
    subscriptionPeriodActive(s) &&
    subscriptionRunsRemaining(s) <= 0 &&
    s.paidJobCredits <= 0
  ) {
    return 'quota_exhausted'
  }
  if (hasSubscriptionAccessForSession(s, signedIn) || s.paidJobCredits > 0) return 'none'
  if (fileCount > 1) return 'multi_on_free'
  if (s.freeRunsUsed >= freeRunsCap(s)) return 'free_exhausted'
  return 'none'
}

/** Local-only preview when API unavailable (not used for enforced billing). */
export function applyMockPurchase(planId: PricingPlanId): BillingSnapshot {
  const s = readBillingSnapshot()
  const now = Date.now()
  let next: BillingSnapshot = { ...s }

  switch (planId) {
    case 'single':
    case 'debug':
      next = { ...next, paidJobCredits: next.paidJobCredits + 1 }
      break
    case 'month':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 32 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionRunsUsedThisMonth: 0,
      }
      break
    case 'sixmo':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 186 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionRunsUsedThisMonth: 0,
      }
      break
    case 'year':
      next = {
        ...next,
        unlimitedUntil: new Date(now + 370 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionRunsUsedThisMonth: 0,
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

/** Guest / offline: bump local usage after a successful job (signed-in users should sync from server). */
export function recordSuccessfulJob(): BillingSnapshot {
  const s = readBillingSnapshot()
  if (hasSubscriptionAccess(s)) return s
  if (s.paidJobCredits > 0) {
    const next = { ...s, paidJobCredits: s.paidJobCredits - 1 }
    writeSnapshot(next)
    return next
  }
  const cap = freeRunsCap(s)
  const next = { ...s, freeRunsUsed: Math.min(cap, s.freeRunsUsed + 1) }
  writeSnapshot(next)
  return next
}
