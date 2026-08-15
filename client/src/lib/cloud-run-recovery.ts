import type { CombinedPack } from './pack-domain'
import type { GenerationRun } from './generation-progress'
import { recoverInterruptedRun } from './generation-queue'

type CloudRunRecord = {
  id: string
  status: 'running' | 'complete' | 'partial' | 'cancelled'
  tasks: Record<string, unknown>[]
  packData: Record<string, unknown> | null
  startedAt: Date
  finishedAt: Date | null
}

function isCombinedPack(value: Record<string, unknown>): value is CombinedPack {
  return Array.isArray(value.parts) && typeof value.meta === 'object' && value.meta !== null
}

export function recoverLatestCloudRun(runs: CloudRunRecord[]): { pack: CombinedPack; run: GenerationRun } | null {
  const interrupted = runs.find((item) => item.status === 'running' && item.packData && isCombinedPack(item.packData))
  if (!interrupted || !interrupted.packData) return null
  return {
    pack: interrupted.packData as CombinedPack,
    run: recoverInterruptedRun({
      id: interrupted.id,
      status: 'running',
      tasks: interrupted.tasks as unknown as GenerationRun['tasks'],
      startedAt: new Date(interrupted.startedAt).getTime(),
      finishedAt: interrupted.finishedAt ? new Date(interrupted.finishedAt).getTime() : undefined,
    }),
  }
}
