// Design philosophy: Editorial Control Room — keep the domain model precise, status-aware, and ready for review.

export type GenerationStage = 'fields' | 'script' | 'montage' | 'grade'
export type StageStatus = 'idle' | 'running' | 'done' | 'partial' | 'stale' | 'error'

export type PackMeta = {
  topic: string
  notes: string
  createdAt: string
  rulesVersion: string
  model: string
}

export type PackStage = {
  status: StageStatus
  completedParts: number
  totalParts: number
  lastError?: string
}

export type ContentPack = {
  schemaVersion: 1
  packVersion: 1
  meta: PackMeta
  stages: Record<GenerationStage, PackStage>
}

export const STAGES: Array<{ id: GenerationStage; label: string; detail: string }> = [
  { id: 'fields', label: 'Fields', detail: 'Shape the brief' },
  { id: 'script', label: 'Script', detail: 'Draft the story' },
  { id: 'montage', label: 'Montage', detail: 'Plan the cut' },
  { id: 'grade', label: 'Grade', detail: 'Set the look' },
]

export function createEmptyPack(topic = ''): ContentPack {
  const stage = (): PackStage => ({ status: 'idle', completedParts: 0, totalParts: 1 })
  return {
    schemaVersion: 1,
    packVersion: 1,
    meta: {
      topic,
      notes: '',
      createdAt: new Date().toISOString(),
      rulesVersion: 'v3.2',
      model: 'Local / not connected',
    },
    stages: { fields: stage(), script: stage(), montage: stage(), grade: stage() },
  }
}
