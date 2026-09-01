import { GUIDE_VIDEO_CLIPS, VIDEOS_HUB_PATH, type GuideWorkflowClip } from './guideWorkflowSteps'

type Props = {
  clip: GuideWorkflowClip
}

export default function VideoWatchPage({ clip }: Props) {
  const others = GUIDE_VIDEO_CLIPS.filter((entry) => entry.path !== clip.path)

  return (
    <div className="support-page video-watch">
      <header className="support-page__header">
        <a className="support-page__back" href={VIDEOS_HUB_PATH}>
          ← All workflow videos
        </a>
      </header>
      <main className="support-page__main video-watch__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item">
              <a href={VIDEOS_HUB_PATH}>Videos</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              {clip.title}
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title video-watch__title">{clip.title}</h1>
        <div className="video-watch__player-wrap">
          <video
            className="video-watch__player"
            src={clip.src}
            poster={clip.poster}
            controls
            playsInline
            preload="metadata"
            width={960}
            height={540}
          >
            Your browser does not support this video.
          </video>
        </div>
        <p className="support-page__lead video-watch__lead">{clip.lead}</p>
        <p className="support-page__note">
          This clip is step “{clip.stepTitle}” in the translator. See the{' '}
          <a href="/how-to">written how-to</a> for the full sequence.
        </p>
        <nav className="video-watch__related" aria-label="Other workflow videos">
          <h2 className="intent-landing__h2">Other clips</h2>
          <ul className="video-watch__related-list">
            {others.map((entry) => (
              <li key={entry.path}>
                <a href={entry.path}>{entry.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}
