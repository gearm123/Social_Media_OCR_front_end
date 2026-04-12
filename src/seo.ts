/**
 * SEO helpers — meta descriptions match visible copy on each route (no new marketing text).
 */

import { CANONICAL_SITE_ORIGIN } from './canonicalSite'
export {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FAQ_ITEMS,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_DESCRIPTION,
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

function upsertCanonical(href: string): void {
  const id = 'seo-canonical'
  let el = document.getElementById(id) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.id = id
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

function siteOrigin(): string {
  const raw = import.meta.env.VITE_SITE_URL?.trim() || ''
  if (raw) return raw.replace(/\/+$/, '')
  if (import.meta.env.PROD) return CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')
  return ''
}

export type DocumentSeo = {
  title: string
  description: string
  /** Path starting with `/` (e.g. `/`, `/contact`). */
  path: string
  robots?: string
}

/**
 * Updates document title, description, Open Graph, Twitter, and canonical (when `VITE_SITE_URL` is set).
 */
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

export function applyDocumentSeo({ title, description, path, robots }: DocumentSeo): void {
  document.title = title
  upsertMetaName('description', description)
  upsertMetaName('robots', robots || 'index, follow, max-image-preview:large')
  upsertMetaProperty('og:type', 'website')
  upsertMetaProperty('og:title', title)
  upsertMetaProperty('og:description', description)
  upsertMetaName('twitter:card', 'summary_large_image')
  upsertMetaName('twitter:title', title)
  upsertMetaName('twitter:description', description)

  const origin = siteOrigin()
  if (origin) {
    const norm = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
    const url = norm === '/' ? `${origin}/` : `${origin}${norm}`
    upsertMetaProperty('og:url', url)
    upsertCanonical(url)
    upsertMetaProperty('og:image', `${origin}/translate-chat-mark.svg`)
    upsertMetaName('twitter:image', `${origin}/translate-chat-mark.svg`)
  }
}
