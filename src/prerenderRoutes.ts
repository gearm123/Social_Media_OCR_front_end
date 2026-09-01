import { DEMO_RECONSTRUCTION_GIF_PATH, DEMO_RECONSTRUCTION_HEIGHT, DEMO_RECONSTRUCTION_WIDTH } from './demoReconstructionMedia'
import {
  CONTACT_DOCUMENT_SEO,
  DEMONSTRATION_DOCUMENT_SEO,
  FAQ_DOCUMENT_SEO,
  FEEDBACK_DOCUMENT_SEO,
  HOME_DOCUMENT_SEO,
  HOWTO_DOCUMENT_SEO,
  PAY_DOCUMENT_SEO,
  PRIVACY_DOCUMENT_SEO,
  TERMS_DOCUMENT_SEO,
  USES_DOCUMENT_SEO,
  VIDEOS_DOCUMENT_SEO,
  intentDocumentSeo,
  videoClipDocumentSeo,
} from './documentSeo'
import { GUIDE_VIDEO_BY_SRC, GUIDE_VIDEO_CLIPS, GUIDE_WORKFLOW_STEPS, VIDEOS_HUB_PATH } from './guideWorkflowSteps'
import { INTENT_LANDINGS, USES_HUB_PATH, type IntentLanding } from './intentLandings'
import {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_ITEMS,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOME_H1,
  SEO_HOWTO_STEPS,
  SEO_PRIVACY_DESCRIPTION,
  SEO_PRIVACY_SECTIONS,
  SEO_SITE_NAME,
  SEO_TERMS_DESCRIPTION,
  SEO_TERMS_SECTIONS,
  SEO_USES_DESCRIPTION,
  SEO_VIDEOS_DESCRIPTION,
} from './seoContent'
import { SUPPORT_EMAIL } from './supportEmail'
import type { DocumentSeo } from './seoTypes'

