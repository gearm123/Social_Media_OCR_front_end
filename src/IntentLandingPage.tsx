import type { IntentLanding } from './intentLandings'
import { INTENT_LANDINGS, USES_HUB_PATH } from './intentLandings'

type Props = {
  intent: IntentLanding
}

export default function IntentLandingPage({ intent }: Props) {
  const others = INTENT_LANDINGS.filter((x) => x.path !== intent.path)

  return (
    <div className="support-page intent-landing">
      <header className="support-page__header">
        <a className="support-page__back" href={USES_HUB_PATH}>
          ← All translation guides
        </a>
      </header>
      <main className="support-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item">
              <a href={USES_HUB_PATH}>Guides</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              {intent.h1}
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">{intent.h1}</h1>
        <p className="support-page__lead">{intent.lead}</p>
        {intent.more?.map((p, i) => (
          <p className="support-page__lead intent-landing__more" key={i}>
            {p}
          </p>
        ))}

        <h2 className="intent-landing__h2">Tips for better results</h2>
        <ul className="intent-landing__tips">
          {intent.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <p className="intent-landing__cta-wrap">
          <a className="support-page__mailto intent-landing__cta" href="/">
            Start translating — upload screenshots
          </a>
        </p>

        <nav className="intent-landing__related" aria-label="Other guides">
          <h2 className="intent-landing__h2">Other guides</h2>
          <ul className="intent-landing__related-list">
            {others.map((x) => (
              <li key={x.path}>
                <a href={x.path}>{x.h1}</a>
              </li>
            ))}
            <li>
              <a href={USES_HUB_PATH}>All guides on one page</a>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  )
}
