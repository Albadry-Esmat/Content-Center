import type { FoundationReference } from './foundation-reference'
import type { GenerationProvenance } from './generation-provenance'

const FOUNDATION_SESSIONS_KEY = 'albadry_foundation_sessions_v1'

export type FoundationDecision = 'review' | 'kept' | 'appended' | 'replaced' | 'discarded'

export type FoundationSession = {
  schemaVersion: 1
  packId: string
  topicSnapshot: string
  notesSnapshot: string
  draft: FoundationReference | null
  warnings: string[]
  provenance: GenerationProvenance | null
  edited: boolean
  decision: FoundationDecision
  acceptedSnapshot: string | null
  updatedAt: string
}

function cleanText(value: unknown): string { return typeof value === 'string' ? value.trim() : '' }
function cleanList(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [] }

function normalizeDraft(value: unknown): FoundationReference | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<FoundationReference>
  return {
    workingAngle: cleanText(source.workingAngle),
    audienceProblem: cleanText(source.audienceProblem),
    intendedPromise: cleanText(source.intendedPromise),
    keyPoints: cleanList(source.keyPoints),
    evidenceToCollect: cleanList(source.evidenceToCollect),
    sourcesToCheck: cleanList(source.sourcesToCheck),
    termsToDefine: cleanList(source.termsToDefine),
    openQuestions: cleanList(source.openQuestions),
    verificationReminders: cleanList(source.verificationReminders),
  }
}

function normalizeProvenance(value: unknown): GenerationProvenance | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<GenerationProvenance>
  if (typeof source.providerId !== 'string' || typeof source.providerMode !== 'string' || typeof source.model !== 'string' || typeof source.generatedAt !== 'string') return null
  if (source.providerMode !== 'local' && source.providerMode !== 'known-provider') return null
  if (source.source !== 'ai' && source.source !== 'fallback' && source.source !== 'manual') return null
  return { providerId: source.providerId, providerMode: source.providerMode, model: source.model, source: source.source, generatedAt: source.generatedAt }
}

export function normalizeFoundationSession(value: unknown): FoundationSession | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<FoundationSession>
  if (source.schemaVersion !== 1 || typeof source.packId !== 'string' || !source.packId.trim()) return null
  const decision: FoundationDecision = source.decision === 'kept' || source.decision === 'appended' || source.decision === 'replaced' || source.decision === 'discarded' ? source.decision : 'review'
  return {
    schemaVersion: 1,
    packId: source.packId,
    topicSnapshot: typeof source.topicSnapshot === 'string' ? source.topicSnapshot : '',
    notesSnapshot: typeof source.notesSnapshot === 'string' ? source.notesSnapshot : '',
    draft: normalizeDraft(source.draft),
    warnings: cleanList(source.warnings),
    provenance: normalizeProvenance(source.provenance),
    edited: source.edited === true,
    decision,
    acceptedSnapshot: typeof source.acceptedSnapshot === 'string' ? source.acceptedSnapshot : null,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : new Date(0).toISOString(),
  }
}

export function loadFoundationSessions(): FoundationSession[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FOUNDATION_SESSIONS_KEY) || '[]') as unknown
    return Array.isArray(parsed) ? parsed.map(normalizeFoundationSession).filter((item): item is FoundationSession => Boolean(item)) : []
  } catch { return [] }
}

export function loadFoundationSession(packId: string): FoundationSession | null {
  return loadFoundationSessions().find((session) => session.packId === packId) || null
}

export function saveFoundationSession(session: FoundationSession): FoundationSession[] {
  const next = [session, ...loadFoundationSessions().filter((item) => item.packId !== session.packId)].slice(0, 50)
  try { window.localStorage.setItem(FOUNDATION_SESSIONS_KEY, JSON.stringify(next)) } catch { /* UI remains usable when storage is unavailable. */ }
  return next
}

export function deleteFoundationSession(packId: string): FoundationSession[] {
  const next = loadFoundationSessions().filter((session) => session.packId !== packId)
  try { window.localStorage.setItem(FOUNDATION_SESSIONS_KEY, JSON.stringify(next)) } catch { /* no-op */ }
  return next
}
