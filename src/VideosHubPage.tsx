import { GUIDE_VIDEO_CLIPS } from './guideWorkflowSteps'
import { SEO_VIDEOS_DESCRIPTION } from './seoContent'

export default function VideosHubPage() {
  return (
    <div className="support-page video-watch-hub">
      <header className="support-page__header">
        <a className="support-page__back" href="/how-to">
          ← How to use Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              Videos
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">Workflow videos</h1>
        <p className="support-page__lead">{SEO_VIDEOS_DESCRIPTION}</p>
        <ul className="video-watch-hub__list">
          {GUIDE_VIDEO_CLIPS.map((clip) => (
            <li key={clip.path} className="video-watch-hub__item">
              <a className="video-watch-hub__card" href={clip.path}>
                <img
                  className="video-watch-hub__thumb"
                  src={clip.poster}
                  alt=""
                  width={480}
                  height={270}
                  loading="lazy"
                  decoding="async"
                />
                <span className="video-watch-hub__card-title">{clip.title}</span>
                <span className="video-watch-hub__card-desc">{clip.lead}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="support-page__note">
          Prefer written steps? Open the <a href="/how-to">how-to guide</a>.
        </p>
      </main>
    </div>
  )
}
