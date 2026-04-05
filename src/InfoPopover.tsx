import {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type Props = {
  /** Accessible name for the trigger, e.g. "About this product" */
  label: string
  children: ReactNode
  /** Optional alignment for the panel (default `info-popover--align-start`) */
  align?: 'start' | 'end'
}

const PANEL_Z = 4150
const MARGIN = 12
const GAP = 6

type Pos = {
  top: number
  left: number
  maxW: number
  maxH: number | null
}

/**
 * Hover or keyboard focus shows the panel. Touch users can tap the trigger (focus-within).
 * Panel is portaled to `document.body` so it always stacks above page content (below modals).
 * Position is clamped to the viewport; flips above the trigger when needed; scrolls when content is tall.
 */
export function InfoPopover({ label, children, align = 'start' }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, maxW: 416, maxH: null })

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 140)
  }, [clearCloseTimer])

  const measureAndPlace = useCallback(() => {
    const btn = wrapRef.current?.querySelector('button')
    const inner = innerRef.current
    if (!btn) return

    const r = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const maxW = Math.min(26 * 16, vw - 2 * MARGIN)
    const left =
      align === 'end'
        ? Math.max(MARGIN, Math.min(r.right - maxW, vw - maxW - MARGIN))
        : Math.max(MARGIN, Math.min(r.left, vw - maxW - MARGIN))

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
      const cap = Math.max(96, preferBelow ? roomBelow : roomAbove)
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
  }, [align])

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

  return (
    <>
      <span
        ref={wrapRef}
        className={`info-popover info-popover--align-${align}`}
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={onOpen}
        onPointerLeave={scheduleClose}
      >
        <button
          type="button"
          className="info-popover__trigger"
          aria-label={label}
          onFocus={onOpen}
          onBlur={scheduleClose}
        >
          <span className="info-popover__glyph" aria-hidden>
            i
          </span>
        </button>
      </span>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`info-popover__panel info-popover--align-${align}`}
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
            <div ref={innerRef} className="info-popover__panel-inner">
              {children}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
