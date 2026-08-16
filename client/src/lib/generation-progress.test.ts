import { describe, expect, it } from 'vitest'
import { createRunnableStageQueue, createStageQueue, getNextRecommendedTask, getPackProgress, getStageProgress, type GenerationRun } from './generation-progress'
import { createCombinedPack, packReducer, type FieldSet } from './pack-domain'

const fields: FieldSet = { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' }

describe('generation progress', () => {
  it('builds an explicit eight-asset queue for a campaign stage action', () => {
    const pack = createCombinedPack('A topic')
    const queue = createStageQueue(pack, 'fields')

    expect(queue).toHaveLength(8)
    expect(queue[0]).toMatchObject({ partKey: 'long', stage: 'fields', label: 'Long-form · fields' })
    expect(queue.at(-1)).toMatchObject({ partKey: 'short-7', stage: 'fields' })
  })

  it('makes prerequisite blocks explicit instead of leaving later stages silently idle', () => {
    const pack = createCombinedPack('A topic')
    const short = pack.parts.find((part) => part.key === 'short-2')!

    expect(getStageProgress(short, 'script')).toMatchObject({ status: 'blocked', label: 'Needs prerequisite' })
    expect(getNextRecommendedTask(pack)).toMatchObject({ partKey: 'long', stage: 'fields' })
  })

  it('reports queued and active work alongside completed and review-required artifacts', () => {
    let pack = createCombinedPack('A topic')
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields, warnings: ['Local draft fallback used because the provider could not be reached.'] })
    const run: GenerationRun = {
      id: 'run-1', status: 'running', startedAt: 1,
      tasks: [
        { id: 'short-1:fields', partKey: 'short-1', stage: 'fields', label: 'Short #1 · fields', outcome: 'running', startedAt: 2 },
        { id: 'short-2:fields', partKey: 'short-2', stage: 'fields', label: 'Short #2 · fields', outcome: 'queued' },
      ],
    }

    const summary = getPackProgress(pack, run)
    expect(summary).toMatchObject({ completedSteps: 1, reviewRequired: 1, running: 1, queued: 1, totalSteps: 32 })
    expect(getStageProgress(pack.parts.find((part) => part.key === 'long')!, 'fields', run)).toMatchObject({ status: 'review-required' })
  })

  it('creates a combined script queue only for deliverables whose briefs are ready', () => {
    let pack = createCombinedPack('A topic')
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields })
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'short-1', fields })

    expect(createRunnableStageQueue(pack, 'script')).toEqual([
      expect.objectContaining({ partKey: 'long', stage: 'script' }),
      expect.objectContaining({ partKey: 'short-1', stage: 'script' }),
    ])
  })
})
