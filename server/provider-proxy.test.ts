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

  it('normalizes OpenAI model IDs from server-side discovery', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: ' gpt-a ' }, { id: 'gpt-a' }, { id: 'gpt-b' }, { id: 42 }, {}] }), { status: 200 }))

    const result = await (await import('./provider-proxy')).listKnownProviderModels('openai', configuredEnv, fetchImpl)

    expect(result).toMatchObject({ providerId: 'openai', models: ['gpt-a', 'gpt-b'] })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.openai.test/v1/models', expect.objectContaining({ method: 'GET' }))
  })

  it('discovers Anthropic model IDs through the official models endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'claude-opus-4-6' }, { id: 'claude-opus-4-6' }, { id: ' claude-sonnet-4-6 ' }] }), { status: 200 }))
    const env = { ...configuredEnv, anthropicApiKey: 'test-anthropic-key' }

    const result = await (await import('./provider-proxy')).listKnownProviderModels('anthropic', env, fetchImpl)

    expect(result).toMatchObject({ providerId: 'anthropic', models: ['claude-opus-4-6', 'claude-sonnet-4-6'] })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.anthropic.com/v1/models', expect.objectContaining({ headers: { 'x-api-key': 'test-anthropic-key', 'anthropic-version': '2023-06-01' } }))
  })

  it('maps Anthropic system prompts and messages to the Messages API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [{ text: 'Anthropic response' }] }), { status: 200 }))
    const env = { ...configuredEnv, anthropicApiKey: 'test-anthropic-key' }

    await expect(completeKnownProvider({ providerId: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.4, maxTokens: 256, messages: [{ role: 'system', content: 'System rule' }, { role: 'user', content: 'User request' }] }, env, fetchImpl)).resolves.toMatchObject({ content: 'Anthropic response' })
    expect(fetchImpl).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'test-anthropic-key', 'anthropic-version': '2023-06-01' }) }))
    const requestInit = fetchImpl.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(requestInit.body))).toMatchObject({ system: 'System rule', messages: [{ role: 'user', content: 'User request' }], max_tokens: 256, temperature: 0.4 })
  })

  it('lists only Google models that support generateContent', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: [{ name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] }, { name: 'models/text-embedding-005', supportedGenerationMethods: ['embedContent'] }] }), { status: 200 }))
    const env = { ...configuredEnv, googleAiApiKey: 'test-google-key' }

    const result = await (await import('./provider-proxy')).listKnownProviderModels('google', env, fetchImpl)

    expect(result).toMatchObject({ providerId: 'google', models: ['gemini-2.5-flash'] })
    expect(fetchImpl).toHaveBeenCalledWith('https://generativelanguage.googleapis.com/v1beta/models?key=test-google-key', expect.objectContaining({ method: 'GET' }))
  })

  it('maps Google system prompts to systemInstruction', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Google response' }] } }] }), { status: 200 }))
    const env = { ...configuredEnv, googleAiApiKey: 'test-google-key' }

    await expect(completeKnownProvider({ providerId: 'google', model: 'gemini-2.5-flash', temperature: 0.4, maxTokens: 256, messages: [{ role: 'system', content: 'System rule' }, { role: 'user', content: 'User request' }] }, env, fetchImpl)).resolves.toMatchObject({ content: 'Google response' })
    const requestInit = fetchImpl.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(requestInit.body))).toMatchObject({ systemInstruction: { parts: [{ text: 'System rule' }] }, contents: [{ role: 'user', parts: [{ text: 'User request' }] }] })
  })

  it('fails before making an upstream request when the server secret is absent', async () => {
    const fetchImpl = vi.fn()

    await expect(completeKnownProvider({ providerId: 'anthropic', model: 'claude-test', temperature: 0.4, maxTokens: 256, messages: [{ role: 'user', content: 'User' }] }, configuredEnv, fetchImpl)).rejects.toThrow('ANTHROPIC_API_KEY')
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
