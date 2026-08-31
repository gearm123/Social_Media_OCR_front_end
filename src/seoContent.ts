/** SEO copy shared by browser and build-time prerendering. */
export const SEO_SITE_NAME = 'Translate Chat'

/** Visible home H1 and the keyword half of document.title. */
export const SEO_HOME_H1 = 'Translate chat screenshots to English'

/** document.title / og:title for `/`. */
export const SEO_HOME_TITLE = `${SEO_HOME_H1} · ${SEO_SITE_NAME}`

export const SEO_HOME_DESCRIPTION =
  'Turn chat screenshots from Messenger, WhatsApp, LINE, and similar apps into a translated English conversation image you can save or share.'

export const SEO_CONTACT_DESCRIPTION =
  'Questions about the product, billing, or partnerships? Send us a message — we read every email.'

export const SEO_FEEDBACK_DESCRIPTION =
  'Your experience matters. Share bugs, ideas, or anything that would make Translate Chat more useful for you.'

export const SEO_FAQ_DESCRIPTION =
  'Quick answers about what Translate Chat does, which chat apps work best, whether you need an account, and how privacy is handled.'

export const SEO_HOWTO_DESCRIPTION =
  'Step-by-step: upload chat screenshots in order, add bubble counts and sender/receiver guidance, choose difficulty, run Process, then download your translated conversation image.'

export const SEO_DEMONSTRATION_DESCRIPTION =
  "See how readable chat bubbles can be reconstructed even when the phone screen is badly cracked — the same idea behind Translate Chat's output on tough screenshots."

export const SEO_PRIVACY_DESCRIPTION =
  'How Translate Chat handles screenshots, accounts, payments, and cookies — including that we do not use your images to train public models.'

export const SEO_TERMS_DESCRIPTION =
  'Terms of use for Translate Chat: the translator service, acceptable use, billing through Paddle, and limits of the automated output.'

export const SEO_USES_DESCRIPTION =
  'Short guides for common search intents — same tool on the home page, with tips tailored to each chat app or language.'

export const SEO_HOWTO_STEPS: readonly { title: string; body: string }[] = [
  {
    title: 'Upload screenshots in chat order',
    body: 'Use Choose images or drag and drop anywhere on the page. Add files in conversation order — the first image should show the earliest part of the chat. Supported formats: PNG, JPEG, WebP, and BMP.',
  },
  {
    title: 'Add guidance for each image',
    body: 'For every screenshot, open Add guidance and enter the total number of message bubbles you see. Set the sequence (sender vs receiver) for each bubble. This optional step significantly improves layout and translation quality.',
  },
  {
    title: 'Pick language difficulty',
    body: 'Choose a difficulty level (1–3) before Process. Higher levels take longer but help for complex scripts and languages; use the in-app hint to see recommended levels for your language.',
  },
  {
    title: 'Run Process',
    body: 'Click Process when your API is configured and you have usage available. Wait for the pipeline to finish — you can switch tabs while it runs. You can cancel from the progress screen if needed.',
  },
  {
    title: 'Download or share the result',
    body: 'When processing completes, open the result to view full size, download the PNG, or use Share if your device supports it. Use Back to adjust guidance and run again, or Start over to clear uploads.',
  },
]

export const SEO_FAQ_ITEMS = [
  {
    question: 'What does Translate Chat do?',
    answer:
      'You upload chat screenshots (Messenger, WhatsApp, LINE, Instagram, Telegram, iMessage, and similar apps). We read the conversation layout with AI vision and OCR hints, then produce a clean English chat-style image you can save or share.',
  },
  {
    question: 'Which chat apps work best?',
    answer:
      'The pipeline is tuned for common layouts: Facebook Messenger, WhatsApp, LINE, Instagram-style threads, Telegram, and iMessage-style bubbles. See the translation guides for app-specific tips.',
  },
  {
    question: 'Do I need an account to try it?',
    answer:
      'You can start with a limited free run without signing in. Create an account when you want more usage, subscriptions, or one-time paid runs.',
  },
  {
    question: 'Where can I read about privacy and data handling?',
    answer:
      'See the Privacy page (/privacy) for how screenshots, accounts, and payments are handled. We do not use your screenshots to train public models.',
  },
  {
    question: 'Which image formats can I upload?',
    answer:
      'PNG, JPEG, WebP, and BMP. Upload screenshots in conversation order. Higher-resolution exports usually improve small-text recognition.',
  },
  {
    question: 'How does billing work?',
    answer:
      'Payments are processed by Paddle (merchant of record). Free-tier runs may be available without an account; paid plans and one-time runs add usage. See Terms (/terms) for acceptable use and checkout details.',
  },
] as const

export const SEO_PRIVACY_SECTIONS: readonly { title: string; body: string }[] = [
  {
    title: 'Who we are',
    body: 'Translate Chat (chatreconstruct.com) is a web app that turns chat screenshots into a translated conversation image. Contact: the address on the Contact page.',
  },
  {
    title: 'Screenshots you upload',
    body: 'Images you upload are sent to our API so the pipeline can read layout and text (AI vision plus OCR hints) and render a result. We do not use your screenshots to train public models. Do not upload images you are not allowed to process.',
  },
  {
    title: 'Accounts and guest use',
    body: 'You can try a limited free run without signing in. If you create an account, we store the email and username you provide so you can sign in, manage usage, and complete checkout. Guest billing uses a browser identifier so unpaid and paid guest runs can be associated on this device.',
  },
  {
    title: 'Payments',
    body: 'Subscriptions and one-time purchases are processed by Paddle as merchant of record. Paddle handles card details and tax; we receive transaction status so we can unlock usage. See Paddle’s own privacy terms for payment data.',
  },
  {
    title: 'Cookies and analytics',
    body: 'The site uses essential storage for sign-in and guest billing. We use Google Analytics (GA4) to understand visits in aggregate (pages, countries, device types). You can block analytics with browser or OS settings.',
  },
  {
    title: 'Retention and requests',
    body: 'We keep account and billing records as long as needed to provide the service and meet legal obligations. To ask about access or deletion of account data, email us from the Contact page.',
  },
]

export const SEO_TERMS_SECTIONS: readonly { title: string; body: string }[] = [
  {
    title: 'The service',
    body: 'Translate Chat provides automated translation and reconstruction of chat screenshots you upload. Output can be wrong, incomplete, or stylized. You are responsible for how you use results.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not upload content you do not have the right to process, or use the service for harassment, fraud, or anything illegal. We may suspend access if usage or content violates these terms or harms the service.',
  },
  {
    title: 'Accounts and usage',
    body: 'Free runs may be limited. Paid usage is granted after Paddle checkout (subscription or one-time). Plan details shown in the app at purchase time apply. Chargebacks or abuse may result in revoked access.',
  },
  {
    title: 'Payments',
    body: 'Paddle is the merchant of record. Subscription, tax, and refund rules are those Paddle presents at checkout. Failed payments can pause paid features.',
  },
  {
    title: 'Intellectual property',
    body: 'The Translate Chat app, brand, and pipeline are ours (or our licensors’). You keep rights to your screenshots and to output generated from them, subject to others’ rights in the original chat content.',
  },
  {
    title: 'Disclaimer',
    body: 'The service is provided as is. We do not warrant uninterrupted availability or that translations are accurate. To the extent allowed by law, we are not liable for indirect or consequential loss from using the translator.',
  },
]
