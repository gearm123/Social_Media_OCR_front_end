import { createElement, StrictMode, type ReactElement } from 'react'
import type { ResolvedSeoRoute } from './seoRoutes'

/** Load only the page module needed for this URL (keeps Paddle + the translator app off landing pages). */
export async function loadRouteElement(route: ResolvedSeoRoute): Promise<ReactElement> {
  switch (route.page) {
    case 'contact': {
      const { default: Page } = await import('./ContactPage')
      return createElement(Page)
    }
    case 'feedback': {
      const { default: Page } = await import('./FeedbackPage')
      return createElement(Page)
    }
    case 'privacy': {
      const { default: Page } = await import('./PrivacyPage')
      return createElement(Page)
    }
    case 'terms': {
      const { default: Page } = await import('./TermsPage')
      return createElement(Page)
    }
    case 'pay': {
      const { default: Page } = await import('./PayCheckoutPage')
      return createElement(Page)
    }
    case 'intent': {
      const { default: Page } = await import('./IntentLandingPage')
      return createElement(Page, { intent: route.intent! })
    }
    case 'uses': {
      const { default: Page } = await import('./UsesHubPage')
      return createElement(Page)
    }
    case 'faq': {
      const { default: Page } = await import('./FaqPage')
      return createElement(Page)
    }
    case 'how-to': {
      const { default: Page } = await import('./HowToPage')
      return createElement(Page)
    }
    case 'demonstration': {
      const { default: Page } = await import('./DemonstrationPage')
      return createElement(Page)
    }
    case 'videos': {
      const { default: Page } = await import('./VideosHubPage')
      return createElement(Page)
    }
    case 'video': {
      const { default: Page } = await import('./VideoWatchPage')
      return createElement(Page, { clip: route.clip! })
    }
    case 'blog': {
      const { default: Page } = await import('./BlogHubPage')
      return createElement(Page)
    }
    case 'article': {
      const { default: Page } = await import('./ArticlePage')
      return createElement(Page, { article: route.article! })
    }
  }
}

export async function loadHomeApp(): Promise<ReactElement> {
  const { default: App } = await import('./App')
  return createElement(StrictMode, null, createElement(App))
}
