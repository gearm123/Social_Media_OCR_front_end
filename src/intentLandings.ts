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
  /** Whether this landing should be promoted in sitemap.xml. */
  includeInSitemap?: boolean
  /** First paragraph; duplicated in seoDescription. */
  lead: string
  /** Extra paragraphs (optional). */
  more?: string[]
  tips: string[]
  /** Page-specific questions shown on this URL (and FAQ JSON-LD when indexed). */
  faq?: readonly { question: string; answer: string }[]
}

export const USES_HUB_PATH = '/uses'

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
      'Messenger threads often mix reactions, timestamps, and “Seen” labels. Leave those in frame when they help show who replied to whom; the model uses bubble side and sequence more than chrome.',
      'This guide is for Facebook Messenger DMs and group chats — not the Facebook feed. Upload PNG, JPEG, WebP, or BMP captures in the order you scrolled the thread, then run Process on the home page.',
    ],
    tips: [
      'Keep the full width of the thread visible so “sent” vs “received” bubble sides stay obvious.',
      'For long chats, add several screenshots in chronological order.',
      'Avoid tight crops on the outer edge where bubble alignment is judged.',
    ],
    faq: [
      {
        question: 'Does this work with Messenger dark mode?',
        answer:
          'Yes. Dark and light Messenger themes both work. Higher-contrast screenshots usually read small type more reliably.',
      },
      {
        question: 'Can I translate a long Messenger thread?',
        answer:
          'Upload several screenshots in chat order on the home page. The pipeline stitches them into one English conversation image.',
      },
      {
        question: 'Do I need to hide names and photos?',
        answer:
          'No. Names and avatars often help label speakers. Only upload chats you have the right to process — see Privacy.',
      },
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
      'Quoted replies and group sender names are part of WhatsApp’s layout. If a quote carries the meaning, include it in the screenshot rather than cropping to the reply line only.',
      'This page is for WhatsApp (and WhatsApp Business) chat screenshots. Status, Channels, and in-app browsers are out of scope — capture the message list with both bubble sides visible.',
    ],
    tips: [
      'Include quoted replies when they matter — partial crops can hide who said what.',
      'Dark mode and light mode both work; higher contrast screenshots usually OCR better.',
      'If names or avatars help disambiguate speakers, leave them in frame.',
    ],
    faq: [
      {
        question: 'Does group WhatsApp work?',
        answer:
          'Yes, when sender names or avatars stay in the screenshot. Tight crops that drop names make speaker order harder.',
      },
      {
        question: 'What about WhatsApp voice notes?',
        answer:
          'Voice-note rows without visible text will not translate as dialogue. Include the bubbles that contain the words you need.',
      },
      {
        question: 'Can I mix several WhatsApp chats in one run?',
        answer:
          'Keep one conversation per run. Mixing two threads in one batch usually confuses order.',
      },
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
      'LINE is often mixed-script (Japanese, Thai, Korean, English). Capture the full bubble, including stickers beside text, so the translator keeps speaker order.',
      'Use this guide when the chat lives in LINE (Keep, VOOM, and OpenChat chrome can stay in frame). Output is an English chat-style image you download from the home page.',
    ],
    tips: [
      'Capture the bubble text clearly; decorative stickers without text are fine to leave in.',
      'Long threads: upload multiple screenshots in order, like you scroll the chat.',
      'If the date separator or “read” line clarifies order, keep it visible.',
    ],
    faq: [
      {
        question: 'Will LINE stickers be translated?',
        answer:
          'Stickers without text stay as layout. Text inside or beside a sticker is translated with the rest of the bubble.',
      },
      {
        question: 'Does this help with Thai or Japanese LINE chats?',
        answer:
          'Yes. Mixed scripts are expected. For dense Thai, raise difficulty in the app. This page itself is written in English.',
      },
      {
        question: 'Can I screenshot LINE from a computer?',
        answer:
          'Yes, if the bubble layout is still visible. Phone screenshots at native resolution usually read small type better.',
      },
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
      'This page is the English-language guide for Thai-script chats. Use a higher difficulty level in the app when the thread is dense or heavily mixed with English slang.',
      'This site’s menus and this guide are in English. You still upload Thai-script screenshots; the result is an English chat image. A Thai-language version of the website is not offered yet.',
    ],
    tips: [
      'Use the highest resolution export your phone allows — small text benefits from more pixels.',
      'If a message mixes Thai and English, include the whole bubble.',
      'Name the screenshots in scroll order when uploading many at once.',
    ],
    faq: [
      {
        question: 'Is the website in Thai?',
        answer:
          'No. Translate Chat’s pages are in English. You can still upload Thai-script screenshots from LINE, Messenger, WhatsApp, or similar apps.',
      },
      {
        question: 'Which difficulty should I pick for Thai?',
        answer:
          'Use a higher level (2–3) for dense Thai or heavy mixing with English. The in-app hint lists suggested levels by language.',
      },
      {
        question: 'Can the output stay in Thai?',
        answer:
          'The product is built to produce an English conversation image. Set the target language on the home page if you need a different output language.',
      },
    ],
  },
  {
    path: '/translate-instagram-chat-screenshots',
    seoTitle: 'Translate Instagram DM screenshots',
    seoDescription:
      'Translate Instagram Direct Message screenshots into an English chat-style image. Works with typical IG DM bubbles, reactions, and reply threads when the layout is visible.',
    h1: 'Translate Instagram DM screenshots',
    lead: 'Translate Instagram Direct Message screenshots into an English chat-style image. Works with typical IG DM bubbles, reactions, and reply threads when the layout is visible.',
    more: [
      'Instagram DMs often sit under a header with the other person’s name. Keep that header if it helps label speakers in a group or request thread.',
      'Vanishing-mode and emoji reactions are common — include them when they change who responded, but focus on bubbles that contain the text you need translated.',
      'This is for Instagram Direct, not the feed or Reels comments. Capture the DM thread with left/right bubbles visible, then upload on the home page.',
    ],
    tips: [
      'Avoid cropping the left/right margins where bubble alignment shows who sent the message.',
      'For long DMs, upload several screenshots in the order you scrolled.',
      'Higher-resolution captures help tiny IG type and timestamps.',
    ],
    faq: [
      {
        question: 'Do vanishing DMs work?',
        answer:
          'Only if the text is still on screen when you screenshot. Once a message disappears, there is nothing to translate.',
      },
      {
        question: 'What about Instagram group chats?',
        answer:
          'Keep the header and sender labels in frame. Group DMs without names are harder to reconstruct accurately.',
      },
      {
        question: 'Can I translate comment threads?',
        answer:
          'This pipeline is tuned for chat bubbles (DMs), not the public comments UI under a post.',
      },
    ],
  },
  {
    path: '/translate-telegram-chat-screenshots',
    seoTitle: 'Translate Telegram chat screenshots',
    seoDescription:
      'Turn Telegram chat screenshots into a translated English conversation image. Suited to private chats and groups when bubble sides and sender names are visible.',
    h1: 'Translate Telegram chat screenshots',
    lead: 'Turn Telegram chat screenshots into a translated English conversation image. Suited to private chats and groups when bubble sides and sender names are visible.',
    more: [
      'Telegram groups stack sender names above bubbles. Leave names in frame so the reconstructed thread can keep speakers straight.',
      'Replies, forwards, and service messages (“joined the group”) are part of Telegram chrome — include them when they affect reading order.',
      'Use this guide for Telegram private chats and groups. Channels that are one-way announcement feeds are a poor fit unless you only need a few labeled bubbles.',
    ],
    tips: [
      'In groups, keep avatars or names visible when two people send similar-looking bubbles.',
      'Dark theme is fine; sharper text still OCR better than heavy compression.',
      'Upload media-heavy threads in scroll order so voice-note labels stay in sequence.',
    ],
    faq: [
      {
        question: 'Does Telegram desktop capture work?',
        answer:
          'Yes, if bubble sides and names are visible. Native phone resolution still helps tiny type.',
      },
      {
        question: 'What about secret chats?',
        answer:
          'If you can screenshot the bubbles, they can be processed. Do not upload chats you are not allowed to process.',
      },
      {
        question: 'Are forwards translated as new speakers?',
        answer:
          'Forward headers are treated as chrome around the quoted text. Include them when they change who said what.',
      },
    ],
  },
  {
    path: '/translate-imessage-screenshots',
    seoTitle: 'Translate iMessage screenshots to English',
    seoDescription:
      'Translate iMessage and iPhone Messages screenshots into a clean English chat image. Works with blue and green bubbles when both sides of the thread are in frame.',
    h1: 'Translate iMessage screenshots to English',
    lead: 'Translate iMessage and iPhone Messages screenshots into a clean English chat image. Works with blue and green bubbles when both sides of the thread are in frame.',
    more: [
      'Blue vs green bubbles mark iMessage vs SMS. Keep both sides of the thread visible so sent vs received stays obvious after translation.',
      'Tapbacks and “Delivered/Read” sit close to bubbles — leave them in if they disambiguate a short reply.',
      'This guide covers the iPhone Messages app (iMessage and green SMS bubbles). Android RCS screenshots are closer to the generic chat guides.',
    ],
    tips: [
      'Do not crop the status bar if timestamps on the thread matter for order.',
      'Group iMessages: keep participant names or photos visible at the top when you can.',
      'Export at native resolution; small San Francisco text needs pixels.',
    ],
    faq: [
      {
        question: 'Do green SMS bubbles work?',
        answer:
          'Yes. Blue iMessage and green SMS/MMS bubbles are both expected as long as both sides of the thread are in frame.',
      },
      {
        question: 'Can I screenshot from macOS Messages?',
        answer:
          'Yes, if the transcript still looks like a bubble thread. Phone screenshots at native scale are usually sharper.',
      },
      {
        question: 'What about Memoji or effects?',
        answer:
          'Effects without readable text will not become dialogue. Include the bubbles that hold the words you need translated.',
      },
    ],
  },
  {
    path: '/ai-chat-screenshot-translator',
    seoTitle: 'AI chat screenshot translator',
    seoDescription:
      'Use AI to translate chat screenshots into English: upload images, get structured dialogue and a rendered chat image powered by vision models and OCR hints.',
    h1: 'AI chat screenshot translator',
    includeInSitemap: false,
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
  {
    path: '/ai-translate-chat-screenshots',
    seoTitle: 'AI translate chat screenshots',
    seoDescription:
      'Use AI to translate chat screenshots: upload images from messaging apps and get English dialogue in a clean chat-style layout with vision and OCR-backed parsing.',
    h1: 'AI translate chat screenshots',
    includeInSitemap: false,
    lead: 'Use AI to translate chat screenshots: upload images from messaging apps and get English dialogue in a clean chat-style layout with vision and OCR-backed parsing.',
    more: [
      'Built for real threads — timestamps, avatars, and app chrome help the model infer who said what before translation.',
    ],
    tips: [
      'Upload in scroll order when one conversation spans several captures.',
      'Avoid cropping the outer bubble margin; alignment cues matter for left vs right speakers.',
      'Higher-resolution exports usually improve small-text recognition.',
    ],
  },
  {
    path: '/translate-chat-screenshots-with-ai',
    seoTitle: 'Translate chat screenshots with AI',
    seoDescription:
      'Translate chat screenshots with AI: turn phone captures into readable English while preserving bubble order, replies, and typical messenger UI structure.',
    h1: 'Translate chat screenshots with AI',
    includeInSitemap: false,
    lead: 'Translate chat screenshots with AI: turn phone captures into readable English while preserving bubble order, replies, and typical messenger UI structure.',
    more: [
      'The same pipeline powers every guide here — this page focuses on the general “chat + AI translation” workflow.',
    ],
    tips: [
      'If replies are threaded, include the quoted snippet in the screenshot when it carries meaning.',
      'Dark mode and compressed images are OK; sharper text still helps.',
      'After the first result, you can run again with clearer crops if something misread.',
    ],
  },
  {
    path: '/chat-screenshot-ai-translation',
    seoTitle: 'Chat screenshot AI translation',
    seoDescription:
      'Chat screenshot AI translation for busy threads: extract text from UI bubbles, translate with AI, and export a single stitched conversation image you can share.',
    h1: 'Chat screenshot AI translation',
    includeInSitemap: false,
    lead: 'Chat screenshot AI translation for busy threads: extract text from UI bubbles, translate with AI, and export a single stitched conversation image you can share.',
    more: [
      'Suited to DMs and small groups where reading order follows the on-screen stack.',
    ],
    tips: [
      'For group chats, keep sender names or avatars visible when they disambiguate speakers.',
      'Long banners or “pinned” messages can sit above bubbles — include them if they affect context.',
      'Name files with a numeric prefix (01, 02…) when batch-uploading.',
    ],
  },
  {
    path: '/ai-conversation-screenshot-translator',
    seoTitle: 'AI conversation screenshot translator',
    seoDescription:
      'AI conversation screenshot translator: convert back-and-forth chat captures into fluent English while keeping the feel of a natural messaging transcript.',
    h1: 'AI conversation screenshot translator',
    includeInSitemap: false,
    lead: 'AI conversation screenshot translator: convert back-and-forth chat captures into fluent English while keeping the feel of a natural messaging transcript.',
    more: [
      'Helpful when you need the whole exchange, not isolated phrases — the output stays in conversational order.',
    ],
    tips: [
      'Skip heavy zoom; show enough width that both sides of the thread are visible.',
      'If the app shows “edited” or delivery states, leaving them in frame can reduce ambiguity.',
      'Mixing languages in one bubble is fine; capture the full bubble text.',
    ],
  },
  {
    path: '/translate-chat-ui-screenshots-ai',
    seoTitle: 'Translate chat UI screenshots with AI',
    seoDescription:
      'Translate chat UI screenshots with AI: menus, headers, and bubble chrome stay visually familiar while message text is translated for quick reading.',
    h1: 'Translate chat UI screenshots with AI',
    includeInSitemap: false,
    lead: 'Translate chat UI screenshots with AI: menus, headers, and bubble chrome stay visually familiar while message text is translated for quick reading.',
    more: [
      'Useful when you want context from the surrounding interface, not just raw extracted lines.',
    ],
    tips: [
      'Do not crop out the status bar if it anchors time-of-day for the thread.',
      'Keyboard-open screenshots are OK if the message list is still readable.',
      'When in doubt, one wider screenshot beats several ultra-tight crops.',
    ],
  },
]

export const INTENT_BY_PATH: Record<string, IntentLanding> = Object.fromEntries(
  INTENT_LANDINGS.map((entry) => [entry.path, entry]),
)

export function isIntentIndexed(intent: IntentLanding): boolean {
  return intent.includeInSitemap !== false
}
