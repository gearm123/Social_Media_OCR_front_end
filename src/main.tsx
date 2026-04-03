import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ContactPage from './ContactPage.tsx'
import FeedbackPage from './FeedbackPage.tsx'
import PayCheckoutPage from './PayCheckoutPage.tsx'
import './index.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isPayRoute = /^\/pay$/i.test(path)
const isContactRoute = /^\/contact$/i.test(path)
const isFeedbackRoute = /^\/feedback$/i.test(path)

const root = document.getElementById('root')!
// Paddle.js + Checkout.open must not run under StrictMode's double effect mount; the first
// mount's async init is cancelled and checkout never opens. Main app keeps StrictMode.
createRoot(root).render(
  isPayRoute ? (
    <PayCheckoutPage />
  ) : isContactRoute ? (
    <ContactPage />
  ) : isFeedbackRoute ? (
    <FeedbackPage />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
