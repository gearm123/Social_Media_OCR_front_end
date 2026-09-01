import { createRoot } from 'react-dom/client'
import { mountLandingStructuredData } from './landingStructuredData'
import { applyDocumentSeo } from './seo'
import { HOME_DOCUMENT_SEO } from './documentSeo'
import { loadHomeApp, loadRouteElement } from './loadPage'
import { LEGACY_LANDING_REDIRECTS } from './intentLandings'
import { normalizeSeoPath, resolveSeoRoute } from './seoRoutes'
import './index.css'

const pathNorm = normalizeSeoPath(window.location.pathname)
const legacyTo = LEGACY_LANDING_REDIRECTS[pathNorm]
if (legacyTo) {
  window.location.replace(legacyTo)
} else {
  const resolvedRoute = resolveSeoRoute(pathNorm)

  if (resolvedRoute) {
    applyDocumentSeo(resolvedRoute.seo)
  } else {
    applyDocumentSeo(HOME_DOCUMENT_SEO)
  }

  mountLandingStructuredData(pathNorm, resolvedRoute?.intent ?? null)

  const root = document.getElementById('root')!

  void (resolvedRoute ? loadRouteElement(resolvedRoute) : loadHomeApp()).then((node) => {
    // Keep prerendered HTML until the route chunk is ready, then replace (trees do not hydrate 1:1).
    if (root.hasChildNodes()) root.replaceChildren()
    createRoot(root).render(node)
  })
}
