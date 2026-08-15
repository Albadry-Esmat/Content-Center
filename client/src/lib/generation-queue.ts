import type { GenerationRun, GenerationRunTask, GenerationTask, GenerationTaskOutcome } from './generation-progress'

export type QueueWorker = (task: GenerationTask, signal: AbortSignal) => Promise<Extract<GenerationTaskOutcome, 'succeeded' | 'warning' | 'fallback'>>

export type QueueRunOptions = {
  id: string
  tasks: GenerationTask[]
  signal: AbortSignal
  worker: QueueWorker
  onUpdate?: (run: GenerationRun) => void
  now?: () => number
}

function toTaskState(task: GenerationTask, outcome: GenerationTaskOutcome, extras: Partial<GenerationRunTask> = {}): GenerationRunTask {
  return { ...task, outcome, ...extras }
}

export async function runSequentialQueue({ id, tasks, signal, worker, onUpdate, now = Date.now }: QueueRunOptions): Promise<GenerationRun> {
  const startedAt = now()
  let taskStates = tasks.map((task) => toTaskState(task, 'queued'))
  const publish = (status: GenerationRun['status'], finishedAt?: number) => {
    const run = { id, status, tasks: taskStates, startedAt, finishedAt }
    onUpdate?.(run)
    return run
  }
  const updateTask = (taskId: string, outcome: GenerationTaskOutcome, extras: Partial<GenerationRunTask> = {}) => {
    taskStates = taskStates.map((task) => task.id === taskId ? { ...task, outcome, ...extras } : task)
    publish('running')
  }

  publish('running')
  for (const task of tasks) {
    if (signal.aborted) break
    updateTask(task.id, 'running', { startedAt: now(), message: undefined })
    try {
      const outcome = await worker(task, signal)
      updateTask(task.id, outcome, { finishedAt: now() })
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) break
      updateTask(task.id, 'failed', { message: error instanceof Error ? error.message : 'Generation failed. Retry this stage.', finishedAt: now() })
    }
  }

  if (signal.aborted) taskStates = taskStates.map((task) => task.outcome === 'queued' || task.outcome === 'running' ? { ...task, outcome: 'cancelled', finishedAt: now(), message: 'Cancelled by creator. Resume when ready.' } : task)
  const status = signal.aborted ? 'cancelled' : taskStates.some((task) => task.outcome === 'failed') ? 'partial' : 'complete'
  return publish(status, now())
}
