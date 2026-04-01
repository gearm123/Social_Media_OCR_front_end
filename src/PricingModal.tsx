import { PRICING_PLANS, applyMockPurchase, type PricingPlanId } from './billingStorage'

type Props = {
  open: boolean
  onClose: () => void
  onApplied: () => void
}

export function PricingModal({ open, onClose, onApplied }: Props) {
  if (!open) return null

  const onSelect = (id: PricingPlanId) => {
    applyMockPurchase(id)
    onApplied()
    onClose()
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
              Prices cover hosting (Netlify + Render) and API usage (Gemini + Vision). Checkout will be wired
              next — for now selecting a plan unlocks features in this browser only (preview).
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
                onClick={() => onSelect(plan.id)}
              >
                Select
              </button>
            </article>
          ))}
        </div>

        <p className="pricing-modal__legal">
          Payment processing (e.g. Stripe) and server-side verification will be added in a later step. This
          screen is for UX and pricing structure only.
        </p>
      </div>
    </div>
  )
}
