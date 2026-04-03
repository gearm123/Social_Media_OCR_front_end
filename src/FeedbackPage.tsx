import { SUPPORT_EMAIL } from './supportEmail'

export default function FeedbackPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Translate Chat — feedback')}&body=${encodeURIComponent(
    'What went well or what could be better:\n\n',
  )}`

  return (
    <div className="support-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <h1 className="support-page__title">Feedback</h1>
        <p className="support-page__lead">
          Your experience matters. Share bugs, ideas, or anything that would make Translate Chat more useful for you.
        </p>
        <p className="support-page__email-line">
          <a className="support-page__mailto" href={mailto}>
            Send feedback by email
          </a>
        </p>
        <p className="support-page__muted">
          Opens your mail app to <strong>{SUPPORT_EMAIL}</strong> with a short template you can edit.
        </p>
      </main>
    </div>
  )
}
