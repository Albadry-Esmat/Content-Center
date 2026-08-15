// Design philosophy: Editorial Control Room — connection checks return an explicit, reviewable desk status.

import type { AiConfig } from './ai-config'

export type ConnectionTestResult = {
  ok: boolean
  message: string
  detail?: string
  latencyMs?: number
  warning?: string
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function modelsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  return /\/v1$/i.test(trimmed) ? `${trimmed}/models` : `${trimmed}/v1/models`
}

export async function testAiConnection(config: Pick<AiConfig, 'baseUrl' | 'model'>, fetchImpl: FetchLike = fetch): Promise<ConnectionTestResult> {
  if (!config.baseUrl.trim()) return { ok: false, message: 'Add a base URL before testing the connection.', detail: 'The endpoint is empty.' }
  if (!config.model.trim()) return { ok: false, message: 'Add a model name before testing the connection.', detail: 'The model field is empty.' }

  let url: string
  try { url = modelsUrl(config.baseUrl); new URL(url) } catch { return { ok: false, message: 'The base URL is not valid.', detail: 'Use a complete URL such as http://localhost:1234 or https://provider.example/v1.' } }

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 8000)
  const started = performance.now()
  try {
    const response = await fetchImpl(url, { method: 'GET', signal: controller.signal })
    const latencyMs = Math.round(performance.now() - started)
    if (!response.ok) return { ok: false, message: `Connection refused with HTTP ${response.status}.`, detail: 'Check the endpoint and local model server.', latencyMs }
    const payload = await response.json().catch(() => null) as { data?: Array<{ id?: string }> } | null
    const models = payload?.data?.map((model) => model.id).filter(Boolean) as string[] | undefined
    const warning = models?.length && !models.includes(config.model.trim()) ? `The endpoint responded, but “${config.model.trim()}” was not listed in /models.` : undefined
    return { ok: true, message: 'AI connection is live.', detail: `${url} responded in ${latencyMs} ms.`, latencyMs, warning }
  } catch (error) {
    const detail = error instanceof DOMException && error.name === 'AbortError' ? 'The request timed out after 8 seconds.' : error instanceof Error ? error.message : 'The browser could not reach the endpoint.'
    return { ok: false, message: 'AI connection test failed.', detail }
  } finally { globalThis.clearTimeout(timeout) }
}
