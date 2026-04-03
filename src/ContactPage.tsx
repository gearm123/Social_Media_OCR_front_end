import { SUPPORT_EMAIL } from './supportEmail'

export default function ContactPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Translate Chat — contact')}`

  return (
    <div className="support-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">Contact us</h1>
        <p className="support-page__lead">
          Questions about the product, billing, or partnerships? Send us a message — we read every email.
        </p>
        <p className="support-page__email-line">
          <a className="support-page__mailto" href={mailto}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="support-page__note">
          This inbox is not monitored 24/7 yet; we will respond as soon as we can.
        </p>
      </main>
    </div>
  )
}
