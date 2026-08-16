import { describe, expect, it } from 'vitest'
import { DEFAULT_AI_CONFIG } from './ai-config'
import { createProviderForConfig, getProviderDescriptor, PROVIDER_CATALOG } from './provider-registry'

describe('provider registry', () => {
  it('catalogues local providers as browser-safe OpenAI-compatible endpoints', () => {
    const descriptor = getProviderDescriptor('ollama-local')

    expect(descriptor).toMatchObject({ mode: 'local', browserSafe: true, requiresServerProxy: false, endpointStyle: 'openai-compatible' })
  })

  it('does not make hosted-provider requests directly from the browser', async () => {
    const provider = createProviderForConfig({ ...DEFAULT_AI_CONFIG, providerMode: 'known-provider', providerId: 'openai' })

    await expect(provider.complete({ baseUrl: 'https://example.invalid', model: 'hosted-model', temperature: 0.6, maxTokens: 128, messages: [{ role: 'user', content: 'Do not send this.' }] })).rejects.toThrow('server-side provider proxy')
    expect(PROVIDER_CATALOG.find((item) => item.id === 'openai')).toMatchObject({ browserSafe: false, requiresServerProxy: true })
  })
})
