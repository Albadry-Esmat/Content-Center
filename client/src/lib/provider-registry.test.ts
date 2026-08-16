import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { createProviderForConfig, getProviderDescriptor, PROVIDER_CATALOG } from './provider-registry'

afterEach(() => vi.unstubAllGlobals())

describe('provider registry', () => {
  it('catalogues local providers as browser-safe OpenAI-compatible endpoints', () => {
    const descriptor = getProviderDescriptor('ollama-local')

    expect(descriptor).toMatchObject({ mode: 'local', browserSafe: true, requiresServerProxy: false, endpointStyle: 'openai-compatible' })
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
