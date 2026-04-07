import {
  DEMO_RECONSTRUCTION_GIF_PATH,
  DEMO_RECONSTRUCTION_HEIGHT,
  DEMO_RECONSTRUCTION_WIDTH,
} from './demoReconstructionMedia'

/**
 * Demo GIF: served as a static file (`<img src="…gif">`, native browser decode + animation).
 * Refresh `public/demonstration-chat-reconstruction.gif` from `video_maker/chat_reconstruct_enhanced.gif` when the asset changes.
 */
const DEMONSTRATION_MEDIA_SRC = DEMO_RECONSTRUCTION_GIF_PATH

export default function DemonstrationPage() {
  return (
    <div className="support-page demonstration-page">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main demonstration-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              Demonstration
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">Demonstration</h1>
        <p className="support-page__lead demonstration-page__lead">
          See how readable chat bubbles can be reconstructed even when the phone screen is badly cracked — the same
          idea behind Translate Chat&apos;s output on tough screenshots.
        </p>

        <div className="demonstration-page__visual">
          <img
            className="demonstration-page__media"
            src={DEMONSTRATION_MEDIA_SRC}
            alt="Before and after: cracked phone screens with reconstructed chat bubbles overlaid for legibility"
            width={DEMO_RECONSTRUCTION_WIDTH}
            height={DEMO_RECONSTRUCTION_HEIGHT}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <p className="demonstration-page__cta">
          <a className="support-page__mailto" href="/">
            Open the translator
          </a>
        </p>
      </main>
    </div>
  )
}
