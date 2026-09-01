/**
 * Informational articles (blog + comparisons). Commercial intent stays on INTENT_LANDINGS.
 */

export type ArticleCta = {
  href: string
  label: string
  text?: string
}

export type ArticleBlock =
  | {
      type: 'prose'
      heading: string
      paragraphs: string[]
      bullets?: string[]
    }
  | {
      type: 'table'
      heading?: string
      caption: string
      headers: readonly string[]
      rows: readonly (readonly string[])[]
    }
  | {
      type: 'callout'
      href: string
      label: string
      text?: string
    }

export type SeoArticle = {
  path: string
  seoTitle: string
  seoDescription: string
  h1: string
  lead: string
  datePublished: string
  kind: 'blog' | 'comparison'
  blocks: readonly ArticleBlock[]
  cta: ArticleCta
  related: readonly { path: string; label: string }[]
}

export const BLOG_HUB_PATH = '/blog'

export const SEO_ARTICLES: SeoArticle[] = [
  {
    path: '/blog/how-to-translate-multiple-chat-screenshots',
    seoTitle: 'How to Translate Multiple Chat Screenshots Without Losing Context',
    seoDescription:
      'How to translate multiple chat screenshots without losing context: why one-by-one translation breaks threads, how to order captures, and a conversation-aware workflow.',
    h1: 'How to Translate Multiple Chat Screenshots Without Losing Context',
    lead: 'How to translate multiple chat screenshots without losing context: why one-by-one translation breaks threads, how to order captures, and a conversation-aware workflow.',
    datePublished: '2026-09-01',
    kind: 'blog',
    cta: {
      href: '/translate-multiple-chat-screenshots',
      label: 'Translate multiple chat screenshots at once',
      text: 'Commercial guide for the same-conversation upload — start there when you are ready to run the tool.',
    },
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'the multiple-screenshot translator' },
      { path: '/batch-screenshot-translator', label: 'bulk upload of several images' },
      { path: '/translate-chat-screenshots-with-context', label: 'why surrounding lines matter' },
      { path: '/how-to', label: 'product how-to steps' },
    ],
    blocks: [
      {
        type: 'callout',
        href: '/translate-multiple-chat-screenshots',
        label: 'Open the multiple-screenshot translator guide',
        text: 'That page is the tool landing. This article is the how-to: what goes wrong and how to capture a thread.',
      },
      {
        type: 'prose',
        heading: 'What goes wrong if you translate each screenshot alone',
        paragraphs: [
          'Most screenshot translators treat every photo as a new document. That is reasonable for a sign or a slide. It is a poor fit for a chat that you captured as you scrolled. A reply on image 4 often depends on a name, a joke, or a “that one” on image 1. Translate those files independently and you get fluent English that no longer reads as one conversation.',
          'The usual failure is not missing a dictionary entry. It is missing conversational glue: who is speaking, what the previous bubble established, and whether a short line is an answer or a new topic.',
        ],
        bullets: [
          'Pronouns (“he”, “that”, “มัน”) attach to the wrong person or become generic “it.”',
          'Slang and abbreviations look random without the setup line above them.',
          'Quoted replies lose the quoted text if you cropped to the newest bubble.',
          'You spend time stitching English paragraphs by hand in the same order you already scrolled.',
        ],
      },
      {
        type: 'prose',
        heading: 'Chronological order is the capture',
        paragraphs: [
          'Start at a date separator or a clear topic change. Screenshot as you scroll in one direction. Put the earliest frame first in the upload list and the newest last. If the phone reorders files by name, prefix them 01, 02, 03.',
          'A little overlap between frames helps: a bubble that is cut at the bottom of one screenshot can reappear complete at the top of the next. Overlap is cheaper than guessing what was said in the gap.',
        ],
      },
      {
        type: 'prose',
        heading: 'Duplicate and overlapping messages',
        paragraphs: [
          'When two screenshots share a few of the same bubbles, that is usually good for reconstruction — the duplicate is a stitch point, not waste. Problems start when you capture the same stretch twice after scrolling back, or mix a crop with a full-width shot of the same lines.',
          'If you notice a repeat, drop the worse crop (the one that cuts a bubble or hides a name) and keep the clearer frame. Do not delete overlap that is only one or two messages; keep it when it preserves speaker sides.',
        ],
      },
      {
        type: 'prose',
        heading: 'Missing pronouns, slang, and short replies',
        paragraphs: [
          'Chat language drops subjects. Thai, Japanese, and casual English all do this. A translator that only sees “ไปแล้ว” or “lol ok” has to invent a subject. Surrounding bubbles — who asked, what was offered — are what make a context-aware reading possible.',
          'Include the boring setup messages, not only the punchline. Keep quoted replies and reply-chains in frame. In groups, keep sender names; otherwise every short line looks like the same speaker.',
        ],
      },
      {
        type: 'prose',
        heading: 'Long conversations',
        paragraphs: [
          'You do not have to screenshot from the first message ever sent. Cover the stretch you need in English — a decision, a plan, an argument — continuously, without skipping screens of the thread. If the history is huge, split by topic into two jobs rather than mixing unrelated weeks.',
          'Voice notes and stickers without text will not become dialogue. Capture the bubbles that hold the words.',
        ],
      },
      {
        type: 'prose',
        heading: 'One possible workflow: ChatReconstruct',
        paragraphs: [
          'ChatReconstruct is built for this pattern: several screenshots of the same conversation, reconstructed in order, then translated into one English chat-style image. It is not the only way to work (you can still paste lines into a general translator), but it avoids treating a thread as a stack of unrelated photos.',
          'On the home page, upload in scroll order, optionally add bubble-count guidance when speakers are unclear, then Process. If you were comparing bulk tools that OCR a folder of independent images, that is a different intent — see the batch screenshot translator page. If you already know the job is one split conversation, use the multiple-screenshot landing next.',
        ],
      },
    ],
  },
  {
    path: '/blog/how-to-translate-an-entire-whatsapp-conversation',
    seoTitle: 'How to Translate an Entire WhatsApp Conversation',
    seoDescription:
      'How to translate an entire WhatsApp conversation to English from screenshots: capturing a full thread, keeping quotes and names, and when to use a chat-specific translator.',
    h1: 'How to Translate an Entire WhatsApp Conversation',
    lead: 'How to translate an entire WhatsApp conversation to English from screenshots: capturing a full thread, keeping quotes and names, and when to use a chat-specific translator.',
    datePublished: '2026-09-01',
    kind: 'blog',
    cta: {
      href: '/translate-whatsapp-screenshots',
      label: 'Translate WhatsApp chat screenshots',
      text: 'That guide is the commercial WhatsApp landing (bubbles, groups, quotes). This article is the how-to for a full thread.',
    },
    related: [
      { path: '/translate-whatsapp-screenshots', label: 'WhatsApp screenshot translator (tool page)' },
      { path: '/translate-entire-chat-conversation', label: 'any messenger, full stretch of chat' },
      { path: '/ocr-whatsapp-screenshots', label: 'reading WhatsApp pixels first' },
      { path: '/blog/how-to-translate-multiple-chat-screenshots', label: 'several screenshots without losing the thread' },
    ],
    blocks: [
      {
        type: 'callout',
        href: '/translate-whatsapp-screenshots',
        label: 'Go to the WhatsApp screenshot translator',
        text: 'Use that page when you want the tool. Stay here for capture steps to translate a full WhatsApp chat.',
      },
      {
        type: 'prose',
        heading: 'Translate a whole WhatsApp conversation without a .txt export',
        paragraphs: [
          'WhatsApp can export a chat as a text file. That is useful for archives; it is not what this walkthrough uses. Here, “translate full WhatsApp chat” means screenshots of the message list — the same green and gray bubbles you already read — uploaded in order so English keeps who said what.',
          'People search this because a long 1:1 or group thread does not fit on one screen. Translating only the last screenshot hides why a one-word reply landed. To translate a whole WhatsApp conversation, you capture continuously through the stretch you care about.',
        ],
      },
      {
        type: 'prose',
        heading: 'What “entire” should mean',
        paragraphs: [
          'Entire does not have to mean every message since 2019. Pick a starting point: a date line, a new topic, or the first message of a trip plan. Screenshot downward (or upward, but stay consistent) until that topic ends. Skipping a page of bubbles is how speakers and quotes fall out of the English result.',
          'Keep one conversation per job. A second WhatsApp chat is a second run. Mixing family and work threads in one batch is the usual way a “translate WhatsApp chat to English” attempt turns into soup.',
        ],
      },
      {
        type: 'prose',
        heading: 'WhatsApp-specific capture habits',
        paragraphs: [
          'Quoted replies are smaller and lighter than the response. If the quote is the meaning, leave it in frame. Group sender names sit above bubbles — cropping them makes two people look like one. Ticks and timestamps are chrome; they can stay, but they should not replace the bubble text.',
          'Prefer the original screenshot over a recompressed share. WhatsApp often crushes JPEGs when you forward the image to yourself. Dark and light themes both work; contrast still helps small type.',
        ],
      },
      {
        type: 'prose',
        heading: 'Voice notes, Status, and Channels',
        paragraphs: [
          'A duration label on a voice note is not dialogue. Include neighboring text bubbles so order stays clear. Status, Channels, and in-app browsers are not the message list — this how-to is for the chat UI you scroll in a DM or group.',
        ],
      },
      {
        type: 'prose',
        heading: 'Where the translator lives on this site',
        paragraphs: [
          'The WhatsApp landing page is for people ready to upload: layout tips, groups, quotes. This article does not try to rank for that commercial query. When the screenshots are in order, open that guide or the home page and run Process. If the thread is long in any messenger, not only WhatsApp, the entire-conversation landing is the app-agnostic version of the same idea.',
        ],
      },
    ],
  },
  {
    path: '/blog/how-to-translate-thai-line-messages-to-english',
    seoTitle: 'How to Translate Thai LINE Messages to English',
    seoDescription:
      'How to translate Thai LINE messages to English: informal Thai, dropped subjects, mixed Thai–English slang, and why conversational context beats line-by-line LINE translation.',
    h1: 'How to Translate Thai LINE Messages to English',
    lead: 'How to translate Thai LINE messages to English: informal Thai, dropped subjects, mixed Thai–English slang, and why conversational context beats line-by-line LINE translation.',
    datePublished: '2026-09-01',
    kind: 'blog',
    cta: {
      href: '/translate-thai-chat-screenshots',
      label: 'Translate Thai chat screenshots to English',
      text: 'Language-focused commercial guide. For LINE chrome and stickers, use the LINE screenshot guide as well.',
    },
    related: [
      { path: '/translate-thai-chat-screenshots', label: 'Thai-script chats in any app' },
      { path: '/translate-line-screenshots', label: 'LINE layout and stickers' },
      { path: '/ocr-thai-chat-screenshots', label: 'reading Thai glyphs off the screenshot' },
      { path: '/translate-chat-screenshots-with-context', label: 'dropped subjects and slang in context' },
    ],
    blocks: [
      {
        type: 'callout',
        href: '/translate-thai-chat-screenshots',
        label: 'Thai chat screenshots guide',
        text: 'Start here for Thai-script threads (LINE, Messenger, WhatsApp).',
      },
      {
        type: 'callout',
        href: '/translate-line-screenshots',
        label: 'LINE chat screenshots guide',
        text: 'Start here for LINE layout: stickers, Keep, mixed-script bubbles.',
      },
      {
        type: 'prose',
        heading: 'Why a Thai LINE translator is not the same as a sentence box',
        paragraphs: [
          'LINE is where a lot of Thai friends and work chat actually lives. Searches like “Thai LINE translator” and “translate LINE Thai to English” often assume you can paste one polished sentence. Real LINE messages are short, stacked, and informal: particles, abbreviations, English brand names inside Thai script, stickers next to three characters of text.',
          'A box that translates “ไปยัง” in isolation has to guess. In a thread it might be “on the way,” “already left,” or a joke repeating the last offer. Conversational context — the bubbles before and after, who is on the left — is what makes translate-Thai-chat-to-English usable.',
        ],
      },
      {
        type: 'prose',
        heading: 'Informal Thai, abbreviations, and missing subjects',
        paragraphs: [
          'Spoken Thai drops subjects constantly. Chat doubles down: no polite particles, romanized slang, number jokes, and clipped verbs. Abbreviations and keyboard shortcuts that friends share will look like OCR noise to a document translator. Keep the full bubble, including vowels and tone marks at the top and bottom of the line — those marks are easy to crop off on a phone screenshot.',
          'If a message mixes Thai and English in one bubble (a common LINE habit), do not crop to the Thai half. The English half is often the object or the punchline.',
        ],
      },
      {
        type: 'prose',
        heading: 'Stickers, date lines, and mixed screens',
        paragraphs: [
          'Stickers without letters stay as layout. Text on or beside a sticker can still matter. Date separators help order a long Thai LINE thread; leave them in if you are covering more than one day. Capture the message list, not VOOM or an in-app browser.',
        ],
      },
      {
        type: 'prose',
        heading: 'Practical capture for Thai LINE',
        paragraphs: [
          'Use the highest resolution export you can. Stacked Thai vowels need pixels. Upload several screenshots in scroll order when the conversation is longer than one screen — that is how surrounding context reaches the translator. Raise difficulty in the app (level 2–3) when the thread is dense or heavily mixed with English slang.',
          'This site’s menus are in English; you still upload Thai-script LINE screenshots. For OCR-focused reading of Thai glyphs, there is a separate Thai OCR guide. For the translator itself, use the two landings linked above, then Process on the home page.',
        ],
      },
    ],
  },
  {
    path: '/google-translate-chat-screenshots',
    seoTitle: 'Google Translate for Chat Screenshots: When Context Gets Lost',
    seoDescription:
      'Google Translate is strong on individual words and straightforward screenshots. Chat screenshots that span several images lose ordering and surrounding context unless the thread is reconstructed first.',
    h1: 'Google Translate for Chat Screenshots: When Context Gets Lost',
    lead: 'Google Translate is strong on individual words and straightforward screenshots. Chat screenshots that span several images lose ordering and surrounding context unless the thread is reconstructed first.',
    datePublished: '2026-09-01',
    kind: 'comparison',
    cta: {
      href: '/translate-multiple-chat-screenshots',
      label: 'Translate multiple chat screenshots',
      text: 'If the job is one conversation across captures, that guide matches the workflow. Google Translate remains a good choice for isolated text.',
    },
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'one conversation across several captures' },
      { path: '/chat-screenshot-translator', label: 'chat screenshot translator' },
      { path: '/translate-chat-screenshots-with-context', label: 'when short replies need the lines above them' },
      { path: '/blog/how-to-translate-multiple-chat-screenshots', label: 'how-to for split threads' },
    ],
    blocks: [
      {
        type: 'prose',
        heading: 'Two different jobs that share the word “translate”',
        paragraphs: [
          'Google Translate (app, Lens, and the website) is excellent at turning a highlighted sentence or a clean photo of a paragraph into another language. That includes many “Google Translate screenshot conversation” attempts: you point the camera at one bubble, or you paste one line, and you get a usable gloss.',
          'ChatReconstruct is not a replacement for that. It is built for a narrower job: conversation screenshots — often several — where bubble sides, order, and neighboring messages change the meaning. Claiming it is always better would be false. For a menu, a sign, or a single clear sentence, Google Translate is usually the faster, more appropriate tool.',
        ],
      },
      {
        type: 'table',
        heading: 'Where each tool tends to fit',
        caption: 'Balanced comparison: Google Translate vs ChatReconstruct for screenshots. Neither column is “always better.”',
        headers: ['Situation', 'Google Translate', 'ChatReconstruct'],
        rows: [
          [
            'A word, phrase, or short isolated sentence',
            'Strong default — type, tap, or Lens',
            'Unnecessary; use Google Translate',
          ],
          [
            'One straightforward screenshot of a paragraph or sign',
            'Strong — photo / Lens translation',
            'Not designed for documents or street text',
          ],
          [
            'One chat screenshot with both bubble sides visible',
            'Can read the text; speakers and reply structure are easy to lose',
            'Reads bubbles as a thread and outputs a chat-style English image',
          ],
          [
            'Google Translate multiple screenshots / a long thread',
            'Each image (or each tap) is a separate job; you reassemble English yourself',
            'Upload the set in order; reconstructs chronological context, then translates',
          ],
          [
            'Slang, dropped subjects, short replies',
            'Best when you already know the previous line',
            'Uses surrounding bubbles when they are in the reconstructed thread',
          ],
          [
            'Output you want',
            'Text you can copy',
            'A reconstructed conversation image you can save or share',
          ],
        ],
      },
      {
        type: 'prose',
        heading: 'When context gets lost in Google Translate',
        paragraphs: [
          'Lens and screenshot translation see pixels in one frame. They do not, by themselves, know that yesterday’s screenshot is the setup for today’s. “Google Translate chat screenshots” of a long DM therefore often produce a stack of good sentences with the wrong “he,” a missed quote, or a joke that no longer lands.',
          'That is not a knock on the quality of Google’s sentence translation. It is a limit of treating a conversation as a sequence of independent photos. If you only need one bubble, stay in Google Translate. If you need the thread, you need ordering plus neighbors — ChatReconstruct’s scope — or a careful human who still has the original chat open.',
        ],
      },
      {
        type: 'prose',
        heading: 'A practical split',
        paragraphs: [
          'Use Google Translate for look-ups, signs, homework sentences, and any screenshot that is not a message list. Use a chat-specific workflow when the screenshot is Messenger, WhatsApp, LINE, or similar and especially when you have Google Translate multiple screenshots of the same conversation.',
          'ChatReconstruct will still be wrong sometimes: glare, tiny type, heavy slang, or a bad crop will break any pipeline. It is not universally more accurate than Google Translate on a single clean sentence. It is specialized for conversations spread across captures, where context is the product, not a nice extra.',
        ],
      },
    ],
  },
]

export const ARTICLE_BY_PATH: Record<string, SeoArticle> = Object.fromEntries(
  SEO_ARTICLES.map((entry) => [entry.path, entry]),
)

export const BLOG_ARTICLES = SEO_ARTICLES.filter((entry) => entry.kind === 'blog')
export const COMPARISON_ARTICLES = SEO_ARTICLES.filter((entry) => entry.kind === 'comparison')
