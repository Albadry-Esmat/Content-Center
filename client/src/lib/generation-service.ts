// Design philosophy: Editorial Control Room — generation is observable, cancelable, and validated before it becomes an artifact.

import { loadAiConfig, type AiConfig } from './ai-config'
import { type AiProvider } from './ai-provider'
import { createProviderForConfig } from './provider-registry'
import { parseModelJson, validateMontage } from './ai-parser'
import { buildFieldsPrompt, buildFoundationReferencePrompt, buildScriptPrompt } from './prompt-builders'
import { normaliseFoundationReference, type FoundationReference } from './foundation-reference'
import { createGenerationProvenance } from './generation-provenance'
import type { CampaignConfig } from './campaign-config'
import type { FieldSet, PartKey } from './pack-domain'
import type { GradeArtifact, MontageShot, ScriptArtifact } from './pack-domain'

const REQUIRED_FIELDS: Array<keyof FieldSet> = ['title', 'promise', 'audience', 'hook', 'story', 'insight', 'proof', 'payoff', 'cta']

function normaliseFields(input: unknown): { fields: FieldSet; warnings: string[] } {
  const source = typeof input === 'object' && input !== null && 'fields' in input ? (input as { fields: unknown }).fields : input
  const record = (source && typeof source === 'object' ? source : {}) as Record<string, unknown>
  const warnings: string[] = []
  const fields = Object.fromEntries(REQUIRED_FIELDS.map((key) => {
    const value = typeof record[key] === 'string' ? record[key] as string : ''
    if (!value.trim()) warnings.push(`Missing field: ${key}`)
    return [key, value.trim()]
  })) as FieldSet
  return { fields, warnings }
}

export async function generateFoundationReference(input: { topic: string; notes: string; rulesVersion: string; campaign?: CampaignConfig; config?: AiConfig; provider?: AiProvider; signal?: AbortSignal }): Promise<{ foundation: FoundationReference; warnings: string[]; truncated: boolean; provenance: ReturnType<typeof createGenerationProvenance> }> {
  const config = input.config || loadAiConfig()
  const provider = input.provider || createProviderForConfig(config)
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 120_000)
  const relayAbort = () => controller.abort()
  input.signal?.addEventListener('abort', relayAbort, { once: true })
  try {
    const prompt = buildFoundationReferencePrompt({ ...input, preferences: config })
    const raw = await provider.complete({ baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, maxTokens: config.maxTokens, messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }] }, controller.signal)
    const parsed = parseModelJson<unknown>(raw)
    const result = normaliseFoundationReference(parsed.value)
    return { ...result, warnings: [...parsed.warnings, ...result.warnings], truncated: parsed.truncated, provenance: createGenerationProvenance(config) }
  } finally {
    globalThis.clearTimeout(timeout)
    input.signal?.removeEventListener('abort', relayAbort)
  }
}

export async function generateFieldsForPart(input: { partKey: PartKey; topic: string; notes: string; rulesVersion: string; campaign?: CampaignConfig; config?: AiConfig; provider?: AiProvider; signal?: AbortSignal }) {
  const config = input.config || loadAiConfig()
  const provider = input.provider || createProviderForConfig(config)
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 120_000)
  const relayAbort = () => controller.abort()
  input.signal?.addEventListener('abort', relayAbort, { once: true })
  try {
    const prompt = buildFieldsPrompt({ ...input, preferences: config })
    const raw = await provider.complete({ baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, maxTokens: config.maxTokens, messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }] }, controller.signal)
    const parsed = parseModelJson<unknown>(raw)
    const result = normaliseFields(parsed.value)
    return { ...result, warnings: [...parsed.warnings, ...result.warnings], truncated: parsed.truncated }
  } finally {
    globalThis.clearTimeout(timeout)
    input.signal?.removeEventListener('abort', relayAbort)
  }
}

