import { describe, expect, it } from 'vitest'
import { SUPPORTED_PLATFORMS } from './campaign-config'
import { getPlatformPreset, getPlatformPresets } from './platform-presets'

describe('platform presets', () => {
  it('provides simple vertical guidance for short-form platforms', () => {
    const preset = getPlatformPreset('youtube-shorts')

    expect(preset.aspectRatio).toBe('9:16')
    expect(preset.ctaGuidance).toContain('full video')
    expect(preset.safeZoneGuidance).toContain('top and bottom')
  })

  it('keeps every supported platform preset complete and versioned', () => {
    const requiredFields = ['label', 'role', 'aspectRatio', 'titleGuidance', 'captionGuidance', 'ctaGuidance', 'safeZoneGuidance', 'exportGuidance', 'version'] as const

    for (const platform of SUPPORTED_PLATFORMS) {
      const preset = getPlatformPreset(platform)
      expect(preset.id).toBe(platform)
      expect(preset.version).toMatch(/^v\d+$/)
      for (const field of requiredFields) expect(preset[field].trim().length).toBeGreaterThan(0)
    }
  })

  it('returns presets in the selected campaign order', () => {
    const presets = getPlatformPresets(['linkedin', 'tiktok', 'youtube'])

    expect(presets.map((preset) => preset.id)).toEqual(['linkedin', 'tiktok', 'youtube'])
    expect(presets.every((preset) => preset.version === 'v1')).toBe(true)
  })
})
