import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import {
  buildPass1BubbleSummaryText,
  defaultImageBubbleHint,
  type ImageBubbleHint,
} from './bubbleSummary'
import { AuthModal } from './AuthModal'
import {
  apiBase,
  cancelJob,
  createJob,
  fetchArtifact,
  waitForJob,
  type JobStatusResponse,
} from './api'
import {
  claimGuestPaidTransaction,
  claimUserPaidTransaction,
  syncBillingFromServer,
  syncGuestBillingFromServer,
} from './billingApi'
import { AuthInvalidError, fetchMe, type UserMe } from './authApi'
import { clearSession, getAccessToken } from './authStorage'
import { fileKey } from './fileUtils'
import { sortImageFilesByNameSequence } from './sortUploadedImages'
import { MessengerBackdrop } from './MessengerBackdrop'
import {
  canMultiImageUploadForSession,
  freeRunsCap,
  freeRunsRemaining,
  hasPaidJobAccessForSession,
  hasSubscriptionAccessForSession,
  processBlockReasonForSession,
  readBillingSnapshot,
  recordSuccessfulJob,
  subscriptionQuotaStuckForSession,
  subscriptionRunsRemaining,
  subscriptionTierName,
} from './billingStorage'
import { GuidanceInputModal } from './GuidanceInputModal'
import { ChatReconstructHoverPreview } from './ChatReconstructHoverPreview'
import { InfoPopover } from './InfoPopover'
import { PaywallModal } from './PaywallModal'
import { PricingModal } from './PricingModal'
import SiteExploreBar from './SiteExploreBar'
import { applyDocumentSeo, SEO_HOME_DESCRIPTION, SEO_SITE_NAME } from './seo'
import { DEFAULT_TARGET_LANGUAGE_CODE } from './supportedTargetLanguages'
import { TargetLanguagePicker } from './TargetLanguagePicker'

/** Formats the pipeline is built around (OpenCV-friendly screenshots). */
const ACCEPT_IMAGES =
  'image/png,image/jpeg,image/jpg,image/webp,image/bmp,.png,.jpg,.jpeg,.webp,.bmp'

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'])

function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true
  return /\.(png|jpe?g|webp|bmp)$/i.test(file.name)
}

const MAX_MESSAGE_BUBBLES = 30

/** Insets for `object-fit: contain` image inside a box (letterboxing), in px. */
function objectFitContainInsets(
  cw: number,
  ch: number,
  nw: number,
  nh: number,
): { ix: number; iy: number } {
  if (cw <= 0 || ch <= 0 || nw <= 0 || nh <= 0) return { ix: 0, iy: 0 }
  const scale = Math.min(cw / nw, ch / nh)
  const dw = nw * scale
  const dh = nh * scale
  return { ix: (cw - dw) / 2, iy: (ch - dh) / 2 }
}

type DropPairPreviewThumbProps = {
  url: string
  fileName: string
  order: number
  onZoom: () => void
  onRemove: () => void
}

/** Thumb preview: badges align to the visible photo (letterbox), not the outer frame. */
function DropPairPreviewThumb({
  url,
  fileName,
  order,
  onZoom,
  onRemove,
}: DropPairPreviewThumbProps) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const updateLetterboxInsets = useCallback(() => {
    const thumb = thumbRef.current
    const img = imgRef.current
    if (!thumb) return
    const nw = img?.naturalWidth ?? 0
    const nh = img?.naturalHeight ?? 0
    if (!nw || !nh) {
      thumb.style.setProperty('--preview-inset-x', '0px')
      thumb.style.setProperty('--preview-inset-y', '0px')
      return
    }
    const cw = thumb.clientWidth
    const ch = thumb.clientHeight
    const { ix, iy } = objectFitContainInsets(cw, ch, nw, nh)
    thumb.style.setProperty('--preview-inset-x', `${ix}px`)
    thumb.style.setProperty('--preview-inset-y', `${iy}px`)
    const scale = Math.min(cw / nw, ch / nh)
    const dw = nw * scale
    /* Room inside photo after default 6px inset each side (see .preview-thumb--drop-pair .preview-thumb__badges). */
    const innerW = dw - 12
    thumb.classList.toggle('preview-thumb--badges-tight', innerW < 76)
  }, [])

  useLayoutEffect(() => {
    const thumb = thumbRef.current
    if (!thumb) return
    updateLetterboxInsets()
    const ro = new ResizeObserver(() => updateLetterboxInsets())
    ro.observe(thumb)
    return () => ro.disconnect()
  }, [updateLetterboxInsets, url])

  return (
    <div ref={thumbRef} className="preview-thumb preview-thumb--drop-pair">
      <button
        type="button"
        className="preview-thumb__zoom"
        aria-label={`Enlarge preview ${order}: ${fileName}`}
        onClick={onZoom}
      >
        <img ref={imgRef} src={url} alt="" onLoad={updateLetterboxInsets} />
      </button>
      <div className="preview-thumb__badges">
        <span className="preview-thumb__order" aria-hidden>
          {order}
        </span>
        <button
          type="button"
          className="preview-thumb__remove"
          aria-label={`Remove ${fileName} from upload`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </div>
  )
}

const PATIENCE_LINES = [
  "We're on it.",
  'It will be worth the wait.',
  'You can switch tabs while we work.',
  'Adding a message sequence helps us understand your chat.',
  'The more images, the more time.',
]

/** Matches backend `POST /jobs` form field `difficulty` (pipeline depth). */
type TranslationDifficulty = 1 | 2 | 3

type TranslationMood = 'hurry' | 'patient'

type RunPresetContext = 'guest-free' | 'user-free' | 'paid'

function runPresetForAccess(hasPaidAccess: boolean): {
  difficulty: TranslationDifficulty
  mood: TranslationMood
} {
  return hasPaidAccess
    ? { difficulty: 3, mood: 'patient' }
    : { difficulty: 2, mood: 'hurry' }
}

function runPresetContextForSession(signedIn: boolean, hasPaidAccess: boolean): RunPresetContext {
  if (hasPaidAccess) return 'paid'
  return signedIn ? 'user-free' : 'guest-free'
}

function initialRunPresetState(): {
  difficulty: TranslationDifficulty
  mood: TranslationMood
  context: RunPresetContext
} {
  const signedIn = Boolean(getAccessToken())
  const billing = readBillingSnapshot()
  const hasPaidAccess = hasPaidJobAccessForSession(billing, signedIn)
  return {
    ...runPresetForAccess(hasPaidAccess),
    context: runPresetContextForSession(signedIn, hasPaidAccess),
  }
}

