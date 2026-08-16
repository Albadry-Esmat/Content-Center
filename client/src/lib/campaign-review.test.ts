import { describe, expect, it } from 'vitest'
import { createCombinedPack, packReducer } from './pack-domain'
import { reviewCampaign } from './campaign-review'

const fields = { title: 'Title', promise: 'Promise', audience: 'Audience', hook: 'Hook', story: 'Story', insight: 'Insight', proof: 'Proof', payoff: 'Payoff', cta: 'CTA' }

describe('campaign review', () => {
  it('flags missing grounding and unfinished assets without treating them as provider failures', () => {
    const summary = reviewCampaign(createCombinedPack('A topic'))

    expect(summary.errors).toBe(0)
    expect(summary.warnings).toBe(1)
    expect(summary.info).toBe(8)
    expect(summary.ready).toBe(false)
    expect(summary.issues.some((item) => item.id === 'grounding-missing')).toBe(true)
    expect(summary.issues.some((item) => item.id === 'short-7-fields-missing')).toBe(true)
  })

  it('blocks publish readiness when a generated field still needs verification', () => {
    let pack = createCombinedPack('A topic', 'Source notes')
    pack = packReducer(pack, { type: 'complete-fields', partKey: 'long', fields: { ...fields, proof: '[verification required] Add source' } })

    const summary = reviewCampaign(pack)

    expect(summary.warnings).toBe(1)
    expect(summary.ready).toBe(false)
    expect(summary.issues[0]).toMatchObject({ partKey: 'long', severity: 'warning' })
  })
})
