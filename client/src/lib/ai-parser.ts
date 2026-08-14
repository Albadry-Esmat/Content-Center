// Design philosophy: Editorial Control Room — model output is evidence to validate, not trusted blindly.

export type ParsedModel<T> = { value: T; warnings: string[]; truncated: boolean }

export function parseModelJson<T>(raw: string, finishReason?: string): ParsedModel<T> {
  const warnings: string[] = []
  const truncated = finishReason === 'length'
  if (truncated) warnings.push('The model reached its token limit; review and regenerate this part.')
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try { return { value: JSON.parse(cleaned) as T, warnings, truncated } }
  catch {
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first >= 0 && last > first) {
      try { warnings.push('Extra prose around the JSON response was removed.'); return { value: JSON.parse(cleaned.slice(first, last + 1)) as T, warnings, truncated } } catch { /* fall through */ }
    }
    throw new Error('The model returned an invalid JSON artifact.')
  }
}

export function parseTimecode(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function validateMontage(shots: Array<{ tStart: string; tEnd: string }>): string[] {
  const warnings: string[] = []
  shots.forEach((shot, index) => {
    const start = parseTimecode(shot.tStart); const end = parseTimecode(shot.tEnd)
    if (start === null || end === null || end <= start) warnings.push(`Shot ${index + 1} has an invalid timecode range.`)
  })
  return warnings
}

export function clampGrade(input: { intensity?: number; exposure?: number; contrast?: number; saturation?: number; temperature?: number; filter?: string; notes?: string }) {
  const clamp = (value: number | undefined, min: number, max: number) => Math.min(max, Math.max(min, value ?? 0))
  return { filter: input.filter?.trim() || 'No filter selected', intensity: clamp(input.intensity, 0, 100), exposure: clamp(input.exposure, -100, 100), contrast: clamp(input.contrast, -100, 100), saturation: clamp(input.saturation, -100, 100), temperature: clamp(input.temperature, -50, 50), notes: input.notes?.trim() || '' }
}
