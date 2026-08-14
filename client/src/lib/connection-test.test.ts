// Design philosophy: Editorial Control Room — connection checks are deterministic enough to test without a live model server.

import { describe, expect, it, vi } from 'vitest'
import { testAiConnection } from './connection-test'

const config = { baseUrl: 'http://localhost:1234', model: 'local-model', apiKey: '' }

describe('AI connection test', () => {
  it('reports a live endpoint and warns when the requested model is absent', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'other-model' }] }), { status: 200 }))
    const result = await testAiConnection(config, fetchImpl)
    expect(result.ok).toBe(true)
    expect(result.warning).toContain('was not listed')
    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:1234/v1/models', expect.objectContaining({ method: 'GET' }))
  })

  it('reports HTTP failures instead of failing silently', async () => {
    const result = await testAiConnection(config, vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    expect(result.ok).toBe(false)
    expect(result.message).toContain('HTTP 401')
  })

  it('reports empty configuration before making a request', async () => {
    const fetchImpl = vi.fn()
    const result = await testAiConnection({ ...config, baseUrl: '' }, fetchImpl)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('base URL')
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
