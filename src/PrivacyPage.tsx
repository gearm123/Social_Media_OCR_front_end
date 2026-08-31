import { SEO_PRIVACY_DESCRIPTION, SEO_PRIVACY_SECTIONS } from './seoContent'

export default function PrivacyPage() {
  return (
    <div className="support-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">Privacy</h1>
        <p className="support-page__lead">{SEO_PRIVACY_DESCRIPTION}</p>
        {SEO_PRIVACY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="intent-landing__h2">{section.title}</h2>
            <p className="support-page__lead intent-landing__more">{section.body}</p>
          </section>
        ))}
        <p className="support-page__note">
          <a href="/terms">Terms of use →</a>
          {' · '}
          <a href="/contact">Contact →</a>
        </p>
      </main>
    </div>
  )
}
