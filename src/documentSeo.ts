import { USES_HUB_PATH, isIntentIndexed, type IntentLanding } from './intentLandings'
import {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
  SEO_HOME_TITLE,
  SEO_HOWTO_DESCRIPTION,
  SEO_PRIVACY_DESCRIPTION,
  SEO_SITE_NAME,
  SEO_TERMS_DESCRIPTION,
  SEO_USES_DESCRIPTION,
} from './seoContent'
import type { DocumentSeo } from './seoTypes'

export function intentDocumentSeo(intent: IntentLanding): DocumentSeo {
  const indexed = isIntentIndexed(intent)
  return {
    title: `${intent.seoTitle} · ${SEO_SITE_NAME}`,
    description: intent.seoDescription,
    path: intent.path,
    ...(indexed
      ? {}
      : { robots: 'noindex, follow', canonicalPath: USES_HUB_PATH }),
  }
}

export const HOME_DOCUMENT_SEO: DocumentSeo = {
  title: SEO_HOME_TITLE,
  description: SEO_HOME_DESCRIPTION,
  path: '/',
}

export const CONTACT_DOCUMENT_SEO: DocumentSeo = {
  title: `Contact us · ${SEO_SITE_NAME}`,
  description: SEO_CONTACT_DESCRIPTION,
  path: '/contact',
}

export const FEEDBACK_DOCUMENT_SEO: DocumentSeo = {
  title: `Feedback · ${SEO_SITE_NAME}`,
  description: SEO_FEEDBACK_DESCRIPTION,
  path: '/feedback',
}

export const FAQ_DOCUMENT_SEO: DocumentSeo = {
  title: `FAQ · ${SEO_SITE_NAME}`,
  description: SEO_FAQ_DESCRIPTION,
  path: '/faq',
}

export const HOWTO_DOCUMENT_SEO: DocumentSeo = {
  title: `How to · ${SEO_SITE_NAME}`,
  description: SEO_HOWTO_DESCRIPTION,
  path: '/how-to',
}

export const DEMONSTRATION_DOCUMENT_SEO: DocumentSeo = {
  title: `Demonstration · ${SEO_SITE_NAME}`,
  description: SEO_DEMONSTRATION_DESCRIPTION,
  path: '/demonstration',
}

export const USES_DOCUMENT_SEO: DocumentSeo = {
  title: `Translation guides · ${SEO_SITE_NAME}`,
  description: SEO_USES_DESCRIPTION,
  path: USES_HUB_PATH,
}

export const PRIVACY_DOCUMENT_SEO: DocumentSeo = {
  title: `Privacy · ${SEO_SITE_NAME}`,
  description: SEO_PRIVACY_DESCRIPTION,
  path: '/privacy',
}

export const TERMS_DOCUMENT_SEO: DocumentSeo = {
  title: `Terms · ${SEO_SITE_NAME}`,
  description: SEO_TERMS_DESCRIPTION,
  path: '/terms',
}

export const PAY_DOCUMENT_SEO: DocumentSeo = {
  title: `Checkout · ${SEO_SITE_NAME}`,
  description: SEO_HOME_DESCRIPTION,
  path: '/pay',
  robots: 'noindex, nofollow',
}
