import { describe, expect, it, vi } from 'vitest'
import { completeKnownProvider, listProviderAvailability, type ProviderProxyEnv } from './provider-proxy'

const configuredEnv: ProviderProxyEnv = {
  openaiApiKey: 'test-provider-key',
  openaiBaseUrl: 'https://api.openai.test',
  anthropicApiKey: '',
  googleAiApiKey: '',
}

describe('known-provider proxy', () => {
  it('reports configuration without returning credential values', () => {
    const statuses = listProviderAvailability(configuredEnv)

    expect(statuses).toEqual([
      expect.objectContaining({ providerId: 'openai', configured: true, credentialBoundary: 'server-only' }),
      expect.objectContaining({ providerId: 'anthropic', configured: false, credentialBoundary: 'server-only' }),
      expect.objectContaining({ providerId: 'google', configured: false, credentialBoundary: 'server-only' }),
    ])
    expect(JSON.stringify(statuses)).not.toContain('test-provider-key')
  })

  it('sends an OpenAI-compatible request with the server-held credential', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'Server response' } }] }), { status: 200 }))

    const result = await completeKnownProvider({ providerId: 'openai', model: 'gpt-test', temperature: 0.4, maxTokens: 256, messages: [{ role: 'system', content: 'System' }, { role: 'user', content: 'User' }] }, configuredEnv, fetchImpl)

    expect(result).toMatchObject({ content: 'Server response', providerId: 'openai', model: 'gpt-test' })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.openai.test/v1/chat/completions', expect.objectContaining({ headers: expect.objectContaining({ authorization: 'Bearer test-provider-key' }) }))
    const requestInit = fetchImpl.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(requestInit.body))).toMatchObject({ model: 'gpt-test', max_tokens: 256, temperature: 0.4 })
  })

  it('fails before making an upstream request when the server secret is absent', async () => {
    const fetchImpl = vi.fn()

    await expect(completeKnownProvider({ providerId: 'anthropic', model: 'claude-test', temperature: 0.4, maxTokens: 256, messages: [{ role: 'user', content: 'User' }] }, configuredEnv, fetchImpl)).rejects.toThrow('ANTHROPIC_API_KEY')
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