/** Live overlay timer: m:ss from Process click until loading ends. */
function formatProcessElapsed(ms: number): string {
  const t = Math.max(0, ms)
  const totalSec = Math.floor(t / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Rough average expected runtime (seconds) for the loading bar, by mode and language difficulty.
 * Anchored to an observed d3 + take-your-time mean of ~4m40s, with the other presets scaled from
 * the original relative ratios so the ETA stays consistent across configurations.
 */
const PIPELINE_ETA_SEC_PATIENT: Record<TranslationDifficulty, number> = {
  1: 150,
  2: 210,
  3: 280,
}
const PIPELINE_ETA_SEC_HURRY: Record<TranslationDifficulty, number> = {
  1: 85,
  2: 135,
  3: 185,
}

/** Allow one full Pass 1 restart plus some finalization buffer before auto-stopping. */
const OVERLOADED_RUN_ABORT_MS = 285_000

function pipelineEtaSecondsRange(
  mood: TranslationMood,
  difficulty: TranslationDifficulty,
): [number, number] {
  const sec = mood === 'hurry' ? PIPELINE_ETA_SEC_HURRY[difficulty] : PIPELINE_ETA_SEC_PATIENT[difficulty]
  return [Math.max(1, sec - 30), sec + 30]
}

/**
 * Keep the total ETA stable during normal execution and only step it upward when
 * the backend reports extra penalty time for a retried Gemini attempt.
 */
function addEtaPenaltyToRange(
  baseRange: [number, number],
  extraMs: number,
): [number, number] {
  const extraSec = Math.max(0, Math.round(extraMs / 1000))
  return [Math.max(1, baseRange[0] + extraSec), baseRange[1] + extraSec]
}

function formatEstimatedTotalTimeFromRange([lo, hi]: [number, number]): string {
  if (lo === hi) {
    return `Est. total ~${formatProcessElapsed(lo * 1000)}`
  }
  return `Est. total ~${formatProcessElapsed(lo * 1000)}–${formatProcessElapsed(hi * 1000)}`
}

/** Short titles for the pipeline overlay (ignore verbose server ``stage_label``). */
function processingOverlayHeadline(stage: string | undefined, status: string): string {
  if (status === 'cancelled') return 'Cancelling…'
  if (status === 'queued') return 'Starting…'
  const st = stage ?? ''
  switch (st) {
    case 'starting':
      return 'Starting…'
    case 'artifact_cleaning':
    case 'status_bar_extract':
    case 'pass_1':
      return 'Transcribing'
    case 'pass_2_prep':
    case 'pass_2':
      return 'Polishing'
    case 'pass_3':
    case 'pass_4':
    case 'finalizing':
    case 'rendering':
      return 'Bringing it all together'
    default:
      if (status === 'completed') return 'Final image ready'
      return 'Processing…'
  }
}

function loadingPrimaryFromJobStatus(j: JobStatusResponse): string {
  return processingOverlayHeadline(j.stage, j.status)
}

function isServersOverloadedMessage(msg: string): boolean {
  return msg.includes('SERVERS_OVERLOADED:')
}

/**
 * Some browsers leave `dataTransfer.files` empty on drop (single file from certain sources);
 * `items` + `getAsFile()` is the reliable fallback.
 */
function filesFromDataTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return []
  if (dt.files?.length) {
    return Array.from(dt.files)
  }
  const out: File[] = []
  if (dt.items?.length) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i]
      if (item.kind === 'file') {
        const f = item.getAsFile()
        if (f) out.push(f)
      }
    }
  }
  return out
}

/** Dedupe within one pick/drop; each new selection replaces the previous list entirely. */
function dedupeImageFiles(incoming: File[]): File[] {
  const seen = new Set<string>()
  const out: File[] = []
  for (const f of incoming) {
    if (!isImageFile(f)) continue
    const k = fileKey(f)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(f)
  }
  return out
}

type PreviewItem = { file: File; url: string }

type PreviewLightbox = { url: string; name: string }

function ProductInfoContent() {
  return (
    <>
      <p className="info-popover__lead">
        We combine <strong>Gemini Pro</strong> with <strong>Google Vision OCR</strong> in a proprietary AI-powered
        processing pipeline to deliver highly accurate results.
      </p>
      <ul className="info-popover__list info-popover__list--after-lead">
        <li>Powered by state-of-the-art AI models for maximum accuracy and reliability</li>
        <li>
          Reconstructs full conversations including timestamps, call logs, and translated messages — all seamlessly
          integrated into the original chat UI layout
        </li>
        <li>Supports major platforms including Facebook, Instagram, WhatsApp, Telegram, and LINE</li>
        <li>Robust to real-world conditions, including cracked screens and imperfect image quality</li>
        <li>Downloadable final output once processing is complete</li>
        <li>Language-agnostic processing, supporting virtually any source language</li>
      </ul>
    </>
  )
}

const PLATFORM_LOGO_SRC: { src: string; label: string }[] = [
  { src: 'https://cdn.simpleicons.org/facebook/1877F2', label: 'Facebook' },
  { src: 'https://cdn.simpleicons.org/instagram/E4405F', label: 'Instagram' },
  { src: 'https://cdn.simpleicons.org/whatsapp/25D366', label: 'WhatsApp' },
  { src: 'https://cdn.simpleicons.org/telegram/26A5E4', label: 'Telegram' },
  { src: 'https://cdn.simpleicons.org/line/00B900', label: 'LINE' },
]

