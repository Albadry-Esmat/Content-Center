// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { deleteFoundationSession, loadFoundationSession, normalizeFoundationSession, saveFoundationSession } from './foundation-session'

const session = {
  schemaVersion: 1 as const,
  packId: 'pack-foundation',
  topicSnapshot: 'Creator workflow',
  notesSnapshot: 'Grounded notes',
  draft: {
    workingAngle: 'A clear workflow',
    audienceProblem: 'Creators need a repeatable plan.',
    intendedPromise: 'Leave with a usable method.',
    keyPoints: ['Start with the problem.'],
    evidenceToCollect: ['A real example.'],
    sourcesToCheck: ['[source to verify]'],
    termsToDefine: ['Foundation notes'],
    openQuestions: ['Which constraint matters most?'],
    verificationReminders: ['Verify every claim.'],
  },
  warnings: ['Review before publishing.'],
  provenance: { providerId: 'openai-compatible-local', providerMode: 'local' as const, model: 'local-model', source: 'ai' as const, generatedAt: '2026-08-18T00:00:00.000Z' },
  edited: true,
  decision: 'appended' as const,
  acceptedSnapshot: 'Creator workflow\u0000Grounded notes',
  updatedAt: '2026-08-18T00:00:00.000Z',
}

beforeEach(() => window.localStorage.clear())

describe('foundation session persistence', () => {
  it('round-trips an editable accepted session without credentials', () => {
    saveFoundationSession(session)
    const restored = loadFoundationSession('pack-foundation')
    const raw = window.localStorage.getItem('albadry_foundation_sessions_v1') || ''

    expect(restored).toMatchObject({ packId: 'pack-foundation', decision: 'appended', acceptedSnapshot: 'Creator workflow\u0000Grounded notes', edited: true })
    expect(raw).toContain('openai-compatible-local')
    expect(raw).not.toContain('apiKey')
    expect(raw).not.toContain('baseUrl')
  })

  it('rejects unsupported provider modes and normalizes legacy missing fields', () => {
    expect(normalizeFoundationSession({ ...session, provenance: { ...session.provenance, providerMode: 'browser-secret', apiKey: 'do-not-store' } })).toMatchObject({ packId: 'pack-foundation', provenance: null })
    const restored = normalizeFoundationSession({ schemaVersion: 1, packId: 'legacy-session', draft: null })
    expect(restored).toMatchObject({ packId: 'legacy-session', decision: 'review', warnings: [], provenance: null, acceptedSnapshot: null })
  })

  it('deletes a saved session by pack id', () => {
    saveFoundationSession(session)
    expect(deleteFoundationSession('pack-foundation')).toHaveLength(0)
    expect(loadFoundationSession('pack-foundation')).toBeNull()
  })
})
