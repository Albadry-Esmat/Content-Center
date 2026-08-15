import { describe, expect, it } from 'vitest'
import { recoverLatestCloudRun } from './cloud-run-recovery'
import { createCombinedPack } from './pack-domain'

describe('cloud run reload recovery', () => {
  it('restores the persisted pack snapshot and converts active tasks into resumable recovery state', () => {
    const pack = createCombinedPack('Cloud recovery')
    const recovered = recoverLatestCloudRun([{ id: 'run-cloud-1', status: 'running', packData: pack as unknown as Record<string, unknown>, tasks: [{ id: 'long:fields', partKey: 'long', stage: 'fields', label: 'Long-form · fields', outcome: 'running' }, { id: 'short-1:fields', partKey: 'short-1', stage: 'fields', label: 'Short #1 · fields', outcome: 'queued' }], startedAt: new Date(10), finishedAt: null }])

    expect(recovered?.pack.meta.topic).toBe('Cloud recovery')
    expect(recovered?.run.status).toBe('cancelled')
    expect(recovered?.run.tasks.map((task) => task.outcome)).toEqual(['cancelled', 'cancelled'])
  })

  it('does not recover completed runs or malformed snapshots', () => {
    expect(recoverLatestCloudRun([{ id: 'complete-run', status: 'complete', packData: createCombinedPack() as unknown as Record<string, unknown>, tasks: [], startedAt: new Date(), finishedAt: new Date() }])).toBeNull()
    expect(recoverLatestCloudRun([{ id: 'bad-run', status: 'running', packData: { invalid: true }, tasks: [], startedAt: new Date(), finishedAt: null }])).toBeNull()
  })
})
