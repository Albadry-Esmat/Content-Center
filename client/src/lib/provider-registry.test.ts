import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { createProviderForConfig, discoverKnownProviderModels, getProviderDescriptor, PROVIDER_CATALOG } from './provider-registry'

afterEach(() => vi.unstubAllGlobals())

describe('provider registry', () => {
  it('catalogues local providers as browser-safe OpenAI-compatible endpoints', () => {
    const descriptor = getProviderDescriptor('ollama-local')

    expect(descriptor).toMatchObject({ mode: 'local', browserSafe: true, requiresServerProxy: false, endpointStyle: 'openai-compatible' })
  })

  it('reads discovered models from the protected server route', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: { data: { json: { models: [' gpt-a ', 'gpt-a', '', 42, null], detail: '5 raw entries returned.' } } } }), { status: 200 }))

    const result = await discoverKnownProviderModels('openai', fetchImpl)

    expect(result).toEqual({ models: ['gpt-a'], detail: '5 raw entries returned.' })
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/api/trpc/ai.listModels?input='), expect.objectContaining({ credentials: 'include' }))
  })

  it('routes hosted-provider generation through the server proxy transport', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ result: { data: { json: { content: 'Server response' } } } }]), { status: 200 }))
    vi.stubGlobal('fetch', fetchImpl)
    const provider = createProviderForConfig({ ...DEFAULT_AI_CONFIG, providerMode: 'known-provider', providerId: 'openai' })

    await expect(provider.complete({ baseUrl: 'https://example.invalid', model: 'hosted-model', temperature: 0.6, maxTokens: 128, messages: [{ role: 'user', content: 'Route this.' }] })).resolves.toBe('Server response')
    expect(fetchImpl).toHaveBeenCalledWith('/api/trpc/ai.complete?batch=1', expect.objectContaining({ credentials: 'include' }))
    expect(PROVIDER_CATALOG.find((item) => item.id === 'openai')).toMatchObject({ browserSafe: false, requiresServerProxy: true })
  })
})
