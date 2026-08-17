export const FOUNDATION_REFERENCE_ARRAY_FIELDS = ['keyPoints', 'evidenceToCollect', 'sourcesToCheck', 'termsToDefine', 'openQuestions', 'verificationReminders'] as const

export type FoundationReference = {
  workingAngle: string
  audienceProblem: string
  intendedPromise: string
  keyPoints: string[]
  evidenceToCollect: string[]
  sourcesToCheck: string[]
  termsToDefine: string[]
  openQuestions: string[]
  verificationReminders: string[]
}

export type FoundationReferenceResult = {
  foundation: FoundationReference
  warnings: string[]
}

const REQUIRED_TEXT_FIELDS: Array<keyof Pick<FoundationReference, 'workingAngle' | 'audienceProblem' | 'intendedPromise'>> = ['workingAngle', 'audienceProblem', 'intendedPromise']
const DEFAULT_VERIFICATION_REMINDER = 'Verify every specific claim, metric, version, date, and source before publishing.'

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
}

export function normaliseFoundationReference(input: unknown): FoundationReferenceResult {
  const source = typeof input === 'object' && input !== null && 'foundation' in input ? (input as { foundation: unknown }).foundation : input
  const record = (source && typeof source === 'object' ? source : {}) as Record<string, unknown>
  const warnings: string[] = []
  const foundation: FoundationReference = {
    workingAngle: cleanText(record.workingAngle),
    audienceProblem: cleanText(record.audienceProblem),
    intendedPromise: cleanText(record.intendedPromise),
    keyPoints: cleanList(record.keyPoints),
    evidenceToCollect: cleanList(record.evidenceToCollect),
    sourcesToCheck: cleanList(record.sourcesToCheck),
    termsToDefine: cleanList(record.termsToDefine),
    openQuestions: cleanList(record.openQuestions),
    verificationReminders: cleanList(record.verificationReminders),
  }

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!foundation[field]) warnings.push(`Missing foundation section: ${field}`)
  }
  for (const field of FOUNDATION_REFERENCE_ARRAY_FIELDS) {
    if (!foundation[field].length) warnings.push(`Missing foundation list: ${field}`)
  }
  if (!foundation.verificationReminders.length) foundation.verificationReminders = [DEFAULT_VERIFICATION_REMINDER]
  return { foundation, warnings }
}
