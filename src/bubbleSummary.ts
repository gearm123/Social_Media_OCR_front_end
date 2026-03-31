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
 * Builds the compact multiline string expected by the Python API (`_parse_bubble_summary_text` in main.py):
 * for each image, two lines — bubble count (integer), then roles comma-separated (`sender` / `receiver`).
 * This matches the on-disk `pass1_bubble_input.txt` style (counts + `r,s` lines are accepted server-side too).
 *
 * Local CLI still uses `pass1_bubble_input.txt` when present; the API uses this form field instead.
 */
export function buildPass1BubbleSummaryText(
  files: File[],
  hints: Record<string, ImageBubbleHint>,
): string {
  const lines: string[] = []

  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const h = hints[fileKey(f)] ?? defaultImageBubbleHint()

    if (h.messageCount == null || h.messageCount < 1) {
      lines.push('1')
      lines.push('sender')
      continue
    }

    const n = Math.min(99, Math.max(1, Math.floor(h.messageCount)))
    lines.push(String(n))

    const roles: BubbleRole[] =
      h.sequenceEnabled && h.sequence.length === n
        ? h.sequence
        : Array.from({ length: n }, () => 'receiver' as BubbleRole)

    lines.push(roles.join(','))
  }

  return lines.join('\n')
}
