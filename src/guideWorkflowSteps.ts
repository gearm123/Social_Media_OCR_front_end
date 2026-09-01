export type GuideWorkflowStep = {
  title: string
  description: string
  mainSrc: string
  microSrc: string | null
}

/** One unique MP4 eligible for Google video indexing (dedicated watch page). */
export type GuideWorkflowClip = {
  slug: string
  path: string
  title: string
  seoTitle: string
  seoDescription: string
  lead: string
  src: string
  poster: string
  duration: string
  stepTitle: string
}

const BASE = '/guide-workflow'

export const VIDEOS_HUB_PATH = '/videos'

/** Order matches the app: screenshots → guidance → settings → result. Clips from `public/guide-workflow/`. */
export const GUIDE_WORKFLOW_STEPS: readonly GuideWorkflowStep[] = [
  {
    title: 'Add input',
    description:
      'Upload screenshots in chat order — drag and drop or Choose images. PNG, JPEG, WebP, and BMP are supported.',
    mainSrc: `${BASE}/add_input_images.mp4`,
    microSrc: null,
  },
  {
    title: 'Add guidance input',
    description:
      'Open Add guidance on each image: bubble counts and sender/receiver order improve layout and translation.',
    mainSrc: `${BASE}/add_guidance_input.mp4`,
    microSrc: `${BASE}/add_guidance_input_micro.mp4`,
  },
  {
    title: 'Configure settings',
    description:
      'Set output language, difficulty (1–3), and optional mood before Process — they steer the whole pipeline.',
    mainSrc: `${BASE}/configure_settings.mp4`,
    microSrc: `${BASE}/configure_settings_micro.mp4`,
  },
  {
    title: 'View result',
    description:
      'When processing finishes, open the result full size, download, or go back to adjust guidance and run again.',
    mainSrc: `${BASE}/view_result.mp4`,
    microSrc: `${BASE}/view_result_micro.mp4`,
  },
]

function clip(
  slug: string,
  title: string,
  seoDescription: string,
  src: string,
  duration: string,
  stepTitle: string,
): GuideWorkflowClip {
  const file = src.slice(src.lastIndexOf('/') + 1).replace(/\.mp4$/i, '')
  return {
    slug,
    path: `${VIDEOS_HUB_PATH}/${slug}`,
    title,
    seoTitle: title,
    seoDescription,
    lead: seoDescription,
    src,
    poster: `${BASE}/${file}.jpg`,
    duration,
    stepTitle,
  }
}

/** One watch-page clip per unique MP4 (main + detail). */
export const GUIDE_VIDEO_CLIPS: readonly GuideWorkflowClip[] = [
  clip(
    'add-input',
    'Add input screenshots',
    'Watch how to upload chat screenshots in conversation order on Translate Chat — drag and drop or Choose images (PNG, JPEG, WebP, BMP).',
    `${BASE}/add_input_images.mp4`,
    'PT5S',
    'Add input',
  ),
  clip(
    'add-guidance',
    'Add guidance to each screenshot',
    'Watch how to open Add guidance on each screenshot and set bubble counts plus sender versus receiver order before Process.',
    `${BASE}/add_guidance_input.mp4`,
    'PT23S',
    'Add guidance input',
  ),
  clip(
    'add-guidance-detail',
    'Add guidance — close-up',
    'A closer look at the Add guidance controls: message-bubble count and the sender/receiver sequence for one screenshot.',
    `${BASE}/add_guidance_input_micro.mp4`,
    'PT6S',
    'Add guidance input',
  ),
  clip(
    'configure-settings',
    'Configure translation settings',
    'Watch how to set target language, difficulty (1–3), and optional mood on Translate Chat before running Process.',
    `${BASE}/configure_settings.mp4`,
    'PT19S',
    'Configure settings',
  ),
  clip(
    'configure-settings-detail',
    'Configure settings — close-up',
    'A closer look at language, difficulty, and mood controls that steer the screenshot translation pipeline.',
    `${BASE}/configure_settings_micro.mp4`,
    'PT4S',
    'Configure settings',
  ),
  clip(
    'view-result',
    'View and download the result',
    'Watch how to open the translated conversation full size, download the PNG, or go back to adjust guidance and run again.',
    `${BASE}/view_result.mp4`,
    'PT17S',
    'View result',
  ),
  clip(
    'view-result-detail',
    'View result — close-up',
    'A closer look at the translated chat image result: expand, download, and return to the upload slot.',
    `${BASE}/view_result_micro.mp4`,
    'PT4S',
    'View result',
  ),
]

export const GUIDE_VIDEO_BY_PATH: Record<string, GuideWorkflowClip> = Object.fromEntries(
  GUIDE_VIDEO_CLIPS.map((entry) => [entry.path, entry]),
)

export const GUIDE_VIDEO_BY_SRC: Record<string, GuideWorkflowClip> = Object.fromEntries(
  GUIDE_VIDEO_CLIPS.map((entry) => [entry.src, entry]),
)
