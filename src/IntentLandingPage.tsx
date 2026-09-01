import GuideWorkflowSection from './GuideWorkflowSection'
import type { IntentLanding } from './intentLandings'
import { USES_HUB_PATH } from './intentLandings'

type Props = {
  intent: IntentLanding
}

export default function IntentLandingPage({ intent }: Props) {
  const related = intent.related ?? []

  return (
    <div className="support-page intent-landing guide-page">
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

        <div className="guide-page__split">
          <aside className="guide-page__rail" aria-label="Screen recordings of the translator workflow">
            <GuideWorkflowSection
              variant="rail"
              heading="How the translator flows"
              intro="Left: the four steps in order. Right: tips for this guide."
            />
          </aside>
          <div className="guide-page__body">
            {intent.workflow && intent.workflow.length > 0 ? (
              <>
                <h2 className="intent-landing__h2">Short workflow</h2>
                <ol className="intent-landing__workflow">
                  {intent.workflow.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </>
            ) : null}

            <h2 className="intent-landing__h2">Tips for better results</h2>
            <ul className="intent-landing__tips">
              {intent.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            {intent.faq && intent.faq.length > 0 ? (
              <section className="seo-home-faq seo-home-faq--page" aria-label="Questions about this guide">
                <h2 className="intent-landing__h2">Questions about this guide</h2>
                <dl className="seo-home-faq__list">
                  {intent.faq.map((item) => (
                    <div className="seo-home-faq__item" key={item.question}>
                      <dt className="seo-home-faq__q">{item.question}</dt>
                      <dd className="seo-home-faq__a">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <p className="intent-landing__cta-wrap">
              <a className="support-page__mailto intent-landing__cta" href="/">
                Start translating — upload screenshots
              </a>
            </p>

            {related.length > 0 ? (
              <nav className="intent-landing__related" aria-label="Related translation guides">
                <h2 className="intent-landing__h2">Related translation guides</h2>
                <ul className="intent-landing__related-list">
                  {related.map((item) => (
                    <li key={item.path}>
                      <a href={item.path}>{item.label}</a>
                    </li>
                  ))}
                  <li>
                    <a href={USES_HUB_PATH}>Every guide on the hub</a>
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
