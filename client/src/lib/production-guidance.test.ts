import { describe, expect, it } from 'vitest'
import { getColoringGuidance, getMontageGuidance } from './production-guidance'

describe('production guidance', () => {
  it('keeps CapCut montage guidance simple and actionable', () => {
    const guidance = getMontageGuidance('capcut')

    expect(guidance.toolLabel).toContain('CapCut')
    expect(guidance.steps).toContain('Use hard cuts to remove pauses and dead space.')
    expect(guidance.avoid).toContain('motion tracking')
  })

  it('keeps DaVinci guidance focused on basic correction', () => {
    const guidance = getColoringGuidance('davinci-resolve')

    expect(guidance.toolLabel).toContain('DaVinci Resolve')
    expect(guidance.steps[0]).toContain('exposure')
    expect(guidance.avoid).toContain('LUT design')
  })
})
