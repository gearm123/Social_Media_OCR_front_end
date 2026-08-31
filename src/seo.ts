/**
 * SEO helpers — meta descriptions match visible copy on each route (no new marketing text).
 */

import { absoluteSiteUrl, CANONICAL_SITE_ORIGIN } from './canonicalSite'
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
} from './seoAssets'
import { SEO_SITE_NAME } from './seoContent'
import type { DocumentSeo } from './seoTypes'

export type { DocumentSeo } from './seoTypes'
export {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FAQ_ITEMS,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
  SEO_HOME_H1,
  SEO_HOME_TITLE,
  SEO_HOWTO_DESCRIPTION,
  SEO_HOWTO_STEPS,
  SEO_SITE_NAME,
} from './seoContent'

function upsertMetaName(name: string, content: string): void {
  const sel = `meta[name="${name}"]`
  let el = document.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaProperty(property: string, content: string): void {
  const sel = `meta[property="${property}"]`
  let el = document.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(id: string, rel: string, href: string, attrs?: Record<string, string>): void {
  let el = document.getElementById(id) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.id = id
    document.head.appendChild(el)
  }
  el.rel = rel
  el.href = href
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
  }
}

function siteOrigin(): string {
  const raw = import.meta.env.VITE_SITE_URL?.trim() || ''
  if (raw) return raw.replace(/\/+$/, '')
  if (import.meta.env.PROD) return CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')
  return ''
}

/** Public site origin from `VITE_SITE_URL` (no trailing slash). Used for JSON-LD URLs. */
export function getSeoSiteOrigin(): string {
  return siteOrigin()
}

/** Mount `<script type="application/ld+json">` in `document.head`; replaces prior script with same `id`. */
export function mountJsonLd(id: string, data: Record<string, unknown>): void {
  unmountJsonLd(id)
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = id
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
  document.head.appendChild(script)
}

export function unmountJsonLd(id: string): void {
  document.getElementById(id)?.remove()
}

export function applyDocumentSeo({
  title,
  description,
  path,
  robots,
  canonicalPath,
}: DocumentSeo): void {
  document.title = title
  upsertMetaName('description', description)
  upsertMetaName('robots', robots || 'index, follow, max-image-preview:large')
  upsertMetaProperty('og:type', 'website')
  upsertMetaProperty('og:site_name', SEO_SITE_NAME)
  upsertMetaProperty('og:locale', 'en_US')
  upsertMetaProperty('og:title', title)
  upsertMetaProperty('og:description', description)
  upsertMetaName('twitter:card', 'summary_large_image')
  upsertMetaName('twitter:title', title)
  upsertMetaName('twitter:description', description)

  const origin = siteOrigin()
  if (origin) {
    const canonPath = canonicalPath || path
    const url = absoluteSiteUrl(origin, canonPath)
    const imageUrl = `${origin}${OG_IMAGE_PATH}`
    upsertMetaProperty('og:url', url)
    upsertLink('seo-canonical', 'canonical', url)
    upsertLink('seo-hreflang-en', 'alternate', url, { hreflang: 'en' })
    upsertLink('seo-hreflang-default', 'alternate', url, { hreflang: 'x-default' })
    upsertMetaProperty('og:image', imageUrl)
    upsertMetaProperty('og:image:alt', OG_IMAGE_ALT)
    upsertMetaProperty('og:image:type', OG_IMAGE_TYPE)
    upsertMetaProperty('og:image:width', String(OG_IMAGE_WIDTH))
    upsertMetaProperty('og:image:height', String(OG_IMAGE_HEIGHT))
    upsertMetaName('twitter:image', imageUrl)
    upsertMetaName('twitter:image:alt', OG_IMAGE_ALT)
  }
}
