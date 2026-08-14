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

export type PartState = {
  key: PartKey
  label: string
  stageStatus: Record<GenerationStage, StageStatus>
  fields?: FieldSet
  script?: ScriptArtifact
  montage?: MontageShot[]
  grade?: GradeArtifact
  error?: string
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
  | { type: 'complete-fields'; partKey: PartKey; fields: FieldSet }
  | { type: 'complete-script'; partKey: PartKey; markdown: string }
  | { type: 'complete-montage'; partKey: PartKey; shots: MontageShot[] }
  | { type: 'complete-grade'; partKey: PartKey; grade: GradeArtifact }
  | { type: 'stage-error'; stage: GenerationStage; partKey: PartKey; message: string }
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

export function packReducer(pack: CombinedPack, action: PackAction): CombinedPack {
  switch (action.type) {
    case 'set-meta': return { ...pack, meta: { ...pack.meta, topic: action.topic, notes: action.notes, updatedAt: new Date().toISOString() } }
    case 'start-stage': return updatePart(pack, action.partKey, (part) => ({ ...part, error: undefined, stageStatus: { ...part.stageStatus, [action.stage]: 'running' } }))
    case 'complete-fields': return updatePart(pack, action.partKey, (part) => ({ ...part, fields: action.fields, stageStatus: { ...part.stageStatus, fields: 'done' }, error: undefined }))
    case 'complete-script': return updatePart(pack, action.partKey, (part) => ({ ...part, script: { markdown: action.markdown, wordCount: action.markdown.trim() ? action.markdown.trim().split(/\s+/).length : 0 }, stageStatus: { ...part.stageStatus, script: 'done' }, error: undefined }))
    case 'complete-montage': return updatePart(pack, action.partKey, (part) => ({ ...part, montage: action.shots, stageStatus: { ...part.stageStatus, montage: 'done' }, error: undefined }))
    case 'complete-grade': return updatePart(pack, action.partKey, (part) => ({ ...part, grade: action.grade, stageStatus: { ...part.stageStatus, grade: 'done' }, error: undefined }))
    case 'stage-error': return updatePart(pack, action.partKey, (part) => ({ ...part, error: action.message, stageStatus: { ...part.stageStatus, [action.stage]: 'error' } }))
    case 'toggle-run-sheet': return { ...pack, meta: { ...pack.meta, updatedAt: new Date().toISOString() }, runSheet: pack.runSheet.map((item, index) => index === action.index ? { ...item, done: !item.done } : item) }
  }
}

export function getPart(pack: CombinedPack, key: PartKey): PartState { return pack.parts.find((part) => part.key === key) ?? pack.parts[0] }
