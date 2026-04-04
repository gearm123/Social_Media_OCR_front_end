import { useEffect } from 'react'
import { INTENT_LANDINGS, USES_HUB_PATH } from './intentLandings'
import { getSeoSiteOrigin, mountJsonLd, unmountJsonLd } from './seo'

const HUB_LEAD =
  'Short guides for common search intents — same tool on the home page, with tips tailored to each chat app or language.'

export const USES_HUB_SEO_DESCRIPTION = HUB_LEAD

export default function UsesHubPage() {
  useEffect(() => {
    const origin = getSeoSiteOrigin()
    if (!origin) return
    const id = 'jsonld-breadcrumb-uses'
    const hubUrl = `${origin}${USES_HUB_PATH}`
    mountJsonLd(id, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Translation guides', item: hubUrl },
      ],
    })
    return () => unmountJsonLd(id)
  }, [])

  return (
    <div className="support-page intent-landing">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              Translation guides
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">Translation guides</h1>
        <p className="support-page__lead">{HUB_LEAD}</p>

        <ul className="intent-landing__hub-list">
          {INTENT_LANDINGS.map((x) => (
            <li key={x.path}>
              <a href={x.path}>{x.h1}</a>
            </li>
          ))}
        </ul>

        <p className="intent-landing__cta-wrap">
          <a className="support-page__mailto intent-landing__cta" href="/">
            Open the translator
          </a>
        </p>
      </main>
    </div>
  )
}
