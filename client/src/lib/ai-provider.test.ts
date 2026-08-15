import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBrowserProvider } from './ai-provider'

afterEach(() => vi.unstubAllGlobals())

describe('browser AI provider', () => {
  it('sends local-provider requests without an authorization header', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'Local response' } }] }), { status: 200 }))
    vi.stubGlobal('fetch', fetchImpl)

    const response = await createBrowserProvider().complete({
      baseUrl: 'http://localhost:1234',
      model: 'local-model',
      temperature: 0.6,
      maxTokens: 512,
      messages: [{ role: 'user', content: 'Draft a brief.' }],
    })

    expect(response).toBe('Local response')
    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', expect.objectContaining({
      headers: { 'Content-Type': 'application/json' },
    }))
  })
})
