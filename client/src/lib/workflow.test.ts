// Design philosophy: Editorial Control Room — the critical path is a recoverable production sequence.

import { describe, expect, it } from 'vitest'
import { packToMarkdown } from './pack-export'
import { createCombinedPack, packReducer } from './pack-domain'

describe('combined pack production workflow', () => {
  it('keeps one part editable without clobbering the other five', () => {
    let pack = createCombinedPack('D365 Plugin Pipeline')
    pack = packReducer(pack, { type: 'set-meta', topic: 'D365 Plugin Pipeline', notes: 'Keep the source grounded.' })
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields: { title: 'Pipeline stages', promise: 'A clear execution map', audience: 'Developers', hook: 'Most plugins fail here.', story: 'Trace the runtime.', insight: 'Stages create the order.', proof: 'Profiler evidence.', payoff: 'Debug with intent.', cta: 'Save the checklist.' } })
    pack = packReducer(pack, { type: 'update-field', partKey: 'long', field: 'hook', value: 'Most plugin bugs start before the method runs.' })
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'short-3', fields: { title: 'One stage', promise: 'One useful distinction', audience: 'Builders', hook: 'Here is the overlooked stage.', story: 'Show the sequence.', insight: 'Order matters.', proof: 'A trace.', payoff: 'Faster diagnosis.', cta: 'Review the system.' } })
    const long = pack.parts.find((part) => part.key === 'long')!
    const short = pack.parts.find((part) => part.key === 'short-3')!
    expect(long.fields?.hook).toContain('Most plugin bugs')
    expect(short.fields?.title).toBe('One stage')
    expect(pack.parts.filter((part) => part.fields).length).toBe(2)
    expect(packToMarkdown(pack)).toContain('Most plugin bugs start')
  })
})
