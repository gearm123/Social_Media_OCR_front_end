import { useEffect, useState } from 'react'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'

/**
 * Paddle default payment link target. URL from API is this page + ?_ptxn=<transaction_id>.
 * Netlify: VITE_PADDLE_CLIENT_TOKEN = live client token; VITE_PADDLE_ENV=production (default).
 */
export default function PayCheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const ptxn = params.get('_ptxn')?.trim() || ''
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim() || ''
  const env =
    import.meta.env.VITE_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production'

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!token) {
        setStatus('error')
        setMessage(
          'Missing VITE_PADDLE_CLIENT_TOKEN. Add it in Netlify → Environment variables → redeploy.',
        )
        return
      }
      if (!ptxn) {
        setStatus('error')
        setMessage(
          'No checkout session. Open Plans in the app while signed in, pick a plan, or use the link from your purchase email.',
        )
        return
      }

      let paddle: Paddle | undefined
      try {
        paddle = await initializePaddle({
          environment: env,
          token,
          checkout: {
            settings: { displayMode: 'overlay', theme: 'light' },
          },
        })
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setMessage(e instanceof Error ? e.message : 'Failed to initialize Paddle')
        }
        return
      }

      if (cancelled || !paddle) {
        if (!cancelled) {
          setStatus('error')
          setMessage('Paddle did not initialize')
        }
        return
      }

      try {
        paddle.Checkout.open({
          transactionId: ptxn,
          settings: { displayMode: 'overlay', theme: 'light' },
        })
        if (!cancelled) {
          setStatus('ready')
          setMessage('Complete payment in the window above. You can close this tab when done.')
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setMessage(e instanceof Error ? e.message : 'Failed to open checkout')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token, env, ptxn])

  return (
    <div className="pay-checkout-page">
      <h1 className="pay-checkout-page__title">Checkout</h1>
      {status === 'loading' && <p>Loading payment…</p>}
      {status === 'ready' && <p>{message}</p>}
      {status === 'error' && (
        <p className="pay-checkout-page__error" role="alert">
          {message}
        </p>
      )}
      <p className="pay-checkout-page__back">
        <a href="/">← Back to Translate Chat</a>
      </p>
    </div>
  )
}
