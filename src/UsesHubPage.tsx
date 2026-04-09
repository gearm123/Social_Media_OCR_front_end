import GuideWorkflowSection from './GuideWorkflowSection'
import { INTENT_LANDINGS } from './intentLandings'

const HUB_LEAD =
  'Short guides for common search intents — same tool on the home page, with tips tailored to each chat app or language.'

export const USES_HUB_SEO_DESCRIPTION = HUB_LEAD

export default function UsesHubPage() {
  return (
    <div className="support-page intent-landing guide-page">
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

        <div className="guide-page__split">
          <aside className="guide-page__rail" aria-label="Screen recordings of the translator workflow">
            <GuideWorkflowSection
              variant="rail"
              heading="Quick walkthrough"
              intro="Same four steps for every topic. Pick a guide on the right for app-specific tips."
            />
          </aside>
          <div className="guide-page__body">
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
          </div>
        </div>
      </main>
    </div>
  )
}
