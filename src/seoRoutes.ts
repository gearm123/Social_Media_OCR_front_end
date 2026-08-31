import {
  CONTACT_DOCUMENT_SEO,
  DEMONSTRATION_DOCUMENT_SEO,
  FAQ_DOCUMENT_SEO,
  FEEDBACK_DOCUMENT_SEO,
  HOWTO_DOCUMENT_SEO,
  PAY_DOCUMENT_SEO,
  PRIVACY_DOCUMENT_SEO,
  TERMS_DOCUMENT_SEO,
  USES_DOCUMENT_SEO,
  intentDocumentSeo,
} from './documentSeo'
import { INTENT_BY_PATH, INTENT_LANDINGS, USES_HUB_PATH, type IntentLanding } from './intentLandings'
import type { DocumentSeo } from './seoTypes'

export type { DocumentSeo } from './seoTypes'

export type SeoPageKind =
  | 'contact'
  | 'feedback'
  | 'privacy'
  | 'terms'
  | 'pay'
  | 'intent'
  | 'uses'
  | 'faq'
  | 'how-to'
  | 'demonstration'

export type ResolvedSeoRoute = {
  pathNorm: string
  seo: DocumentSeo
  page: SeoPageKind
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
  '/privacy',
  '/terms',
  USES_HUB_PATH,
  ...INTENT_LANDINGS.map((entry) => entry.path),
] as const

export function resolveSeoRoute(pathname: string): ResolvedSeoRoute | null {
  const pathNorm = normalizeSeoPath(pathname)
  const intent = INTENT_BY_PATH[pathNorm]

  if (pathNorm === '/contact') {
    return { pathNorm, intent: null, page: 'contact', seo: CONTACT_DOCUMENT_SEO }
  }
  if (pathNorm === '/feedback') {
    return { pathNorm, intent: null, page: 'feedback', seo: FEEDBACK_DOCUMENT_SEO }
  }
  if (pathNorm === '/privacy') {
    return { pathNorm, intent: null, page: 'privacy', seo: PRIVACY_DOCUMENT_SEO }
  }
  if (pathNorm === '/terms') {
    return { pathNorm, intent: null, page: 'terms', seo: TERMS_DOCUMENT_SEO }
  }
  if (pathNorm === '/pay') {
    return { pathNorm, intent: null, page: 'pay', seo: PAY_DOCUMENT_SEO }
  }
  if (intent) {
    return { pathNorm, intent, page: 'intent', seo: intentDocumentSeo(intent) }
  }
  if (pathNorm === USES_HUB_PATH) {
    return { pathNorm, intent: null, page: 'uses', seo: USES_DOCUMENT_SEO }
  }
  if (pathNorm === '/faq') {
    return { pathNorm, intent: null, page: 'faq', seo: FAQ_DOCUMENT_SEO }
  }
  if (pathNorm === '/how-to') {
    return { pathNorm, intent: null, page: 'how-to', seo: HOWTO_DOCUMENT_SEO }
  }
  if (pathNorm === '/demonstration') {
    return { pathNorm, intent: null, page: 'demonstration', seo: DEMONSTRATION_DOCUMENT_SEO }
  }
  return null
}
