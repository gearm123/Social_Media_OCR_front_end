/**
 * Intent-based landing pages for SEO. Meta descriptions match the first visible paragraph.
 */

export type IntentLanding = {
  path: string
  /** document.title (include site name in main.tsx) */
  seoTitle: string
  /** Meta description — must equal {@link lead} (single paragraph). */
  seoDescription: string
  h1: string
  /** First paragraph; duplicated in seoDescription. */
  lead: string
  /** Extra paragraphs (optional). */
  more?: string[]
  tips: string[]
}

export const INTENT_LANDINGS: IntentLanding[] = [
  {
    path: '/translate-messenger-screenshots',
    seoTitle: 'Translate Messenger screenshots to English',
    seoDescription:
      'Upload Facebook Messenger screenshots and get a clean English chat image. Works with typical Messenger layouts: left and right bubbles, timestamps, and header chrome.',
    h1: 'Translate Messenger screenshots to English',
    lead: 'Upload Facebook Messenger screenshots and get a clean English chat image. Works with typical Messenger layouts: left and right bubbles, timestamps, and header chrome.',
    more: [
      'Translate Chat reads the conversation structure from your images, then renders a single translated thread you can save or share.',
    ],
    tips: [
      'Keep the full width of the thread visible so “sent” vs “received” bubble sides stay obvious.',
      'For long chats, add several screenshots in chronological order.',
      'Avoid tight crops on the outer edge where bubble alignment is judged.',
    ],
  },
  {
    path: '/translate-whatsapp-screenshots',
    seoTitle: 'Translate WhatsApp chat screenshots',
    seoDescription:
      'Turn WhatsApp conversation screenshots into a translated chat-style image. Suited to standard WhatsApp bubbles, groups, and reply chains when the layout is visible.',
    h1: 'Translate WhatsApp chat screenshots',
    lead: 'Turn WhatsApp conversation screenshots into a translated chat-style image. Suited to standard WhatsApp bubbles, groups, and reply chains when the layout is visible.',
    more: [
      'Upload one or many images from the same conversation; we stitch the flow and output English you can read at a glance.',
    ],
    tips: [
      'Include quoted replies when they matter — partial crops can hide who said what.',
      'Dark mode and light mode both work; higher contrast screenshots usually OCR better.',
      'If names or avatars help disambiguate speakers, leave them in frame.',
    ],
  },
  {
    path: '/translate-line-screenshots',
    seoTitle: 'Translate LINE chat screenshots',
    seoDescription:
      'Convert LINE app screenshots into an English chat image. Helpful for Japanese, Thai, or other LINE-heavy regions where friends and work chats often live on LINE.',
    h1: 'Translate LINE chat screenshots',
    lead: 'Convert LINE app screenshots into an English chat image. Helpful for Japanese, Thai, or other LINE-heavy regions where friends and work chats often live on LINE.',
    more: [
      'Stickers and system banners are common on LINE — include enough context around text bubbles for best results.',
    ],
    tips: [
      'Capture the bubble text clearly; decorative stickers without text are fine to leave in.',
      'Long threads: upload multiple screenshots in order, like you scroll the chat.',
      'If the date separator or “read” line clarifies order, keep it visible.',
    ],
  },
  {
    path: '/translate-thai-chat-screenshots',
    seoTitle: 'Translate Thai chat screenshots to English',
    seoDescription:
      'Translate Thai-language chat screenshots from LINE, Messenger, WhatsApp, or similar apps into clear English in a chat-style layout.',
    h1: 'Translate Thai chat screenshots to English',
    lead: 'Translate Thai-language chat screenshots from LINE, Messenger, WhatsApp, or similar apps into clear English in a chat-style layout.',
    more: [
      'Thai script and mixed Thai–English messages are fine; the pipeline is built for messy real screenshots, not perfect crops.',
    ],
    tips: [
      'Use the highest resolution export your phone allows — small text benefits from more pixels.',
      'If a message mixes Thai and English, include the whole bubble.',
      'Name the screenshots in scroll order when uploading many at once.',
    ],
  },
  {
    path: '/ai-chat-screenshot-translator',
    seoTitle: 'AI chat screenshot translator',
    seoDescription:
      'Use AI to translate chat screenshots into English: upload images, get structured dialogue and a rendered chat image powered by vision models and OCR hints.',
    h1: 'AI chat screenshot translator',
    lead: 'Use AI to translate chat screenshots into English: upload images, get structured dialogue and a rendered chat image powered by vision models and OCR hints.',
    more: [
      'Built for real screenshots — glare, compression, and UI chrome — not just clean mockups.',
    ],
    tips: [
      'Works across common chat apps; pick the guide for your app from the links below if you want tailored tips.',
      'You can start on the home page with no account for light use; sign in when you need more runs or billing.',
      'Feedback welcome if a layout misparses — it helps improve the model prompts.',
    ],
  },
]

export const INTENT_BY_PATH: Record<string, IntentLanding> = Object.fromEntries(
  INTENT_LANDINGS.map((entry) => [entry.path, entry]),
)

export const USES_HUB_PATH = '/uses'
