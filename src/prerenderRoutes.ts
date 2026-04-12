import { INTENT_LANDINGS, USES_HUB_PATH, type IntentLanding } from './intentLandings'
import {
  SEO_CONTACT_DESCRIPTION,
  SEO_DEMONSTRATION_DESCRIPTION,
  SEO_FAQ_DESCRIPTION,
  SEO_FAQ_ITEMS,
  SEO_FEEDBACK_DESCRIPTION,
  SEO_HOWTO_DESCRIPTION,
  SEO_HOWTO_STEPS,
  SEO_HOME_DESCRIPTION,
  SEO_SITE_NAME,
} from './seoContent'
import { SUPPORT_EMAIL } from './supportEmail'
import type { DocumentSeo } from './seoRoutes'

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

function wrapSupportPage(content: string, backHref = '/', backLabel = 'Back to Translate Chat'): string {
  return `<div class="support-page"><header class="support-page__header"><a class="support-page__back" href="${backHref}">${escHtml(backLabel)}</a></header><main class="support-page__main">${content}</main></div>`
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
    <p class="support-page__lead">${escHtml(SEO_FAQ_DESCRIPTION)}</p>
    <section class="seo-home-faq seo-home-faq--page" aria-label="Frequently asked questions">
      <dl class="seo-home-faq__list">${items}</dl>
      <p class="seo-home-faq__more"><a href="${USES_HUB_PATH}">More guides by app and language →</a></p>
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
    <p class="support-page__lead">${escHtml(SEO_HOWTO_DESCRIPTION)}</p>
    <ol class="howto-page__steps">${steps}</ol>
    <p class="support-page__note"><a href="${USES_HUB_PATH}">App-specific tips (Messenger, WhatsApp, LINE, Thai, …) →</a> · <a href="/faq">FAQ →</a></p>`,
  )
}

function demonstrationBody(): string {
  return wrapSupportPage(
    `${breadcrumb([{ label: 'Home', href: '/' }, { label: 'Demonstration' }])}
    <h1 class="support-page__title">Demonstration</h1>
    <p class="support-page__lead demonstration-page__lead">${escHtml(SEO_DEMONSTRATION_DESCRIPTION)}</p>
    <div class="guide-page__body guide-page__body--demonstration">
      <div class="demonstration-page__visual">
        <img
          class="demonstration-page__media"
          src="/demonstration-chat-reconstruction.gif"
          alt="Before and after: cracked phone screens with reconstructed chat bubbles overlaid for legibility"
          width="3924"
          height="1744"
          loading="eager"
          decoding="async"
        />
      </div>
      <p class="demonstration-page__cta"><a class="support-page__mailto" href="/">Open the translator</a></p>
    </div>`,
  )
}

function usesBody(): string {
  const links = INTENT_LANDINGS.map(
    (entry) => `<li><a href="${entry.path}">${escHtml(entry.h1)}</a></li>`,
  ).join('')
  return wrapSupportPage(
    `${breadcrumb([{ label: 'Home', href: '/' }, { label: 'Translation guides' }])}
    <h1 class="support-page__title">Translation guides</h1>
    <p class="support-page__lead">Short guides for common search intents — same tool on the home page, with tips tailored to each chat app or language.</p>
    <ul class="intent-landing__hub-list">${links}</ul>
    <p class="intent-landing__cta-wrap"><a class="support-page__mailto intent-landing__cta" href="/">Open the translator</a></p>`,
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
    <h2 class="intent-landing__h2">Tips for better results</h2>
    <ul class="intent-landing__tips">${tips}</ul>
    <p class="intent-landing__cta-wrap"><a class="support-page__mailto intent-landing__cta" href="/">Start translating — upload screenshots</a></p>
    <nav class="intent-landing__related" aria-label="Other guides">
      <h2 class="intent-landing__h2">Other guides</h2>
      <ul class="intent-landing__related-list">${others}<li><a href="${USES_HUB_PATH}">All guides on one page</a></li></ul>
    </nav>`,
    USES_HUB_PATH,
    'All translation guides',
  )
}

export const PRERENDER_ROUTES: readonly PrerenderRoute[] = [
  {
    pathNorm: '/contact',
    intent: null,
    seo: {
      title: `Contact us · ${SEO_SITE_NAME}`,
      description: SEO_CONTACT_DESCRIPTION,
      path: '/contact',
    },
    bodyHtml: contactBody(),
  },
  {
    pathNorm: '/feedback',
    intent: null,
    seo: {
      title: `Feedback · ${SEO_SITE_NAME}`,
      description: SEO_FEEDBACK_DESCRIPTION,
      path: '/feedback',
    },
    bodyHtml: feedbackBody(),
  },
  {
    pathNorm: '/faq',
    intent: null,
    seo: {
      title: `FAQ · ${SEO_SITE_NAME}`,
      description: SEO_FAQ_DESCRIPTION,
      path: '/faq',
    },
    bodyHtml: faqBody(),
  },
  {
    pathNorm: '/how-to',
    intent: null,
    seo: {
      title: `How to · ${SEO_SITE_NAME}`,
      description: SEO_HOWTO_DESCRIPTION,
      path: '/how-to',
    },
    bodyHtml: howToBody(),
  },
  {
    pathNorm: '/demonstration',
    intent: null,
    seo: {
      title: `Demonstration · ${SEO_SITE_NAME}`,
      description: SEO_DEMONSTRATION_DESCRIPTION,
      path: '/demonstration',
    },
    bodyHtml: demonstrationBody(),
  },
  {
    pathNorm: USES_HUB_PATH,
    intent: null,
    seo: {
      title: `Translation guides · ${SEO_SITE_NAME}`,
      description:
        'Short guides for common search intents — same tool on the home page, with tips tailored to each chat app or language.',
      path: USES_HUB_PATH,
    },
    bodyHtml: usesBody(),
  },
  ...INTENT_LANDINGS.map((intent) => ({
    pathNorm: intent.path,
    intent,
    seo: {
      title: `${intent.seoTitle} · ${SEO_SITE_NAME}`,
      description: intent.seoDescription,
      path: intent.path,
    },
    bodyHtml: intentBody(intent),
  })),
]

export const PAY_ROUTE_SEO: DocumentSeo = {
  title: `Checkout · ${SEO_SITE_NAME}`,
  description: SEO_HOME_DESCRIPTION,
  path: '/pay',
  robots: 'noindex, nofollow',
}
