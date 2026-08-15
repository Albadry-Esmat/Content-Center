// Design philosophy: run state is transient, sequential, and visible; completed artifacts remain in the pack domain.

import { useCallback, useRef, useState } from 'react'
import type { GenerationRun, GenerationTask } from '../lib/generation-progress'
import { runSequentialQueue, type QueueWorker } from '../lib/generation-queue'

export type GenerationTaskWorker = QueueWorker

export function useGenerationRun(worker: GenerationTaskWorker) {
  const [run, setRun] = useState<GenerationRun | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const workerRef = useRef(worker)
  workerRef.current = worker

  const cancel = useCallback(() => controllerRef.current?.abort(), [])
  const recover = useCallback((interruptedRun: GenerationRun) => setRun(interruptedRun), [])

  const start = useCallback(async (tasks: GenerationTask[]) => {
    if (!tasks.length || controllerRef.current) return
    const controller = new AbortController()
    controllerRef.current = controller
    const runId = `run-${Date.now()}`
    try {
      await runSequentialQueue({ id: runId, tasks, signal: controller.signal, worker: (task, signal) => workerRef.current(task, signal), onUpdate: setRun })
    } finally {
      controllerRef.current = null
    }
  }, [])

  return { run, isRunning: Boolean(controllerRef.current), start, cancel, recover }
}
