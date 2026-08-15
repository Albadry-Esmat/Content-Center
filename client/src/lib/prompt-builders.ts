// Design philosophy: Editorial Control Room — prompts are versioned production instructions, not opaque strings.

import type { AiConfig } from './ai-config'
import type { FieldSet, PartKey } from './pack-domain'

type GenerationPreferences = Pick<AiConfig, 'scriptLanguage' | 'textDirection' | 'brandPhrases'>

function buildWritingGuidance(preferences?: GenerationPreferences): string {
  const language = preferences?.scriptLanguage.trim() || 'English'
  const direction = preferences?.textDirection || 'auto'
  const directionInstruction = direction === 'auto' ? 'Choose the natural reading direction for the selected language.' : `Write for ${direction.toUpperCase()} reading direction.`
  const brandPhrases = preferences?.brandPhrases.trim()
  const brandInstruction = brandPhrases ? `Optional brand phrases: ${brandPhrases}. Use a phrase only when it genuinely fits; never force, repeat, or fabricate a slogan.` : 'No brand phrases are configured.'
  return `Write narrative prose in ${language}. ${directionInstruction} ${brandInstruction}`
}

export function buildFieldsPrompt(input: { partKey: PartKey; topic: string; notes: string; rulesVersion: string; preferences?: GenerationPreferences }) {
  const partLabel = input.partKey === 'long' ? 'long-form authority video' : `${input.partKey.replace('short-', 'short #')} discovery video`
  return {
    system: `You are an editorial content strategist. ${buildWritingGuidance(input.preferences)} Return ONLY valid JSON with exactly these keys: title, promise, audience, hook, story, insight, proof, payoff, cta. Never invent specific versions, metrics, or claims that are absent from the grounding notes. Mark uncertainty inside the relevant value with [verification required]. Rules version: ${input.rulesVersion}.`,
    user: `Create editable fields for a ${partLabel}.\n\nTopic:\n${input.topic}\n\nGrounding notes:\n${input.notes || '(none supplied)'}\n\nThe fields must form one coherent editorial argument. One short means one idea; the long-form version must move from story to technical explanation to proof to verdict.`,
  }
}

export function buildScriptPrompt(input: { partKey: PartKey; topic: string; notes: string; fields: FieldSet; preferences?: GenerationPreferences }) {
  return {
    system: `You are an editorial video script strategist. ${buildWritingGuidance(input.preferences)} Return only Markdown with clear sections for Hook, Story, Technical Breakdown, Proof, Verdict, and CTA, translated naturally when the selected language requires it. Do not invent factual specifics absent from the grounding notes.`,
    user: `Topic: ${input.topic}\nGrounding notes: ${input.notes || '(none)'}\nFields: ${JSON.stringify(input.fields)}\nPart: ${input.partKey}`,
  }
}
