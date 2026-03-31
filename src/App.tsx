import { useCallback, useEffect, useId, useRef, useState } from 'react'
import './App.css'
import {
  buildPass1BubbleSummaryText,
  defaultImageBubbleHint,
  type ImageBubbleHint,
} from './bubbleSummary'
import {
  apiBase,
  createJob,
  fetchArtifact,
  waitForJob,
} from './api'
import { fileKey } from './fileUtils'
import { IphoneBubbleSequence } from './IphoneBubbleSequence'
import { MessengerBackdrop } from './MessengerBackdrop'

/** Formats the pipeline is built around (OpenCV-friendly screenshots). */
const ACCEPT_IMAGES =
  'image/png,image/jpeg,image/jpg,image/webp,image/bmp,.png,.jpg,.jpeg,.webp,.bmp'

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'])

function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true
  return /\.(png|jpe?g|webp|bmp)$/i.test(file.name)
}

const MAX_MESSAGE_BUBBLES = 30

function resizeSequence(
  prev: ImageBubbleHint['sequence'],
  n: number,
): ImageBubbleHint['sequence'] {
  const out = prev.slice(0, n)
  while (out.length < n) out.push('receiver')
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

function App() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const [hints, setHints] = useState<Record<string, ImageBubbleHint>>({})
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [jobMessage, setJobMessage] = useState<string | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)

  const replaceFilesFromList = useCallback((list: FileList | File[] | null) => {
    if (!list || (list instanceof FileList && !list.length)) return
    const arr = Array.from(list as FileList | File[])
    setFiles(dedupeImageFiles(arr))
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
      if (e.dataTransfer?.files?.length) {
        replaceFilesFromList(e.dataTransfer.files)
      }
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

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPreviews(next)
    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [files])

  const onPickFiles = (list: FileList | null) => {
    replaceFilesFromList(list)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearAll = () => {
    setFiles([])
    setHints({})
    setJobMessage(null)
    setJobError(null)
    setResultImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const runProcess = async () => {
    if (files.length === 0) return
    const base = apiBase()
    if (!base) {
      setJobError(
        'Set VITE_API_BASE_URL (e.g. http://127.0.0.1:8000) in .env for local API, then restart dev server.',
      )
      return
    }
    setProcessing(true)
    setJobError(null)
    setJobMessage('Uploading…')
    setResultImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    try {
      const bubbleSummaryText = buildPass1BubbleSummaryText(files, hints)
      const created = await createJob(files, { bubbleSummaryText })
      const jobId = created.job_id
      if (!jobId) throw new Error('No job_id in response')
      setJobMessage('Processing on server…')
      const done = await waitForJob(jobId)
      if (done.status === 'failed') {
        const msg = done.error || 'Pipeline failed'
        const tail = done.traceback ? `\n\n${String(done.traceback).slice(0, 800)}` : ''
        throw new Error(msg + tail)
      }
      const path = done.artifact_urls?.final_image
      if (!path) throw new Error('No final_image in job result')
      setJobMessage('Loading result…')
      const blob = await fetchArtifact(path)
      const url = URL.createObjectURL(blob)
      setResultImageUrl(url)
      setJobMessage(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setJobError(msg)
      setJobMessage(null)
    } finally {
      setProcessing(false)
    }
  }

  const updateHint = useCallback((k: string, patch: Partial<ImageBubbleHint>) => {
    setHints((h) => ({
      ...h,
      [k]: { ...(h[k] ?? defaultImageBubbleHint()), ...patch },
    }))
  }, [])

  return (
    <>
      <MessengerBackdrop />
      {dragActive ? (
        <div className="drag-page-hint" aria-hidden>
          <p className="drag-page-hint__text">
            {files.length > 0 ? 'Drop to replace with new images' : 'Drop anywhere to add images'}
          </p>
        </div>
      ) : null}
      <div className="app-shell">
        <div className={`app${files.length > 0 ? ' app--has-files' : ''}`}>
          <header className="hero">
            <p className="eyebrow">Translate Chat</p>
            <h1>Turn chat screenshots into a translated conversation</h1>
            {files.length === 0 ? (
              <p className="lede">
                Upload your screenshots in order (first file = first page). We support PNG, JPEG, WebP,
                and BMP — the same formats the backend pipeline expects.
              </p>
            ) : (
              <p className="lede lede--when-files">
                <span className="lede--when-files__muted">
                  Choose images again or drop files to <strong>replace</strong> this set · PNG, JPEG, WebP,
                  BMP
                </span>
              </p>
            )}
            <div className="hero-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose images
              </button>
              {files.length > 0 ? (
                <button type="button" className="btn ghost" onClick={clearAll}>
                  Clear all
                </button>
              ) : null}
              <button
                type="button"
                className="btn process"
                disabled={files.length === 0 || processing}
                title={
                  files.length === 0
                    ? 'Upload at least one image to process'
                    : apiBase()
                      ? 'Run translation job on the API'
                      : 'Configure VITE_API_BASE_URL in .env'
                }
                onClick={() => void runProcess()}
              >
                {processing ? 'Working…' : 'Process'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              id={inputId}
              className="sr-only"
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </header>

          {files.length === 0 ? (
            <div className={`drop-zone ${dragActive ? 'drop-zone--active' : ''}`}>
              <div className="drop-zone__inner">
                <p className="drop-zone__title">Drag &amp; drop zone</p>
                <p className="drop-zone__hint">
                  Drop <strong>anywhere on this page</strong> (including the background) or use{' '}
                  <strong>Choose images</strong>. PNG, JPEG, WebP, or BMP.
                </p>
              </div>
            </div>
          ) : null}

          {previews.length > 0 ? (
            <section className="preview-section" aria-label="Uploaded images">
              <p className="hints-inline">
                Optional: bubble count + sender/receiver order (top→bottom) improve accuracy — all optional.
              </p>
              <div className="preview-row" role="list">
                {previews.map((p, i) => {
                  const k = fileKey(p.file)
                  const hint = hints[k] ?? defaultImageBubbleHint()
                  const count = hint.messageCount
                  const showSequence = count != null && count >= 1 && hint.sequenceEnabled

                  return (
                    <figure
                      key={`${k}-${i}`}
                      className="preview-card preview-card--with-hints"
                      role="listitem"
                    >
                      <div className="preview-thumb">
                        <span className="preview-thumb__order" aria-hidden>
                          {i + 1}
                        </span>
                        <img src={p.url} alt="" />
                      </div>
                      <figcaption>
                        <span className="preview-name" title={p.file.name}>
                          {p.file.name}
                        </span>
                      </figcaption>
                      <div className="preview-hint-fields">
                        <label className="preview-hint-label" htmlFor={`bubble-count-${k}`}>
                          Bubbles <span className="preview-hint-optional">opt.</span>
                        </label>
                        <div className="preview-count-shell">
                          <span className="preview-count-glyph" aria-hidden>
                            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                              <path
                                d="M8 6.5h12a3.5 3.5 0 013.5 3.5v5a3.5 3.5 0 01-3.5 3.5h-1.2l-2.8 2.1V18.5H8A3.5 3.5 0 014.5 15V10A3.5 3.5 0 018 6.5z"
                                stroke="currentColor"
                                strokeWidth="1.35"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M11 11.5h10M11 14.5h7"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                opacity="0.55"
                              />
                            </svg>
                          </span>
                          <input
                            id={`bubble-count-${k}`}
                            className="preview-count-input"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={MAX_MESSAGE_BUBBLES}
                            placeholder="—"
                            title="Message bubbles visible in this screenshot (1–30)"
                            value={count == null ? '' : String(count)}
                            onChange={(e) => {
                              const raw = e.target.value.trim()
                              if (raw === '') {
                                updateHint(k, {
                                  messageCount: null,
                                  sequence: [],
                                })
                                return
                              }
                              let n = parseInt(raw, 10)
                              if (Number.isNaN(n)) return
                              n = Math.min(MAX_MESSAGE_BUBBLES, Math.max(1, n))
                              updateHint(k, {
                                messageCount: n,
                                sequence: hint.sequenceEnabled
                                  ? resizeSequence(hint.sequence, n)
                                  : [],
                              })
                            }}
                          />
                        </div>
                        {count != null && count >= 1 ? (
                          <label className="preview-hint-check">
                            <input
                              type="checkbox"
                              checked={hint.sequenceEnabled}
                              onChange={(e) => {
                                const on = e.target.checked
                                updateHint(k, {
                                  sequenceEnabled: on,
                                  sequence: on ? resizeSequence(hint.sequence, count) : hint.sequence,
                                })
                              }}
                            />
                            <span>R/S order</span>
                          </label>
                        ) : null}
                        {showSequence ? (
                          <IphoneBubbleSequence
                            count={count}
                            value={hint.sequence}
                            onChange={(seq) => updateHint(k, { sequence: seq })}
                          />
                        ) : null}
                      </div>
                    </figure>
                  )
                })}
              </div>
            </section>
          ) : null}

          {jobMessage ? <p className="job-status job-status--info">{jobMessage}</p> : null}
          {jobError ? (
            <p className="job-status job-status--error" role="alert">
              {jobError}
            </p>
          ) : null}
          {resultImageUrl ? (
            <section className="job-result" aria-label="Translated chat result">
              <h2 className="job-result__title">Result</h2>
              <div className="job-result__frame">
                <img src={resultImageUrl} alt="Translated conversation render" />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default App