export async function generateScriptForPart(input: { partKey: PartKey; topic: string; notes: string; fields: FieldSet; campaign?: CampaignConfig; config?: AiConfig; provider?: AiProvider; signal?: AbortSignal }): Promise<ScriptArtifact> {
  const config = input.config || loadAiConfig()
  const provider = input.provider || createProviderForConfig(config)
  const controller = new AbortController(); const timeout = globalThis.setTimeout(() => controller.abort(), 120_000)
  const relayAbort = () => controller.abort(); input.signal?.addEventListener('abort', relayAbort, { once: true })
  try {
    const prompt = buildScriptPrompt({ ...input, preferences: config })
    const markdown = await provider.complete({ baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, maxTokens: config.maxTokens, messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }] }, controller.signal)
    return { markdown: markdown.trim(), wordCount: markdown.trim() ? markdown.trim().split(/\s+/).length : 0 }
  } finally { globalThis.clearTimeout(timeout); input.signal?.removeEventListener('abort', relayAbort) }
}

export async function generateMontageForPart(input: { partKey: PartKey; topic: string; script: ScriptArtifact; config?: AiConfig; provider?: AiProvider; signal?: AbortSignal }): Promise<{ shots: MontageShot[]; warnings: string[] }> {
  const config = input.config || loadAiConfig(); const provider = input.provider || createProviderForConfig(config)
  const controller = new AbortController(); const timeout = globalThis.setTimeout(() => controller.abort(), 120_000)
  const relayAbort = () => controller.abort(); input.signal?.addEventListener('abort', relayAbort, { once: true })
  try {
    const direction = config.textDirection === 'auto' ? 'the natural direction for the selected script language' : `${config.textDirection.toUpperCase()} direction`
    const raw = await provider.complete({ baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, maxTokens: config.maxTokens, messages: [{ role: 'system', content: `Return ONLY valid JSON in the shape {"shots":[{"tStart":"0:00","tEnd":"0:10","shot":"talking-head","camera":"medium-static","onScreen":"","note":""}]}. Timecodes must be ordered and shot names must be concise. Write on-screen copy in ${config.scriptLanguage} using ${direction}.` }, { role: 'user', content: `Topic: ${input.topic}\nPart: ${input.partKey}\nScript: ${input.script.markdown}` }] }, controller.signal)
    const parsed = parseModelJson<{ shots?: MontageShot[] }>(raw); const shots = Array.isArray(parsed.value.shots) ? parsed.value.shots : []
    if (!shots.length) throw new Error('The montage response did not include any shots.')
    return { shots, warnings: validateMontage(shots) }
  } finally { globalThis.clearTimeout(timeout); input.signal?.removeEventListener('abort', relayAbort) }
}

export async function generateGradeForPart(input: { partKey: PartKey; topic: string; script: ScriptArtifact; config?: AiConfig; provider?: AiProvider; signal?: AbortSignal }): Promise<GradeArtifact> {
  const config = input.config || loadAiConfig(); const provider = input.provider || createProviderForConfig(config)
  const controller = new AbortController(); const timeout = globalThis.setTimeout(() => controller.abort(), 120_000)
  const relayAbort = () => controller.abort(); input.signal?.addEventListener('abort', relayAbort, { once: true })
  try {
    const raw = await provider.complete({ baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, maxTokens: config.maxTokens, messages: [{ role: 'system', content: `Return ONLY valid JSON for a color grade with keys filter, intensity, exposure, contrast, saturation, temperature, notes. Keep numbers within sensible CapCut ranges. Write any notes in ${config.scriptLanguage}.` }, { role: 'user', content: `Topic: ${input.topic}\nPart: ${input.partKey}\nScript: ${input.script.markdown}` }] }, controller.signal)
    const parsed = parseModelJson<Partial<GradeArtifact>>(raw)
    return { filter: parsed.value.filter?.trim() || 'No filter selected', intensity: Math.min(100, Math.max(0, parsed.value.intensity ?? 60)), exposure: Math.min(100, Math.max(-100, parsed.value.exposure ?? 0)), contrast: Math.min(100, Math.max(-100, parsed.value.contrast ?? 0)), saturation: Math.min(100, Math.max(-100, parsed.value.saturation ?? 0)), temperature: Math.min(50, Math.max(-50, parsed.value.temperature ?? 0)), notes: parsed.value.notes?.trim() || '' }
  } finally { globalThis.clearTimeout(timeout); input.signal?.removeEventListener('abort', relayAbort) }
}
