import type { AiConfig } from './ai-config'
import { createBrowserProvider, type AiProvider } from './ai-provider'

export type ProviderDescriptor = {
  id: string
  label: string
  mode: 'local' | 'known-provider'
  endpointStyle: 'openai-compatible' | 'server-proxy'
  browserSafe: boolean
  requiresServerProxy: boolean
  privacyNote: string
}

export const PROVIDER_CATALOG: ProviderDescriptor[] = [
  { id: 'openai-compatible-local', label: 'Local OpenAI-compatible endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Prompts go directly from this browser to the configured local endpoint.' },
  { id: 'ollama-local', label: 'Ollama local endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Use an OpenAI-compatible Ollama endpoint; no hosted provider credential is stored here.' },
  { id: 'lm-studio-local', label: 'LM Studio local endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Use the local LM Studio server; prompts remain on the configured machine.' },
  { id: 'openai', label: 'OpenAI', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.' },
  { id: 'anthropic', label: 'Anthropic', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.' },
  { id: 'google', label: 'Google AI provider', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.' },
]

export function getProviderDescriptor(providerId: string): ProviderDescriptor {
  return PROVIDER_CATALOG.find((provider) => provider.id === providerId) || PROVIDER_CATALOG[0]
}

export function createProviderForConfig(config: Pick<AiConfig, 'providerMode' | 'providerId'>): AiProvider {
  const descriptor = getProviderDescriptor(config.providerId)
  if (config.providerMode === 'local' && descriptor.mode === 'local') return createBrowserProvider()
  return {
    async complete() {
      throw new Error(`${descriptor.label} requires a server-side provider proxy before it can generate content.`)
    },
  }
}
