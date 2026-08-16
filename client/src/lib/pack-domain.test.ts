import { describe, expect, it } from 'vitest'
import { createCombinedPack, packReducer } from './pack-domain'
import { deserializeCombinedPacks, serializeCombinedPacks } from './content-storage'
import { clampGrade, parseModelJson, validateMontage } from './ai-parser'
import { createGenerationProvenance } from './generation-provenance'
import { packToMarkdown } from './pack-export'

describe('combined pack domain', () => {
  it('creates eight independently addressable campaign assets', () => {
    const pack = createCombinedPack('Plugin pipeline')
    expect(pack.schemaVersion).toBe(2)
    expect(pack.parts.map((part) => part.key)).toEqual(['long', 'short-1', 'short-2', 'short-3', 'short-4', 'short-5', 'short-6', 'short-7'])
    expect(pack.campaign).toMatchObject({ preLaunchCount: 2, postLaunchCount: 5, montageTool: 'capcut', coloringTool: 'davinci-resolve' })
    expect(pack.runSheet).toHaveLength(5)
  })

  it('stores generation provenance on the completed artifact', () => {
    const pack = createCombinedPack('Plugin pipeline')
    const provenance = createGenerationProvenance({ providerId: 'ollama-local', providerMode: 'local', model: 'llama3' })
    const next = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields: { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' }, provenance })

    expect(next.parts[0].provenance?.fields).toMatchObject({ providerId: 'ollama-local', model: 'llama3', source: 'ai' })
  })

  it('completes a single stage without touching other parts', () => {
    const pack = createCombinedPack('Plugin pipeline')
    const running = packReducer(pack, { type: 'start-stage', stage: 'fields', partKey: 'short-2' })
    const next = packReducer(running, { type: 'complete-fields', partKey: 'short-2', fields: { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' } })
    expect(next.parts.find((part) => part.key === 'short-2')?.stageStatus.fields).toBe('done')
    expect(next.parts.find((part) => part.key === 'long')?.stageStatus.fields).toBe('idle')
  })

  it('exposes running and error states so the editor can render recovery feedback', () => {
    const pack = createCombinedPack('Plugin pipeline')
    const running = packReducer(pack, { type: 'start-stage', stage: 'fields', partKey: 'long' })
    const failed = packReducer(running, { type: 'stage-error', stage: 'fields', partKey: 'long', message: 'AI request failed' })
    expect(running.parts[0].stageStatus.fields).toBe('running')
    expect(failed.parts[0].stageStatus.fields).toBe('error')
    expect(failed.parts[0].error).toBe('AI request failed')
    expect(failed.parts[0].stageFeedback?.fields).toMatchObject({ kind: 'error', message: 'AI request failed' })
  })

  it('preserves explicit local draft fallback provenance after a stage completes', () => {
    const pack = createCombinedPack('Plugin pipeline')
    const completed = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields: { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' } })
    const fallback = packReducer(completed, { type: 'stage-fallback', stage: 'fields', partKey: 'long', message: 'Local draft fallback used. Review before use.' })

    expect(fallback.parts[0].stageStatus.fields).toBe('done')
    expect(fallback.parts[0].stageFeedback?.fields).toMatchObject({ kind: 'fallback', message: 'Local draft fallback used. Review before use.' })
  })

  it('marks dependent artifacts stale when an AI regeneration changes an upstream artifact', () => {
    const initial = createCombinedPack('Plugin pipeline')
    const fields = { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' }
    const scripted = packReducer(packReducer(initial, { type: 'complete-fields', partKey: 'long', fields }), { type: 'complete-script', partKey: 'long', markdown: 'Original script' })
    const completed = packReducer(packReducer(scripted, { type: 'complete-montage', partKey: 'long', shots: [] }), { type: 'complete-grade', partKey: 'long', grade: { filter: 'Neutral', intensity: 50, exposure: 0, contrast: 0, saturation: 0, temperature: 0, notes: '' } })

    const regeneratedFields = packReducer(completed, { type: 'complete-fields', partKey: 'long', fields: { ...fields, hook: 'A new hook' } })
    expect(regeneratedFields.parts[0].stageStatus).toMatchObject({ fields: 'done', script: 'stale', montage: 'stale', grade: 'stale' })

    const regeneratedScript = packReducer(completed, { type: 'complete-script', partKey: 'long', markdown: 'Replacement script' })
    expect(regeneratedScript.parts[0].stageStatus).toMatchObject({ fields: 'done', script: 'done', montage: 'stale', grade: 'stale' })
  })
})

describe('AI response handling', () => {
  it('strips code fences and reports truncation', () => {
    const result = parseModelJson<{ title: string }>('```json\n{"title":"Proof"}\n```', 'length')
    expect(result.value.title).toBe('Proof')
    expect(result.truncated).toBe(true)
    expect(result.warnings[0]).toContain('token limit')
  })

  it('flags invalid montage ranges and clamps grade values', () => {
    expect(validateMontage([{ tStart: '0:10', tEnd: '0:05' }])).toHaveLength(1)
    expect(clampGrade({ intensity: 150, temperature: -80, filter: '' })).toMatchObject({ intensity: 100, temperature: -50, filter: 'No filter selected' })
  })
})

describe('persistence and export', () => {
  it('round-trips only current schema packs', () => {
    const pack = createCombinedPack('Round trip')
    const raw = serializeCombinedPacks([pack, { ...pack, schemaVersion: 1 } as never])
    expect(deserializeCombinedPacks(raw)).toHaveLength(1)
  })

  it('normalizes an older six-part pack into the current campaign shape', () => {
    const pack = createCombinedPack('Legacy campaign')
    const legacy = { ...pack, packVersion: 1, campaign: undefined, parts: pack.parts.slice(0, 6) }
    const restored = deserializeCombinedPacks(JSON.stringify([legacy]))[0]

    expect(restored.parts).toHaveLength(8)
    expect(restored.campaign).toMatchObject({ preLaunchCount: 2, postLaunchCount: 5 })
    expect(restored.parts.at(-1)?.key).toBe('short-7')
  })

  it('exports an artifact-oriented markdown hand-off', () => {
    const pack = createCombinedPack('Export test')
    pack.parts[0].warnings = ['Needs source verification']
    const result = packToMarkdown(pack)
    expect(result).toContain('# ALBADRY CONTENT CAMPAIGN')
    expect(result).toContain('2 pre-launch shorts')
    expect(result).toContain('CapCut (simple)')
    expect(result).toContain('DaVinci Resolve (simple)')
    expect(result).toContain('## 1. Production run-sheet')
    expect(result).toContain('## Long-form')
    expect(result).toContain('Stage completeness')
    expect(result).toContain('## Review gate')
    expect(result).toContain('Review before publishing')
    expect(result).toContain('Needs source verification')
    expect(result.endsWith('\n')).toBe(true)
  })
})
