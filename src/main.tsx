import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ContactPage from './ContactPage.tsx'
import FeedbackPage from './FeedbackPage.tsx'
import PayCheckoutPage from './PayCheckoutPage.tsx'
import {
  applyDocumentSeo,
  SEO_CONTACT_DESCRIPTION,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
  SEO_SITE_NAME,
} from './seo'
import './index.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isPayRoute = /^\/pay$/i.test(path)
const isContactRoute = /^\/contact$/i.test(path)
const isFeedbackRoute = /^\/feedback$/i.test(path)

if (isContactRoute) {
  applyDocumentSeo({
    title: `Contact us · ${SEO_SITE_NAME}`,
    description: SEO_CONTACT_DESCRIPTION,
    path: '/contact',
  })
} else if (isFeedbackRoute) {
  applyDocumentSeo({
    title: `Feedback · ${SEO_SITE_NAME}`,
    description: SEO_FEEDBACK_DESCRIPTION,
    path: '/feedback',
  })
} else if (isPayRoute) {
  applyDocumentSeo({
    title: `Checkout · ${SEO_SITE_NAME}`,
    description: SEO_HOME_DESCRIPTION,
    path: '/pay',
  })
}

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
