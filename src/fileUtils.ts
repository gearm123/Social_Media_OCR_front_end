export function fileKey(f: File): string {
  return `${f.name}-${f.size}-${f.lastModified}`
}
