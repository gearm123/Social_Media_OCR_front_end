import { SEO_FAQ_DESCRIPTION, SEO_FAQ_ITEMS } from './seo'

export default function FaqPage() {
  return (
    <div className="support-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">Common questions</h1>
        <p className="support-page__lead">{SEO_FAQ_DESCRIPTION}</p>
        <section
          className="seo-home-faq seo-home-faq--page"
          aria-label="Frequently asked questions"
        >
          <dl className="seo-home-faq__list">
            {SEO_FAQ_ITEMS.map((item) => (
              <div className="seo-home-faq__item" key={item.question}>
                <dt className="seo-home-faq__q">{item.question}</dt>
                <dd className="seo-home-faq__a">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="seo-home-faq__more">
            <a href="/uses">More guides by app and language →</a>
          </p>
        </section>
      </main>
    </div>
  )
}
