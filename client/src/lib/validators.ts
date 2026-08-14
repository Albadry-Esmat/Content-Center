// Design philosophy: Editorial Control Room — validation makes the hand-off trustworthy without hiding uncertainty.

export function isValidTimecode(value: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(value)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0
}
