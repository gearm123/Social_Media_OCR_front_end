import { useEffect, useMemo, useState } from 'react'
import {
  fetchBillingStatus,
  startBillingCheckout,
  startGuestBillingCheckout,
  type BillingStatusResponse,
} from './billingApi'
import {
  getVisiblePricingPlans,
  isOneTimePlan,
  isSubscriptionPlan,
  type PricingPlanId,
} from './billingStorage'

type Props = {
  open: boolean
  onClose: () => void
  onApplied: () => void
  /** When true, only one-time plans can be purchased; subscriptions prompt for sign-in. */
  isGuest: boolean
  onOpenAuth?: (tab: 'signin' | 'signup') => void
}

function planSelectable(id: PricingPlanId, status: BillingStatusResponse | null | undefined): boolean {
  if (status == null) return true
  if (status.paddle_configured === false) return false
  if (status.prices && id in status.prices && status.prices[id] === false) return false
  return true
}

export function PricingModal({ open, onClose, onApplied: _onApplied, isGuest, onOpenAuth }: Props) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<PricingPlanId | null>(null)
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null)
  const [guestEmail, setGuestEmail] = useState('')
  const [subscriptionGuestPrompt, setSubscriptionGuestPrompt] = useState(false)

  const visiblePlans = useMemo(() => {
    const all = getVisiblePricingPlans()
    if (isGuest) return all.filter((p) => isOneTimePlan(p.id))
    return all
  }, [isGuest])

  useEffect(() => {
    if (open) {
      setCheckoutError(null)
      setCheckoutLoadingPlanId(null)
      setSubscriptionGuestPrompt(false)
      let cancelled = false
      void fetchBillingStatus().then((s) => {
        if (!cancelled) setBillingStatus(s)
      })
      return () => {
        cancelled = true
      }
    }
    setBillingStatus(null)
    return undefined
  }, [open])

  if (!open) return null

  const onSelect = async (id: PricingPlanId) => {
    setCheckoutError(null)
    setSubscriptionGuestPrompt(false)

    if (isGuest && isSubscriptionPlan(id)) {
      setSubscriptionGuestPrompt(true)
      return
    }

    if (isGuest && isOneTimePlan(id)) {
      const em = guestEmail.trim()
      if (!em || !em.includes('@')) {
        setCheckoutError('Enter a valid email below — Paddle needs it for your receipt and to link your purchase.')
        return
      }
      setCheckoutLoadingPlanId(id)
      try {
        const url = await startGuestBillingCheckout(id, em)
        window.location.href = url
      } catch (e) {
        setCheckoutLoadingPlanId(null)
        setCheckoutError(e instanceof Error ? e.message : String(e))
      }
      return
    }

    setCheckoutLoadingPlanId(id)
    try {
      const url = await startBillingCheckout(id)
      window.location.href = url
    } catch (e) {
      setCheckoutLoadingPlanId(null)
      setCheckoutError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="pricing-modal" role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
      <button type="button" className="pricing-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="pricing-modal__panel">
        <div className="pricing-modal__head">
          <div>
            <h2 id="pricing-modal-title" className="pricing-modal__title">
              Choose a plan
            </h2>
            <p className="pricing-modal__subtitle">
              {isGuest ? (
                <>
                  Without an account, use the email below to buy a <strong>one-time</strong> run (Debug test or Single
                  full run). You will be redirected to Paddle checkout.
                </>
              ) : (
                <>
                  Choose a plan and you will be redirected to secure Paddle checkout. After payment, return here —
                  entitlements sync from the server.
                </>
              )}
            </p>
          </div>
          <button type="button" className="pricing-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isGuest ? (
          <div className="pricing-modal__guest-email">
            <label htmlFor="pricing-guest-email" className="pricing-modal__guest-email-label">
              Email for checkout & receipt
            </label>
            <input
              id="pricing-guest-email"
              type="email"
              className="pricing-modal__guest-email-input"
              autoComplete="email"
              placeholder="you@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              disabled={checkoutLoadingPlanId !== null}
            />
          </div>
        ) : null}

        {isGuest ? (
          <p className="pricing-modal__subscription-upsell">
            <button
              type="button"
              className="pricing-modal__subscription-upsell-link"
              onClick={() => {
                onOpenAuth?.('signup')
                onClose()
              }}
            >
              Sign up for subscription options
            </button>
          </p>
        ) : null}

        {billingStatus?.paddle_configured === false ? (
          <p className="pricing-modal__warn" role="status">
            Billing is not configured on the server yet (Paddle API key). Plans cannot be purchased until it is.
          </p>
        ) : null}

        {subscriptionGuestPrompt ? (
          <div className="pricing-modal__account-prompt" role="status">
            <p className="pricing-modal__account-prompt-text">
              Monthly and annual plans need a <strong>free account</strong> so we can manage your subscription and
              usage. Sign up or sign in, then open Plans again.
            </p>
            <div className="pricing-modal__account-prompt-actions">
              <button
                type="button"
                className="btn primary btn--compact"
                onClick={() => {
                  onOpenAuth?.('signup')
                  onClose()
                }}
              >
                Sign up
              </button>
              <button
                type="button"
                className="btn ghost btn--compact"
                onClick={() => {
                  onOpenAuth?.('signin')
                  onClose()
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        ) : null}

        <div className="pricing-modal__grid">
          {visiblePlans.map((plan) => {
            const ok = planSelectable(plan.id, billingStatus ?? undefined)
            const missingPrice = Boolean(
              billingStatus?.paddle_configured && billingStatus.prices?.[plan.id] === false,
            )
            const title =
              billingStatus?.paddle_configured === false
                ? 'Server billing not ready'
                : missingPrice
                  ? `Set the matching PADDLE_PRICE_* env var on the server for “${plan.name}”`
                  : undefined
            return (
              <article
                key={plan.id}
                className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}${
                  plan.id === 'debug' ? ' pricing-card--debug' : ''
                }`}
              >
                {plan.id === 'debug' ? (
                  <span className="pricing-card__ribbon pricing-card__ribbon--test">Test</span>
                ) : plan.featured ? (
                  <span className="pricing-card__ribbon">Popular</span>
                ) : null}
                <h3 className="pricing-card__name">{plan.name}</h3>
                <p className="pricing-card__price">
                  <span className="pricing-card__amount">{plan.priceLabel}</span>
                  <span className="pricing-card__period">{plan.periodHint}</span>
                </p>
                <p className="pricing-card__blurb">{plan.blurb}</p>
                <button
                  type="button"
                  className={`btn pricing-card__cta${plan.featured ? ' primary' : ' ghost'}`}
                  disabled={checkoutLoadingPlanId !== null || !ok}
                  title={title}
                  onClick={() => void onSelect(plan.id)}
                >
                  {checkoutLoadingPlanId === plan.id
                    ? 'Starting…'
                    : missingPrice
                      ? 'Not configured'
                      : 'Select'}
                </button>
              </article>
            )
          })}
        </div>

        {checkoutError ? (
          <p className="pricing-modal__error" role="alert">
            {checkoutError}
          </p>
        ) : null}

        <p className="pricing-modal__legal">
          Payments are processed by Paddle (merchant of record). Subscription and tax terms apply at checkout.
        </p>
      </div>
    </div>
  )
}
