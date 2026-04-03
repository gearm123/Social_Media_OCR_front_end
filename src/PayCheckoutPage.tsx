import { useEffect, useRef, useState } from 'react'
import { CheckoutEventNames, initializePaddle, type Paddle } from '@paddle/paddle-js'
import { claimGuestPaidTransaction, claimUserPaidTransaction } from './billingApi'
import { getAccessToken } from './authStorage'

/**
 * Paddle default payment link target. URL from API is this page + ?_ptxn=<transaction_id>.
 * Netlify: VITE_PADDLE_CLIENT_TOKEN = live client token; VITE_PADDLE_ENV=production (default).
 */
export default function PayCheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const ptxn = params.get('_ptxn')?.trim() || ''
  const ptxnRef = useRef(ptxn)
  ptxnRef.current = ptxn

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [claimErr, setClaimErr] = useState<string | null>(null)

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
          eventCallback: (event) => {
            if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return
            const d = event.data as
              | { transaction_id?: string; id?: string }
              | null
              | undefined
            const tx =
              (typeof d?.transaction_id === 'string' && d.transaction_id) ||
              (typeof d?.id === 'string' && d.id) ||
              ptxnRef.current
            if (!tx) return
            void (async () => {
              try {
                if (getAccessToken()) {
                  await claimUserPaidTransaction(tx)
                } else {
                  await claimGuestPaidTransaction(tx)
                }
                if (!cancelled) window.location.assign('/')
              } catch (e) {
                console.error('[billing] guest claim', e)
                if (!cancelled) {
                  setClaimErr(e instanceof Error ? e.message : 'Could not activate your purchase')
                  setStatus('ready')
                  setMessage(
                    'If you completed payment, wait a few seconds and open Translate Chat from this same browser, or refresh the home page.',
                  )
                }
              }
            })()
          },
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to initialize Paddle'
        console.error('[Paddle] initializePaddle failed', e)
        if (!cancelled) {
          setStatus('error')
          setMessage(msg)
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
          setMessage(
            'Complete payment in the Paddle window (overlay). If you do not see it, check the browser console, popup blocker, and that this domain is approved in Paddle for your client token.',
          )
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to open checkout'
        console.error('[Paddle] Checkout.open failed', e)
        if (!cancelled) {
          setStatus('error')
          setMessage(msg)
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
      {claimErr ? (
        <p className="pay-checkout-page__error" role="alert">
          {claimErr}
        </p>
      ) : null}
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
