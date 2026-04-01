/** Filename without extension (last dot separates extension). */
export function fileStem(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot <= 0) return filename
  return filename.slice(0, lastDot)
}

/**
 * Best-effort sequence index from a filename for sorting uploads.
 * 1) Trailing digits on the stem (e.g. IMAGE_3 → 3, shot_001.png → 1).
 * 2) Else the last digit run in the stem (e.g. page_12_final → 12).
 */
export function extractSequenceIndexFromFilename(filename: string): number | null {
  const stem = fileStem(filename).trim()
  if (!stem) return null

  const trailing = stem.match(/(\d+)\s*$/)
  if (trailing) {
    const n = parseInt(trailing[1], 10)
    if (!Number.isNaN(n)) return n
  }

  const runs = stem.match(/\d+/g)
  if (!runs?.length) return null
  const n = parseInt(runs[runs.length - 1], 10)
  return Number.isNaN(n) ? null : n
}

/**
 * Sort by detected sequence numbers only when the heuristic clearly applies:
 * at least two files, every name yields a key, and all keys are unique.
 * Otherwise returns a copy of `files` in the original order.
 */
export function sortImageFilesByNameSequence(files: File[]): File[] {
  if (files.length < 2) return [...files]

  const decorated = files.map((file, index) => ({
    file,
    index,
    key: extractSequenceIndexFromFilename(file.name),
  }))

  if (decorated.some((d) => d.key === null)) {
    return [...files]
  }

  const keys = decorated.map((d) => d.key as number)
  if (new Set(keys).size !== keys.length) {
    return [...files]
  }

  return [...decorated]
    .sort((a, b) => {
      if (a.key !== b.key) return (a.key as number) - (b.key as number)
      return a.index - b.index
    })
    .map((d) => d.file)
}
