/**
 * SEO helpers — meta descriptions match visible copy on each route (no new marketing text).
 */

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
  return raw.replace(/\/+$/, '')
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
