import { describe, expect, it } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { generateFieldsForPart } from './generation-service'
import { buildFieldsPrompt } from './prompt-builders'

describe('provider-backed fields generation', () => {
  it('builds grounded, JSON-only instructions for a part', () => {
    const prompt = buildFieldsPrompt({ partKey: 'short-2', topic: 'Plugin pipeline', notes: 'Use the post-operation example only.', rulesVersion: 'v3.2' })
    expect(prompt.system).toContain('Return ONLY valid JSON')
    expect(prompt.system).toContain('v3.2')
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
})
