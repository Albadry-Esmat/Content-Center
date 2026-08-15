import { describe, expect, it } from 'vitest'
import { runSequentialQueue } from './generation-queue'
import type { GenerationTask } from './generation-progress'

const tasks: GenerationTask[] = [
  { id: 'long:fields', partKey: 'long', stage: 'fields', label: 'Long-form · fields' },
  { id: 'short-1:fields', partKey: 'short-1', stage: 'fields', label: 'Short #1 · fields' },
  { id: 'short-2:fields', partKey: 'short-2', stage: 'fields', label: 'Short #2 · fields' },
]

describe('sequential generation queue', () => {
  it('continues independent tasks after a retryable failure and reports a partial outcome', async () => {
    const order: string[] = []
    const run = await runSequentialQueue({ id: 'run-1', tasks, signal: new AbortController().signal, worker: async (task) => {
      order.push(task.id)
      if (task.id === 'short-1:fields') throw new Error('Provider unavailable')
      return task.id === 'short-2:fields' ? 'warning' : 'succeeded'
    } })

    expect(order).toEqual(tasks.map((task) => task.id))
    expect(run.status).toBe('partial')
    expect(run.tasks.map((task) => task.outcome)).toEqual(['succeeded', 'failed', 'warning'])
  })

  it('keeps completed artifacts and marks only unfinished queue tasks cancelled', async () => {
    const controller = new AbortController()
    const run = await runSequentialQueue({ id: 'run-2', tasks, signal: controller.signal, worker: async (task) => {
      if (task.id === 'long:fields') { controller.abort(); return 'succeeded' }
      return 'succeeded'
    } })

    expect(run.status).toBe('cancelled')
    expect(run.tasks.map((task) => task.outcome)).toEqual(['succeeded', 'cancelled', 'cancelled'])
  })

  it('reruns an individual failed task without replaying the completed combined queue', async () => {
    const failed = await runSequentialQueue({ id: 'run-3', tasks: [tasks[1]], signal: new AbortController().signal, worker: async () => { throw new Error('Temporary provider failure') } })
    const retry = await runSequentialQueue({ id: 'run-4', tasks: [tasks[1]], signal: new AbortController().signal, worker: async () => 'succeeded' })

    expect(failed).toMatchObject({ status: 'partial', tasks: [expect.objectContaining({ id: 'short-1:fields', outcome: 'failed' })] })
    expect(retry).toMatchObject({ status: 'complete', tasks: [expect.objectContaining({ id: 'short-1:fields', outcome: 'succeeded' })] })
  })
})
