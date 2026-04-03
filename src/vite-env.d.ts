/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PADDLE_CLIENT_TOKEN?: string
  readonly VITE_PADDLE_ENV?: string
  /** Set to `false` to hide the debug ($0.10) plan in production builds. */
  readonly VITE_SHOW_DEBUG_PRICE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
