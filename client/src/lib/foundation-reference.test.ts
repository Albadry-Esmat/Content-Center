import { describe, expect, it } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { createDefaultCampaignConfig } from './campaign-config'
import { generateFoundationReference } from './generation-service'
import { normaliseFoundationReference } from './foundation-reference'
import { buildFoundationReferencePrompt } from './prompt-builders'

const completeFoundation = {
  workingAngle: 'A practical explanation for creators who want one clear workflow.',
  audienceProblem: 'Creators need to turn one topic into a useful long-form lesson and related shorts.',
  intendedPromise: 'The viewer will leave with a repeatable planning method.',
  keyPoints: ['Start with the audience problem.', 'Show the workflow.', 'End with a review step.'],
  evidenceToCollect: ['A real workflow example.'],
  sourcesToCheck: ['[source to verify]'],
  termsToDefine: ['Foundation notes'],
  openQuestions: ['Which audience constraint matters most?'],
  verificationReminders: ['Verify every specific claim before publishing.'],
}

describe('foundation/reference generation contract', () => {
  it('builds a structured, review-first prompt with safety boundaries', () => {
    const prompt = buildFoundationReferencePrompt({
      topic: 'Creator workflow',
      notes: 'Use the supplied workflow only.',
      rulesVersion: 'v3.2',
      campaign: createDefaultCampaignConfig(),
      preferences: { scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Build with clarity' },
    })

    expect(prompt.system).toContain('Return ONLY valid JSON')
    expect(prompt.system).toContain('editable planning draft')
    expect(prompt.system).toContain('Do not browse')
    expect(prompt.system).toContain('invent URLs')
    expect(prompt.system).toContain('Arabic')
    expect(prompt.system).toContain('RTL')
    expect(prompt.user).toContain('Creator workflow')
    expect(prompt.user).toContain('preLaunchCount')
    expect(prompt.user).toContain('Use the supplied workflow only.')
  })

  it('normalizes a complete foundation and preserves all review sections', () => {
    const result = normaliseFoundationReference(completeFoundation)

    expect(result.foundation.workingAngle).toContain('practical explanation')
    expect(result.foundation.keyPoints).toHaveLength(3)
    expect(result.foundation.sourcesToCheck).toEqual(['[source to verify]'])
    expect(result.foundation.verificationReminders).toHaveLength(1)
    expect(result.warnings).toEqual([])
  })

  it('returns deterministic warnings and a verification fallback for incomplete output', () => {
    const result = normaliseFoundationReference({ workingAngle: 'Angle', keyPoints: ['One point'] })

    expect(result.warnings).toContain('Missing foundation section: audienceProblem')
    expect(result.warnings).toContain('Missing foundation list: sourcesToCheck')
    expect(result.foundation.verificationReminders[0]).toContain('Verify every specific claim')
  })

  it('returns an AI provenance record for a valid provider response', async () => {
    const result = await generateFoundationReference({
      topic: 'Creator workflow',
      notes: 'Grounded workflow notes.',
      rulesVersion: 'v3.2',
      config: { ...DEFAULT_AI_CONFIG, providerId: 'local-openai-compatible', providerMode: 'local', model: 'local-model' },
      provider: { complete: async () => JSON.stringify(completeFoundation) },
    })

    expect(result.foundation.intendedPromise).toContain('repeatable planning method')
    expect(result.warnings).toEqual([])
    expect(result.truncated).toBe(false)
    expect(result.provenance).toMatchObject({ source: 'ai', providerId: 'local-openai-compatible', providerMode: 'local', model: 'local-model' })
  })
})
