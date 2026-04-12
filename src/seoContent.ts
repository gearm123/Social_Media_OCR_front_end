/** SEO copy shared by browser and build-time prerendering. */
export const SEO_HOME_DESCRIPTION = 'Turn your chat screenshots into a translated conversation'

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

export const SEO_SITE_NAME = 'Translate Chat'

export const SEO_FAQ_ITEMS = [
  {
    question: 'What does Translate Chat do?',
    answer:
      'You upload chat screenshots (Messenger, WhatsApp, LINE, and similar apps). We read the conversation layout with AI vision and OCR hints, then produce a clean English chat-style image you can save or share.',
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
      'Use the Privacy link in the footer when the app is connected to our API — it opens our hosted privacy page. We do not use your screenshots to train public models.',
  },
] as const
