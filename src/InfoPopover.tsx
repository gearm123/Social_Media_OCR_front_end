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

/**
 * Hover or keyboard focus shows the panel. Touch users can tap the trigger (focus-within).
 * Panel is portaled to `document.body` so it always stacks above page content (below modals).
 */
export function InfoPopover({ label, children, align = 'start' }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, maxW: 416 })

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

  const updatePosition = useCallback(() => {
    const root = wrapRef.current
    const btn = root?.querySelector('button')
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const maxW = Math.min(26 * 16, vw - 24)
    const left =
      align === 'end'
        ? Math.max(12, Math.min(r.right - maxW, vw - maxW - 12))
        : Math.max(12, Math.min(r.left, vw - maxW - 12))
    setPos({ top: r.bottom + 6, left, maxW })
  }, [align])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const onReposition = () => updatePosition()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open, updatePosition])

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
              zIndex: PANEL_Z,
            }}
            onPointerEnter={onOpen}
            onPointerLeave={scheduleClose}
          >
            <div className="info-popover__panel-inner">{children}</div>
          </div>,
          document.body,
        )}
    </>
  )
}
