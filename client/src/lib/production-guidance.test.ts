import { describe, expect, it } from 'vitest'
import { getColoringGuidance, getMontageGuidance } from './production-guidance'

describe('production guidance', () => {
  it('keeps every guidance variant complete and versioned', () => {
    const guidanceVariants = [getMontageGuidance('capcut'), getMontageGuidance('generic'), getColoringGuidance('davinci-resolve'), getColoringGuidance('generic')]

    for (const guidance of guidanceVariants) {
      expect(guidance.steps.length).toBeGreaterThanOrEqual(4)
      expect(guidance.avoid.trim().length).toBeGreaterThan(0)
      expect(guidance.reviewCue.trim().length).toBeGreaterThan(0)
      expect(guidance.version).toMatch(/^v\d+$/)
    }
  })

  it('keeps CapCut montage guidance simple and actionable', () => {
    const guidance = getMontageGuidance('capcut')

    expect(guidance.toolLabel).toContain('CapCut')
    expect(guidance.steps).toContain('Use hard cuts to remove pauses and dead space.')
    expect(guidance.avoid).toContain('motion tracking')
    expect(guidance.reviewCue).toContain('phone')
    expect(guidance.version).toBe('v1')
  })

  it('keeps DaVinci guidance focused on basic correction', () => {
    const guidance = getColoringGuidance('davinci-resolve')

    expect(guidance.toolLabel).toContain('DaVinci Resolve')
    expect(guidance.steps[0]).toContain('exposure')
    expect(guidance.avoid).toContain('LUT design')
    expect(guidance.reviewCue).toContain('screen recording')
    expect(guidance.version).toBe('v1')
  })
})
