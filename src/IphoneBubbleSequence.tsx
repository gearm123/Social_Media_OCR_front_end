import { useId } from 'react'
import type { BubbleRole } from './bubbleSummary'
import './IphoneBubbleSequence.css'

type Props = {
  count: number
  value: BubbleRole[]
  onChange: (next: BubbleRole[]) => void
}

/** Sender/receiver sequence: compact segmented rows (screen order top → bottom). */
export function IphoneBubbleSequence({ count, value, onChange }: Props) {
  const descId = useId()
  const seq: BubbleRole[] = Array.from({ length: count }, (_, i) => value[i] ?? 'receiver')

  const setAt = (index: number, role: BubbleRole) => {
    if (seq[index] === role) return
    const next = [...seq]
    next[index] = role
    onChange(next)
  }

  return (
    <div className="bubble-seq" aria-describedby={descId}>
      <p id={descId} className="bubble-seq__sr-only">
        For each chat bubble from top to bottom in this screenshot, choose receiver or sender.
      </p>
      <div className="bubble-seq__list" role="list">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="bubble-seq__row" role="listitem">
            <span className="bubble-seq__index" aria-hidden>
              {i + 1}
            </span>
            <div
              className="bubble-seq__track"
              role="group"
              aria-label={`Bubble ${i + 1}, top to bottom`}
            >
              <button
                type="button"
                className={`bubble-seq__slot bubble-seq__slot--receiver ${seq[i] === 'receiver' ? 'bubble-seq__slot--active' : ''}`}
                onClick={() => setAt(i, 'receiver')}
              >
                Receiver
              </button>
              <button
                type="button"
                className={`bubble-seq__slot bubble-seq__slot--sender ${seq[i] === 'sender' ? 'bubble-seq__slot--active' : ''}`}
                onClick={() => setAt(i, 'sender')}
              >
                Sender
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
