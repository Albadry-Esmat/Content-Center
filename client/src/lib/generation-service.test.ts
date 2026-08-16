import { describe, expect, it } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { createDefaultCampaignConfig } from './campaign-config'
import { generateFieldsForPart, generateScriptForPart } from './generation-service'
import { buildFieldsPrompt } from './prompt-builders'

describe('provider-backed fields generation', () => {
  it('builds grounded, JSON-only instructions for a part', () => {
    const prompt = buildFieldsPrompt({ partKey: 'short-2', topic: 'Plugin pipeline', notes: 'Use the post-operation example only.', rulesVersion: 'v3.2', campaign: createDefaultCampaignConfig(), preferences: { scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Build with clarity' } })
    expect(prompt.system).toContain('Return ONLY valid JSON')
    expect(prompt.system).toContain('v3.2')
    expect(prompt.system).toContain('Arabic')
    expect(prompt.system).toContain('RTL')
    expect(prompt.system).toContain('Build with clarity')
    expect(prompt.user).toContain('pre-launch')
    expect(prompt.user).toContain('promise')
    expect(prompt.user).toContain('post-operation example')
  })

  it('normalizes a valid provider response into a typed fields artifact', async () => {
    const result = await generateFieldsForPart({
      partKey: 'long',
      topic: 'Plugin pipeline',
      notes: 'Grounded note',
      rulesVersion: 'v3.2',
      config: { ...DEFAULT_AI_CONFIG, baseUrl: 'http://localhost:1234' },
      provider: { complete: async () => JSON.stringify({ title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' }) },
    })
    expect(result.fields.title).toBe('Title')
    expect(result.warnings).toEqual([])
  })

  it('surfaces missing fields as review warnings instead of failing the whole part', async () => {
    const result = await generateFieldsForPart({
      partKey: 'short-1',
      topic: 'Plugin pipeline',
      notes: '',
      rulesVersion: 'v3.2',
      config: DEFAULT_AI_CONFIG,
      provider: { complete: async () => JSON.stringify({ title: 'Title' }) },
    })
    expect(result.fields.title).toBe('Title')
    expect(result.warnings).toContain('Missing field: promise')
  })

  it('passes language, direction, and optional brand phrases into script generation', async () => {
    let systemPrompt = ''
    await generateScriptForPart({
      partKey: 'long',
      topic: 'Creator workflow',
      notes: 'Only use the supplied production notes.',
      fields: { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' },
      config: { ...DEFAULT_AI_CONFIG, scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count' },
      provider: { complete: async (request) => { systemPrompt = request.messages[0]?.content || ''; return '## Hook\nA grounded draft.' } },
    })
    expect(systemPrompt).toContain('Arabic')
    expect(systemPrompt).toContain('RTL')
    expect(systemPrompt).toContain('Make every idea count')
  })
})
