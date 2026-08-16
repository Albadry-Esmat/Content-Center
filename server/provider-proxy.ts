import { ENV } from './_core/env'
import { fetchWithBackoff } from './_core/llm'

export type KnownProviderId = 'openai' | 'anthropic' | 'google'
export type ProxyMessage = { role: 'system' | 'user'; content: string }
export type KnownProviderRequest = {
  providerId: KnownProviderId
  model: string
  messages: ProxyMessage[]
  temperature: number
  maxTokens: number
}
export type ProviderProxyEnv = Pick<typeof ENV, 'openaiApiKey' | 'openaiBaseUrl' | 'anthropicApiKey' | 'googleAiApiKey'>
export type ProviderAvailability = { providerId: KnownProviderId; configured: boolean; credentialBoundary: 'server-only'; detail: string }
export type ProviderModelsResult = { providerId: KnownProviderId; models: string[]; detail: string }

type FetchLike = typeof fetch

const PROVIDER_IDS: KnownProviderId[] = ['openai', 'anthropic', 'google']

function isKnownProviderId(value: string): value is KnownProviderId {
  return PROVIDER_IDS.includes(value as KnownProviderId)
}

function providerAvailability(providerId: KnownProviderId, env: ProviderProxyEnv): ProviderAvailability {
  if (providerId === 'openai') return { providerId, configured: Boolean(env.openaiApiKey.trim()), credentialBoundary: 'server-only', detail: env.openaiApiKey.trim() ? 'Server-side OpenAI credential is configured.' : 'Set OPENAI_API_KEY on the server.' }
  if (providerId === 'anthropic') return { providerId, configured: Boolean(env.anthropicApiKey.trim()), credentialBoundary: 'server-only', detail: env.anthropicApiKey.trim() ? 'Server-side Anthropic credential is configured.' : 'Set ANTHROPIC_API_KEY on the server.' }
  return { providerId, configured: Boolean(env.googleAiApiKey.trim()), credentialBoundary: 'server-only', detail: env.googleAiApiKey.trim() ? 'Server-side Google AI credential is configured.' : 'Set GOOGLE_AI_API_KEY on the server.' }
}

export function listProviderAvailability(env: ProviderProxyEnv = ENV): ProviderAvailability[] {
  return PROVIDER_IDS.map((providerId) => providerAvailability(providerId, env))
}

function endpointFor(providerId: KnownProviderId, env: ProviderProxyEnv, model: string): { url: string; headers: Record<string, string>; body: Record<string, unknown> } {
  if (providerId === 'openai') return { url: `${env.openaiBaseUrl.replace(/\/$/, '')}/v1/chat/completions`, headers: { authorization: `Bearer ${env.openaiApiKey}`, 'content-type': 'application/json' }, body: { model, messages: undefined, temperature: undefined, max_tokens: undefined, stream: false } }
  if (providerId === 'anthropic') return { url: 'https://api.anthropic.com/v1/messages', headers: { 'x-api-key': env.anthropicApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: { model, max_tokens: undefined, temperature: undefined, system: undefined, messages: undefined } }
  return { url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.googleAiApiKey)}`, headers: { 'content-type': 'application/json' }, body: { contents: undefined, generationConfig: undefined } }
}

function responseText(providerId: KnownProviderId, payload: unknown): string {
  const data = payload as { choices?: Array<{ message?: { content?: string } }>; content?: Array<{ text?: string }>; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  if (providerId === 'openai') return data.choices?.[0]?.message?.content || ''
  if (providerId === 'anthropic') return data.content?.map((part) => part.text || '').join('') || ''
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
}

export async function listKnownProviderModels(providerId: KnownProviderId, env: ProviderProxyEnv = ENV, fetchImpl: FetchLike = fetch): Promise<ProviderModelsResult> {
  if (!isKnownProviderId(providerId)) throw new Error('Provider is not allowlisted for server-side routing.')
  const availability = providerAvailability(providerId, env)
  if (!availability.configured) throw new Error(availability.detail)
  if (providerId === 'anthropic') return { providerId, models: [], detail: 'Anthropic model discovery is not exposed by this proxy yet; enter a supported model ID manually.' }
  const url = providerId === 'openai' ? `${env.openaiBaseUrl.replace(/\/$/, '')}/v1/models` : `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(env.googleAiApiKey)}`
  const headers: Record<string, string> = providerId === 'openai' ? { authorization: `Bearer ${env.openaiApiKey}` } : {}
  const response = await fetchWithBackoff(url, { method: 'GET', headers }, fetchImpl)
  if (!response.ok) throw new Error(`Provider model discovery failed with HTTP ${response.status}.`)
  const payload = await response.json() as { data?: Array<{ id?: string }>; models?: Array<{ name?: string }> }
  const models = providerId === 'openai' ? (payload.data || []).map((model) => model.id).filter(Boolean) as string[] : (payload.models || []).map((model) => model.name?.replace(/^models\//, '')).filter(Boolean) as string[]
  return { providerId, models, detail: models.length ? `${models.length} models discovered.` : 'The provider responded without model IDs.' }
}

export async function completeKnownProvider(input: KnownProviderRequest, env: ProviderProxyEnv = ENV, fetchImpl: FetchLike = fetch): Promise<{ content: string; providerId: KnownProviderId; model: string }> {
  if (!isKnownProviderId(input.providerId)) throw new Error('Provider is not allowlisted for server-side routing.')
  const availability = providerAvailability(input.providerId, env)
  if (!availability.configured) throw new Error(availability.detail)
  const endpoint = endpointFor(input.providerId, env, input.model)
  const messages = input.messages.map((message) => ({ role: message.role, content: message.content }))
  if (input.providerId === 'openai') endpoint.body = { ...endpoint.body, messages, temperature: input.temperature, max_tokens: input.maxTokens }
  if (input.providerId === 'anthropic') {
    const system = messages.find((message) => message.role === 'system')?.content
    endpoint.body = { ...endpoint.body, system, messages: messages.filter((message) => message.role !== 'system'), temperature: input.temperature, max_tokens: input.maxTokens }
  }
  if (input.providerId === 'google') endpoint.body = { contents: messages.map((message) => ({ role: 'user', parts: [{ text: message.role === 'system' ? `System instructions:\n${message.content}` : message.content }] })), generationConfig: { temperature: input.temperature, maxOutputTokens: input.maxTokens } }
  const response = await fetchWithBackoff(endpoint.url, { method: 'POST', headers: endpoint.headers, body: JSON.stringify(endpoint.body) }, fetchImpl)
  if (!response.ok) throw new Error(`Known provider request failed with HTTP ${response.status}.`)
  const content = responseText(input.providerId, await response.json())
  if (!content.trim()) throw new Error('Known provider returned an empty response.')
  return { content, providerId: input.providerId, model: input.model }
}
