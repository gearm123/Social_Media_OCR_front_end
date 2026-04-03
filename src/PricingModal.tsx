import { useEffect, useMemo, useState } from 'react'
import { fetchBillingStatus, startBillingCheckout, type BillingStatusResponse } from './billingApi'
import { getVisiblePricingPlans, type PricingPlanId } from './billingStorage'

type Props = {
  open: boolean
  onClose: () => void
  onApplied: () => void
}

function planSelectable(id: PricingPlanId, status: BillingStatusResponse | null | undefined): boolean {
  if (status == null) return true
  if (status.paddle_configured === false) return false
  if (status.prices && id in status.prices && status.prices[id] === false) return false
  return true
}

export function PricingModal({ open, onClose, onApplied: _onApplied }: Props) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null)

  const visiblePlans = useMemo(() => getVisiblePricingPlans(), [])

  useEffect(() => {
    if (open) {
      setCheckoutError(null)
      setCheckoutLoading(false)
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
    setCheckoutLoading(true)
    try {
      const url = await startBillingCheckout(id)
      window.location.href = url
    } catch (e) {
      setCheckoutLoading(false)
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
              Sign in, then choose a plan. You will be redirected to secure Paddle checkout. After payment,
              return here — entitlements sync from the server.
            </p>
          </div>
          <button type="button" className="pricing-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {billingStatus?.paddle_configured === false ? (
          <p className="pricing-modal__warn" role="status">
            Billing is not configured on the server yet (Paddle API key). Plans cannot be purchased until it is.
          </p>
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
                  disabled={checkoutLoading || !ok}
                  title={title}
                  onClick={() => void onSelect(plan.id)}
                >
                  {checkoutLoading ? 'Starting…' : missingPrice ? 'Not configured' : 'Select'}
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
