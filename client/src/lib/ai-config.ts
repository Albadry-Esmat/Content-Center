// Design philosophy: Editorial Control Room — connection settings make the trust boundary visible and reversible.

export type AiConfig = {
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  persistKey: boolean
  apiKey: string
}

const AI_CONFIG_KEY = 'albadry_ai_config_v2'

export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl: 'http://localhost:1234',
  model: 'local-model',
  temperature: 0.6,
  maxTokens: 4096,
  persistKey: false,
  apiKey: '',
}

export function loadAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG
  try {
    const stored = JSON.parse(window.localStorage.getItem(AI_CONFIG_KEY) || '{}') as Partial<AiConfig>
    return { ...DEFAULT_AI_CONFIG, ...stored, apiKey: stored.persistKey ? stored.apiKey || '' : '' }
  } catch { return DEFAULT_AI_CONFIG }
}

export function saveAiConfig(config: AiConfig): void {
  if (typeof window === 'undefined') return
  const safe = config.persistKey ? config : { ...config, apiKey: '' }
  try { window.localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(safe)) } catch { /* Settings remain usable when storage is unavailable. */ }
}
