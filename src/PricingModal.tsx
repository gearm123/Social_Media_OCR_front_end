import { useEffect, useState } from 'react'
import { startBillingCheckout } from './billingApi'
import { PRICING_PLANS, type PricingPlanId } from './billingStorage'

type Props = {
  open: boolean
  onClose: () => void
  onApplied: () => void
}

export function PricingModal({ open, onClose, onApplied: _onApplied }: Props) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setCheckoutError(null)
      setCheckoutLoading(false)
    }
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

        <div className="pricing-modal__grid">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}`}
            >
              {plan.featured ? <span className="pricing-card__ribbon">Popular</span> : null}
              <h3 className="pricing-card__name">{plan.name}</h3>
              <p className="pricing-card__price">
                <span className="pricing-card__amount">{plan.priceLabel}</span>
                <span className="pricing-card__period">{plan.periodHint}</span>
              </p>
              <p className="pricing-card__blurb">{plan.blurb}</p>
              <button
                type="button"
                className={`btn pricing-card__cta${plan.featured ? ' primary' : ' ghost'}`}
                disabled={checkoutLoading}
                onClick={() => void onSelect(plan.id)}
              >
                {checkoutLoading ? 'Starting…' : 'Select'}
              </button>
            </article>
          ))}
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
