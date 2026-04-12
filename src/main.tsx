import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { mountLandingStructuredData } from './landingStructuredData'
import { applyDocumentSeo } from './seo'
import { normalizeSeoPath, resolveSeoRoute } from './seoRoutes'
import { prefetchAuthProviders } from './authApi'
import './index.css'

/** Warm OAuth provider config on every entry route so Sign in is not blocked waiting on /auth/providers. */
prefetchAuthProviders()

const pathNorm = normalizeSeoPath(window.location.pathname)
const resolvedRoute = resolveSeoRoute(pathNorm)

if (resolvedRoute) {
  applyDocumentSeo(resolvedRoute.seo)
}

mountLandingStructuredData(pathNorm, resolvedRoute?.intent ?? null)

const root = document.getElementById('root')!
const app = resolvedRoute ? (
  resolvedRoute.element
) : (
  <StrictMode>
    <App />
  </StrictMode>
)
// Paddle.js + Checkout.open must not run under StrictMode's double effect mount; the first
// mount's async init is cancelled and checkout never opens. Main app keeps StrictMode.
if (root.hasChildNodes()) root.replaceChildren()
createRoot(root).render(app)
