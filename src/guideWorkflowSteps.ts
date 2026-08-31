export type GuideWorkflowStep = {
  title: string
  description: string
  mainSrc: string
  microSrc: string | null
}

const BASE = '/guide-workflow'

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
