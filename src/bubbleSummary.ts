import { fileKey } from './fileUtils'

export type BubbleRole = 'sender' | 'receiver'

/** Per-image optional hints for the pipeline pass-1 bubble summary (backend `pass1_bubble_input` format). */
export type ImageBubbleHint = {
  /** Total text bubbles the user counts in the screenshot; null = not provided. */
  messageCount: number | null
  /** If true, show sequence UI; user can turn off to skip order hints. */
  sequenceEnabled: boolean
  /** Length matches messageCount when sequenceEnabled; each slot is sender vs receiver (left/right in typical chats). */
  sequence: BubbleRole[]
}

export function defaultImageBubbleHint(): ImageBubbleHint {
  return { messageCount: null, sequenceEnabled: true, sequence: [] }
}

/**
 * Builds the multiline string expected by the Python pipeline (`pass1_bubble_input.txt` style).
 * For images with no count, uses a minimal placeholder (1 bubble, sender) so image index stays aligned.
 * When count is set but sequence is disabled, repeats `receiver` as a neutral default line per bubble.
 */
export function buildPass1BubbleSummaryText(
  files: File[],
  hints: Record<string, ImageBubbleHint>,
): string {
  const blocks: string[] = []

  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const h = hints[fileKey(f)] ?? defaultImageBubbleHint()
    const img = i + 1

    if (h.messageCount == null || h.messageCount < 1) {
      blocks.push(`in image ${img}`)
      blocks.push(`i count 1 message bubbles`)
      blocks.push('sender')
      continue
    }

    const n = Math.min(99, Math.max(1, Math.floor(h.messageCount)))
    blocks.push(`in image ${img}`)
    blocks.push(`i count ${n} message bubbles`)

    if (h.sequenceEnabled && h.sequence.length === n) {
      for (const role of h.sequence) {
        blocks.push(role)
      }
    } else {
      for (let j = 0; j < n; j++) {
        blocks.push('receiver')
      }
    }
  }

  return blocks.join('\n')
}
