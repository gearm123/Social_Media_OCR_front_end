/** Shared SEO document fields. Safe to import from Vite config (no DOM). */
export type DocumentSeo = {
  title: string
  description: string
  /** Path starting with `/` (e.g. `/`, `/contact`). */
  path: string
  robots?: string
  /** When set, canonical and og:url use this path instead of `path`. */
  canonicalPath?: string
}
