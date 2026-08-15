// Design philosophy: Editorial Control Room — connection settings make the trust boundary visible and reversible.

export type AiConfig = {
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  scriptLanguage: string
  textDirection: 'auto' | 'ltr' | 'rtl'
  brandPhrases: string
}

const AI_CONFIG_KEY = 'albadry_ai_config_v2'

export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl: 'http://localhost:1234',
  model: 'local-model',
  temperature: 0.6,
  maxTokens: 4096,
  scriptLanguage: 'English',
  textDirection: 'auto',
  brandPhrases: '',
}

export function loadAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG
  try {
    const stored = JSON.parse(window.localStorage.getItem(AI_CONFIG_KEY) || '{}') as Record<string, unknown>
    const config: AiConfig = {
      baseUrl: typeof stored.baseUrl === 'string' ? stored.baseUrl : DEFAULT_AI_CONFIG.baseUrl,
      model: typeof stored.model === 'string' ? stored.model : DEFAULT_AI_CONFIG.model,
      temperature: typeof stored.temperature === 'number' && Number.isFinite(stored.temperature) ? stored.temperature : DEFAULT_AI_CONFIG.temperature,
      maxTokens: typeof stored.maxTokens === 'number' && Number.isFinite(stored.maxTokens) ? stored.maxTokens : DEFAULT_AI_CONFIG.maxTokens,
      scriptLanguage: typeof stored.scriptLanguage === 'string' ? stored.scriptLanguage : DEFAULT_AI_CONFIG.scriptLanguage,
      textDirection: stored.textDirection === 'ltr' || stored.textDirection === 'rtl' || stored.textDirection === 'auto' ? stored.textDirection : DEFAULT_AI_CONFIG.textDirection,
      brandPhrases: typeof stored.brandPhrases === 'string' ? stored.brandPhrases : DEFAULT_AI_CONFIG.brandPhrases,
    }
    if ('apiKey' in stored || 'persistKey' in stored) window.localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
    return config
  } catch { return DEFAULT_AI_CONFIG }
}

export function saveAiConfig(config: AiConfig): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config)) } catch { /* Settings remain usable when storage is unavailable. */ }
}