export type PrerenderRoute = {
  pathNorm: string
  seo: DocumentSeo
  intent: IntentLanding | null
  bodyHtml: string
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function breadcrumb(items: readonly { label: string; href?: string }[]): string {
  const rows = items
    .map((item, index) => {
      const current = index === items.length - 1
      if (current || !item.href) {
        return `<li class="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">${escHtml(item.label)}</li>`
      }
      return `<li class="seo-breadcrumbs__item"><a href="${item.href}">${escHtml(item.label)}</a></li>`
    })
    .join('')
  return `<nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol class="seo-breadcrumbs__list">${rows}</ol></nav>`
}

function wrapSupportPage(
  content: string,
  backHref = '/',
  backLabel = 'Back to Translate Chat',
  extraClass = '',
): string {
  const cls = extraClass ? `support-page ${extraClass}` : 'support-page'
  return `<div class="${cls}"><header class="support-page__header"><a class="support-page__back" href="${backHref}">${escHtml(backLabel)}</a></header><main class="support-page__main">${content}</main></div>`
}

function workflowClipHtml(src: string, ariaLabel: string, micro: boolean): string {
  const watch = GUIDE_VIDEO_BY_SRC[src]
  const poster = watch ? ` poster="${escHtml(watch.poster)}"` : ''
  const cls = micro ? 'guide-workflow__clip guide-workflow__clip--micro' : 'guide-workflow__clip'
  const video = `<video class="${cls}" src="${escHtml(src)}"${poster} muted playsinline controls preload="metadata" aria-label="${escHtml(ariaLabel)}"></video>`
  if (!watch) return video
  return `${video}<p class="guide-workflow__watch-wrap"><a class="guide-workflow__watch-link" href="${escHtml(watch.path)}">Open watch page</a></p>`
}

function workflowRailHtml(heading: string, intro: string): string {
  const steps = GUIDE_WORKFLOW_STEPS.map((step, index) => {
    const micro = step.microSrc
      ? `<div class="guide-workflow__micro-wrap"><p class="guide-workflow__micro-label">Detail</p>${workflowClipHtml(step.microSrc, `${step.title}: detail`, true)}</div>`
      : ''
    return `<li class="guide-workflow__step"><div class="guide-workflow__step-head"><span class="guide-workflow__step-badge" aria-hidden>${index + 1}</span><div><h3 class="guide-workflow__step-title">${escHtml(step.title)}</h3><p class="guide-workflow__step-desc">${escHtml(step.description)}</p></div></div><div class="guide-workflow__media"><div class="guide-workflow__primary">${workflowClipHtml(step.mainSrc, `${step.title}: overview`, false)}</div>${micro}</div></li>`
  }).join('')
  return `<aside class="guide-page__rail" aria-label="Screen recordings of the translator workflow"><section id="visual-walkthrough" class="guide-workflow guide-workflow--rail" aria-labelledby="guide-workflow-heading"><h2 id="guide-workflow-heading" class="guide-workflow__heading">${escHtml(heading)}</h2><p class="guide-workflow__intro">${escHtml(intro)}</p><ol class="guide-workflow__steps">${steps}</ol></section></aside>`
}

function legalSectionsHtml(sections: readonly { title: string; body: string }[]): string {
  return sections
    .map(
      (section) =>
        `<section><h2 class="intent-landing__h2">${escHtml(section.title)}</h2><p class="support-page__lead intent-landing__more">${escHtml(section.body)}</p></section>`,
    )
    .join('')
}

function contactBody(): string {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Translate Chat — contact')}`
  return wrapSupportPage(
    `<h1 class="support-page__title">Contact us</h1>
    <p class="support-page__lead">${escHtml(SEO_CONTACT_DESCRIPTION)}</p>
    <p class="support-page__email-line"><a class="support-page__mailto" href="${mailto}">${escHtml(SUPPORT_EMAIL)}</a></p>
    <p class="support-page__note">This inbox is not monitored 24/7 yet; we will respond as soon as we can.</p>`,
  )
}

function feedbackBody(): string {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Translate Chat — feedback')}&body=${encodeURIComponent(
    'What went well or what could be better:\n\n',
  )}`
  return wrapSupportPage(
    `<h1 class="support-page__title">Feedback</h1>
    <p class="support-page__lead">${escHtml(SEO_FEEDBACK_DESCRIPTION)}</p>
    <p class="support-page__email-line"><a class="support-page__mailto" href="${mailto}">Send feedback by email</a></p>
    <p class="support-page__muted">Opens your mail app to <strong>${escHtml(SUPPORT_EMAIL)}</strong> with a short template you can edit.</p>`,
  )
}

function faqBody(): string {
  const items = SEO_FAQ_ITEMS.map(
    (item) =>
      `<div class="seo-home-faq__item"><dt class="seo-home-faq__q">${escHtml(item.question)}</dt><dd class="seo-home-faq__a">${escHtml(item.answer)}</dd></div>`,
  ).join('')
  return wrapSupportPage(
    `<h1 class="support-page__title">Common questions</h1>
    <p class="support-page__lead">${escHtml(FAQ_DOCUMENT_SEO.description)}</p>
    <section class="seo-home-faq seo-home-faq--page" aria-label="Frequently asked questions">
      <dl class="seo-home-faq__list">${items}</dl>
      <p class="seo-home-faq__more"><a href="${USES_HUB_PATH}">More guides by app and language →</a> · <a href="/demonstration">Demonstration</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
    </section>`,
  )
}

function howToBody(): string {
  const steps = SEO_HOWTO_STEPS.map(
    (step) =>
      `<li class="howto-page__step"><h2 class="howto-page__step-title">${escHtml(step.title)}</h2><p class="howto-page__step-body">${escHtml(step.body)}</p></li>`,
  ).join('')
  return wrapSupportPage(
    `<h1 class="support-page__title">How to use ${escHtml(SEO_SITE_NAME)}</h1>
    <p class="support-page__lead">${escHtml(HOWTO_DOCUMENT_SEO.description)}</p>
    <div class="guide-page__split">
      ${workflowRailHtml('See the flow in the app', 'Videos on the left; detailed written steps on the right.')}
      <div class="guide-page__body">
        <ol class="howto-page__steps">${steps}</ol>
        <p class="support-page__note"><a href="${USES_HUB_PATH}">App-specific tips (Messenger, WhatsApp, LINE, Thai, …) →</a> · <a href="${VIDEOS_HUB_PATH}">Workflow videos →</a> · <a href="/faq">FAQ →</a> · <a href="/demonstration">Demonstration →</a></p>
      </div>
    </div>`,
    '/',
    'Back to Translate Chat',
    'guide-page',
  )
}

function demonstrationBody(): string {
  return wrapSupportPage(
    `${breadcrumb([{ label: 'Home', href: '/' }, { label: 'Demonstration' }])}
    <h1 class="support-page__title">Demonstration</h1>
    <p class="support-page__lead demonstration-page__lead">${escHtml(SEO_DEMONSTRATION_DESCRIPTION)}</p>
    <div class="guide-page__split guide-page__split--demonstration">
      ${workflowRailHtml('Using the translator', 'Workflow on the left; reconstruction example on the right.')}
      <div class="guide-page__body guide-page__body--demonstration">
        <div class="demonstration-page__visual">
          <img
            class="demonstration-page__media"
            src="${escHtml(DEMO_RECONSTRUCTION_GIF_PATH)}"
            alt="Before and after: cracked phone screens with reconstructed chat bubbles overlaid for legibility"
            width="${DEMO_RECONSTRUCTION_WIDTH}"
            height="${DEMO_RECONSTRUCTION_HEIGHT}"
            loading="eager"
            decoding="async"
          />
        </div>
        <p class="demonstration-page__cta"><a class="support-page__mailto" href="/">Open the translator</a></p>
      </div>
    </div>`,
    '/',
    'Back to Translate Chat',
    'demonstration-page guide-page',
  )
}

function usesBody(): string {
  const links = INTENT_LANDINGS.map((entry) => `<li><a href="${entry.path}">${escHtml(entry.h1)}</a></li>`).join('')
  return wrapSupportPage(
    `${breadcrumb([{ label: 'Home', href: '/' }, { label: 'Translation guides' }])}
    <h1 class="support-page__title">Translation guides</h1>
    <p class="support-page__lead">${escHtml(SEO_USES_DESCRIPTION)}</p>
    <div class="guide-page__split">
      ${workflowRailHtml('Quick walkthrough', 'Same four steps for every topic. Pick a guide on the right for app-specific tips.')}
      <div class="guide-page__body">
        <ul class="intent-landing__hub-list">${links}</ul>
        <p class="intent-landing__cta-wrap"><a class="support-page__mailto intent-landing__cta" href="/">Open the translator</a></p>
      </div>
    </div>`,
    '/',
    'Back to Translate Chat',
    'intent-landing guide-page',
  )
}

function intentBody(intent: IntentLanding): string {
  const more = (intent.more || [])
    .map((p) => `<p class="support-page__lead intent-landing__more">${escHtml(p)}</p>`)
    .join('')
  const tips = intent.tips.map((tip) => `<li>${escHtml(tip)}</li>`).join('')
  const others = INTENT_LANDINGS.filter((entry) => entry.path !== intent.path)
    .map((entry) => `<li><a href="${entry.path}">${escHtml(entry.h1)}</a></li>`)
    .join('')

  return wrapSupportPage(
    `${breadcrumb([
      { label: 'Home', href: '/' },
      { label: 'Guides', href: USES_HUB_PATH },
      { label: intent.h1 },
    ])}
    <h1 class="support-page__title">${escHtml(intent.h1)}</h1>
    <p class="support-page__lead">${escHtml(intent.lead)}</p>
    ${more}
    <div class="guide-page__split">
      ${workflowRailHtml('How the translator flows', 'Left: the four steps in order. Right: tips for this guide.')}
      <div class="guide-page__body">
        <h2 class="intent-landing__h2">Tips for better results</h2>
        <ul class="intent-landing__tips">${tips}</ul>
        ${
          intent.faq && intent.faq.length > 0
            ? `<section class="seo-home-faq seo-home-faq--page" aria-label="Questions about this guide"><h2 class="intent-landing__h2">Questions about this guide</h2><dl class="seo-home-faq__list">${intent.faq
                .map(
                  (item) =>
                    `<div class="seo-home-faq__item"><dt class="seo-home-faq__q">${escHtml(item.question)}</dt><dd class="seo-home-faq__a">${escHtml(item.answer)}</dd></div>`,
                )
                .join('')}</dl></section>`
            : ''
        }
        <p class="intent-landing__cta-wrap"><a class="support-page__mailto intent-landing__cta" href="/">Start translating — upload screenshots</a></p>
        <nav class="intent-landing__related" aria-label="Other guides">
          <h2 class="intent-landing__h2">Other guides</h2>
          <ul class="intent-landing__related-list">${others}<li><a href="${USES_HUB_PATH}">All guides on one page</a></li></ul>
        </nav>
      </div>
    </div>`,
    USES_HUB_PATH,
    'All translation guides',
    'intent-landing guide-page',
  )
}

function privacyBody(): string {
  return wrapSupportPage(
    `<h1 class="support-page__title">Privacy</h1>
    <p class="support-page__lead">${escHtml(SEO_PRIVACY_DESCRIPTION)}</p>
    ${legalSectionsHtml(SEO_PRIVACY_SECTIONS)}
    <p class="support-page__note"><a href="/terms">Terms of use →</a> · <a href="/contact">Contact →</a></p>`,
  )
}

function termsBody(): string {
  return wrapSupportPage(
    `<h1 class="support-page__title">Terms of use</h1>
    <p class="support-page__lead">${escHtml(SEO_TERMS_DESCRIPTION)}</p>
    ${legalSectionsHtml(SEO_TERMS_SECTIONS)}
    <p class="support-page__note"><a href="/privacy">Privacy →</a> · <a href="/contact">Contact →</a></p>`,
  )
}

function homeBody(): string {
  return `<main class="app-shell"><div class="app">
    <header class="app-top-bar">
      <nav class="app-top-bar__nav" aria-label="Help and feedback">
        <a class="app-top-bar__link" href="/contact">Contact us</a>
        <a class="app-top-bar__link" href="/feedback">Feedback</a>
      </nav>
    </header>
    <header class="hero">
      <div class="hero-title-block">
        <p class="hero-brand">
          <span class="hero-brand__lockup">
            <img class="hero-brand__mark" src="/translate-chat-mark.svg" alt="" width="44" height="44" decoding="async" />
            <span class="hero-brand__row">
              <span class="hero-brand__translate">Translate</span>
              <span class="hero-brand__chat-pill">Chat</span>
            </span>
          </span>
        </p>
        <h1 class="hero-tagline">${escHtml(SEO_HOME_H1)}</h1>
      </div>
    </header>
    <nav class="site-explore-bar" aria-label="More pages">
      <div class="site-explore-bar__track">
        <span class="site-explore-bar__eyebrow">Explore</span>
        <div class="site-explore-bar__chips">
          <a class="site-explore-bar__chip site-explore-bar__chip--accent" href="/how-to">How to</a>
          <a class="site-explore-bar__chip" href="/uses">Guides</a>
          <a class="site-explore-bar__chip" href="${VIDEOS_HUB_PATH}">Videos</a>
          <a class="site-explore-bar__chip" href="/faq">FAQ</a>
        </div>
      </div>
    </nav>
    <p class="product-wing-badge"><a target="_blank" rel="noopener noreferrer" href="https://productwing.com/product/chatreconstruct"><img src="https://productwing.com/assets/images/badge.png" alt="Product Wing" height="54" loading="lazy" /></a><a target="_blank" rel="noopener noreferrer" href="https://submitmysaas.com"><img src="https://submitmysaas.com/featured-badge.png" alt="Featured on SubmitMySaas" height="54" loading="lazy" /></a></p>
  </div></main>`
}

function videosHubBody(): string {
  const cards = GUIDE_VIDEO_CLIPS.map(
    (clip) =>
      `<li class="video-watch-hub__item"><a class="video-watch-hub__card" href="${escHtml(clip.path)}"><img class="video-watch-hub__thumb" src="${escHtml(clip.poster)}" alt="" width="480" height="270" loading="lazy" decoding="async" /><span class="video-watch-hub__card-title">${escHtml(clip.title)}</span><span class="video-watch-hub__card-desc">${escHtml(clip.lead)}</span></a></li>`,
  ).join('')
  return wrapSupportPage(
    `${breadcrumb([{ label: 'Home', href: '/' }, { label: 'Videos' }])}
    <h1 class="support-page__title">Workflow videos</h1>
    <p class="support-page__lead">${escHtml(SEO_VIDEOS_DESCRIPTION)}</p>
    <ul class="video-watch-hub__list">${cards}</ul>
    <p class="support-page__note">Prefer written steps? Open the <a href="/how-to">how-to guide</a>.</p>`,
    '/how-to',
    'How to use Translate Chat',
    'video-watch-hub',
  )
}

function videoWatchBody(clip: (typeof GUIDE_VIDEO_CLIPS)[number]): string {
  const others = GUIDE_VIDEO_CLIPS.filter((entry) => entry.path !== clip.path)
    .map((entry) => `<li><a href="${escHtml(entry.path)}">${escHtml(entry.title)}</a></li>`)
    .join('')
  return wrapSupportPage(
    `${breadcrumb([
      { label: 'Home', href: '/' },
      { label: 'Videos', href: VIDEOS_HUB_PATH },
      { label: clip.title },
    ])}
    <h1 class="support-page__title video-watch__title">${escHtml(clip.title)}</h1>
    <div class="video-watch__player-wrap"><video class="video-watch__player" src="${escHtml(clip.src)}" poster="${escHtml(clip.poster)}" controls playsinline preload="metadata" width="960" height="540">Your browser does not support this video.</video></div>
    <p class="support-page__lead video-watch__lead">${escHtml(clip.lead)}</p>
    <p class="support-page__note">This clip is step “${escHtml(clip.stepTitle)}” in the translator. See the <a href="/how-to">written how-to</a> for the full sequence.</p>
    <nav class="video-watch__related" aria-label="Other workflow videos"><h2 class="intent-landing__h2">Other clips</h2><ul class="video-watch__related-list">${others}</ul></nav>`,
    VIDEOS_HUB_PATH,
    'All workflow videos',
    'video-watch',
  )
}

export const PRERENDER_ROUTES: readonly PrerenderRoute[] = [
  {
    pathNorm: '/',
    intent: null,
    seo: HOME_DOCUMENT_SEO,
    bodyHtml: homeBody(),
  },
  {
    pathNorm: '/contact',
    intent: null,
    seo: CONTACT_DOCUMENT_SEO,
    bodyHtml: contactBody(),
  },
  {
    pathNorm: '/feedback',
    intent: null,
    seo: FEEDBACK_DOCUMENT_SEO,
    bodyHtml: feedbackBody(),
  },
  {
    pathNorm: '/privacy',
    intent: null,
    seo: PRIVACY_DOCUMENT_SEO,
    bodyHtml: privacyBody(),
  },
  {
    pathNorm: '/terms',
    intent: null,
    seo: TERMS_DOCUMENT_SEO,
    bodyHtml: termsBody(),
  },
  {
    pathNorm: '/faq',
    intent: null,
    seo: FAQ_DOCUMENT_SEO,
    bodyHtml: faqBody(),
  },
  {
    pathNorm: '/how-to',
    intent: null,
    seo: HOWTO_DOCUMENT_SEO,
    bodyHtml: howToBody(),
  },
  {
    pathNorm: '/demonstration',
    intent: null,
    seo: DEMONSTRATION_DOCUMENT_SEO,
    bodyHtml: demonstrationBody(),
  },
  {
    pathNorm: USES_HUB_PATH,
    intent: null,
    seo: USES_DOCUMENT_SEO,
    bodyHtml: usesBody(),
  },
  ...INTENT_LANDINGS.map((intent) => ({
    pathNorm: intent.path,
    intent,
    seo: intentDocumentSeo(intent),
    bodyHtml: intentBody(intent),
  })),
  {
    pathNorm: VIDEOS_HUB_PATH,
    intent: null,
    seo: VIDEOS_DOCUMENT_SEO,
    bodyHtml: videosHubBody(),
  },
  ...GUIDE_VIDEO_CLIPS.map((clip) => ({
    pathNorm: clip.path,
    intent: null,
    seo: videoClipDocumentSeo(clip),
    bodyHtml: videoWatchBody(clip),
  })),
]

export const PAY_ROUTE_SEO: DocumentSeo = PAY_DOCUMENT_SEO
