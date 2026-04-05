/**
 * SEO helpers — meta descriptions match visible copy on each route (no new marketing text).
 */

import { CANONICAL_SITE_ORIGIN } from './canonicalSite'

/** Hero tagline (App.tsx `.hero-tagline`). */
export const SEO_HOME_DESCRIPTION = 'Turn your chat screenshots into a translated conversation'

/** ContactPage lead paragraph. */
export const SEO_CONTACT_DESCRIPTION =
  'Questions about the product, billing, or partnerships? Send us a message — we read every email.'

/** FeedbackPage lead paragraph. */
export const SEO_FEEDBACK_DESCRIPTION =
  'Your experience matters. Share bugs, ideas, or anything that would make Translate Chat more useful for you.'

export const SEO_SITE_NAME = 'Translate Chat'

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

/**
 * Home-page FAQ — keep visible FAQ copy on the home page aligned with these entries for FAQPage schema.
 */
export const SEO_HOME_FAQ_ITEMS = [
  {
    question: 'What does Translate Chat do?',
    answer:
      'You upload chat screenshots (Messenger, WhatsApp, LINE, and similar apps). We read the conversation layout with AI vision and OCR hints, then produce a clean English chat-style image you can save or share.',
  },
  {
    question: 'Which chat apps work best?',
    answer:
      'The pipeline is tuned for common layouts: Facebook Messenger, WhatsApp, LINE, Instagram-style threads, Telegram, and iMessage-style bubbles. See the translation guides for app-specific tips.',
  },
  {
    question: 'Do I need an account to try it?',
    answer:
      'You can start with a limited free run without signing in. Create an account when you want more usage, subscriptions, or one-time paid runs.',
  },
  {
    question: 'Where can I read about privacy and data handling?',
    answer:
      'Use the Privacy link in the footer when the app is connected to our API — it opens our hosted privacy page. We do not use your screenshots to train public models.',
  },
] as const

export function applyDocumentSeo({ title, description, path }: DocumentSeo): void {
  document.title = title
  upsertMetaName('description', description)
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
