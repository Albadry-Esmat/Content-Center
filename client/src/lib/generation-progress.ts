// Design philosophy: make the full content pack observable without persisting transient queue activity.

import type { GenerationStage } from './content-types'
import type { CombinedPack, PartKey, PartState } from './pack-domain'

export const GENERATION_STAGES: GenerationStage[] = ['fields', 'script', 'montage', 'grade']

export type GenerationTask = {
  id: string
  partKey: PartKey
  stage: GenerationStage
  label: string
}

export type GenerationTaskOutcome = 'queued' | 'running' | 'succeeded' | 'warning' | 'fallback' | 'failed' | 'cancelled'

export type GenerationRunTask = GenerationTask & {
  outcome: GenerationTaskOutcome
  message?: string
  startedAt?: number
  finishedAt?: number
}

export type GenerationRun = {
  id: string
  status: 'idle' | 'running' | 'complete' | 'partial' | 'cancelled'
  tasks: GenerationRunTask[]
  startedAt?: number
  finishedAt?: number
}

export type StageDisplayStatus = 'not-started' | 'blocked' | 'queued' | 'generating' | 'ready-to-review' | 'review-required' | 'needs-refresh' | 'needs-attention'

export type StageProgress = {
  stage: GenerationStage
  partKey: PartKey
  status: StageDisplayStatus
  label: string
  detail: string
}

export type PackProgressSummary = {
  completedSteps: number
  totalSteps: number
  running: number
  queued: number
  blocked: number
  reviewRequired: number
  failed: number
  byStage: Record<GenerationStage, { completed: number; total: number; running: number; queued: number; blocked: number; failed: number }>
}

function taskId(partKey: PartKey, stage: GenerationStage): string { return `${partKey}:${stage}` }

export function createGenerationTask(part: PartState, stage: GenerationStage): GenerationTask {
  return { id: taskId(part.key, stage), partKey: part.key, stage, label: `${part.label} · ${stage}` }
}

export function createStageQueue(pack: CombinedPack, stage: GenerationStage, partKeys = pack.parts.map((part) => part.key)): GenerationTask[] {
  return pack.parts.filter((part) => partKeys.includes(part.key)).map((part) => createGenerationTask(part, stage))
}

export function createRunnableStageQueue(pack: CombinedPack, stage: GenerationStage, partKeys = pack.parts.map((part) => part.key), run?: GenerationRun | null): GenerationTask[] {
  return pack.parts.filter((part) => partKeys.includes(part.key)).filter((part) => {
    const status = getStageProgress(part, stage, run).status
    return status !== 'blocked' && status !== 'generating' && status !== 'queued'
  }).map((part) => createGenerationTask(part, stage))
}

function hasPrerequisite(part: PartState, stage: GenerationStage): boolean {
  if (stage === 'fields') return true
  if (stage === 'script') return Boolean(part.fields)
  return Boolean(part.script)
}

function queuedOutcome(run: GenerationRun | null | undefined, partKey: PartKey, stage: GenerationStage): GenerationTaskOutcome | undefined {
  return run?.tasks.find((task) => task.id === taskId(partKey, stage))?.outcome
}

export function getStageProgress(part: PartState, stage: GenerationStage, run?: GenerationRun | null): StageProgress {
  const runOutcome = queuedOutcome(run, part.key, stage)
  if (runOutcome === 'running') return { stage, partKey: part.key, status: 'generating', label: 'Generating now', detail: 'This task is currently running.' }
  if (runOutcome === 'queued') return { stage, partKey: part.key, status: 'queued', label: 'Queued', detail: 'This task will start after earlier work finishes.' }
  if (runOutcome === 'failed' || part.stageStatus[stage] === 'error') return { stage, partKey: part.key, status: 'needs-attention', label: 'Needs attention', detail: part.stageFeedback?.[stage]?.message || part.error || 'Generation did not complete. Retry or review the connection.' }
  if (part.stageStatus[stage] === 'running') return { stage, partKey: part.key, status: 'generating', label: 'Generating now', detail: 'This task is currently running.' }
  if (part.stageStatus[stage] === 'stale') return { stage, partKey: part.key, status: 'needs-refresh', label: 'Refresh recommended', detail: 'An upstream edit changed this artifact.' }
  if (part.stageStatus[stage] === 'done') {
    const feedback = part.stageFeedback?.[stage]
    if (feedback?.kind === 'warning' || feedback?.kind === 'fallback') return { stage, partKey: part.key, status: 'review-required', label: 'Review required', detail: feedback.message || 'Review this artifact before using it.' }
    return { stage, partKey: part.key, status: 'ready-to-review', label: 'Ready to review', detail: 'This artifact is available to edit or regenerate.' }
  }
  if (!hasPrerequisite(part, stage)) return { stage, partKey: part.key, status: 'blocked', label: 'Needs prerequisite', detail: stage === 'script' ? 'Generate fields before drafting the script.' : 'Generate a script before continuing this stage.' }
  return { stage, partKey: part.key, status: 'not-started', label: 'Not started', detail: 'Ready when you are.' }
}

export function getPackProgress(pack: CombinedPack, run?: GenerationRun | null): PackProgressSummary {
  const initialByStage = Object.fromEntries(GENERATION_STAGES.map((stage) => [stage, { completed: 0, total: pack.parts.length, running: 0, queued: 0, blocked: 0, failed: 0 }])) as PackProgressSummary['byStage']
  let completedSteps = 0; let running = 0; let queued = 0; let blocked = 0; let reviewRequired = 0; let failed = 0
  for (const part of pack.parts) for (const stage of GENERATION_STAGES) {
    const progress = getStageProgress(part, stage, run)
    const summary = initialByStage[stage]
    if (progress.status === 'ready-to-review' || progress.status === 'review-required') { completedSteps += 1; summary.completed += 1 }
    if (progress.status === 'generating') { running += 1; summary.running += 1 }
    if (progress.status === 'queued') { queued += 1; summary.queued += 1 }
    if (progress.status === 'blocked') { blocked += 1; summary.blocked += 1 }
    if (progress.status === 'review-required') reviewRequired += 1
    if (progress.status === 'needs-attention') { failed += 1; summary.failed += 1 }
  }
  return { completedSteps, totalSteps: pack.parts.length * GENERATION_STAGES.length, running, queued, blocked, reviewRequired, failed, byStage: initialByStage }
}

export function getNextRecommendedTask(pack: CombinedPack, run?: GenerationRun | null): GenerationTask | null {
  for (const stage of GENERATION_STAGES) for (const part of pack.parts) {
    const progress = getStageProgress(part, stage, run)
    if (progress.status === 'not-started' || progress.status === 'needs-refresh' || progress.status === 'needs-attention') return createGenerationTask(part, stage)
  }
  return null
}
