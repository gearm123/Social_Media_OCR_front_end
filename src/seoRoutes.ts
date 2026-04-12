import { createElement, type ReactElement } from 'react'
import ContactPage from './ContactPage'
import DemonstrationPage from './DemonstrationPage'
import FaqPage from './FaqPage'
import FeedbackPage from './FeedbackPage'
import HowToPage from './HowToPage'
import IntentLandingPage from './IntentLandingPage'
import { INTENT_BY_PATH, INTENT_LANDINGS, USES_HUB_PATH, type IntentLanding } from './intentLandings'
import PayCheckoutPage from './PayCheckoutPage'
import {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
  SEO_HOWTO_DESCRIPTION,
  SEO_SITE_NAME,
} from './seoContent'
import UsesHubPage, { USES_HUB_SEO_DESCRIPTION } from './UsesHubPage'

export type DocumentSeo = {
  title: string
  description: string
  path: string
  robots?: string
}

export type ResolvedSeoRoute = {
  pathNorm: string
  seo: DocumentSeo
  element: ReactElement
  intent: IntentLanding | null
}

export function normalizeSeoPath(pathname: string): string {
  return (pathname.replace(/\/+$/, '') || '/').toLowerCase()
}

export const PRERENDER_ROUTE_PATHS = [
  '/contact',
  '/feedback',
  '/faq',
  '/how-to',
  '/demonstration',
  USES_HUB_PATH,
  ...INTENT_LANDINGS.map((entry) => entry.path),
] as const

export function resolveSeoRoute(pathname: string): ResolvedSeoRoute | null {
  const pathNorm = normalizeSeoPath(pathname)
  const intent = INTENT_BY_PATH[pathNorm]

  if (pathNorm === '/contact') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `Contact us · ${SEO_SITE_NAME}`,
        description: SEO_CONTACT_DESCRIPTION,
        path: '/contact',
      },
      element: createElement(ContactPage),
    }
  }

  if (pathNorm === '/feedback') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `Feedback · ${SEO_SITE_NAME}`,
        description: SEO_FEEDBACK_DESCRIPTION,
        path: '/feedback',
      },
      element: createElement(FeedbackPage),
    }
  }

  if (pathNorm === '/pay') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `Checkout · ${SEO_SITE_NAME}`,
        description: SEO_HOME_DESCRIPTION,
        path: '/pay',
        robots: 'noindex, nofollow',
      },
      element: createElement(PayCheckoutPage),
    }
  }

  if (intent) {
    return {
      pathNorm,
      intent,
      seo: {
        title: `${intent.seoTitle} · ${SEO_SITE_NAME}`,
        description: intent.seoDescription,
        path: intent.path,
      },
      element: createElement(IntentLandingPage, { intent }),
    }
  }

  if (pathNorm === USES_HUB_PATH) {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `Translation guides · ${SEO_SITE_NAME}`,
        description: USES_HUB_SEO_DESCRIPTION,
        path: USES_HUB_PATH,
      },
      element: createElement(UsesHubPage),
    }
  }

  if (pathNorm === '/faq') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `FAQ · ${SEO_SITE_NAME}`,
        description: SEO_FAQ_DESCRIPTION,
        path: '/faq',
      },
      element: createElement(FaqPage),
    }
  }

  if (pathNorm === '/how-to') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `How to · ${SEO_SITE_NAME}`,
        description: SEO_HOWTO_DESCRIPTION,
        path: '/how-to',
      },
      element: createElement(HowToPage),
    }
  }

  if (pathNorm === '/demonstration') {
    return {
      pathNorm,
      intent: null,
      seo: {
        title: `Demonstration · ${SEO_SITE_NAME}`,
        description: SEO_DEMONSTRATION_DESCRIPTION,
        path: '/demonstration',
      },
      element: createElement(DemonstrationPage),
    }
  }

  return null
}
