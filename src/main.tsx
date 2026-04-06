import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ContactPage from './ContactPage.tsx'
import FeedbackPage from './FeedbackPage.tsx'
import IntentLandingPage from './IntentLandingPage.tsx'
import PayCheckoutPage from './PayCheckoutPage.tsx'
import UsesHubPage, { USES_HUB_SEO_DESCRIPTION } from './UsesHubPage.tsx'
import FaqPage from './FaqPage.tsx'
import HowToPage from './HowToPage.tsx'
import { mountLandingStructuredData } from './landingStructuredData'
import { INTENT_BY_PATH, USES_HUB_PATH } from './intentLandings'
import {
  applyDocumentSeo,
  SEO_CONTACT_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
  SEO_HOWTO_DESCRIPTION,
  SEO_SITE_NAME,
} from './seo'
import './index.css'

const rawPath = window.location.pathname.replace(/\/+$/, '') || '/'
const pathNorm = rawPath.toLowerCase()

const isPayRoute = pathNorm === '/pay'
const isContactRoute = pathNorm === '/contact'
const isFeedbackRoute = pathNorm === '/feedback'
const isFaqRoute = pathNorm === '/faq'
const isHowToRoute = pathNorm === '/how-to'
const isUsesHub = pathNorm === USES_HUB_PATH
const intent = INTENT_BY_PATH[pathNorm]

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
} else if (intent) {
  applyDocumentSeo({
    title: `${intent.seoTitle} · ${SEO_SITE_NAME}`,
    description: intent.seoDescription,
    path: intent.path,
  })
} else if (isUsesHub) {
  applyDocumentSeo({
    title: `Translation guides · ${SEO_SITE_NAME}`,
    description: USES_HUB_SEO_DESCRIPTION,
    path: USES_HUB_PATH,
  })
} else if (isFaqRoute) {
  applyDocumentSeo({
    title: `FAQ · ${SEO_SITE_NAME}`,
    description: SEO_FAQ_DESCRIPTION,
    path: '/faq',
  })
} else if (isHowToRoute) {
  applyDocumentSeo({
    title: `How to · ${SEO_SITE_NAME}`,
    description: SEO_HOWTO_DESCRIPTION,
    path: '/how-to',
  })
}

mountLandingStructuredData(pathNorm, intent ?? null)

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
  ) : intent ? (
    <IntentLandingPage intent={intent} />
  ) : isUsesHub ? (
    <UsesHubPage />
  ) : isFaqRoute ? (
    <FaqPage />
  ) : isHowToRoute ? (
    <HowToPage />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
