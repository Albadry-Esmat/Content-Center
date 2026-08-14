// Design philosophy: Editorial Control Room — prompts are versioned production instructions, not opaque strings.

import type { PartKey } from './pack-domain'

export function buildFieldsPrompt(input: { partKey: PartKey; topic: string; notes: string; rulesVersion: string }) {
  const partLabel = input.partKey === 'long' ? 'long-form authority video' : `${input.partKey.replace('short-', 'short #')} discovery video`
  return {
    system: `You are the Albadry Content Desk fields editor. Write in natural Egyptian Arabic when prose is needed, while keeping common technical terms in English. Return ONLY valid JSON with exactly these keys: title, promise, audience, hook, story, insight, proof, payoff, cta. Never invent specific versions, metrics, or claims that are absent from the grounding notes. Mark uncertainty inside the relevant value with [يتطلب التحقق]. Rules version: ${input.rulesVersion}.`,
    user: `Create editable fields for a ${partLabel}.\n\nTopic:\n${input.topic}\n\nGrounding notes:\n${input.notes || '(none supplied)'}\n\nThe fields must form one coherent editorial argument. One short means one idea; the long-form version must move from story to technical explanation to proof to verdict.`,
  }
}
