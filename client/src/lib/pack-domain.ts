// Design philosophy: Editorial Control Room — every artifact is editable, traceable, and independently recoverable.

import type { GenerationStage, StageStatus } from './content-types'

export type PartKey = 'long' | `short-${number}`

export type FieldSet = {
  title: string
  promise: string
  audience: string
  hook: string
  story: string
  insight: string
  proof: string
  payoff: string
  cta: string
}

export type ScriptArtifact = { markdown: string; wordCount: number }
export type MontageShot = { tStart: string; tEnd: string; shot: string; camera: string; onScreen: string; note: string }
export type GradeArtifact = { filter: string; intensity: number; exposure: number; contrast: number; saturation: number; temperature: number; notes: string }
export type RunSheetItem = { label: string; done: boolean }
export type StageFeedback = { kind: 'success' | 'warning' | 'fallback' | 'error'; message?: string; createdAt: string }

export type PartState = {
  key: PartKey
  label: string
  stageStatus: Record<GenerationStage, StageStatus>
  fields?: FieldSet
  script?: ScriptArtifact
  montage?: MontageShot[]
  grade?: GradeArtifact
  error?: string
  warnings?: string[]
  stageFeedback?: Partial<Record<GenerationStage, StageFeedback>>
}

export type CombinedPack = {
  schemaVersion: 2
  packVersion: 1
  meta: { id: string; topic: string; notes: string; createdAt: string; updatedAt: string; rulesVersion: string; model: string }
  parts: PartState[]
  runSheet: RunSheetItem[]
}

export type PackAction =
  | { type: 'set-meta'; topic: string; notes: string }
  | { type: 'start-stage'; stage: GenerationStage; partKey: PartKey }
  | { type: 'complete-fields'; partKey: PartKey; fields: FieldSet; warnings?: string[] }
  | { type: 'complete-script'; partKey: PartKey; markdown: string }
  | { type: 'complete-montage'; partKey: PartKey; shots: MontageShot[]; warnings?: string[] }
  | { type: 'complete-grade'; partKey: PartKey; grade: GradeArtifact }
  | { type: 'update-field'; partKey: PartKey; field: keyof FieldSet; value: string }
  | { type: 'update-script'; partKey: PartKey; markdown: string }
  | { type: 'update-montage'; partKey: PartKey; index: number; shot: Partial<MontageShot> }
  | { type: 'update-grade'; partKey: PartKey; grade: Partial<GradeArtifact> }
  | { type: 'stage-error'; stage: GenerationStage; partKey: PartKey; message: string }
  | { type: 'stage-fallback'; stage: GenerationStage; partKey: PartKey; message: string }
  | { type: 'toggle-run-sheet'; index: number }

export function partKeyLabel(key: PartKey): string { return key === 'long' ? 'Long-form' : `Short ${key.replace('short-', '#')}` }

export function createCombinedPack(topic = '', notes = ''): CombinedPack {
  const now = new Date().toISOString()
  const partKeys: PartKey[] = ['long', 'short-1', 'short-2', 'short-3', 'short-4', 'short-5']
  const stageStatus = (): Record<GenerationStage, StageStatus> => ({ fields: 'idle', script: 'idle', montage: 'idle', grade: 'idle' })
  return {
    schemaVersion: 2,
    packVersion: 1,
    meta: { id: `pack-${Date.now()}`, topic, notes, createdAt: now, updatedAt: now, rulesVersion: 'v3.2', model: 'Local / not connected' },
    parts: partKeys.map((key) => ({ key, label: partKeyLabel(key), stageStatus: stageStatus() })),
    runSheet: ['Capture references', 'Record long-form master', 'Cut five short variations', 'Apply global grade', 'Review subtitles and upload copy'].map((label) => ({ label, done: false })),
  }
}

function updatePart(pack: CombinedPack, partKey: PartKey, update: (part: PartState) => PartState): CombinedPack {
  return { ...pack, meta: { ...pack.meta, updatedAt: new Date().toISOString() }, parts: pack.parts.map((part) => part.key === partKey ? update(part) : part) }
}

function markDownstreamStale(status: Record<GenerationStage, StageStatus>, from: GenerationStage): Record<GenerationStage, StageStatus> {
  const order: GenerationStage[] = ['fields', 'script', 'montage', 'grade']
  const start = order.indexOf(from) + 1
  return { ...status, ...Object.fromEntries(order.slice(start).map((stage) => [stage, status[stage] === 'idle' ? 'idle' : 'stale'])) }
}

