type PaywallReason = 'free_exhausted' | 'multi_on_free' | 'quota_exhausted'

type Props = {
  open: boolean
  reason: PaywallReason
  onClose: () => void
  onViewPlans: () => void
}

const COPY: Record<PaywallReason, { title: string; body: string }> = {
  free_exhausted: {
    title: 'Free try used',
    body:
      'Your free single-image run is used. Sign in, choose a plan, or buy a single-run credit for multi-image jobs.',
  },
  multi_on_free: {
    title: 'Multiple images need a plan',
    body:
      'On the free tier you can upload one screenshot per run. Use an active subscription (with runs left), a single-run credit, or upgrade.',
  },
  quota_exhausted: {
    title: 'Monthly runs used',
    body:
      'Your plan includes a limited number of full jobs per calendar month. Wait for the next month, buy a one-time run, or upgrade billing period in Plans.',
  },
}

export function PaywallModal({ open, reason, onClose, onViewPlans }: Props) {
  if (!open) return null
  const { title, body } = COPY[reason]

  return (
    <div className="paywall-modal" role="dialog" aria-modal="true" aria-labelledby="paywall-modal-title">
      <button type="button" className="paywall-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="paywall-modal__panel">
        <div className="paywall-modal__head">
          <h2 id="paywall-modal-title" className="paywall-modal__title">
            {title}
          </h2>
          <button type="button" className="paywall-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="paywall-modal__body">{body}</p>
        <div className="paywall-modal__actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Not now
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              onClose()
              onViewPlans()
            }}
          >
            View plans
          </button>
        </div>
      </div>
    </div>
  )
}
