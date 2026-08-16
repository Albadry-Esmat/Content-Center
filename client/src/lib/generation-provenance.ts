import type { AiConfig } from './ai-config'

export type GenerationSource = 'ai' | 'fallback' | 'manual'

export type GenerationProvenance = {
  providerId: string
  providerMode: AiConfig['providerMode']
  model: string
  source: GenerationSource
  generatedAt: string
}

export function createGenerationProvenance(config: Pick<AiConfig, 'providerId' | 'providerMode' | 'model'>, source: GenerationSource = 'ai'): GenerationProvenance {
  return { providerId: config.providerId, providerMode: config.providerMode, model: config.model, source, generatedAt: new Date().toISOString() }
}