function HeroPlatformBanner() {
  return (
    <div className="hero-platform-banner" role="group" aria-label="Supported messaging platforms">
      {PLATFORM_LOGO_SRC.map(({ src, label }) => (
        <img
          key={label}
          className="hero-platform-banner__logo"
          src={src}
          alt={label}
          width={28}
          height={28}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  )
}

function PlansUsageInfoContent() {
  return (
    <>
      <p className="info-popover__lead">
        Guest access: Try the product with 1 free single-image run — no sign-up required
      </p>
      <p className="info-popover__para">
        Sign up bonus: Create a free account to receive an additional single-image run
      </p>
      <p className="info-popover__subhead">Flexible payment options:</p>
      <ul className="info-popover__list info-popover__list--tight">
        <li>
          <strong>One-time plan:</strong> Pay once to process a full multi-image job
        </li>
        <li>
          <strong>Subscription plan:</strong> Unlock multi-image uploads, higher usage limits, and ongoing access to
          the tool
        </li>
      </ul>
      <p className="info-popover__foot">
        Upgrade anytime to continue using the product beyond the free trials
      </p>
    </>
  )
}

function MoodBar({
  mode,
  onMode,
}: {
  mode: TranslationMood
  onMode: (m: TranslationMood) => void
}) {
  const labelId = useId()
  return (
    <div className="hero-actions__mood-stack">
      <span className="hero-actions__mood-label" id={labelId}>
        Choose your mood
      </span>
      <fieldset className="mood-bar" aria-labelledby={labelId}>
        <legend className="sr-only">Processing mood</legend>
        <label
          className={`mood-bar__seg${mode === 'hurry' ? ' mood-bar__seg--active' : ''}`}
        >
          <input
            type="radio"
            className="mood-bar__input"
            name="translation-mood"
            checked={mode === 'hurry'}
            onChange={() => onMode('hurry')}
            aria-label="Hurry up"
          />
          <span className="mood-bar__face">Hurry up</span>
        </label>
        <label className={`mood-bar__seg${mode === 'patient' ? ' mood-bar__seg--active' : ''}`}>
          <input
            type="radio"
            className="mood-bar__input"
            name="translation-mood"
            checked={mode === 'patient'}
            onChange={() => onMode('patient')}
            aria-label="Take your time"
          />
          <span className="mood-bar__face">Take your time</span>
        </label>
      </fieldset>
    </div>
  )
}

function DifficultyInfoContent() {
  return (
    <div className="info-popover--difficulty-copy">
      <header className="info-popover__difficulty-intro-block">
        <p className="info-popover__difficulty-title">Difficulty affects speed and quality of the result.</p>
        <p className="info-popover__difficulty-deck">
          Choosing high difficulty will take more time to process, but the results will be the highest quality.
        </p>
      </header>
      <p className="info-popover__lead">Our recommendation for your requested language:</p>
      <p className="info-popover__subhead">Level 1 — Straightforward OCR</p>
      <p className="info-popover__para">Spanish, French, German, Italian, Portuguese</p>
      <p className="info-popover__subhead">Level 2 — Moderate complexity</p>
      <p className="info-popover__para">
        Dutch, Polish, Swedish, Norwegian, Danish, Finnish, Czech, Romanian
      </p>
      <p className="info-popover__subhead">Level 3 — Complex</p>
      <p className="info-popover__para">
        Thai, Vietnamese, Hindi, Bengali, Tamil, Telugu, Urdu, Chinese, Japanese, Korean, Arabic, Indonesian,
        Filipino/Tagalog, Russian, Ukrainian, Greek, Turkish, Hebrew, Persian (Farsi)
      </p>
    </div>
  )
}

function App() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jobIssuesRef = useRef<HTMLDivElement>(null)
  const activeJobIdRef = useRef<string | null>(null)
  const uploadAbortRef = useRef<AbortController | null>(null)
  const executionCancelledRef = useRef(false)
  const overloadAbortTriggeredRef = useRef(false)
  const initialRunPreset = useMemo(() => initialRunPresetState(), [])
  const appliedRunPresetContextRef = useRef<RunPresetContext>(initialRunPreset.context)
  /** Captured when Process starts so Back restores hints exactly as before that run. */
  const preProcessSnapshotRef = useRef<Record<string, ImageBubbleHint> | null>(null)

  const [files, setFiles] = useState<File[]>([])
  const [hints, setHints] = useState<Record<string, ImageBubbleHint>>({})
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  /** Snapshot at Process click — shown ETA range matches mood (Hurry up vs Take your time). */
  const [processingMood, setProcessingMood] = useState<TranslationMood>('patient')
  /** Snapshot at Process click so ETA does not jump if the live difficulty control changes mid-run. */
  const [processingDifficulty, setProcessingDifficulty] = useState<TranslationDifficulty>(3)
  const [processElapsedMs, setProcessElapsedMs] = useState(0)
  const [serverProcessElapsedMs, setServerProcessElapsedMs] = useState(0)
  const [loadingPrimary, setLoadingPrimary] = useState<string | null>(null)
  const [pipelineProgress, setPipelineProgress] = useState(0)
  const [pipelineEtaExtraMs, setPipelineEtaExtraMs] = useState(0)
  const [overloadNoticeOpen, setOverloadNoticeOpen] = useState(false)
  const [patienceIdx, setPatienceIdx] = useState(0)
  const [jobError, setJobError] = useState<string | null>(null)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [resultExpanded, setResultExpanded] = useState(false)
  const [previewLightbox, setPreviewLightbox] = useState<PreviewLightbox | null>(null)
  const [authUser, setAuthUser] = useState<UserMe | null>(null)
  /** True while we have a stored JWT and have not finished validating it with `GET /auth/me`. */
  const [authBootstrapping, setAuthBootstrapping] = useState(() => Boolean(getAccessToken()))
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  const [billingTick, setBillingTick] = useState(0)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallReason, setPaywallReason] = useState<
    'free_exhausted' | 'multi_on_free' | 'quota_exhausted'
  >('free_exhausted')
  /** Which image (file key) has the guidance modal open */
  const [guidanceModalKey, setGuidanceModalKey] = useState<string | null>(null)
  const [translationDifficulty, setTranslationDifficulty] = useState<TranslationDifficulty>(
    initialRunPreset.difficulty,
  )
  const [translationMood, setTranslationMood] = useState<TranslationMood>(initialRunPreset.mood)
  /** Empty string = English (default); POST /jobs omits `language` in that case (same as no `--language`). */
  const [targetLanguageCliCode, setTargetLanguageCliCode] = useState(
    DEFAULT_TARGET_LANGUAGE_CODE,
  )
  const billingExplainerHeroRef = useRef<HTMLElement | null>(null)

  const billing = useMemo(() => {
    void billingTick
    return readBillingSnapshot()
  }, [billingTick])

  /** Sync with `files` on the same render — avoids a blank frame where `files` is set but preview state lags (useEffect). */
  const previews = useMemo<PreviewItem[]>(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  const refreshAuth = useCallback((): Promise<void> => {
    const t = getAccessToken()
    if (!t) {
      setAuthUser(null)
      if (apiBase()) {
        return syncGuestBillingFromServer()
          .then(() => setBillingTick((x) => x + 1))
          .catch(() => {
            /* optional */
          })
      }
      return Promise.resolve()
    }
    return (async () => {
      const u = await fetchMe()
      // Sync billing BEFORE setting authUser so both land in the same React render.
      // Without this, the UI shows "signed in + guest billing" for one render cycle,
      // which makes privileged accounts appear as limited until a refresh.
      await syncBillingFromServer().catch(() => {
        /* billing endpoint optional; stay signed in */
      })
      setAuthUser(u)
      setBillingTick((x) => x + 1)
    })().catch((e) => {
      setAuthUser(null)
      if (e instanceof AuthInvalidError) {
        clearSession()
      }
      throw e instanceof Error ? e : new Error(String(e))
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!getAccessToken()) {
      setAuthBootstrapping(false)
      void refreshAuth().catch(() => {
        /* guest billing sync is optional */
      })
      return () => {
        cancelled = true
      }
    }
    setAuthBootstrapping(true)
    void refreshAuth()
      .catch(() => {
        /* `refreshAuth` rethrows after updating state */
      })
      .finally(() => {
        if (!cancelled) setAuthBootstrapping(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshAuth])

  useEffect(() => {
    applyDocumentSeo({
      title: SEO_SITE_NAME,
      description: SEO_HOME_DESCRIPTION,
      path: '/',
    })
  }, [])

  /** After guest Paddle checkout, webhooks can lag; re-fetch guest entitlements a few times and on focus. */
  useEffect(() => {
    if (!apiBase()) return
    const syncGuest = () => {
      if (getAccessToken()) return
      void syncGuestBillingFromServer().then((ok) => {
        if (ok) setBillingTick((t) => t + 1)
      })
    }
    syncGuest()
    const timeouts = [2000, 6000, 15000].map((ms) => window.setTimeout(syncGuest, ms))
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncGuest()
    }
    const onPageShow = (e: Event) => {
      if ((e as PageTransitionEvent).persisted) syncGuest()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      timeouts.forEach((id) => clearTimeout(id))
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  /** If Paddle returns to home with ?_ptxn=, activate credits without opening /pay again. */
  useEffect(() => {
    if (!apiBase()) return
    const q = new URLSearchParams(window.location.search)
    const tx = q.get('_ptxn')?.trim()
    if (!tx?.startsWith('txn_')) return
    let cancelled = false
    void (async () => {
      try {
        if (getAccessToken()) {
          await claimUserPaidTransaction(tx)
        } else {
          await claimGuestPaidTransaction(tx)
        }
        if (cancelled) return
        window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
        setBillingTick((t) => t + 1)
      } catch {
        /* Pay page or webhooks may still apply */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const shakeBillingExplainerHero = useCallback(() => {
    const el = billingExplainerHeroRef.current
    if (!el) return
    el.classList.remove('billing-explainer--shake')
    void el.offsetWidth
    el.classList.add('billing-explainer--shake')
    el.addEventListener(
      'animationend',
      () => {
        el.classList.remove('billing-explainer--shake')
      },
      { once: true },
    )
  }, [])

  const replaceFilesFromList = useCallback(
    (list: FileList | File[] | null) => {
      if (list == null) return
      const arr = Array.isArray(list) ? list : Array.from(list)
      if (arr.length === 0) return
      let deduped = dedupeImageFiles(arr)
      const snap = readBillingSnapshot()
      const signedIn = Boolean(getAccessToken())
      if (!canMultiImageUploadForSession(snap, signedIn) && deduped.length > 1) {
        deduped = [deduped[0]]
        shakeBillingExplainerHero()
      }
      setResultImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setResultExpanded(false)
      preProcessSnapshotRef.current = null
      setFiles(sortImageFilesByNameSequence(deduped))
    },
    [shakeBillingExplainerHero],
  )

  const removeFileAt = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /** Drop / drag anywhere on the page (capture on document so it works over any element). */
  useEffect(() => {
    const hasFilePayload = (dt: DataTransfer | null) =>
      Boolean(dt?.types?.includes('Files'))

    const onDragOver = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'copy'
    }

    const onDragEnter = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return
      e.preventDefault()
      setDragActive(true)
    }

    const onDragLeave = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return
      const rel = e.relatedTarget as Node | null
      if (rel && document.documentElement.contains(rel)) return
      setDragActive(false)
    }

    const onDrop = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const dropped = filesFromDataTransfer(e.dataTransfer)
      if (dropped.length) replaceFilesFromList(dropped)
    }

    const onWindowBlur = () => setDragActive(false)

    const opts: AddEventListenerOptions = { capture: true }
    document.addEventListener('dragover', onDragOver, opts)
    document.addEventListener('dragenter', onDragEnter, opts)
    document.addEventListener('dragleave', onDragLeave, opts)
    document.addEventListener('drop', onDrop, opts)
    window.addEventListener('blur', onWindowBlur)

    return () => {
      document.removeEventListener('dragover', onDragOver, opts)
      document.removeEventListener('dragenter', onDragEnter, opts)
      document.removeEventListener('dragleave', onDragLeave, opts)
      document.removeEventListener('drop', onDrop, opts)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [replaceFilesFromList])

  useEffect(() => {
    setHints((prev) => {
      const next: Record<string, ImageBubbleHint> = {}
      for (const f of files) {
        const k = fileKey(f)
        next[k] = prev[k] ?? defaultImageBubbleHint()
      }
      return next
    })
  }, [files])

  const onPickFiles = (list: FileList | null) => {
    replaceFilesFromList(list)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearAll = () => {
    preProcessSnapshotRef.current = null
    setFiles([])
    setHints({})
    setLoadingPrimary(null)
    setJobError(null)
    setResultExpanded(false)
    setPreviewLightbox(null)
    setResultImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /** Close the result image and return to the upload UI with the same files and hints as before Process. */
  const backFromResult = useCallback(() => {
    const snap = preProcessSnapshotRef.current
    if (snap) {
      setHints(structuredClone(snap))
    }
    preProcessSnapshotRef.current = null
    setResultExpanded(false)
    setResultImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setJobError(null)
    setLoadingPrimary(null)
  }, [])

  const downloadResultPng = useCallback(() => {
    if (!resultImageUrl) return
    const a = document.createElement('a')
    a.href = resultImageUrl
    a.download = 'translated_conversation.png'
    a.rel = 'noopener'
    a.click()
  }, [resultImageUrl])

  const shareResultPng = useCallback(async () => {
    if (!resultImageUrl) return
    try {
      const res = await fetch(resultImageUrl)
      const blob = await res.blob()
      const type =
        blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'image/png'
      const file = new File([blob], 'translated_conversation.png', { type })
      const data: ShareData = {
        files: [file],
        title: 'Translated conversation',
        text: 'Translated chat screenshot',
      }
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data)
        return
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      console.warn('[share]', e)
    }
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const res = await fetch(resultImageUrl)
        const blob = await res.blob()
        const t = blob.type?.startsWith('image/') ? blob.type : 'image/png'
        await navigator.clipboard.write([new ClipboardItem({ [t]: blob })])
        return
      }
    } catch {
      /* fall through to download */
    }
    downloadResultPng()
  }, [resultImageUrl, downloadResultPng])

  const previewOpen = previewLightbox !== null

  useEffect(() => {
    if (!processing && !resultExpanded && !previewOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [processing, resultExpanded, previewOpen])

  useEffect(() => {
    if (!resultExpanded && !previewOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (previewOpen) setPreviewLightbox(null)
      else setResultExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resultExpanded, previewOpen])

  useEffect(() => {
    if (!jobError) return
    requestAnimationFrame(() => {
      jobIssuesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [jobError])

  useEffect(() => {
    if (!processing) return
    setPatienceIdx(0)
  }, [processing])

  useEffect(() => {
    if (!processing) return
    const t = window.setInterval(() => {
      setPatienceIdx((i) => (i + 1) % PATIENCE_LINES.length)
    }, 4500)
    return () => clearInterval(t)
  }, [processing])

  useEffect(() => {
    if (!processing) {
      overloadAbortTriggeredRef.current = false
      setProcessElapsedMs(0)
      setServerProcessElapsedMs(0)
      setPipelineProgress(0)
      setPipelineEtaExtraMs(0)
      return
    }
    const started = Date.now()
    setProcessElapsedMs(0)
    const id = window.setInterval(() => {
      setProcessElapsedMs(Date.now() - started)
    }, 250)
    return () => clearInterval(id)
  }, [processing])

  const pipelineEtaSec = useMemo(
    () => pipelineEtaSecondsRange(processingMood, processingDifficulty),
    [processingDifficulty, processingMood],
  )

  const effectiveProcessElapsedMs = Math.max(processElapsedMs, serverProcessElapsedMs)
  const effectivePipelineEtaSec = useMemo<[number, number]>(() => {
    return addEtaPenaltyToRange(pipelineEtaSec, pipelineEtaExtraMs)
  }, [pipelineEtaExtraMs, pipelineEtaSec])

  /** At least as full as elapsed/upper ETA (capped before done); server `progress` can move it faster. */
  const loadingBarProgress = useMemo(() => {
    if (!processing) return 0
    const hi = effectivePipelineEtaSec[1]
    const timeBased = Math.min(0.92, effectiveProcessElapsedMs / (Math.max(1, hi) * 1000))
    return Math.min(1, Math.max(pipelineProgress, timeBased))
  }, [processing, effectivePipelineEtaSec, effectiveProcessElapsedMs, pipelineProgress])

  const apiUrlConfigured = Boolean(apiBase())

  const signedIn = Boolean(authUser)
  const multiUploadAllowed = canMultiImageUploadForSession(billing, signedIn)
  const planUnlocked = hasPaidJobAccessForSession(billing, signedIn)
  const quotaStuck = subscriptionQuotaStuckForSession(billing, signedIn)
  const subAccess = hasSubscriptionAccessForSession(billing, signedIn)
  const blockReason = processBlockReasonForSession(billing, files.length, signedIn)
  // Keep the preset aligned with the token-backed snapshot while auth is still bootstrapping.
  const runPresetSignedIn = signedIn || authBootstrapping
  const runPresetUnlocked = hasPaidJobAccessForSession(billing, runPresetSignedIn)
  const runPresetContext = runPresetContextForSession(runPresetSignedIn, runPresetUnlocked)

  useEffect(() => {
    if (appliedRunPresetContextRef.current === runPresetContext) return
    appliedRunPresetContextRef.current = runPresetContext
    const preset = runPresetForAccess(runPresetUnlocked)
    setTranslationDifficulty(preset.difficulty)
    setTranslationMood(preset.mood)
  }, [runPresetContext, runPresetUnlocked])

  const billingCopy = useMemo(() => {
    const cap = billing.subscriptionRunsCap ?? 10
    const rem = subscriptionRunsRemaining(billing)
    const tier = subscriptionTierName(billing.paddleSubscriptionPriceId)
    const proUntil = billing.unlimitedUntil
      ? new Date(billing.unlimitedUntil).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null
    const multi = canMultiImageUploadForSession(billing, signedIn)
    const fr = freeRunsRemaining(billing)
    const freeCap = freeRunsCap(billing)
    const uploadLine = multi
      ? 'You can upload multiple images per run.'
      : 'Single-image only — one image per run.'

    let planLong = ''
    if (subAccess && proUntil) {
      const subj = tier ? `Active ${tier} subscription` : 'Active subscription'
      planLong = `${subj} · renews ${proUntil} · ${rem}/${cap} runs left this month`
    } else if (quotaStuck && proUntil) {
      const subj = tier ? `${tier} subscription` : 'Subscription'
      planLong = `${subj} · runs used this month · renews ${proUntil}`
    } else if (billing.paidJobCredits > 0) {
      planLong = !signedIn
        ? `Guest · ${billing.paidJobCredits} paid full run${billing.paidJobCredits === 1 ? '' : 's'} (multi-image)`
        : `One-time credits · ${billing.paidJobCredits} full run${billing.paidJobCredits === 1 ? '' : 's'}`
    } else if (!signedIn) {
      planLong = 'No subscription (guest)'
    } else {
      planLong = 'No active subscription'
    }

    let usageLong = ''
    if (subAccess) {
      usageLong =
        rem === 1
          ? `1 run left this month (of ${cap}). ${uploadLine}`
          : `${rem} runs left this month (of ${cap}). ${uploadLine}`
    } else if (billing.paidJobCredits > 0) {
      const n = billing.paidJobCredits
      usageLong =
        n === 1
          ? `1 paid run available. ${uploadLine}`
          : `${n} paid runs available. ${uploadLine}`
    } else if (quotaStuck && proUntil) {
      usageLong = `You've reached your monthly run limit — included runs renew when your subscription renews (${proUntil}). ${uploadLine}`
    } else if (fr > 0) {
      usageLong =
        fr === 1 && freeCap === 1
          ? `You have 1 free run left. ${uploadLine}`
          : `You have ${fr} free ${fr === 1 ? 'run' : 'runs'} left (out of ${freeCap}). ${uploadLine}`
    } else {
      usageLong = signedIn
        ? `You've reached your free run limit — open Plans to purchase runs or subscribe. ${uploadLine}`
        : `You've reached your free guest try — open Plans to buy a run or sign up for more. ${uploadLine}`
    }

    return { planLong, usageLong }
  }, [billing, signedIn, subAccess, quotaStuck])

  const cancelExecution = useCallback(() => {
    executionCancelledRef.current = true
    uploadAbortRef.current?.abort()
    const id = activeJobIdRef.current
    if (id) {
      void cancelJob(id).catch(() => {
        /* network / already finished */
      })
    }
  }, [])

  useEffect(() => {
    if (!processing || overloadAbortTriggeredRef.current) return
    if (effectiveProcessElapsedMs < OVERLOADED_RUN_ABORT_MS) return
    overloadAbortTriggeredRef.current = true
    setOverloadNoticeOpen(true)
    cancelExecution()
  }, [cancelExecution, effectiveProcessElapsedMs, processing])

  const runProcess = async () => {
    if (files.length === 0) return
    const snap = readBillingSnapshot()
    const br = processBlockReasonForSession(snap, files.length, Boolean(getAccessToken()))
    if (br === 'free_exhausted' || br === 'multi_on_free' || br === 'quota_exhausted') {
      setPaywallReason(br)
      setPaywallOpen(true)
      return
    }
    if (br !== 'none') return
    const base = apiBase()
    if (!base) {
      setJobError(
        'Backend URL is not configured. On Netlify: Site configuration → Environment variables → add VITE_API_BASE_URL (your API root, HTTPS, no trailing slash) → trigger a new deploy. Local: put the same in .env and restart npm run dev.',
      )
      return
    }
    executionCancelledRef.current = false
    overloadAbortTriggeredRef.current = false
    activeJobIdRef.current = null
    uploadAbortRef.current = new AbortController()
    setProcessingMood(translationMood)
    setProcessingDifficulty(translationDifficulty)
    setProcessing(true)
    setResultExpanded(false)
    setPreviewLightbox(null)
    setJobError(null)
    setLoadingPrimary('Uploading…')
    preProcessSnapshotRef.current = structuredClone(hints)
    setResultImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    try {
      const bubbleSummaryText = buildPass1BubbleSummaryText(files, hints)
      const created = await createJob(files, {
        bubbleSummaryText,
        difficulty: translationDifficulty,
        hurryUp: translationMood === 'hurry',
        language:
          targetLanguageCliCode.trim() === DEFAULT_TARGET_LANGUAGE_CODE
            ? undefined
            : targetLanguageCliCode.trim(),
        signal: uploadAbortRef.current.signal,
      })
      const jobId = created.job_id
      if (!jobId) throw new Error('No job_id in response')
      activeJobIdRef.current = jobId
      const abortSignal = uploadAbortRef.current.signal

      const syncJobStatusToUi = (j: JobStatusResponse) => {
        if (typeof j.progress === 'number' && Number.isFinite(j.progress)) {
          setPipelineProgress(Math.max(0, Math.min(1, j.progress)))
        }
        if (typeof j.pipeline_elapsed_sec === 'number' && Number.isFinite(j.pipeline_elapsed_sec)) {
          const elapsedMs = Math.round(j.pipeline_elapsed_sec * 1000)
          setServerProcessElapsedMs((prev) => Math.max(prev, elapsedMs))
        }
        if (typeof j.eta_extra_sec === 'number' && Number.isFinite(j.eta_extra_sec)) {
          setPipelineEtaExtraMs(Math.max(0, Math.round(j.eta_extra_sec * 1000)))
        }
        setLoadingPrimary(loadingPrimaryFromJobStatus(j))
      }

      // POST /jobs already returns queued status + stage_label; apply before first poll.
      syncJobStatusToUi(created)

      const done = await waitForJob(jobId, syncJobStatusToUi, { signal: abortSignal })
      if (done.status === 'cancelled') {
        return
      }
      if (done.status === 'failed') {
        const msg = done.error || 'Pipeline failed'
        const tail = done.traceback ? `\n\n${String(done.traceback).slice(0, 800)}` : ''
        throw new Error(msg + tail)
      }
      const path = done.artifact_urls?.final_image
      if (!path) throw new Error('No final_image in job result')
      setLoadingPrimary('Bringing it all together')
      const blob = await fetchArtifact(path, { signal: abortSignal })
      const url = URL.createObjectURL(blob)
      setResultImageUrl(url)
      setLoadingPrimary(null)
      if (getAccessToken()) {
        let billingSynced = true
        try {
          await syncBillingFromServer()
        } catch (e) {
          billingSynced = false
          console.warn('[billing sync]', e)
        }
        const cons = String(done.billing_consumption || '').toLowerCase()
        if (!billingSynced) {
          if (cons === 'free' || cons === 'credit') {
            recordSuccessfulJob()
          }
        } else {
          const snap = readBillingSnapshot()
          if (
            cons === 'free' &&
            snap.paidJobCredits <= 0 &&
            freeRunsRemaining(snap) > 0
          ) {
            recordSuccessfulJob()
          }
        }
      } else {
        const cons = String(done.billing_consumption || '').toLowerCase()
        const imgCount =
          typeof done.images_count === 'number' && Number.isFinite(done.images_count)
            ? done.images_count
            : files.length
        const synced = await syncGuestBillingFromServer()
        if (!synced) {
          if (cons === 'guest_free' || cons === 'guest_credit') {
            recordSuccessfulJob()
          } else if (!cons && imgCount === 1) {
            recordSuccessfulJob()
          }
        } else {
          const snap = readBillingSnapshot()
          if (
            cons === 'guest_free' &&
            snap.paidJobCredits <= 0 &&
            freeRunsRemaining(snap) > 0
          ) {
            recordSuccessfulJob()
          }
        }
      }
      setBillingTick((t) => t + 1)
    } catch (e) {
      const userStopped =
        executionCancelledRef.current ||
        (e instanceof DOMException && e.name === 'AbortError')
      if (userStopped) {
        setJobError(null)
        setLoadingPrimary(null)
      } else {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[Process]', e)
        if (isServersOverloadedMessage(msg)) {
          setJobError(null)
          setOverloadNoticeOpen(true)
        } else {
          setJobError(msg)
        }
        setLoadingPrimary(null)
      }
    } finally {
      activeJobIdRef.current = null
      uploadAbortRef.current = null
      setProcessing(false)
    }
  }

  const updateHint = useCallback((k: string, patch: Partial<ImageBubbleHint>) => {
    setHints((h) => ({
      ...h,
      [k]: { ...(h[k] ?? defaultImageBubbleHint()), ...patch },
    }))
  }, [])

  const hasPaidAccess = planUnlocked
  const freeExhausted =
    !planUnlocked && !quotaStuck && billing.freeRunsUsed >= freeRunsCap(billing)

  return (
    <>
      {!apiUrlConfigured ? (
        <div
          className="api-mini-notice"
          role="status"
          title="Set VITE_API_BASE_URL at build time (Netlify environment variables + redeploy, or local .env + restart dev server). Use an https:// URL when this site is served over HTTPS."
        >
          <span className="api-mini-notice__dot" aria-hidden />
          <span className="api-mini-notice__text">Backend not linked</span>
        </div>
      ) : null}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={refreshAuth}
        initialTab={authModalTab}
      />

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onApplied={() => setBillingTick((t) => t + 1)}
        isGuest={!authUser}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab)
          setAuthModalOpen(true)
        }}
      />

      <PaywallModal
        open={paywallOpen}
        reason={paywallReason}
        onClose={() => setPaywallOpen(false)}
        onViewPlans={() => setPricingOpen(true)}
      />

      {guidanceModalKey ? (
        <GuidanceInputModal
          open
          fileName={
            previews.find((pv) => fileKey(pv.file) === guidanceModalKey)?.file.name ?? ''
          }
          imageUrl={previews.find((pv) => fileKey(pv.file) === guidanceModalKey)?.url ?? ''}
          messageCount={(hints[guidanceModalKey] ?? defaultImageBubbleHint()).messageCount}
          sequence={(hints[guidanceModalKey] ?? defaultImageBubbleHint()).sequence}
          maxBubbles={MAX_MESSAGE_BUBBLES}
          onDismiss={() => setGuidanceModalKey(null)}
          onSave={(next) => {
            updateHint(guidanceModalKey, next)
            setGuidanceModalKey(null)
          }}
        />
      ) : null}

      {resultImageUrl ? null : <MessengerBackdrop />}
      {dragActive && !resultImageUrl ? (
        <div className="drag-page-hint" aria-hidden>
          <p className="drag-page-hint__text">
            Drop anywhere on the page to add or replace images
          </p>
        </div>
      ) : null}
      <main className="app-shell">
        <div className="app">
          <header className="app-top-bar">
            <nav className="app-top-bar__nav" aria-label="Help and feedback">
              <a className="app-top-bar__link" href="/contact">
                Contact us
              </a>
              <a className="app-top-bar__link" href="/feedback">
                Feedback
              </a>
            </nav>
            <span className="app-top-bar__divider" aria-hidden />
            <div className="app-top-bar__auth">
              {!apiUrlConfigured ? (
                <span className="app-auth-bar__muted">Sign in requires API URL</span>
              ) : authUser ? (
                <>
                  <span className="app-auth-bar__name" title={authUser.email}>
                    {authUser.username ?? authUser.email}
                  </span>
                  <button
                    type="button"
                    className="btn ghost btn--compact"
                    onClick={() => {
                      clearSession()
                      setAuthUser(null)
                      setAuthBootstrapping(false)
                      if (apiBase()) {
                        void syncGuestBillingFromServer().then(() => setBillingTick((t) => t + 1))
                      }
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : authBootstrapping ? (
                <span className="app-auth-bar__muted" aria-live="polite">
                  Signing you in…
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn ghost btn--compact"
                    onClick={() => {
                      setAuthModalTab('signin')
                      setAuthModalOpen(true)
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className="btn primary btn--compact"
                    onClick={() => {
                      setAuthModalTab('signup')
                      setAuthModalOpen(true)
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </header>

              <header className="hero">
                <div className="hero-title-block">
                  <h1 className="hero-brand">
                    <span className="hero-brand__lockup">
                      <img
                        className="hero-brand__mark"
                        src="/translate-chat-mark.svg"
                        alt="Translate Chat"
                        width={44}
                        height={44}
                        decoding="async"
                        fetchPriority="high"
                      />
                      <span className="hero-brand__row">
                        <span className="hero-brand__translate">Translate</span>
                        <span className="hero-brand__chat-pill">Chat</span>
                      </span>
                    </span>
                  </h1>
                  <p className="hero-tagline">
                    Turn your chat screenshots into a translated conversation
                  </p>
                </div>

                <section
                  ref={billingExplainerHeroRef}
                  className={`billing-explainer billing-explainer--hero${hasPaidAccess ? ' billing-explainer--unlocked' : ''}${freeExhausted ? ' billing-explainer--exhausted' : ''}`}
                  aria-label="Usage and plans"
                >
                  <div className="billing-explainer__inner">
                    <div className="billing-explainer__copy">
                      <span className="billing-explainer__eyebrow">Plans &amp; usage</span>
                      <div className="billing-explainer__split">
                        <p className="billing-explainer__split-row">
                          <span className="billing-explainer__dim">Plan</span>
                          {subAccess ? (
                            <span className="billing-explainer__status billing-explainer__status--on billing-explainer__status--inline">
                              Active
                            </span>
                          ) : null}
                          <span className="billing-explainer__value">{billingCopy.planLong}</span>
                        </p>
                        <p className="billing-explainer__split-row">
                          <span className="billing-explainer__dim">Usage</span>
                          <span className="billing-explainer__value">{billingCopy.usageLong}</span>
                        </p>
                      </div>
                    </div>
                    <span className="billing-explainer__cta-row">
                      <button
                        type="button"
                        className="btn btn--compact billing-explainer__cta billing-explainer__cta--pill"
                        onClick={() => setPricingOpen(true)}
                      >
                        View plans
                      </button>
                      <InfoPopover label="Plans, free tier, and billing" align="end">
                        <PlansUsageInfoContent />
                      </InfoPopover>
                    </span>
                  </div>
                </section>

                <div className="lede-with-info lede-with-info--instructions">
                  <div className="hero-instructions">
                    <div className="hero-instructions__platform-row">
                      <ChatReconstructHoverPreview />
                      <HeroPlatformBanner />
                      <InfoPopover label="What Translate Chat does">
                        <ProductInfoContent />
                      </InfoPopover>
                    </div>
                    <div className="hero-instructions__stack">
                      <section className="hero-instruction-card" aria-label="Upload your screenshots">
                        <h3 className="hero-instruction-card__name">
                          <span className="hero-instruction-card__step" aria-hidden>
                            1
                          </span>
                          Upload your screenshots
                        </h3>
                        <div className="hero-instruction-card__body">
                          <p className="hero-instruction-card__line">
                            Add images in conversation order — the first image should match the earliest part of the
                            chat.
                          </p>
                          <p className="hero-instruction-card__line">We support PNG, JPEG, WebP, or BMP.</p>
                        </div>
                      </section>
                      <section className="hero-instruction-card" aria-label="Improve translation quality">
                        <h3 className="hero-instruction-card__name">
                          <span className="hero-instruction-card__step" aria-hidden>
                            2
                          </span>
                          Add details for higher quality translation
                        </h3>
                        <div className="hero-instruction-card__body">
                          <p className="hero-instruction-card__line">
                            For each image, enter the total number of messages (bubbles) that you see.
                          </p>
                          <p className="hero-instruction-card__line">
                            Set the message sequence (who sent each bubble — sender vs receiver).
                          </p>
                          <p className="hero-instruction-card__line hero-instruction-card__line--emphasis">
                            This added guidance helps produce the best results.
                          </p>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <div
                  className={`hero-actions${resultImageUrl ? ' hero-actions--result' : ''}`}
                >
                  {resultImageUrl ? (
                    <>
                      <button type="button" className="btn ghost" onClick={backFromResult}>
                        Back
                      </button>
                      <button type="button" className="btn primary" onClick={downloadResultPng}>
                        Download PNG
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => void shareResultPng()}
                        title="Share the image via your device (Messages, social apps, AirDrop, etc.). If sharing is not available, the image may copy to clipboard or download instead."
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        className="btn danger-outline"
                        onClick={clearAll}
                        title="Clear the result and all uploads"
                      >
                        Start over
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="hero-actions__row hero-actions__row--primary">
                        <button
                          type="button"
                          className="btn primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose images
                        </button>
                        <button
                          type="button"
                          className="btn danger-outline"
                          onClick={clearAll}
                          title="Remove all images and start over"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="btn process"
                          disabled={
                            files.length === 0 ||
                            processing ||
                            !apiUrlConfigured ||
                            blockReason !== 'none'
                          }
                          title={
                            files.length === 0
                              ? 'Upload at least one image to process'
                              : !apiUrlConfigured
                                ? 'Set VITE_API_BASE_URL at build time (see notice on the right)'
                                : blockReason === 'quota_exhausted'
                                  ? 'Included runs used — open Plans or wait for renewal'
                                  : blockReason === 'free_exhausted'
                                    ? 'Free try used — open Plans to purchase or subscribe'
                                    : blockReason === 'multi_on_free'
                                      ? 'Multiple images require a plan'
                                      : 'Run translation job on the API'
                          }
                          onClick={() => void runProcess()}
                        >
                          {processing ? 'Working…' : 'Process'}
                        </button>
                      </div>
                      <div className="hero-actions__post-primary">
                        <div className="hero-actions__language-stack">
                          <span className="hero-actions__language-label" title="Target translation language">
                            Target language
                          </span>
                          <TargetLanguagePicker
                            id={`${inputId}-target-language`}
                            value={targetLanguageCliCode}
                            onChange={setTargetLanguageCliCode}
                          />
                        </div>
                        <div className="hero-actions__row hero-actions__row--secondary">
                          <div className="hero-actions__difficulty-stack">
                            <span
                              className="hero-actions__difficulty-label"
                              title="Choose language difficulty"
                            >
                              Choose language difficulty
                            </span>
                            <fieldset className="difficulty-bar" disabled={processing}>
                              <legend className="sr-only">Translation difficulty</legend>
                              {([1, 2, 3] as const).map((level) => (
                                <label
                                  key={level}
                                  className={`difficulty-bar__seg${
                                    translationDifficulty === level
                                      ? ' difficulty-bar__seg--active'
                                      : ''
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    className="difficulty-bar__input"
                                    name="translation-difficulty"
                                    value={level}
                                    checked={translationDifficulty === level}
                                    onChange={() => setTranslationDifficulty(level)}
                                    aria-label={`Difficulty level ${level}`}
                                  />
                                  <span className="difficulty-bar__face" aria-hidden>
                                    {level}
                                  </span>
                                </label>
                              ))}
                            </fieldset>
                          </div>
                          <InfoPopover label="Recommended languages by difficulty level" align="end">
                            <DifficultyInfoContent />
                          </InfoPopover>
                          <MoodBar mode={translationMood} onMode={setTranslationMood} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </header>

          <div ref={jobIssuesRef} className="job-issues">
            {jobError ? (
              <p className="job-status job-status--error" role="alert">
                {jobError}
              </p>
            ) : null}
          </div>

          <div
            className={`upload-slot${
              files.length > 0 || resultImageUrl ? ' upload-slot--filled' : ''
            }`}
          >
            <div
              className={`drop-zone${dragActive && !resultImageUrl ? ' drop-zone--active' : ''}${
                resultImageUrl ? ' drop-zone--has-result' : files.length > 0 ? ' drop-zone--has-files' : ''
              }`}
            >
              {resultImageUrl ? (
                <div className="drop-zone__result" aria-label="Translated chat result">
                  <button
                    type="button"
                    className="drop-zone__result-expand"
                    onClick={() => setResultExpanded(true)}
                    aria-label="Expand translated result to full screen"
                  >
                    <img src={resultImageUrl} alt="Translated conversation" />
                  </button>
                  <p className="drop-zone__result-hint">Click the image to view full size</p>
                </div>
              ) : files.length === 0 ? (
                <div className="drop-zone__inner">
                  <p className="drop-zone__title">Drag &amp; drop zone</p>
                  <p className="drop-zone__hint">
                    Drop <strong>anywhere on this page</strong> (including the background) or use{' '}
                    <strong>Choose images</strong>. PNG, JPEG, WebP, or BMP.
                  </p>
                </div>
              ) : files.length > 0 ? (
                <div className="drop-zone__previews">
                  <p className="drop-zone__replace-hint">
                    Drop anywhere or use <strong>Choose images</strong> to replace · Reset clears the slot.
                  </p>
                  <section className="preview-section preview-section--in-drop" aria-label="Uploaded images">
                    <div
                      className={`preview-row preview-row--upload-slot${
                        files.length <= 3 ? ' preview-row--upload-slot--fit-three' : ''
                      }`}
                      role="list"
                    >
                {previews.map((p, i) => {
                  const k = fileKey(p.file)
                  const hint = hints[k] ?? defaultImageBubbleHint()
                  const count = hint.messageCount
                  const guidanceSaved = count != null && count >= 1

                  return (
                    <figure
                      key={k}
                      className="preview-card preview-card--with-hints preview-card--drop-pair"
                      role="listitem"
                    >
                      <div className="preview-drop-pair">
                        <div className="preview-thumb-wrap">
                          <DropPairPreviewThumb
                            url={p.url}
                            fileName={p.file.name}
                            order={i + 1}
                            onZoom={() =>
                              setPreviewLightbox({ url: p.url, name: p.file.name })
                            }
                            onRemove={() => removeFileAt(i)}
                          />
                        </div>
                        <div
                          className={
                            guidanceSaved
                              ? 'preview-guidance-strip preview-guidance-strip--set'
                              : 'preview-guidance-strip'
                          }
                        >
                          <p className="preview-guidance-strip__name" title={p.file.name}>
                            {p.file.name}
                          </p>
                          {guidanceSaved ? (
                            <>
                              <div
                                className="preview-guidance-strip__set-indicator"
                                role="img"
                                aria-label={`Guidance saved for ${count} message${count === 1 ? '' : 's'}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width={20}
                                  height={20}
                                  aria-hidden={true}
                                >
                                  <circle cx="12" cy="12" r="11" fill="#16a34a" />
                                  <path
                                    d="M7 12.5 L10.5 16 L17 9"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="preview-guidance-strip__actions">
                                <button
                                  type="button"
                                  className="btn ghost btn--compact preview-guidance-strip__action-btn"
                                  onClick={() => setGuidanceModalKey(k)}
                                  aria-label={`Edit guidance for ${p.file.name}`}
                                >
                                  Edit guidance
                                </button>
                                <button
                                  type="button"
                                  className="btn ghost btn--compact preview-guidance-strip__action-btn"
                                  onClick={() => updateHint(k, defaultImageBubbleHint())}
                                  aria-label={`Clear guidance for ${p.file.name}`}
                                >
                                  Clear guidance
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn primary btn--compact preview-guidance-strip__btn"
                                onClick={() => setGuidanceModalKey(k)}
                              >
                                Add guidance
                              </button>
                              <p className="preview-guidance-strip__status">
                                Optional — improves accuracy
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </figure>
                  )
                })}
              </div>
                  </section>
                </div>
              ) : null}
            </div>
          </div>

          <SiteExploreBar />

          <input
            ref={fileInputRef}
            id={inputId}
            className="sr-only"
            type="file"
            accept={ACCEPT_IMAGES}
            multiple={multiUploadAllowed}
            onChange={(e) => onPickFiles(e.target.files)}
          />
        </div>
      </main>

      {processing ? (
        <div
          className="process-loading"
          role="alertdialog"
          aria-busy="true"
          aria-live="polite"
          aria-labelledby="process-loading-title"
          aria-describedby="process-loading-progress-desc"
        >
          <div className="process-loading__panel">
            <div className="process-loading__spinner" aria-hidden />
            <p id="process-loading-title" className="process-loading__title">
              {loadingPrimary || 'Please wait…'}
            </p>
            <div
              className="process-loading__bar-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(loadingBarProgress * 100)}
              aria-label="Pipeline progress"
            >
              <div
                className="process-loading__bar-fill"
                style={{ width: `${Math.round(loadingBarProgress * 100)}%` }}
              />
            </div>
            <p id="process-loading-progress-desc" className="process-loading__timers" aria-live="polite">
              <span className="process-loading__timer-row">
                Total time{' '}
                <span className="process-loading__timer-value">{formatProcessElapsed(effectiveProcessElapsedMs)}</span>
              </span>
              <span className="process-loading__timer-sep" aria-hidden>
                ·
              </span>
              <span className="process-loading__timer-row">
                <span className="process-loading__timer-value">
                  {formatEstimatedTotalTimeFromRange(effectivePipelineEtaSec)}
                </span>
              </span>
            </p>
            <p
              key={patienceIdx}
              className="process-loading__patience"
              aria-live="polite"
            >
              {PATIENCE_LINES[patienceIdx]}
            </p>
            <button
              type="button"
              className="btn ghost process-loading__cancel"
              onClick={cancelExecution}
            >
              Cancel execution
            </button>
          </div>
        </div>
      ) : null}

      {overloadNoticeOpen ? (
        <div
          className="process-overload-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="process-overload-title"
        >
          <button
            type="button"
            className="process-overload-modal__backdrop"
            aria-label="Close overload notice"
            onClick={() => setOverloadNoticeOpen(false)}
          />
          <div className="process-overload-modal__panel">
            <h2 id="process-overload-title" className="process-overload-modal__title">
              Servers are overloaded
            </h2>
            <p className="process-overload-modal__body">
              We stopped this run because it took too long under heavy load. Please try again later. This run did
              not count against your allowance.
            </p>
            <button
              type="button"
              className="btn primary btn--compact"
              onClick={() => setOverloadNoticeOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {previewLightbox ? (
        <div className="result-lightbox" role="dialog" aria-modal="true" aria-label="Preview image">
          <button
            type="button"
            className="result-lightbox__backdrop"
            aria-label="Close preview"
            onClick={() => setPreviewLightbox(null)}
          />
          <div className="result-lightbox__chrome">
            <div className="result-lightbox__toolbar result-lightbox__toolbar--split">
              <span className="preview-lightbox__name" title={previewLightbox.name}>
                {previewLightbox.name}
              </span>
              <button
                type="button"
                className="btn primary btn--compact"
                onClick={() => setPreviewLightbox(null)}
              >
                Close
              </button>
            </div>
            <div className="result-lightbox__stage">
              <img src={previewLightbox.url} alt={previewLightbox.name} />
            </div>
          </div>
        </div>
      ) : null}

      {resultExpanded && resultImageUrl ? (
        <div className="result-lightbox" role="dialog" aria-modal="true" aria-label="Full size result">
          <button
            type="button"
            className="result-lightbox__backdrop"
            aria-label="Close preview"
            onClick={() => setResultExpanded(false)}
          />
          <div className="result-lightbox__chrome">
            <div className="result-lightbox__toolbar result-lightbox__toolbar--split">
              <span className="result-lightbox__heading">Translated result</span>
              <div className="result-lightbox__toolbar-actions">
                <button type="button" className="btn ghost btn--compact" onClick={downloadResultPng}>
                  Download PNG
                </button>
                <button
                  type="button"
                  className="btn ghost btn--compact"
                  onClick={() => void shareResultPng()}
                >
                  Share
                </button>
                <button
                  type="button"
                  className="btn primary btn--compact"
                  onClick={() => setResultExpanded(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="result-lightbox__stage">
              <img src={resultImageUrl} alt="Translated conversation full size" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
