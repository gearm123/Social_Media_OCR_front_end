type PaywallReason = 'free_exhausted' | 'multi_on_free'

type Props = {
  open: boolean
  reason: PaywallReason
  onClose: () => void
  onViewPlans: () => void
}

const COPY: Record<PaywallReason, { title: string; body: string }> = {
  free_exhausted: {
    title: 'Free tries used',
    body:
      'You have used all 3 free single-image runs. Choose a plan to keep translating — including multi-image jobs and unlimited use on passes.',
  },
  multi_on_free: {
    title: 'Multiple images need a plan',
    body:
      'On the free tier you can upload one screenshot per run. Upgrade with a single-run credit or a pass to combine several images in one job.',
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
