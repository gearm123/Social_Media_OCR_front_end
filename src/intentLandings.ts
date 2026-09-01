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
  /** Page-specific questions shown on this URL (and FAQ JSON-LD). */
  faq?: readonly { question: string; answer: string }[]
  /** In-content links shown as “Related translation guides” (varied anchors). */
  related?: readonly { path: string; label: string }[]
  /** Short numbered steps unique to this intent. */
  workflow?: readonly string[]
}

export const USES_HUB_PATH = '/uses'

export const INTENT_LANDINGS: IntentLanding[] = [
  {
    path: '/chat-screenshot-translator',
    seoTitle: 'Chat Screenshot Translator',
    seoDescription:
      'A chat screenshot translator for message bubbles: upload conversation images and get a reconstructed English chat, not a generic photo translation of whatever is on screen.',
    h1: 'Chat Screenshot Translator',
    lead: 'A chat screenshot translator for message bubbles: upload conversation images and get a reconstructed English chat, not a generic photo translation of whatever is on screen.',
    more: [
      'People searching for a conversation screenshot translator usually already have a Messenger, WhatsApp, LINE, Instagram, Telegram, or iMessage thread on their camera roll. The home page is the product itself — upload, Process, download. This page is the deeper tool guide: what the chat image translator actually does, when it beats a generic screenshot translator, and how to feed it a real conversation.',
      'A message screenshot translator has to solve layout, not only letters. Sent vs received sides, group sender names, quoted replies, timestamps, and short “ok” / “lol” lines only make sense if the pipeline keeps speakers and order. ChatReconstruct reads those cues, optionally takes bubble-count guidance, then renders one English conversation image.',
      'Example: a LINE group where three people reply “ok” to different questions. A generic screenshot translator gives you three “OK”s. A chat screenshot translator keeps who answered whom so the English thread is usable.',
      'Use it when you need to translate a chat screenshot for family, travel, or work and you care who said what. A flyer, a restaurant menu, or a PDF scan is a different job — those belong in a document OCR tool. If your photos are several frames of the same thread, upload them together so they reconstruct as one conversation instead of five separate translations.',
      'Features that matter for this query: multi-image upload in scroll order, optional sender/receiver sequence, difficulty for dense or mixed scripts, and a downloadable chat-style result. App-specific capture tips live on the Messenger, WhatsApp, LINE, Instagram, Telegram, and iMessage guides; this page stays on the product pattern, not one app’s chrome.',
    ],
    tips: [
      'Upload every screenshot from the same conversation in the order you scrolled — do not mix two chats in one run.',
      'Leave both bubble sides in frame so the translator can tell sent from received.',
      'Open Add guidance when speaker order is ambiguous; bubble counts are optional but help messy group threads.',
      'Use a higher difficulty level for dense scripts or heavy slang; level 1 is enough for short Latin chats.',
    ],
    faq: [
      {
        question: 'How is this different from the Translate Chat home page?',
        answer:
          'Home is the translator UI: choose images and run Process. This page targets the search “chat screenshot translator” and explains features and use cases. Same tool; this URL is the commercial guide, not a second product.',
      },
      {
        question: 'Is a chat image translator the same as translating any photo?',
        answer:
          'No. Generic image translators dump text from a picture. A chat screenshot translator has to keep bubble sides, speakers, and order, then output a conversation you can read.',
      },
      {
        question: 'Can I translate a chat screenshot from any messaging app?',
        answer:
          'Layouts the pipeline is tuned for include Messenger, WhatsApp, LINE, Instagram DMs, Telegram, and iMessage. Unusual UIs still work when left/right bubbles are visible. See the app guides for capture tips.',
      },
      {
        question: 'Do I translate one screenshot or several?',
        answer:
          'Either. One image is enough for a short exchange. For a longer thread, add every capture in chat order so the result is one conversation, not disconnected translations.',
      },
    ],
    workflow: [
      'Upload the chat screenshot (or several from the same thread, in order).',
      'Optionally add bubble counts and sender/receiver if the crop is messy.',
      'Set difficulty if the script is dense, then Process.',
      'Download the reconstructed English conversation image.',
    ],
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'stitch several captures of the same thread' },
      { path: '/translate-entire-chat-conversation', label: 'translate an entire conversation' },
      { path: '/translate-chat-screenshots-with-context', label: 'translate screenshots with context' },
      { path: '/translate-screenshot-to-english', label: 'broader screenshot-to-English searches' },
    ],
  },
  {
    path: '/translate-screenshot-to-english',
    seoTitle: 'Translate a Screenshot to English',
    seoDescription:
      'Translate a screenshot to English in the browser. When the image is a chat — Messenger, WhatsApp, LINE, or similar — ChatReconstruct reads bubbles and speakers, not just a block of OCR text.',
    h1: 'Translate a Screenshot to English',
    lead: 'Translate a screenshot to English in the browser. When the image is a chat — Messenger, WhatsApp, LINE, or similar — ChatReconstruct reads bubbles and speakers, not just a block of OCR text.',
    more: [
      '“Translate screenshot to English” and “screenshot translator to English” are crowded queries. Most results are generic image translators: they OCR a photo and paste a paragraph. That is fine for a street sign. It is a poor fit for a chat screenshot, where meaning lives in who spoke, what they replied to, and the two or three lines above the joke.',
      'ChatReconstruct is a screenshot translator to English specialized for conversations. It looks at bubble sides, timestamps, and names, then writes an English chat-style image. If you came here to translate text in a screenshot to English and that screenshot is a DM or group thread, you want reconstruction — not a wall of unsorted lines.',
      'Example: a single Messenger screenshot of a two-person argument. Upload it, Process, and get an English chat image with sent vs received sides intact — unlike Lens, which would give you a stack of unsorted lines.',
      'If the screenshot is not a chat (a document, a slide, a product label), a general translate-image-screenshot-to-English tool or your phone’s live text will be closer to the job. This site does not claim to be the best menu translator. It claims to be better than those tools when the pixels are message bubbles.',
      'You can translate a screenshot online here with no desktop install: PNG, JPEG, WebP, or BMP, then Process. One image is enough for a short exchange. Several frames of the same thread should go in together so English output keeps chronological context. For extract-text-only wording, the OCR chat screenshots guide goes deeper on recognition; this page stays on “screenshot → English,” with chat reconstruction as the difference.',
    ],
    tips: [
      'If the photo is a messaging app, capture the full thread width — bubble alignment is how speakers are inferred.',
      'Native resolution beats a recompressed share; tiny type is what generic screenshot translators drop first.',
      'Do not expect a reconstructed chat from a restaurant menu or a PDF page; those are not conversation layouts.',
      'Several screenshots of one conversation belong in one run, in scroll order, on the home page.',
    ],
    faq: [
      {
        question: 'Can I translate a screenshot to English without installing an app?',
        answer:
          'Yes. Open Translate Chat in the browser, upload the image, and run Process. The result is a downloadable English conversation image when the screenshot is a chat.',
      },
      {
        question: 'How is this different from Google Lens or Live Text?',
        answer:
          'Those copy lines of text from a picture. This screenshot translator to English is built for chats: it infers speakers from bubbles, can stitch several screenshots, and outputs a conversation image — not a clipboard dump.',
      },
      {
        question: 'What if my screenshot is not a chat?',
        answer:
          'Use a general image translator. ChatReconstruct is specialized for message lists. A sign, receipt, or document will not reconstruct as a meaningful thread.',
      },
      {
        question: 'Does it translate the screenshot’s UI chrome too?',
        answer:
          'Chrome such as clocks and ticks is usually treated as layout. The English result is the conversation, not a literal copy of every pixel of the status bar.',
      },
    ],
    workflow: [
      'Confirm the image is a message list, not a sign or PDF page.',
      'Upload it on the home page (add more frames if they belong to the same chat).',
      'Process, then download the English conversation image.',
    ],
    related: [
      { path: '/chat-screenshot-translator', label: 'when the photo is a chat, not a sign' },
      { path: '/translate-multiple-chat-screenshots', label: 'several frames of one conversation' },
      { path: '/ocr-chat-screenshots', label: 'extract-text-first for chat bubbles' },
    ],
  },
  {
    path: '/translate-multiple-chat-screenshots',
    seoTitle: 'Translate Multiple Chat Screenshots at Once',
    seoDescription:
      'Translate multiple chat screenshots from the same conversation in one run. ChatReconstruct stitches them into chronological context first, then translates — unlike ordinary batch image translators that treat each photo as a separate job.',
    h1: 'Translate Multiple Chat Screenshots at Once',
    lead: 'Translate multiple chat screenshots from the same conversation in one run. ChatReconstruct stitches them into chronological context first, then translates — unlike ordinary batch image translators that treat each photo as a separate job.',
    more: [
      'Batch-translate-chat-screenshots tools that run the same OCR on file 1, file 2, and file 3 give you three disconnected English blobs. A reply on screenshot three often depends on a name or joke that only appeared on screenshot one. ChatReconstruct is conversation-aware: you translate several screenshots as one thread, reconstructed in chronological order before translation.',
      'Typical case: a long DM or group chat that does not fit on one capture. You screenshot as you scroll, then upload those images together — earliest at the top of the list. The pipeline aligns bubble sides and sequence across files so “translate multiple screenshots at once” means one English conversation image, not a zip of isolated translations.',
      'Example: eight WhatsApp screenshots of one argument. Drop them in scroll order, Process once, and save a single English thread — not eight disconnected OCR pastes.',
      'Keep one conversation per batch. Mixing two group chats, or WhatsApp plus Messenger in the same run, usually scrambles speakers. If you have two threads, run them separately. Optional Add guidance (bubble counts, sender vs receiver) is worth it when a crop is messy or a group has similar bubbles.',
      'This is the highest-leverage workflow on the product: multiple conversation screenshots in, one reconstructed translation out. For why surrounding lines change slang and pronouns, see translating with conversation context. For “I want the whole thread in English,” see translating an entire chat conversation. App chrome tips stay on the Messenger, WhatsApp, and other app guides.',
    ],
    tips: [
      'Add files in conversation order — first image is the earliest part of the chat, last is the newest.',
      'Do not mix two conversations in one batch; translate multiple screenshots only when they belong to the same thread.',
      'Overlap a line or two between captures if you can; it helps the stitch when a bubble is split across screenshots.',
      'Name files 01, 02, 03 if your phone shuffles the upload order.',
    ],
    faq: [
      {
        question: 'Can I translate multiple screenshots at once from different chats?',
        answer:
          'No. One run is one conversation. Upload only the screenshots that belong to that thread, in scroll order. Start a new run for a second chat.',
      },
      {
        question: 'How is this different from a batch image translator?',
        answer:
          'A batch tool translates each file independently. ChatReconstruct reconstructs chronological conversational context across the set, then translates the thread as a whole.',
      },
      {
        question: 'How many screenshots can I add?',
        answer:
          'Add as many captures as you need to cover the stretch of chat you care about, in order. Very large batches still work better when each image is a full-width thread, not a tiny crop.',
      },
      {
        question: 'What if one screenshot is out of order?',
        answer:
          'Remove it and re-add in the right place, or start over with files named in sequence. Order is how the conversation is rebuilt.',
      },
    ],
    workflow: [
      'Screenshot the stretch of chat as you scroll, earliest to newest.',
      'Upload every image from that one thread in the same order.',
      'Fix thumbnail order if the phone shuffled files; add guidance if speakers are unclear.',
      'Process once and download the reconstructed conversation.',
    ],
    related: [
      { path: '/translate-entire-chat-conversation', label: 'translate an entire conversation' },
      { path: '/chat-screenshot-translator', label: 'chat screenshot translator' },
      { path: '/translate-chat-screenshots-with-context', label: 'why neighboring bubbles change the English' },
      { path: '/blog/how-to-translate-multiple-chat-screenshots', label: 'written how-to for split threads' },
      { path: '/batch-screenshot-translator', label: 'bulk upload vs one split conversation' },
    ],
  },
  {
    path: '/batch-screenshot-translator',
    seoTitle: 'Batch Screenshot Translator for Conversations',
    seoDescription:
      'A batch screenshot translator for conversations: upload several images at once, then reconstruct them as one thread instead of running independent bulk image translation on each file.',
    h1: 'Batch Screenshot Translator for Conversations',
    lead: 'A batch screenshot translator for conversations: upload several images at once, then reconstruct them as one thread instead of running independent bulk image translation on each file.',
    more: [
      '“Batch translate screenshots,” “bulk screenshot translator,” and “translate multiple images at once” are tool queries. Searchers already know they have a folder of photos; they want software that accepts more than one file per job. Generic batch image translation runs the same OCR on every picture in isolation — fine for receipts or slides, weak when those pictures are frames of a chat.',
      'ChatReconstruct’s batch is the multi-image upload on the home page: PNG, JPEG, WebP, or BMP, added together, then one Process. It is not a zip-in, zip-out folder converter for unrelated pictures. If the set is one conversation, the pipeline uses order across files. If the set is two different chats, split them into two runs — bulk does not mean “mix everything.”',
      'This page is the batch-processing / tool landing. The separate guide Translate Multiple Chat Screenshots at Once is the problem page for “my thread is split across captures.” Same upload, different search intent: here you compared ChatReconstruct to other bulk screenshot translators; there you want chronological reconstruction of one conversation.',
      'Compared with typical batch image translation, the extra work is conversational: bubble sides, speaker names, overlap between screenshots. You still translate multiple images at once — you do not get fifty disconnected English paragraphs unless that is what you uploaded. For product steps, see How to. For why slang and pronouns need neighbors, see conversation context.',
    ],
    tips: [
      'Select or drop every image for the job in one go, then check the thumbnail order before Process.',
      'A bulk screenshot translator run still needs one conversation per batch; start a second run for a second thread.',
      'If your phone’s share sheet recompresses a whole album, prefer original files from Photos or Files.',
      'Use Add guidance on messy group captures; batch upload does not replace speaker hints.',
    ],
    faq: [
      {
        question: 'Is this the same as Translate Multiple Chat Screenshots at Once?',
        answer:
          'No. That page is for one conversation spread across screenshots. This page is the batch/tool intent: uploading several images at once, versus generic bulk image translators. Same home-page upload either way.',
      },
      {
        question: 'Can I batch-translate a folder of unrelated screenshots?',
        answer:
          'Not as one meaningful conversation. Unrelated photos in one run scramble speakers. Use separate runs, or a generic batch OCR tool if the images are not a chat thread.',
      },
      {
        question: 'Does batch image translation output one file or many?',
        answer:
          'You upload several screenshots; you download one reconstructed English conversation image for that run — not a zip of per-image translations.',
      },
      {
        question: 'How do I translate multiple images at once in the app?',
        answer:
          'On the home page, choose or drop every screenshot, confirm order, then Process. Optional guidance per image still applies in a batch.',
      },
    ],
    workflow: [
      'Select every image for this job in one drop or file picker.',
      'Confirm they are one conversation and that thumbnail order matches the chat.',
      'Process; download one reconstructed English image, not a zip of per-file translations.',
    ],
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'translate multiple chat screenshots' },
      { path: '/chat-screenshot-translator', label: 'conversation screenshot tool' },
      { path: '/translate-chat-screenshots-with-context', label: 'keep slang attached to nearby lines' },
    ],
  },
  {
    path: '/translate-entire-chat-conversation',
    seoTitle: 'Translate an Entire Chat Conversation to English',
    seoDescription:
      'Translate an entire chat conversation to English by uploading every screenshot of the thread. The output is one reconstructed conversation, not a pile of disconnected screenshot translations.',
    h1: 'Translate an Entire Chat Conversation to English',
    lead: 'Translate an entire chat conversation to English by uploading every screenshot of the thread. The output is one reconstructed conversation, not a pile of disconnected screenshot translations.',
    more: [
      'A “translate full chat conversation” search usually means the thread is longer than one screen. Translating only the last screenshot loses the setup: who started the topic, which pronoun points where, why a one-word reply landed. ChatReconstruct lets you translate a whole conversation by capturing as you scroll and uploading the set as one job.',
      'The result is meant to read as a complete chat in English — a translate-complete-chat workflow — not a gallery of separately translated images. The model uses bubble sides and order across files. You still work from screenshots of the message list (PNG, JPEG, WebP, BMP), not a .txt export or PDF dump from the messaging app.',
      'This page is not tied to one messenger. The same pattern works for any bubble thread the product already supports. If you only need capture tips for a specific UI, use those app guides; if you need the mechanics of uploading several files, use translate multiple chat screenshots. Here the intent is the whole conversation in English, including long chat conversations that take many captures.',
      'You do not have to screenshot from the first message ever sent. “Entire” means the stretch you care about: a work decision, a travel plan, a family argument. Start at a date separator or a clear topic shift, then capture continuously until the end of that stretch so the translated whole conversation stays coherent.',
      'Example: a week of travel planning in Messenger. Capture from the first “where should we stay?” date line through the booking confirmation, upload that set as one job, and read one English conversation instead of a gallery of partial translations.',
    ],
    tips: [
      'Start capturing at a natural break (date line or topic change) so the “whole conversation” you upload has a clear beginning.',
      'Keep scrolling in one direction and screenshot without skipping pages of the thread.',
      'Leave names and avatars in group chats so the reconstructed conversation can keep speakers straight.',
      'If the thread is huge, split by topic into two runs rather than mixing unrelated days in one batch.',
    ],
    faq: [
      {
        question: 'Can I translate a whole conversation from a chat export file?',
        answer:
          'No. Upload screenshots of the message list. .txt, HTML, or PDF exports are not this pipeline’s input.',
      },
      {
        question: 'Do I need every message from the beginning of the chat?',
        answer:
          'Only the stretch you want in English. Treat “entire” as that complete topic or date range, captured continuously, not necessarily years of history.',
      },
      {
        question: 'Will I get one image or many?',
        answer:
          'You upload many screenshots; you download one reconstructed English conversation image for that run.',
      },
      {
        question: 'Is this only for one messaging app?',
        answer:
          'No. It is for any supported bubble thread. App-specific chrome is documented on the Messenger, WhatsApp, LINE, and other app guides.',
      },
    ],
    workflow: [
      'Pick a start (date line or topic change) and screenshot continuously to the end of that stretch.',
      'Upload the set in order — one conversation per run.',
      'Process and download one reconstructed English thread.',
    ],
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'translate multiple chat screenshots' },
      { path: '/chat-screenshot-translator', label: 'the chat-screenshot tool page' },
      { path: '/translate-chat-screenshots-with-context', label: 'translate screenshots with context' },
      { path: '/blog/how-to-translate-an-entire-whatsapp-conversation', label: 'WhatsApp-specific capture walkthrough' },
    ],
  },
  {
    path: '/translate-chat-screenshots-with-context',
    seoTitle: 'Translate Chat Screenshots With Conversation Context',
    seoDescription:
      'Translate chat screenshots with conversation context: several captures are rebuilt into one thread so slang, dropped subjects, pronouns, and short replies are read against the messages around them.',
    h1: 'Translate Chat Screenshots With Conversation Context',
    lead: 'Translate chat screenshots with conversation context: several captures are rebuilt into one thread so slang, dropped subjects, pronouns, and short replies are read against the messages around them.',
    more: [
      'A context-aware chat translation is not a bigger dictionary. Short replies (“that one”, “he said no”, “ㅋㅋ”) are ambiguous until you see the previous bubble and who is speaking. ChatReconstruct reconstructs several screenshots into conversational context first, then translates — a contextual chat translator rather than line-by-line OCR.',
      'Conversation context translation also covers speaker relationships: who is asking, who is answering, whether a quote is sarcasm. Isolated screenshot translators often render every line as a new statement. With surrounding messages in the same reconstructed thread, omitted subjects and pronouns can attach to the right person.',
      'This query is narrower than “translate screenshot to English,” but it is the product’s main technical claim. Upload in scroll order, keep both bubble sides visible, and use Add guidance when a group thread hides names. Difficulty 2–3 helps when slang and mixed scripts pile up in one bubble.',
      'If you only have one screenshot, context is limited to what is in that frame — still better than unordered OCR, but a second capture above or below the joke is what actually unlocks “translate messages with context.” Pair this page with translating multiple chat screenshots when the thread spans several photos.',
      'Example: “ไปแล้ว” after a question about dinner. Alone it could mean left the house or already ate. With the previous bubble in the same reconstructed thread, English can pick the reading that fits.',
    ],
    tips: [
      'Include the messages before a short reply; the line that looks unimportant is often the subject the next bubble omitted.',
      'Keep quoted replies and reply-chains in frame — they are context, not decoration.',
      'In groups, do not crop sender names; context includes who is talking, not only the words.',
      'When slang is dense, raise difficulty and still upload neighboring screenshots rather than a single tight crop.',
    ],
    faq: [
      {
        question: 'What does conversation context mean here?',
        answer:
          'The pipeline rebuilds several screenshots into one thread before translation, so surrounding messages can influence slang, pronouns, omitted subjects, and who a short reply is aimed at.',
      },
      {
        question: 'Does one screenshot still get context?',
        answer:
          'Yes, within that image: bubble order and speakers in frame. Cross-screenshot context needs more than one capture of the same conversation, in order.',
      },
      {
        question: 'Is this the same as a glossary or custom dictionary?',
        answer:
          'No. There is no per-user glossary on this page. Context comes from the reconstructed conversation, not from a word list you maintain.',
      },
      {
        question: 'When should I add guidance?',
        answer:
          'When sender vs receiver is visually unclear or a group has similar bubbles. Guidance is extra context for layout; the screenshots themselves still supply the language.',
      },
    ],
    workflow: [
      'Include the bubbles before a short or slangy reply, not only the punchline.',
      'Upload neighboring screenshots of the same chat in order.',
      'Process so the thread is rebuilt before translation.',
    ],
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'when the thread needed more than one photo' },
      { path: '/translate-entire-chat-conversation', label: 'covering a full stretch of chat' },
      { path: '/chat-screenshot-translator', label: 'chat screenshot translator' },
    ],
  },
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'upload several Messenger shots in order' },
      { path: '/chat-screenshot-translator', label: 'generic chat screenshot tool' },
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
      'Queries like “translate WhatsApp chat” or “WhatsApp chat translator” belong here: same tool, WhatsApp bubble layout — not a second product URL.',
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'a long WhatsApp thread from several photos' },
      {
        path: '/blog/how-to-translate-an-entire-whatsapp-conversation',
        label: 'how to cover a full WhatsApp conversation',
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
      'A “LINE chat translator” search is this page: LINE (including LINE-heavy Thai and Japanese threads), not a separate clone URL.',
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'several LINE screenshots, one conversation' },
      {
        path: '/blog/how-to-translate-thai-line-messages-to-english',
        label: 'Thai LINE messages to English (how-to)',
      },
      { path: '/translate-thai-chat-screenshots', label: 'Thai-script chats in any app' },
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
      '“Thai chat translator” queries belong here rather than a duplicate URL: Thai-script threads from LINE, Messenger, WhatsApp, or similar.',
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
    related: [
      {
        path: '/blog/how-to-translate-thai-line-messages-to-english',
        label: 'Thai LINE walkthrough',
      },
      { path: '/translate-line-screenshots', label: 'LINE layout and stickers' },
      { path: '/translate-multiple-chat-screenshots', label: 'a Thai thread that spanned several captures' },
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'multiple DM screenshots in scroll order' },
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'a Telegram thread that took more than one capture' },
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
    related: [
      { path: '/translate-multiple-chat-screenshots', label: 'several iMessage screens in one run' },
    ],
  },
  {
    path: '/ocr-chat-screenshots',
    seoTitle: 'OCR chat screenshots to English',
    seoDescription:
      'OCR chat screenshots to read bubble text from Messenger, WhatsApp, LINE, and similar apps, then turn that text into a translated English conversation image.',
    h1: 'OCR chat screenshots to English',
    lead: 'OCR chat screenshots to read bubble text from Messenger, WhatsApp, LINE, and similar apps, then turn that text into a translated English conversation image.',
    more: [
      'Generic OCR tools (document scanners, PDF readers, camera live text) are built for paragraphs on a page. Chat screenshots are different: short lines, rounded bubbles, timestamps, ticks, and two speakers stacked in one photo.',
      'Translate Chat runs optical character recognition as part of reading the screenshot, together with vision that looks at bubble sides and order. The goal is not a raw dump of every pixel of UI chrome — it is a reconstructed thread you can actually read.',
      'Glare, cracked glass, compressed JPEGs, and dark mode all reduce OCR accuracy. Native-resolution captures with both sides of the thread visible give the recognizer more pixels and clearer left-versus-right cues.',
      'This page is for extract-text-from-a-chat-screenshot searches. If you already know the app, the Messenger, WhatsApp, LINE, Instagram, Telegram, and iMessage guides add layout-specific tips. Upload on the home page either way.',
    ],
    tips: [
      'Export or share the screenshot at the phone’s full resolution; OCR on chat bubbles fails first on tiny type.',
      'Keep the full width of the thread so sent vs received bubbles stay obvious after OCR.',
      'Skip document-style crops that cut the bubble outline — the outline is a layout signal, not noise.',
      'When one conversation spans several captures, upload them in scroll order so OCR lines stitch into one thread.',
    ],
    faq: [
      {
        question: 'Is this the same as Google Lens or Live Text?',
        answer:
          'Those tools copy lines of text. Translate Chat OCRs the screenshot, infers who said what from the chat layout, translates, and outputs a conversation image.',
      },
      {
        question: 'Does OCR work on dark mode screenshots?',
        answer:
          'Yes. Dark and light themes both work. Higher contrast and less compression usually read small type more reliably.',
      },
      {
        question: 'Can I OCR a PDF of a chat export?',
        answer:
          'No. Upload PNG, JPEG, WebP, or BMP screenshots of the message list — not PDF transcripts or .txt chat exports.',
      },
    ],
    related: [
      { path: '/translate-screenshot-to-english', label: 'after the bubbles are readable, get English output' },
      { path: '/chat-screenshot-translator', label: 'chat-focused translation, not a text dump' },
    ],
  },
  {
    path: '/ocr-whatsapp-screenshots',
    seoTitle: 'WhatsApp screenshot OCR',
    seoDescription:
      'WhatsApp screenshot OCR: read compressed chat bubbles, quoted replies, and group names from WhatsApp captures, then reconstruct a translated English conversation image.',
    h1: 'WhatsApp screenshot OCR',
    lead: 'WhatsApp screenshot OCR: read compressed chat bubbles, quoted replies, and group names from WhatsApp captures, then reconstruct a translated English conversation image.',
    more: [
      'WhatsApp often saves in-app shares as compressed JPEGs. That is hard on OCR: antialiased edges on small Latin or non-Latin type, plus the green and gray bubbles and check marks that sit next to the words.',
      'Quoted replies are a WhatsApp-specific OCR trap. The quoted snippet is smaller and lighter than the reply. If the quote carries the meaning, leave it in frame — cropping to the reply line only hides the text the recognizer needs.',
      'Group chats print sender names above bubbles. Those names are useful OCR targets because they label speakers after translation. Status, Channels, and in-app browsers are out of scope; capture the message list with both bubble sides visible.',
      'This OCR guide is for reading WhatsApp pixels. For translation-focused tips (stitching a long thread, dark vs light), see Translate WhatsApp chat screenshots. Same home-page upload either way.',
    ],
    tips: [
      'Prefer the original screenshot in Photos or Files over a re-shared, recompressed image.',
      'Include quoted reply blocks when they hold names, times, or the sentence you need translated.',
      'In groups, keep sender names in frame so OCR can attach lines to the right person.',
      'WhatsApp Business uses the same bubble layout; capture the thread, not the catalog or status screen.',
    ],
    faq: [
      {
        question: 'Why did a double-check or timestamp get treated as text?',
        answer:
          'Delivery ticks and clock labels sit close to bubbles. They are usually treated as chrome. If a tick overlaps a letter, recapture with a slightly wider crop.',
      },
      {
        question: 'Does voice-note duration text get OCRed?',
        answer:
          'Duration labels can be read as UI, not dialogue. The pipeline is tuned for message bubbles. Include neighboring bubbles so order stays clear.',
      },
      {
        question: 'Can I OCR a WhatsApp chat export (.txt)?',
        answer:
          'No. This tool OCRs screenshots of the chat UI. Use PNG, JPEG, WebP, or BMP captures of the conversation.',
      },
    ],
    related: [
      { path: '/translate-whatsapp-screenshots', label: 'WhatsApp translation once the bubbles are readable' },
      { path: '/translate-multiple-chat-screenshots', label: 'if that WhatsApp chat took several screenshots' },
    ],
  },
  {
    path: '/ocr-thai-chat-screenshots',
    seoTitle: 'OCR Thai chat screenshots',
    seoDescription:
      'OCR Thai chat screenshots from LINE, Messenger, WhatsApp, and similar apps: read Thai script in message bubbles, then output a translated English conversation image.',
    h1: 'OCR Thai chat screenshots',
    lead: 'OCR Thai chat screenshots from LINE, Messenger, WhatsApp, and similar apps: read Thai script in message bubbles, then output a translated English conversation image.',
    more: [
      'Thai script is demanding for OCR: no spaces between words, vowels stacked above and below consonants, and tone marks that sit on tiny screenshots. A recognizer that works on printed documents often drops those marks on a phone capture.',
      'LINE is the most common source of Thai chat screenshots. Stickers beside text, date separators, and mixed Thai–English slang in one bubble are all expected. Capture the full bubble, including stacked vowels at the top and bottom of the line.',
      'This site’s menus are in English. You still upload Thai-script screenshots; the result is an English chat image. Raise difficulty in the app (level 2–3) when the thread is dense or heavily mixed with English.',
      'Use this page when the problem is reading Thai glyphs off the screenshot. For translation-oriented tips (difficulty, output language), see Translate Thai chat screenshots to English.',
    ],
    tips: [
      'Use the highest resolution export your phone allows — stacked Thai vowels need extra pixels.',
      'Do not crop the top or bottom of a bubble; tone marks and below-line vowels live there.',
      'If a message mixes Thai and English, include the whole bubble so OCR does not split the line.',
      'Name files in scroll order (01, 02…) when uploading a long LINE or Messenger thread.',
    ],
    faq: [
      {
        question: 'Why is Thai OCR harder than English OCR?',
        answer:
          'Thai has no word spaces and uses stacked vowels and tone marks. Those marks are easy to lose on compressed or low-resolution screenshots.',
      },
      {
        question: 'Does this OCR Thai from LINE stickers?',
        answer:
          'Text inside or beside a sticker can be read. Stickers with no letters stay as layout. Prefer bubbles that contain the words you need.',
      },
      {
        question: 'Can the OCR output stay in Thai?',
        answer:
          'The product is built to produce an English conversation image after OCR. Set the target language on the home page if you need a different output language.',
      },
    ],
    related: [
      { path: '/translate-thai-chat-screenshots', label: 'Thai translation after the script is readable' },
      {
        path: '/blog/how-to-translate-thai-line-messages-to-english',
        label: 'LINE-specific Thai how-to',
      },
    ],
  },
]

export const INTENT_BY_PATH: Record<string, IntentLanding> = Object.fromEntries(
  INTENT_LANDINGS.map((entry) => [entry.path, entry]),
)

/** Retired keyword URLs; send crawlers and bookmarks to the guides hub. */
export const LEGACY_LANDING_REDIRECTS: Readonly<Record<string, string>> = {
  '/ai-chat-screenshot-translator': USES_HUB_PATH,
  '/ai-translate-chat-screenshots': USES_HUB_PATH,
  '/translate-chat-screenshots-with-ai': USES_HUB_PATH,
  '/chat-screenshot-ai-translation': USES_HUB_PATH,
  '/ai-conversation-screenshot-translator': USES_HUB_PATH,
  '/translate-chat-ui-screenshots-ai': USES_HUB_PATH,
  '/ai-screenshot-translator': '/translate-screenshot-to-english',
  '/ai-chat-translator': '/chat-screenshot-translator',
  '/translate-whatsapp-chat': '/translate-whatsapp-screenshots',
  '/whatsapp-chat-translator': '/translate-whatsapp-screenshots',
  '/line-chat-translator': '/translate-line-screenshots',
  '/thai-chat-translator': '/translate-thai-chat-screenshots',
}
