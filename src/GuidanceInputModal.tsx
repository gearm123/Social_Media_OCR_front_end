import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { BubbleRole } from './bubbleSummary'
import { IphoneBubbleSequence } from './IphoneBubbleSequence'
import { InfoPopover } from './InfoPopover'
import './GuidanceInputModal.css'

function resizeSequence(prev: BubbleRole[], n: number): BubbleRole[] {
  const out = prev.slice(0, n)
  while (out.length < n) out.push('receiver')
  return out
}

const PREVIEW_ZOOM_MIN = 1
const PREVIEW_ZOOM_MAX = 4

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function clampPreviewPan(
  pan: { x: number; y: number },
  zoom: number,
  baseW: number,
  baseH: number,
  vw: number,
  vh: number,
): { x: number; y: number } {
  const W = baseW * zoom
  const H = baseH * zoom
  const maxX = W > vw ? (W - vw) / 2 : 0
  const maxY = H > vh ? (H - vh) / 2 : 0
  return {
    x: clamp(pan.x, -maxX, maxX),
    y: clamp(pan.y, -maxY, maxY),
  }
}

export type GuidanceInputModalProps = {
  open: boolean
  fileName: string
  /** Object URL for the screenshot this guidance applies to */
  imageUrl: string
  messageCount: number | null
  sequence: BubbleRole[]
  maxBubbles: number
  onDismiss: () => void
  onSave: (next: { messageCount: number | null; sequence: BubbleRole[] }) => void
}

