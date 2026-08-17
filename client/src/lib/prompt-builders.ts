// Design philosophy: Editorial Control Room — prompts are versioned production instructions, not opaque strings.

import type { AiConfig } from './ai-config'
import { shortSlotDescription, type CampaignConfig } from './campaign-config'
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

function campaignContext(partKey: PartKey, campaign?: CampaignConfig): string {
  if (partKey === 'long') return 'Campaign role: main long-form video.'
  const slot = shortSlotDescription(Number(partKey.replace('short-', '')), campaign)
  return `Campaign role: ${slot.phase}; short objective: ${slot.objective}. This short must be appropriate for its publication phase.`
}

export function buildFieldsPrompt(input: { partKey: PartKey; topic: string; notes: string; rulesVersion: string; campaign?: CampaignConfig; preferences?: GenerationPreferences }) {
  const partLabel = input.partKey === 'long' ? 'long-form authority video' : `${input.partKey.replace('short-', 'short #')} discovery video`
  return {
    system: `You are an editorial content strategist. ${buildWritingGuidance(input.preferences)} Return ONLY valid JSON with exactly these keys: title, promise, audience, hook, story, insight, proof, payoff, cta. Never invent specific versions, metrics, or claims that are absent from the grounding notes. Mark uncertainty inside the relevant value with [verification required]. Rules version: ${input.rulesVersion}.`,
    user: `Create editable fields for a ${partLabel}.\n\n${campaignContext(input.partKey, input.campaign)}\n\nTopic:\n${input.topic}\n\nGrounding notes:\n${input.notes || '(none supplied)'}\n\nThe fields must form one coherent editorial argument. One short means one idea; the long-form version must move from story to technical explanation to proof to verdict.`,
  }
}

export function buildFoundationReferencePrompt(input: { topic: string; notes: string; rulesVersion: string; campaign?: CampaignConfig; preferences?: GenerationPreferences }) {
  const campaign = input.campaign
  const campaignShape = campaign ? JSON.stringify({ preLaunchCount: campaign.preLaunchCount, postLaunchCount: campaign.postLaunchCount, preLaunchObjectives: campaign.preLaunchObjectives, postLaunchObjectives: campaign.postLaunchObjectives, platforms: campaign.platforms, montageTool: campaign.montageTool, coloringTool: campaign.coloringTool }) : '(default campaign shape)'
  return {
    system: `You are an editorial research-planning assistant. ${buildWritingGuidance(input.preferences)} Return ONLY valid JSON with exactly these keys: workingAngle, audienceProblem, intendedPromise, keyPoints, evidenceToCollect, sourcesToCheck, termsToDefine, openQuestions, verificationReminders. This is an editable planning draft, not verified research. Do not browse, claim to have checked a source, invent URLs, citations, versions, dates, metrics, or other specific facts. If evidence is missing, use a clear placeholder such as [source to verify] or [verification required]. Keep the plan useful for a long-form video and its pre-launch and post-launch shorts. Rules version: ${input.rulesVersion}.`,
    user: `Create a reviewable foundation and reference plan for this content campaign.\n\nTopic:\n${input.topic || '(not supplied)'}\n\nCurrent grounding notes:\n${input.notes || '(none supplied)'}\n\nCampaign configuration:\n${campaignShape}\n\nThe output should help the creator decide the angle, audience problem, promise, points to cover, evidence to collect, sources to check, terms to define, open questions, and verification reminders. Never treat an unsupported claim as confirmed.`,
  }
}

export function buildScriptPrompt(input: { partKey: PartKey; topic: string; notes: string; fields: FieldSet; campaign?: CampaignConfig; preferences?: GenerationPreferences }) {
  return {
    system: `You are an editorial video script strategist. ${buildWritingGuidance(input.preferences)} Return only Markdown with clear sections for Hook, Story, Technical Breakdown, Proof, Verdict, and CTA, translated naturally when the selected language requires it. Do not invent factual specifics absent from the grounding notes.`,
    user: `Topic: ${input.topic}\n${campaignContext(input.partKey, input.campaign)}\nGrounding notes: ${input.notes || '(none)'}\nFields: ${JSON.stringify(input.fields)}\nPart: ${input.partKey}`,
  }
}
