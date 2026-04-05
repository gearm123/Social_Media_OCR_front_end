import { useEffect, useId, useState } from 'react'
import type { BubbleRole } from './bubbleSummary'
import { IphoneBubbleSequence } from './IphoneBubbleSequence'
import { InfoPopover } from './InfoPopover'
import './GuidanceInputModal.css'

function resizeSequence(prev: BubbleRole[], n: number): BubbleRole[] {
  const out = prev.slice(0, n)
  while (out.length < n) out.push('receiver')
  return out
}

export type GuidanceInputModalProps = {
  open: boolean
  fileName: string
  messageCount: number | null
  sequence: BubbleRole[]
  maxBubbles: number
  onDismiss: () => void
  onSave: (next: { messageCount: number | null; sequence: BubbleRole[] }) => void
}

export function GuidanceInputModal({
  open,
  fileName,
  messageCount,
  sequence,
  maxBubbles,
  onDismiss,
  onSave,
}: GuidanceInputModalProps) {
  const titleId = useId()
  const [draftCount, setDraftCount] = useState<number | null>(null)
  const [draftSeq, setDraftSeq] = useState<BubbleRole[]>([])

  useEffect(() => {
    if (!open) return
    setDraftCount(messageCount)
    setDraftSeq(messageCount != null && messageCount >= 1 ? resizeSequence(sequence, messageCount) : [])
  }, [open, messageCount, sequence])

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
  const needsBodyScroll = showSequence && draftCount >= 11
  const useTwoColGrid = showSequence && draftCount >= 5 && draftCount <= 10

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

        <div
          className={
            needsBodyScroll ? 'guidance-modal__body guidance-modal__body--scroll' : 'guidance-modal__body guidance-modal__body--fit'
          }
        >
          <div className="guidance-modal__field">
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
          </div>

          {showSequence ? (
            <div className="guidance-modal__field guidance-modal__field--sequence">
              <p className="guidance-modal__sequence-intro">
                For each bubble from <strong>top</strong> to <strong>bottom</strong>, choose receiver or sender.
              </p>
              <div
                className={
                  useTwoColGrid
                    ? 'guidance-modal__sequence guidance-modal__sequence--two-col'
                    : 'guidance-modal__sequence'
                }
              >
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

        <div className="guidance-modal__actions">
          <button type="button" className="btn ghost" onClick={onDismiss}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleSave}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
