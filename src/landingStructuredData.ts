/**
 * BreadcrumbList JSON-LD on every public route.
 * FAQPage JSON-LD on `/faq` and on indexed intent guides that show their own Q&A.
 * HowTo JSON-LD only on `/how-to` (Google expects these on the URL that actually shows that content).
 */

import type { IntentLanding } from './intentLandings'
import { LANDING_STRUCTURED_DATA_IDS, buildLandingStructuredData } from './landingStructuredDataShared'
import { getSeoSiteOrigin, mountJsonLd, unmountJsonLd } from './seo'

export function mountLandingStructuredData(
  pathNorm: string,
  intent: IntentLanding | null,
): void {
  const origin = getSeoSiteOrigin()
  if (!origin) return
  const entries = buildLandingStructuredData(pathNorm, intent, origin)
  const activeIds = new Set(entries.map((entry) => entry.id))

  for (const entry of entries) {
    mountJsonLd(entry.id, entry.data)
  }
  for (const id of LANDING_STRUCTURED_DATA_IDS) {
    if (!activeIds.has(id)) unmountJsonLd(id)
  }
}
