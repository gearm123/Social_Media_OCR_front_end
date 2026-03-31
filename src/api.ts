/** Backend base URL, no trailing slash. Set in `.env` as VITE_API_BASE_URL */
export function apiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (base && base.trim()) {
    return base.replace(/\/$/, '')
  }
  return ''
}

export async function fetchHealth(): Promise<{ ok: boolean }> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/health`)
  if (!r.ok) throw new Error(`Health failed: ${r.status}`)
  return r.json() as Promise<{ ok: boolean }>
}

export async function createJob(files: File[]): Promise<Record<string, unknown>> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const fd = new FormData()
  for (const f of files) {
    fd.append('files', f)
  }
  const r = await fetch(`${base}/jobs`, { method: 'POST', body: fd })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Create job failed: ${r.status} ${t}`)
  }
  return r.json() as Promise<Record<string, unknown>>
}

export async function getJob(jobId: string): Promise<Record<string, unknown>> {
  const base = apiBase()
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  const r = await fetch(`${base}/jobs/${jobId}`)
  if (!r.ok) throw new Error(`Get job failed: ${r.status}`)
  return r.json() as Promise<Record<string, unknown>>
}
