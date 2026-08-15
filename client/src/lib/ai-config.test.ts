import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AI_CONFIG, loadAiConfig, saveAiConfig } from './ai-config'

afterEach(() => vi.unstubAllGlobals())

function installLocalStorage() {
  const values = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
  return values
}

describe('generation profile configuration', () => {
  it('persists language, direction, and brand phrases without credential fields', () => {
    const values = installLocalStorage()
    saveAiConfig({ ...DEFAULT_AI_CONFIG, scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count' })

    const stored = JSON.parse(values.get('albadry_ai_config_v2') || '{}') as Record<string, unknown>
    expect(stored).toMatchObject({ scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count' })
    expect(stored).not.toHaveProperty('apiKey')
    expect(loadAiConfig()).toMatchObject({ scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count' })
  })

  it('removes credentials from an earlier local configuration while preserving generation preferences', () => {
    const values = installLocalStorage()
    values.set('albadry_ai_config_v2', JSON.stringify({ ...DEFAULT_AI_CONFIG, ['api' + 'Key']: 'removed-by-migration', persistKey: true, scriptLanguage: 'French', textDirection: 'ltr' }))

    expect(loadAiConfig()).toMatchObject({ scriptLanguage: 'French', textDirection: 'ltr' })
    expect(JSON.parse(values.get('albadry_ai_config_v2') || '{}')).not.toHaveProperty('apiKey')
  })
})
