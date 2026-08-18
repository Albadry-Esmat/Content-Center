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
  suggestedModels: string[]
}

export const PROVIDER_CATALOG: ProviderDescriptor[] = [
  { id: 'openai-compatible-local', label: 'Local OpenAI-compatible endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Prompts go directly from this browser to the configured local endpoint.', suggestedModels: [] },
  { id: 'ollama-local', label: 'Ollama local endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Use an OpenAI-compatible Ollama endpoint; no hosted provider credential is stored here.', suggestedModels: ['llama3.2', 'qwen2.5', 'mistral'] },
  { id: 'lm-studio-local', label: 'LM Studio local endpoint', mode: 'local', endpointStyle: 'openai-compatible', browserSafe: true, requiresServerProxy: false, privacyNote: 'Use the local LM Studio server; prompts remain on the configured machine.', suggestedModels: [] },
  { id: 'openai', label: 'OpenAI', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.', suggestedModels: [] },
  { id: 'anthropic', label: 'Anthropic', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.', suggestedModels: [] },
  { id: 'google', label: 'Google AI provider', mode: 'known-provider', endpointStyle: 'server-proxy', browserSafe: false, requiresServerProxy: true, privacyNote: 'Requires a server-side proxy so the provider credential never enters the browser.', suggestedModels: [] },
]

export function getProviderDescriptor(providerId: string): ProviderDescriptor {
  return PROVIDER_CATALOG.find((provider) => provider.id === providerId) || PROVIDER_CATALOG[0]
}

function createServerProxyProvider(providerId: string): AiProvider {
  return {
    async complete(request, signal) {
      const response = await fetch('/api/trpc/ai.complete?batch=1', {
        method: 'POST',
        signal,
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 0: { json: { providerId, model: request.model, messages: request.messages, temperature: request.temperature, maxTokens: request.maxTokens } } }),
      })
      if (!response.ok) throw new Error(`Server provider proxy failed with HTTP ${response.status}.`)
      const payload = await response.json() as Array<{ result?: { data?: { json?: { content?: string } } } }>
      const content = payload[0]?.result?.data?.json?.content
      if (typeof content !== 'string' || !content.trim()) throw new Error('Server provider proxy returned an empty response.')
      return content
    },
  }
}

export async function discoverKnownProviderModels(providerId: string, fetchImpl: typeof fetch = fetch): Promise<{ models: string[]; detail: string }> {
  const input = encodeURIComponent(JSON.stringify({ json: { providerId } }))
  const response = await fetchImpl(`/api/trpc/ai.listModels?input=${input}`, { method: 'GET', credentials: 'include' })
  if (!response.ok) throw new Error(`Model discovery failed with HTTP ${response.status}.`)
  const payload = await response.json() as { result?: { data?: { json?: { models?: unknown; detail?: unknown } } } }
  const rawModels = payload.result?.data?.json?.models
  const models = Array.from(new Set((Array.isArray(rawModels) ? rawModels : []).filter((model): model is string => typeof model === 'string').map((model) => model.trim()).filter(Boolean)))
  const detail = typeof payload.result?.data?.json?.detail === 'string' && payload.result.data.json.detail.trim() ? payload.result.data.json.detail : 'No model discovery detail was returned.'
  return { models, detail }
}

export function createProviderForConfig(config: Pick<AiConfig, 'providerMode' | 'providerId'>): AiProvider {
  const descriptor = getProviderDescriptor(config.providerId)
  if (config.providerMode === 'local' && descriptor.mode === 'local') return createBrowserProvider()
  if (config.providerMode === 'known-provider' && descriptor.mode === 'known-provider') return createServerProxyProvider(descriptor.id)
  return {
    async complete() {
      throw new Error(`${descriptor.label} is not available for the selected provider mode.`)
    },
  }
}
