import { useEffect, useRef, useState } from 'react'
import { GUIDE_VIDEO_BY_SRC, GUIDE_WORKFLOW_STEPS } from './guideWorkflowSteps'

export type { GuideWorkflowStep } from './guideWorkflowSteps'
export { GUIDE_WORKFLOW_STEPS } from './guideWorkflowSteps'

type Props = {
  heading?: string
  intro?: string
  className?: string
  /**
   * `rail` — compact column meant to sit **left** of the main guide text (sticky on wide viewports).
   * `default` — full-width block (legacy / rare).
   */
  variant?: 'default' | 'rail'
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduced
}

function GuideClip({
  src,
  label,
  micro,
  autoPlay,
}: {
  src: string
  label: string
  micro?: boolean
  autoPlay: boolean
}) {
  const watch = GUIDE_VIDEO_BY_SRC[src]
  return (
    <>
      <video
        className={micro ? 'guide-workflow__clip guide-workflow__clip--micro' : 'guide-workflow__clip'}
        src={src}
        poster={watch?.poster}
        muted
        playsInline
        loop
        controls
        autoPlay={autoPlay}
        preload="metadata"
        aria-label={label}
      />
      {watch ? (
        <p className="guide-workflow__watch-wrap">
          <a className="guide-workflow__watch-link" href={watch.path}>
            Open watch page
          </a>
        </p>
      ) : null}
    </>
  )
}

export default function GuideWorkflowSection({
  heading = 'Visual walkthrough',
  intro = 'Same flow on the home page: input → guidance → settings → translated image.',
  className = '',
  variant = 'default',
}: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const autoPlay = !reducedMotion
  const rootRef = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setRevealed(true)
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const rail = variant === 'rail'

  return (
    <section
      ref={rootRef}
      id="visual-walkthrough"
      className={`guide-workflow${rail ? ' guide-workflow--rail' : ''}${revealed ? ' guide-workflow--revealed' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby="guide-workflow-heading"
    >
      <h2 id="guide-workflow-heading" className="guide-workflow__heading">
        {heading}
      </h2>
      <p className="guide-workflow__intro">{intro}</p>

      <ol className="guide-workflow__steps">
        {GUIDE_WORKFLOW_STEPS.map((step, index) => (
          <li key={step.title} className="guide-workflow__step">
            <div className="guide-workflow__step-head">
              <span className="guide-workflow__step-badge" aria-hidden>
                {index + 1}
              </span>
              <div>
                <h3 className="guide-workflow__step-title">{step.title}</h3>
                <p className="guide-workflow__step-desc">{step.description}</p>
              </div>
            </div>
            <div className="guide-workflow__media">
              <div className="guide-workflow__primary">
                <GuideClip src={step.mainSrc} label={`${step.title}: overview`} autoPlay={autoPlay} />
              </div>
              {step.microSrc ? (
                <div className="guide-workflow__micro-wrap">
                  <p className="guide-workflow__micro-label">Detail</p>
                  <GuideClip src={step.microSrc} label={`${step.title}: detail`} micro autoPlay={autoPlay} />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
