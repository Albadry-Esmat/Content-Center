import { describe, expect, it } from 'vitest'
import { createDefaultCampaignConfig, normalizeCampaignConfig } from './campaign-config'

describe('campaign configuration', () => {
  it('creates the public default campaign shape', () => {
    const config = createDefaultCampaignConfig()

    expect(config.preLaunchCount).toBe(2)
    expect(config.postLaunchCount).toBe(5)
    expect(config.preLaunchObjectives).toEqual(['curiosity', 'promise'])
    expect(config.postLaunchObjectives).toEqual(['insight', 'mistake', 'quick-tip', 'advanced-context', 'question'])
    expect(config.montageTool).toBe('capcut')
    expect(config.coloringTool).toBe('davinci-resolve')
    expect(config.platforms).toContain('youtube')
  })

  it('resizes objective arrays to match configurable counts', () => {
    const config = createDefaultCampaignConfig({ preLaunchCount: 4, postLaunchCount: 1, preLaunchObjectives: ['curiosity', 'promise'], postLaunchObjectives: ['question', 'insight'] })

    expect(config.preLaunchObjectives).toEqual(['curiosity', 'promise', 'curiosity', 'promise'])
    expect(config.postLaunchObjectives).toEqual(['question'])
  })

  it('normalizes incomplete saved configuration without discarding valid choices', () => {
    const config = normalizeCampaignConfig({
      preLaunchCount: 99,
      postLaunchCount: -2,
      platforms: ['linkedin', 'linkedin', 'unsupported'],
      montageTool: 'generic',
    })

    expect(config.preLaunchCount).toBe(6)
    expect(config.postLaunchCount).toBe(0)
    expect(config.platforms).toEqual(['linkedin'])
    expect(config.montageTool).toBe('generic')
    expect(config.coloringTool).toBe('davinci-resolve')
  })
})
