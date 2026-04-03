import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PayCheckoutPage from './PayCheckoutPage.tsx'
import './index.css'

const isPayRoute = /^\/pay\/?$/i.test(window.location.pathname)

const root = document.getElementById('root')!
// Paddle.js + Checkout.open must not run under StrictMode's double effect mount; the first
// mount's async init is cancelled and checkout never opens. Main app keeps StrictMode.
createRoot(root).render(
  isPayRoute ? (
    <PayCheckoutPage />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
