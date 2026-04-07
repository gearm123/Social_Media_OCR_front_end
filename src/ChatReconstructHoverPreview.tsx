import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DEMO_RECONSTRUCTION_GIF_PATH,
  DEMO_RECONSTRUCTION_HEIGHT,
  DEMO_RECONSTRUCTION_WIDTH,
} from './demoReconstructionMedia'

const PANEL_Z = 4150
const MARGIN = 12
const GAP = 2
const CLOSE_DELAY_MS = 450
const PANEL_MAX_W = 520

type Pos = {
  top: number
  left: number
  maxW: number
  maxH: number | null
}

function MoviePlayIcon() {
  const uid = useId().replace(/:/g, '')
  const gid = `movie-play-grad-${uid}`

  return (
    <svg
      className="chat-reconstruct-hover__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="0.45" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="7" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect x="2.5" y="10.9" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect x="2.5" y="14.8" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect x="19.3" y="7" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect x="19.3" y="10.9" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect x="19.3" y="14.8" width="2.2" height="2.2" rx="0.4" fill="#475569" opacity="0.9" />
      <rect
        x="6.25"
        y="4.75"
        width="11.5"
        height="14.5"
        rx="2.25"
        fill={`url(#${gid})`}
        stroke="#1e1b4b"
        strokeWidth="0.85"
      />
      <path
        d="M10.2 9.1v5.8l4.9-2.9-4.9-2.9z"
        fill="#ffffff"
        stroke="#f8fafc"
        strokeWidth="0.35"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Circular control to the left of the platform pill: hover/focus shows the reconstruction demo GIF
 * (`public/demonstration-chat-reconstruction.gif`) in a portaled tooltip.
 */
export function ChatReconstructHoverPreview() {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, maxW: PANEL_MAX_W, maxH: null })

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }, [clearCloseTimer])

  const measureAndPlace = useCallback(() => {
    const btn = wrapRef.current?.querySelector('button')
    const inner = innerRef.current
    if (!btn) return

    const r = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const maxW = Math.min(PANEL_MAX_W, vw - 2 * MARGIN)
    const centerX = r.left + r.width / 2
    const left = Math.max(MARGIN, Math.min(centerX - maxW / 2, vw - maxW - MARGIN))

    const naturalH = inner?.scrollHeight ?? 0
    const roomBelow = vh - r.bottom - GAP - MARGIN
    const roomAbove = r.top - GAP - MARGIN

    let top: number
    let maxH: number | null = null

    if (naturalH <= 0) {
      top = r.bottom + GAP
    } else if (naturalH <= roomBelow) {
      top = r.bottom + GAP
    } else if (naturalH <= roomAbove) {
      top = r.top - GAP - naturalH
    } else {
      const preferBelow = roomBelow >= roomAbove
      const cap = Math.max(120, preferBelow ? roomBelow : roomAbove)
      maxH = Math.min(naturalH, cap)
      if (preferBelow) {
        top = r.bottom + GAP
      } else {
        top = r.top - GAP - maxH
      }
    }

    const effectiveH = maxH ?? naturalH
    if (effectiveH > 0 && top + effectiveH > vh - MARGIN) {
      top = Math.max(MARGIN, vh - MARGIN - effectiveH)
    }
    if (top < MARGIN) {
      top = MARGIN
      maxH = vh - 2 * MARGIN
    }

    setPos({ top, left, maxW, maxH })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    measureAndPlace()
    const onReposition = () => measureAndPlace()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    const inner = innerRef.current
    const ro = typeof ResizeObserver !== 'undefined' && inner ? new ResizeObserver(onReposition) : null
    if (inner && ro) ro.observe(inner)
    const id = window.requestAnimationFrame(() => measureAndPlace())
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
      ro?.disconnect()
    }
  }, [open, measureAndPlace])

  const onOpen = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const onPreviewLoad = useCallback(() => {
    window.requestAnimationFrame(() => measureAndPlace())
  }, [measureAndPlace])

  return (
    <>
      <span
        ref={wrapRef}
        className="chat-reconstruct-hover chat-reconstruct-hover--hero-row"
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={onOpen}
        onPointerLeave={scheduleClose}
      >
        <button
          type="button"
          className="chat-reconstruct-hover__trigger chat-reconstruct-hover__trigger--hero"
          aria-label="Preview: chat reconstruction on damaged screens (same clip as the Demonstration page)"
          onFocus={onOpen}
          onBlur={scheduleClose}
        >
          <MoviePlayIcon />
        </button>
      </span>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="chat-reconstruct-hover__panel"
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              maxWidth: pos.maxW,
              maxHeight: pos.maxH ?? undefined,
              zIndex: PANEL_Z,
            }}
            onPointerEnter={onOpen}
            onPointerLeave={scheduleClose}
          >
            <div ref={innerRef} className="chat-reconstruct-hover__panel-inner">
              <img
                className="chat-reconstruct-hover__media"
                src={DEMO_RECONSTRUCTION_GIF_PATH}
                alt=""
                width={DEMO_RECONSTRUCTION_WIDTH}
                height={DEMO_RECONSTRUCTION_HEIGHT}
                loading="eager"
                decoding="async"
                onLoad={onPreviewLoad}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
