/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production site origin, no trailing slash (canonical, Open Graph, sitemap). */
  readonly VITE_SITE_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PADDLE_CLIENT_TOKEN?: string
  readonly VITE_PADDLE_ENV?: string
  /** Shown on pricing cards for Basic subscription (match your Paddle listing, e.g. `$4.99`) */
  readonly VITE_PRICE_BASIC_DISPLAY?: string
  /** Shown on pricing cards for Pro subscription */
  readonly VITE_PRICE_PRO_DISPLAY?: string
  /** Optional. Milliseconds for POST /jobs (upload). Default 600000 (10m). Min 30000, max 1800000. */
  readonly VITE_CREATE_JOB_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
