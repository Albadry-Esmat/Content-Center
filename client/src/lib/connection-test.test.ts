// Design philosophy: Editorial Control Room — connection checks are deterministic enough to test without a live model server.

import { describe, expect, it, vi } from 'vitest'
import { discoverAiModels, testAiConnection } from './connection-test'

const config = { baseUrl: 'http://localhost:1234', model: 'local-model' }

describe('AI connection test', () => {
  it('reports a live endpoint and warns when the requested model is absent', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'other-model' }] }), { status: 200 }))
    const result = await testAiConnection(config, fetchImpl)
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('was not listed')
    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:1234/v1/models', expect.objectContaining({ method: 'GET' }))
  })

  it('discovers exact model IDs without requiring a configured model', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'local/llama-3' }, { id: 'local/llama-3' }, { id: 'local/qwen-2.5' }] }), { status: 200 }))
    const result = await discoverAiModels({ baseUrl: config.baseUrl, model: '' }, fetchImpl)

    expect(result.ok).toBe(true)
    expect(result.models).toEqual(['local/llama-3', 'local/qwen-2.5'])
    expect(result.nextAction).toContain('Choose a discovered model')
  })

  it('reports an explicit empty discovery result when the endpoint returns no IDs', async () => {
    const result = await discoverAiModels({ baseUrl: config.baseUrl, model: '' }, vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 })))

    expect(result.ok).toBe(true)
    expect(result.models).toEqual([])
    expect(result.nextAction).toContain('Enter a model ID manually')
  })

  it('reports HTTP failures instead of failing silently', async () => {
    const result = await testAiConnection(config, vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    expect(result.ok).toBe(false)
    expect(result.message).toContain('HTTP 401')
  })

  it('refuses known-provider browser routing without making a request', async () => {
    const fetchImpl = vi.fn()
    const result = await testAiConnection({ ...config, providerMode: 'known-provider', providerId: 'openai' }, fetchImpl)

    expect(result.ok).toBe(false)
    expect(result.message).toContain('server-side provider proxy')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('reports empty configuration before making a request', async () => {
    const fetchImpl = vi.fn()
    const result = await testAiConnection({ ...config, baseUrl: '' }, fetchImpl)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('base URL')
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
