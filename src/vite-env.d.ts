/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production site origin, no trailing slash (canonical, Open Graph, sitemap). */
  readonly VITE_SITE_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PADDLE_CLIENT_TOKEN?: string
  readonly VITE_PADDLE_ENV?: string
  /** Set to `false` to hide the debug ($0.70) plan in production builds. */
  readonly VITE_SHOW_DEBUG_PRICE?: string
  /** Optional. Milliseconds for POST /jobs (upload). Default 600000 (10m). Min 30000, max 1800000. */
  readonly VITE_CREATE_JOB_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
