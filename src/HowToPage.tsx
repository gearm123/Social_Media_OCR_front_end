import GuideWorkflowSection from './GuideWorkflowSection'
import { SEO_HOWTO_DESCRIPTION, SEO_HOWTO_STEPS } from './seo'

export default function HowToPage() {
  return (
    <div className="support-page guide-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">How to use Translate Chat</h1>
        <p className="support-page__lead">{SEO_HOWTO_DESCRIPTION}</p>

        <div className="guide-page__split">
          <aside className="guide-page__rail" aria-label="Screen recordings of the translator workflow">
            <GuideWorkflowSection
              variant="rail"
              heading="See the flow in the app"
              intro="Videos on the left; detailed written steps on the right."
            />
          </aside>
          <div className="guide-page__body">
            <ol className="howto-page__steps">
              {SEO_HOWTO_STEPS.map((step) => (
                <li key={step.title} className="howto-page__step">
                  <h2 className="howto-page__step-title">{step.title}</h2>
                  <p className="howto-page__step-body">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="support-page__note">
              <a href="/uses">App-specific tips (Messenger, WhatsApp, LINE, Thai, …) →</a>
              {' · '}
              <a href="/faq">FAQ →</a>
              {' · '}
              <a href="/demonstration">Demonstration →</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
