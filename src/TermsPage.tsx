import { SEO_TERMS_DESCRIPTION, SEO_TERMS_SECTIONS } from './seoContent'

export default function TermsPage() {
  return (
    <div className="support-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">Terms of use</h1>
        <p className="support-page__lead">{SEO_TERMS_DESCRIPTION}</p>
        {SEO_TERMS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="intent-landing__h2">{section.title}</h2>
            <p className="support-page__lead intent-landing__more">{section.body}</p>
          </section>
        ))}
        <p className="support-page__note">
          <a href="/privacy">Privacy →</a>
          {' · '}
          <a href="/contact">Contact →</a>
        </p>
      </main>
    </div>
  )
}
