import { describe, expect, it } from 'vitest'
import { getPlatformPreset, getPlatformPresets } from './platform-presets'

describe('platform presets', () => {
  it('provides simple vertical guidance for short-form platforms', () => {
    const preset = getPlatformPreset('youtube-shorts')

    expect(preset.aspectRatio).toBe('9:16')
    expect(preset.ctaGuidance).toContain('full video')
    expect(preset.safeZoneGuidance).toContain('top and bottom')
  })

  it('returns presets in the selected campaign order', () => {
    const presets = getPlatformPresets(['linkedin', 'tiktok', 'youtube'])

    expect(presets.map((preset) => preset.id)).toEqual(['linkedin', 'tiktok', 'youtube'])
    expect(presets.every((preset) => preset.version === 'v1')).toBe(true)
  })
})
