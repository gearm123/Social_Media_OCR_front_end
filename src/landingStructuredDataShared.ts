import { absoluteSiteUrl } from './canonicalSite'
import { DEMO_RECONSTRUCTION_GIF_PATH } from './demoReconstructionMedia'
import {
  GUIDE_VIDEO_UPLOAD_DATE,
  LOGO_HEIGHT,
  LOGO_PATH,
  LOGO_WIDTH,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
} from './seoAssets'
import { GUIDE_WORKFLOW_STEPS } from './guideWorkflowSteps'
import type { IntentLanding } from './intentLandings'
import { isIntentIndexed, USES_HUB_PATH } from './intentLandings'
import {
  SEO_FAQ_ITEMS,
  SEO_HOME_DESCRIPTION,
  SEO_HOME_TITLE,
  SEO_HOWTO_DESCRIPTION,
  SEO_HOWTO_STEPS,
  SEO_SITE_NAME,
} from './seoContent'
import { SUPPORT_EMAIL } from './supportEmail'

export type StructuredDataEntry = {
  id: string
  data: Record<string, unknown>
}

const ID_FAQ = 'jsonld-landing-faqpage'
const ID_HOWTO = 'jsonld-landing-howto'
const ID_CRUMB = 'jsonld-landing-breadcrumb'
const ID_VIDEOS = 'jsonld-landing-videos'
const ID_SITE = 'jsonld-site-graph'
const ID_DEMO = 'jsonld-demonstration-image'

function faqPageJsonLd(
  origin: string,
  path: string,
  items: readonly { question: string; answer: string }[],
): Record<string, unknown> {
  const pageUrl = absoluteSiteUrl(origin, path)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faqpage`,
    url: pageUrl,
    inLanguage: 'en',
    mainEntity: items.map((item) => ({
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
  const image = `${origin}${OG_IMAGE_PATH}`
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${SEO_SITE_NAME}`,
    description: SEO_HOWTO_DESCRIPTION,
    url: absoluteSiteUrl(origin, '/how-to'),
    inLanguage: 'en',
    image,
    tool: {
      '@type': 'HowToTool',
      name: 'Chat screenshots (PNG, JPEG, WebP, or BMP)',
    },
    step: SEO_HOWTO_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
      image,
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
    '/demonstration': { name: 'Demonstration', path: '/demonstration' },
    '/privacy': { name: 'Privacy', path: '/privacy' },
    '/terms': { name: 'Terms', path: '/terms' },
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
      item: absoluteSiteUrl(origin, c.path),
    })),
  }
}

function workflowVideoJsonLd(origin: string): Record<string, unknown> {
  const thumb = `${origin}${OG_IMAGE_PATH}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SEO_SITE_NAME} workflow videos`,
    inLanguage: 'en',
    itemListElement: GUIDE_WORKFLOW_STEPS.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: step.title,
        description: step.description,
        thumbnailUrl: thumb,
        contentUrl: `${origin}${step.mainSrc}`,
        uploadDate: GUIDE_VIDEO_UPLOAD_DATE,
        inLanguage: 'en',
      },
    })),
  }
}

function demonstrationImageJsonLd(origin: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `${origin}${DEMO_RECONSTRUCTION_GIF_PATH}`,
    url: absoluteSiteUrl(origin, '/demonstration'),
    name: 'Chat reconstruction demonstration',
    description: OG_IMAGE_ALT,
    inLanguage: 'en',
  }
}

export function buildHomeStructuredData(origin: string): StructuredDataEntry[] {
  const base = origin.replace(/\/+$/, '')
  const siteHome = `${base}/`
  const orgId = `${base}/#organization`
  const websiteId = `${base}/#website`
  const webappId = `${base}/#webapp`
  const logoUrl = `${base}${LOGO_PATH}`
  const imageUrl = `${base}${OG_IMAGE_PATH}`

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: SEO_SITE_NAME,
      alternateName: ['Chat Reconstruct', 'chatreconstruct.com'],
      url: siteHome,
      email: SUPPORT_EMAIL,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
      },
      image: logoUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        email: SUPPORT_EMAIL,
        contactType: 'customer support',
        url: absoluteSiteUrl(origin, '/contact'),
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SEO_SITE_NAME,
      alternateName: 'chatreconstruct.com',
      description: SEO_HOME_DESCRIPTION,
      url: siteHome,
      publisher: { '@id': orgId },
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': webappId,
      name: SEO_SITE_NAME,
      alternateName: 'Chat Reconstruct',
      description: SEO_HOME_DESCRIPTION,
      url: siteHome,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en',
      isAccessibleForFree: true,
      image: imageUrl,
      screenshot: imageUrl,
      featureList: [
        'Translate chat screenshots to English',
        'Messenger, WhatsApp, LINE, Instagram, Telegram, and iMessage layouts',
        'Optional bubble-count and sender/receiver guidance',
        'Download a reconstructed conversation image',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier available; paid plans for more usage',
      },
      publisher: { '@id': orgId },
    },
    {
      '@type': 'WebPage',
      '@id': `${base}/#webpage`,
      url: siteHome,
      name: SEO_HOME_TITLE,
      description: SEO_HOME_DESCRIPTION,
      isPartOf: { '@id': websiteId },
      about: { '@id': webappId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
      },
      inLanguage: 'en',
    },
  ]

  return [
    {
      id: ID_SITE,
      data: {
        '@context': 'https://schema.org',
        '@graph': graph,
      },
    },
  ]
}

function routeHasWorkflowVideo(pathNorm: string, intent: IntentLanding | null): boolean {
  if (intent) return true
  return pathNorm === '/how-to' || pathNorm === USES_HUB_PATH || pathNorm === '/demonstration'
}

export function buildLandingStructuredData(
  pathNorm: string,
  intent: IntentLanding | null,
  origin: string,
): StructuredDataEntry[] {
  const entries: StructuredDataEntry[] = []
  if (pathNorm === '/' || pathNorm === '') {
    entries.push(...buildHomeStructuredData(origin))
  }
  if (pathNorm === '/faq') {
    entries.push({ id: ID_FAQ, data: faqPageJsonLd(origin, '/faq', SEO_FAQ_ITEMS) })
  }
  if (intent && isIntentIndexed(intent) && intent.faq && intent.faq.length > 0) {
    entries.push({ id: ID_FAQ, data: faqPageJsonLd(origin, intent.path, intent.faq) })
  }
  if (pathNorm === '/how-to') {
    entries.push({ id: ID_HOWTO, data: howToJsonLd(origin) })
  }
  if (pathNorm === '/demonstration') {
    entries.push({ id: ID_DEMO, data: demonstrationImageJsonLd(origin) })
  }
  if (routeHasWorkflowVideo(pathNorm, intent)) {
    entries.push({ id: ID_VIDEOS, data: workflowVideoJsonLd(origin) })
  }
  entries.push({ id: ID_CRUMB, data: breadcrumbJsonLd(origin, pathNorm, intent) })
  return entries
}

export const LANDING_STRUCTURED_DATA_IDS = [
  ID_FAQ,
  ID_HOWTO,
  ID_CRUMB,
  ID_VIDEOS,
  ID_SITE,
  ID_DEMO,
] as const