export function packReducer(pack: CombinedPack, action: PackAction): CombinedPack {
  switch (action.type) {
    case 'set-meta': return { ...pack, meta: { ...pack.meta, topic: action.topic, notes: action.notes, updatedAt: new Date().toISOString() } }
    case 'start-stage': return updatePart(pack, action.partKey, (part) => ({ ...part, error: undefined, stageFeedback: { ...part.stageFeedback, [action.stage]: undefined }, stageStatus: { ...part.stageStatus, [action.stage]: 'running' } }))
    case 'complete-fields': return updatePart(pack, action.partKey, (part) => ({ ...part, fields: action.fields, warnings: action.warnings, stageFeedback: { ...part.stageFeedback, fields: { kind: action.warnings?.length ? 'warning' : 'success', message: action.warnings?.join(' '), createdAt: new Date().toISOString() } }, stageStatus: markDownstreamStale({ ...part.stageStatus, fields: 'done' }, 'fields'), error: undefined }))
    case 'complete-script': return updatePart(pack, action.partKey, (part) => ({ ...part, script: { markdown: action.markdown, wordCount: action.markdown.trim() ? action.markdown.trim().split(/\s+/).length : 0 }, stageFeedback: { ...part.stageFeedback, script: { kind: 'success', createdAt: new Date().toISOString() } }, stageStatus: markDownstreamStale({ ...part.stageStatus, script: 'done' }, 'script'), error: undefined }))
    case 'complete-montage': return updatePart(pack, action.partKey, (part) => ({ ...part, montage: action.shots, warnings: action.warnings, stageFeedback: { ...part.stageFeedback, montage: { kind: action.warnings?.length ? 'warning' : 'success', message: action.warnings?.join(' '), createdAt: new Date().toISOString() } }, stageStatus: { ...part.stageStatus, montage: 'done' }, error: undefined }))
    case 'complete-grade': return updatePart(pack, action.partKey, (part) => ({ ...part, grade: action.grade, stageFeedback: { ...part.stageFeedback, grade: { kind: 'success', createdAt: new Date().toISOString() } }, stageStatus: { ...part.stageStatus, grade: 'done' }, error: undefined }))
    case 'update-field': return updatePart(pack, action.partKey, (part) => ({ ...part, fields: { ...(part.fields || { title: '', promise: '', audience: '', hook: '', story: '', insight: '', proof: '', payoff: '', cta: '' }), [action.field]: action.value }, stageStatus: markDownstreamStale({ ...part.stageStatus, fields: 'done' }, 'fields') }))
    case 'update-script': return updatePart(pack, action.partKey, (part) => ({ ...part, script: { markdown: action.markdown, wordCount: action.markdown.trim() ? action.markdown.trim().split(/\s+/).length : 0 }, stageStatus: markDownstreamStale({ ...part.stageStatus, script: 'done' }, 'script') }))
    case 'update-montage': return updatePart(pack, action.partKey, (part) => ({ ...part, montage: (part.montage || []).map((shot, index) => index === action.index ? { ...shot, ...action.shot } : shot), stageStatus: { ...part.stageStatus, montage: 'done' } }))
    case 'update-grade': return updatePart(pack, action.partKey, (part) => ({ ...part, grade: { ...(part.grade || { filter: '', intensity: 0, exposure: 0, contrast: 0, saturation: 0, temperature: 0, notes: '' }), ...action.grade }, stageStatus: { ...part.stageStatus, grade: 'done' } }))
    case 'stage-error': return updatePart(pack, action.partKey, (part) => ({ ...part, error: action.message, stageFeedback: { ...part.stageFeedback, [action.stage]: { kind: 'error', message: action.message, createdAt: new Date().toISOString() } }, stageStatus: { ...part.stageStatus, [action.stage]: 'error' } }))
    case 'stage-fallback': return updatePart(pack, action.partKey, (part) => ({ ...part, stageFeedback: { ...part.stageFeedback, [action.stage]: { kind: 'fallback', message: action.message, createdAt: new Date().toISOString() } } }))
    case 'toggle-run-sheet': return { ...pack, meta: { ...pack.meta, updatedAt: new Date().toISOString() }, runSheet: pack.runSheet.map((item, index) => index === action.index ? { ...item, done: !item.done } : item) }
  }
}

export function getPart(pack: CombinedPack, key: PartKey): PartState { return pack.parts.find((part) => part.key === key) ?? pack.parts[0] }
