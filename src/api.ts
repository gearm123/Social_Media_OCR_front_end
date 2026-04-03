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

export type JobStatusResponse = {
  job_id: string
  status: string
  stage?: string
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

  const controller = new AbortController()
  const timeoutMs = 120_000
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
      throw new Error(
        `Request timed out after ${timeoutMs / 1000}s. Check the API URL, CORS, and that the server is running (cold starts on free hosts can be slow — try again).`,
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

export async function getJob(jobId: string): Promise<JobStatusResponse> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), 60_000)
  let r: Response
  try {
    r = await fetch(`${base}/jobs/${encodeURIComponent(jobId)}`, {
      signal: controller.signal,
      headers: jobRequestHeaders(),
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Polling timed out — check API URL and network.')
    }
    throw e
  } finally {
    clearTimeout(tid)
  }
  if (!r.ok) throw new Error(`Get job failed: ${r.status}`)
  return r.json() as Promise<JobStatusResponse>
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

const POLL_MS = 2000
const MAX_POLLS = 360

/** Poll until status is `completed` or `failed`, or timeout (~12 min). `onPoll` runs after each GET. */
export async function waitForJob(
  jobId: string,
  onPoll?: (j: JobStatusResponse) => void,
): Promise<JobStatusResponse> {
  for (let i = 0; i < MAX_POLLS; i++) {
    const j = await getJob(jobId)
    onPoll?.(j)
    if (j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled') {
      return j
    }
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
  throw new Error('Job timed out while waiting for completion')
}

/** `path` from `artifact_urls` (e.g. `/jobs/{id}/artifacts/final_image`). */
export async function fetchArtifact(path: string): Promise<Blob> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const url = path.startsWith('http') ? path : `${base}${path}`
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), 120_000)
  try {
    const r = await fetch(url, { signal: controller.signal, headers: jobRequestHeaders() })
    if (!r.ok) {
      const t = await r.text()
      throw new Error(`Artifact fetch failed: ${r.status} ${t}`)
    }
    return r.blob()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Downloading the result timed out.')
    }
    throw e
  } finally {
    clearTimeout(tid)
  }
}
