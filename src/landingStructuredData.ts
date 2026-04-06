/**
 * FAQPage, HowTo, and BreadcrumbList JSON-LD for every public route (including home).
 * Single mount point keeps schemas consistent and avoids duplicate/conflicting script tags.
 */

import type { IntentLanding } from './intentLandings'
import { USES_HUB_PATH } from './intentLandings'
import {
  getSeoSiteOrigin,
  mountJsonLd,
  SEO_FAQ_ITEMS,
  SEO_HOWTO_DESCRIPTION,
  SEO_HOWTO_STEPS,
  SEO_SITE_NAME,
} from './seo'

const ID_FAQ = 'jsonld-landing-faqpage'
const ID_HOWTO = 'jsonld-landing-howto'
const ID_CRUMB = 'jsonld-landing-breadcrumb'

function absoluteUrl(origin: string, path: string): string {
  if (path === '/' || path === '') return `${origin}/`
  const p = path.startsWith('/') ? path : `/${path}`
  return `${origin}${p}`
}

function faqPageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SEO_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function howToJsonLd(origin: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${SEO_SITE_NAME}`,
    description: SEO_HOWTO_DESCRIPTION,
    url: absoluteUrl(origin, '/how-to'),
    step: SEO_HOWTO_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  }
}

type Crumb = { name: string; path: string }

function breadcrumbsForRoute(pathNorm: string, intent: IntentLanding | null): Crumb[] {
  const home: Crumb = { name: 'Home', path: '/' }
  if (pathNorm === '/' || pathNorm === '') {
    return [home]
  }
  if (intent) {
    return [
      home,
      { name: 'Translation guides', path: USES_HUB_PATH },
      { name: intent.h1, path: intent.path },
    ]
  }
  const tail: Record<string, Crumb> = {
    '/contact': { name: 'Contact us', path: '/contact' },
    '/feedback': { name: 'Feedback', path: '/feedback' },
    '/faq': { name: 'FAQ', path: '/faq' },
    '/how-to': { name: 'How to', path: '/how-to' },
    '/pay': { name: 'Checkout', path: '/pay' },
    [USES_HUB_PATH]: { name: 'Translation guides', path: USES_HUB_PATH },
  }
  const t = tail[pathNorm]
  if (t) return [home, t]
  return [home]
}

function breadcrumbJsonLd(origin: string, pathNorm: string, intent: IntentLanding | null): Record<string, unknown> {
  const crumbs = breadcrumbsForRoute(pathNorm, intent)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(origin, c.path),
    })),
  }
}

/**
 * Mount FAQPage + HowTo + BreadcrumbList (replaces any prior tags with these ids).
 * No-op when `getSeoSiteOrigin()` is empty (local dev without `VITE_SITE_URL`).
 */
export function mountLandingStructuredData(
  pathNorm: string,
  intent: IntentLanding | null,
): void {
  const origin = getSeoSiteOrigin()
  if (!origin) return
  mountJsonLd(ID_FAQ, faqPageJsonLd())
  mountJsonLd(ID_HOWTO, howToJsonLd(origin))
  mountJsonLd(ID_CRUMB, breadcrumbJsonLd(origin, pathNorm, intent))
}
