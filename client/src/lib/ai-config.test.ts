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
  it('persists language, direction, and brand phrases without retaining an opt-out API key', () => {
    const values = installLocalStorage()
    saveAiConfig({ ...DEFAULT_AI_CONFIG, apiKey: 'test-do-not-persist', persistKey: false, scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count' })

    const stored = JSON.parse(values.get('albadry_ai_config_v2') || '{}') as Record<string, unknown>
    expect(stored).toMatchObject({ scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count', apiKey: '' })
    expect(loadAiConfig()).toMatchObject({ scriptLanguage: 'Arabic', textDirection: 'rtl', brandPhrases: 'Make every idea count', apiKey: '' })
  })

  it('retains the API key only when the user explicitly opts in to local persistence', () => {
    installLocalStorage()
    saveAiConfig({ ...DEFAULT_AI_CONFIG, apiKey: 'test-persist-by-choice', persistKey: true, scriptLanguage: 'French', textDirection: 'ltr' })

    expect(loadAiConfig()).toMatchObject({ apiKey: 'test-persist-by-choice', scriptLanguage: 'French', textDirection: 'ltr' })
  })
})
