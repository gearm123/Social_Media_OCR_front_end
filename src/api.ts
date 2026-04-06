import { getAccessToken } from './authStorage'
import { getOrCreateGuestBillingId } from './guestBillingId'

/** Bearer when signed in; else ``X-Guest-Billing-Id`` for billing-enforced guest jobs. */
function jobRequestHeaders(): Record<string, string> {
  const t = getAccessToken()
  if (t) return { Authorization: `Bearer ${t}` }
  return { 'X-Guest-Billing-Id': getOrCreateGuestBillingId() }
}

/** Backend base URL, no trailing slash. Set in `.env` as VITE_API_BASE_URL */
export function apiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (base && base.trim()) {
    return base.replace(/\/$/, '')
  }
  return ''
}

/**
 * Max time to wait for POST /jobs (upload + server saving files + JSON response).
 * Large screenshots on slow links or cold hosts can exceed 2 minutes; default 10 minutes.
 * Override with VITE_CREATE_JOB_TIMEOUT_MS (milliseconds, min 30000, max 1800000).
 */
function createJobTimeoutMs(): number {
  const raw = import.meta.env.VITE_CREATE_JOB_TIMEOUT_MS
  if (raw != null && String(raw).trim() !== '') {
    const n = parseInt(String(raw).trim(), 10)
    if (Number.isFinite(n) && n >= 30_000) {
      return Math.min(n, 1_800_000)
    }
  }
  return 600_000
}

export type JobStatusResponse = {
  job_id: string
  status: string
  stage?: string
  /** Human-readable pipeline step (preferred over mapping `stage` on the client). */
  stage_label?: string
  /** Approximate overall completion 0–1 from the worker. */
  progress?: number
  /** Seconds since pipeline start (from server clock). */
  pipeline_elapsed_sec?: number
  /** ISO timestamp when the current `stage` began (new value when phase changes). */
  phase_started_at?: string
  /** Set at job creation when billing is enforced (`guest_free`, `guest_credit`, etc.). */
  billing_consumption?: string | null
  error?: string
  traceback?: string
  artifact_urls?: Record<string, string>
  images_count?: number
}

export async function fetchHealth(): Promise<{ ok: boolean }> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/health`)
  if (!r.ok) throw new Error(`Health failed: ${r.status}`)
  return r.json() as Promise<{ ok: boolean }>
}

export type CreateJobOptions = {
  bubbleSummaryText?: string | null
  language?: string | null
  /** Pipeline depth 1–3 (matches backend `Form` field `difficulty`). */
  difficulty?: 1 | 2 | 3
  /** Abort upload/create request (e.g. user clicked Cancel before job_id exists). */
  signal?: AbortSignal
}

export async function createJob(
  files: File[],
  options?: CreateJobOptions,
): Promise<JobStatusResponse> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')

  const fd = new FormData()
  for (const f of files) {
    fd.append('files', f)
  }
  const bubble = options?.bubbleSummaryText?.trim()
  if (bubble) {
    fd.append('bubble_summary_text', bubble)
  }
  const lang = options?.language?.trim()
  if (lang) {
    fd.append('language', lang)
  }
  const difficulty = options?.difficulty
  if (difficulty != null) {
    fd.append('difficulty', String(difficulty))
  }

  const controller = new AbortController()
  const timeoutMs = createJobTimeoutMs()
  const tid = setTimeout(() => controller.abort(), timeoutMs)
  const uploadSignal = options?.signal
  const combinedSignal =
    uploadSignal != null ? AbortSignal.any([controller.signal, uploadSignal]) : controller.signal
  let r: Response
  try {
    r = await fetch(`${base}/jobs`, {
      method: 'POST',
      body: fd,
      signal: combinedSignal,
      headers: jobRequestHeaders(),
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      if (uploadSignal?.aborted) {
        throw e
      }
      throw new Error(
        `Upload / create job timed out after ${timeoutMs / 1000}s (large images or a slow network need more time — set VITE_CREATE_JOB_TIMEOUT_MS on the build, e.g. 900000 for 15 minutes).`,
      )
    }
    if (e instanceof TypeError && String(e.message).toLowerCase().includes('fetch')) {
      throw new Error(
        'Network error (could not reach the API). If this site uses HTTPS, the API URL must also be HTTPS. Confirm VITE_API_BASE_URL on Netlify and redeploy.',
      )
    }
    throw e
  } finally {
    clearTimeout(tid)
  }

  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Create job failed: ${r.status} ${t}`)
  }
  return r.json() as Promise<JobStatusResponse>
}

export async function getJob(
  jobId: string,
  options?: { signal?: AbortSignal },
): Promise<JobStatusResponse> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const timeoutController = new AbortController()
  const tid = setTimeout(() => timeoutController.abort(), 120_000)
  const userSignal = options?.signal
  const combinedSignal =
    userSignal != null
      ? AbortSignal.any([timeoutController.signal, userSignal])
      : timeoutController.signal
  let r: Response
  try {
    r = await fetch(`${base}/jobs/${encodeURIComponent(jobId)}`, {
      signal: combinedSignal,
      headers: jobRequestHeaders(),
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      if (userSignal?.aborted) {
        throw e
      }
      throw new Error('Polling timed out — check API URL and network.')
    }
    throw e
  } finally {
    clearTimeout(tid)
  }
  if (!r.ok) throw new Error(`Get job failed: ${r.status}`)
  return r.json() as Promise<JobStatusResponse>
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const onAbort = () => {
      window.clearTimeout(tid)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const tid = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Request cooperative cancel; the worker stops at the next stage boundary. */
export async function cancelJob(jobId: string): Promise<void> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST',
    headers: jobRequestHeaders(),
  })
  if (r.ok) return
  if (r.status === 409) return
  const t = await r.text()
  throw new Error(`Cancel job failed: ${r.status} ${t}`)
}

const POLL_MS = 1000
const MAX_POLLS = 720

/** Poll until status is `completed` or `failed`, or timeout (~12 min). `onPoll` runs after each GET. */
export async function waitForJob(
  jobId: string,
  onPoll?: (j: JobStatusResponse) => void,
  options?: { signal?: AbortSignal },
): Promise<JobStatusResponse> {
  const sig = options?.signal
  for (let i = 0; i < MAX_POLLS; i++) {
    const j = await getJob(jobId, { signal: sig })
    onPoll?.(j)
    if (j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled') {
      return j
    }
    await delay(POLL_MS, sig)
  }
  throw new Error('Job timed out while waiting for completion')
}

/** `path` from `artifact_urls` (e.g. `/jobs/{id}/artifacts/final_image`). */
export async function fetchArtifact(path: string, options?: { signal?: AbortSignal }): Promise<Blob> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const url = path.startsWith('http') ? path : `${base}${path}`
  const timeoutController = new AbortController()
  const tid = setTimeout(() => timeoutController.abort(), 120_000)
  const userSignal = options?.signal
  const combinedSignal =
    userSignal != null
      ? AbortSignal.any([timeoutController.signal, userSignal])
      : timeoutController.signal
  try {
    const r = await fetch(url, { signal: combinedSignal, headers: jobRequestHeaders() })
    if (!r.ok) {
      const t = await r.text()
      throw new Error(`Artifact fetch failed: ${r.status} ${t}`)
    }
    return r.blob()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      if (userSignal?.aborted) {
        throw e
      }
      throw new Error('Downloading the result timed out.')
    }
    throw e
  } finally {
    clearTimeout(tid)
  }
}