export function GuidanceInputModal({
  open,
  fileName,
  imageUrl,
  messageCount,
  sequence,
  maxBubbles,
  onDismiss,
  onSave,
}: GuidanceInputModalProps) {
  const titleId = useId()
  const [draftCount, setDraftCount] = useState<number | null>(null)
  const [draftSeq, setDraftSeq] = useState<BubbleRole[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)
  const previewImgRef = useRef<HTMLImageElement>(null)
  const previewZoomRef = useRef(1)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 })
  /** Display size of the image at zoom 1 (fit inside viewport), in CSS pixels */
  const [previewBaseSize, setPreviewBaseSize] = useState<{ w: number; h: number } | null>(null)
  const previewDragRef = useRef<{ active: boolean; pid: number | null; lastX: number; lastY: number }>({
    active: false,
    pid: null,
    lastX: 0,
    lastY: 0,
  })

  const recomputePreviewBaseSize = useCallback(() => {
    const v = viewportRef.current
    const img = previewImgRef.current
    if (!v || !img || !img.naturalWidth) return
    const vw = Math.max(1, v.clientWidth)
    const vh = Math.max(1, v.clientHeight)
    const r = Math.min(vw / img.naturalWidth, vh / img.naturalHeight)
    setPreviewBaseSize({
      w: img.naturalWidth * r,
      h: img.naturalHeight * r,
    })
  }, [])

  useLayoutEffect(() => {
    previewZoomRef.current = previewZoom
  }, [previewZoom])

  useEffect(() => {
    if (!open) return
    setDraftCount(messageCount)
    setDraftSeq(messageCount != null && messageCount >= 1 ? resizeSequence(sequence, messageCount) : [])
  }, [open, messageCount, sequence])

  useEffect(() => {
    if (!open) return
    previewZoomRef.current = 1
    setPreviewZoom(1)
    setPreviewPan({ x: 0, y: 0 })
    setPreviewBaseSize(null)
  }, [open, imageUrl])

  useLayoutEffect(() => {
    if (!open) return
    const v = viewportRef.current
    if (!v) return
    const ro = new ResizeObserver(() => {
      recomputePreviewBaseSize()
    })
    ro.observe(v)
    return () => ro.disconnect()
  }, [open, imageUrl, recomputePreviewBaseSize])

  useLayoutEffect(() => {
    if (!open || !previewBaseSize) return
    const v = viewportRef.current
    if (!v) return
    const vw = Math.max(1, v.clientWidth)
    const vh = Math.max(1, v.clientHeight)
    setPreviewPan((p) => clampPreviewPan(p, previewZoom, previewBaseSize.w, previewBaseSize.h, vw, vh))
  }, [open, previewZoom, previewBaseSize])

  useEffect(() => {
    if (!open) return
    const el = viewportRef.current
    if (!el) return
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const v = viewportRef.current
      const img = previewImgRef.current
      if (!v || !img?.naturalWidth) return
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      setPreviewZoom((z0) => {
        const z1 = clamp(z0 * factor, PREVIEW_ZOOM_MIN, PREVIEW_ZOOM_MAX)
        previewZoomRef.current = z1
        return z1
      })
    }
    el.addEventListener('wheel', onWheelNative, { passive: false })
    return () => el.removeEventListener('wheel', onWheelNative)
  }, [open, imageUrl])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onDismiss()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null

  const showSequence = draftCount != null && draftCount >= 1
  const countForSeq = showSequence ? draftCount : 0
  /** Scroll the guidance form whenever bubbles are listed. */
  const needsBodyScroll = showSequence

  const handleCountChange = (raw: string) => {
    const t = raw.trim()
    if (t === '') {
      setDraftCount(null)
      setDraftSeq([])
      return
    }
    let n = parseInt(t, 10)
    if (Number.isNaN(n)) return
    n = Math.min(maxBubbles, Math.max(1, n))
    setDraftCount(n)
    setDraftSeq((prev) => resizeSequence(prev, n))
  }

  const handleSave = () => {
    if (draftCount == null || draftCount < 1) {
      onSave({ messageCount: null, sequence: [] })
      return
    }
    onSave({
      messageCount: draftCount,
      sequence: resizeSequence(draftSeq, draftCount),
    })
  }

  const onPreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if (previewZoomRef.current <= PREVIEW_ZOOM_MIN) return
    e.currentTarget.setPointerCapture(e.pointerId)
    previewDragRef.current = {
      active: true,
      pid: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    }
  }

  const onPreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = previewDragRef.current
    if (!d.active || e.pointerId !== d.pid) return
    const dx = e.clientX - d.lastX
    const dy = e.clientY - d.lastY
    d.lastX = e.clientX
    d.lastY = e.clientY
    const v = viewportRef.current
    const base = previewBaseSize
    if (!v || !base) return
    const vw = Math.max(1, v.clientWidth)
    const vh = Math.max(1, v.clientHeight)
    const z = previewZoomRef.current
    setPreviewPan((p) => clampPreviewPan({ x: p.x + dx, y: p.y + dy }, z, base.w, base.h, vw, vh))
  }

  const endPreviewDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = previewDragRef.current
    if (!d.active || e.pointerId !== d.pid) return
    const el = viewportRef.current
    if (el?.hasPointerCapture(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }
    previewDragRef.current = { active: false, pid: null, lastX: 0, lastY: 0 }
  }

  const onPreviewLostPointerCapture = () => {
    previewDragRef.current = { active: false, pid: null, lastX: 0, lastY: 0 }
  }

  return (
    <div className="guidance-modal" role="presentation">
      <button type="button" className="guidance-modal__backdrop" aria-label="Close" onClick={onDismiss} />
      <div
        className="guidance-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="guidance-modal__head">
          <h2 id={titleId} className="guidance-modal__title">
            Guidance for this screenshot
          </h2>
          <button type="button" className="guidance-modal__close" aria-label="Close" onClick={onDismiss}>
            ×
          </button>
        </div>
        <p className="guidance-modal__filename" title={fileName}>
          {fileName}
        </p>

        <div className="guidance-modal__preview">
          <div className="guidance-modal__preview-toolbar">
            <span className="guidance-modal__preview-hint">Scroll to zoom · drag to pan when zoomed</span>
            <div className="guidance-modal__preview-zoom-btns">
              <button
                type="button"
                className="guidance-modal__preview-zoom-btn"
                aria-label="Zoom preview out"
                disabled={previewZoom <= PREVIEW_ZOOM_MIN}
                onClick={() =>
                  setPreviewZoom((z) => {
                    const z1 = clamp(z / 1.2, PREVIEW_ZOOM_MIN, PREVIEW_ZOOM_MAX)
                    previewZoomRef.current = z1
                    return z1
                  })
                }
              >
                −
              </button>
              <span className="guidance-modal__preview-zoom-label" aria-live="polite">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                type="button"
                className="guidance-modal__preview-zoom-btn"
                aria-label="Zoom preview in"
                disabled={previewZoom >= PREVIEW_ZOOM_MAX}
                onClick={() =>
                  setPreviewZoom((z) => {
                    const z1 = clamp(z * 1.2, PREVIEW_ZOOM_MIN, PREVIEW_ZOOM_MAX)
                    previewZoomRef.current = z1
                    return z1
                  })
                }
              >
                +
              </button>
            </div>
          </div>
          <div
            ref={viewportRef}
            className={`guidance-modal__preview-viewport${previewZoom > PREVIEW_ZOOM_MIN ? ' guidance-modal__preview-viewport--pannable' : ''}`}
            onPointerDown={onPreviewPointerDown}
            onPointerMove={onPreviewPointerMove}
            onPointerUp={endPreviewDrag}
            onPointerCancel={endPreviewDrag}
            onLostPointerCapture={onPreviewLostPointerCapture}
          >
            <div
              className="guidance-modal__preview-inner"
              style={{
                transform: `translate(${previewPan.x}px, ${previewPan.y}px) scale(${previewZoom})`,
              }}
            >
              <img
                ref={previewImgRef}
                src={imageUrl}
                alt=""
                className="guidance-modal__preview-img"
                width={previewBaseSize?.w}
                height={previewBaseSize?.h}
                draggable={false}
                onLoad={recomputePreviewBaseSize}
              />
            </div>
          </div>
        </div>

        <div
          className={
            needsBodyScroll ? 'guidance-modal__body guidance-modal__body--scroll' : 'guidance-modal__body guidance-modal__body--fit'
          }
        >
          <div className="guidance-modal__field guidance-modal__field--count-block">
            <div className="guidance-modal__label-row">
              <label className="guidance-modal__label" htmlFor="guidance-modal-total-messages">
                Total text bubbles in this image
              </label>
              <InfoPopover label="Help: total messages" align="start">
                <p className="info-popover__lead">
                  Count every message bubble you see in the screenshot, from top to bottom.
                </p>
              </InfoPopover>
            </div>
            <div className="guidance-modal__count-actions-row">
              <input
                id="guidance-modal-total-messages"
                className="guidance-modal__count-input"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxBubbles}
                placeholder="—"
                title={`How many text bubbles (1–${maxBubbles})`}
                value={draftCount == null ? '' : String(draftCount)}
                onChange={(e) => handleCountChange(e.target.value)}
              />
              <div className="guidance-modal__inline-actions">
                <button type="button" className="btn ghost guidance-modal__action-btn-inline" onClick={onDismiss}>
                  Cancel
                </button>
                <button type="button" className="btn primary guidance-modal__action-btn-inline" onClick={handleSave}>
                  Done
                </button>
              </div>
            </div>
          </div>

          {showSequence ? (
            <div className="guidance-modal__field guidance-modal__field--sequence">
              <p className="guidance-modal__sequence-intro">
                For each bubble from <strong>top</strong> to <strong>bottom</strong>, choose receiver or sender.
              </p>
              <div className="guidance-modal__sequence">
                <IphoneBubbleSequence
                  count={countForSeq}
                  value={resizeSequence(draftSeq, countForSeq)}
                  onChange={setDraftSeq}
                />
              </div>
            </div>
          ) : (
            <p className="guidance-modal__hint">Enter a bubble count above to set the sender/receiver sequence.</p>
          )}
        </div>
      </div>
    </div>
  )
}
