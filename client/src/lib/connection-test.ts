import type { AiConfig } from './ai-config'

export type ConnectionFailureCategory = 'success' | 'configuration' | 'proxy-required' | 'authentication' | 'rate-limit' | 'server' | 'network' | 'timeout'

export type ConnectionTestResult = {
  ok: boolean
  category: ConnectionFailureCategory
  message: string
  detail?: string
  latencyMs?: number
  warning?: string
  models?: string[]
  retryable: boolean
  nextAction: string
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

type ModelConfig = Pick<AiConfig, 'baseUrl' | 'model'> & Partial<Pick<AiConfig, 'providerMode' | 'providerId'>>

function modelsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  return /\/v1$/i.test(trimmed) ? `${trimmed}/models` : `${trimmed}/v1/models`
}

function failure(category: ConnectionFailureCategory, message: string, detail: string, retryable: boolean, nextAction: string, latencyMs?: number): ConnectionTestResult {
  return { ok: false, category, message, detail, retryable, nextAction, ...(typeof latencyMs === 'number' ? { latencyMs } : {}) }
}

export function classifyHttpFailure(status: number, latencyMs?: number): ConnectionTestResult {
  if (status === 401 || status === 403) return failure('authentication', `Connection refused with HTTP ${status}.`, 'The endpoint is reachable but rejected authentication. Check the provider credential or server proxy configuration.', false, 'Verify the credential on the server or use a local endpoint without browser-held credentials.', latencyMs)
  if (status === 429) return failure('rate-limit', 'The provider rate-limited this request.', 'Wait for the provider limit to reset, then retry. Avoid repeatedly pressing the test button.', true, 'Wait briefly and retry once.', latencyMs)
  if (status >= 500) return failure('server', `The provider returned HTTP ${status}.`, 'The upstream service or local model server reported a server-side failure.', true, 'Check provider status or local server logs, then retry.', latencyMs)
  return failure('network', `Connection refused with HTTP ${status}.`, 'Check the endpoint and model server response.', false, 'Verify the endpoint URL and provider configuration.', latencyMs)
}

async function fetchModelList(config: Pick<ModelConfig, 'baseUrl'>, fetchImpl: FetchLike): Promise<ConnectionTestResult> {
  if (!config.baseUrl.trim()) return failure('configuration', 'Add a base URL before discovering models.', 'The endpoint is empty.', false, 'Enter a complete local endpoint URL.')

  let url: string
  try { url = modelsUrl(config.baseUrl); new URL(url) } catch { return failure('configuration', 'The base URL is not valid.', 'Use a complete URL such as http://localhost:1234 or https://provider.example/v1.', false, 'Correct the base URL and try again.') }

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 8000)
  const started = performance.now()
  try {
    const response = await fetchImpl(url, { method: 'GET', signal: controller.signal })
    const latencyMs = Math.round(performance.now() - started)
    if (!response.ok) return classifyHttpFailure(response.status, latencyMs)
    const payload = await response.json().catch(() => null) as { data?: unknown } | null
    const modelRows = Array.isArray(payload?.data) ? payload.data as Array<{ id?: unknown }> : []
    const models = Array.from(new Set(modelRows.map((model) => typeof model.id === 'string' ? model.id.trim() : '').filter(Boolean)))
    return { ok: true, category: 'success', message: 'AI model discovery is live.', detail: `${url} responded in ${latencyMs} ms.`, latencyMs, models, retryable: true, nextAction: models.length ? 'Choose a discovered model before generating.' : 'Enter a model ID manually or check the local server configuration.' }
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError'
    if (timedOut) return failure('timeout', 'The AI model discovery timed out.', 'The endpoint did not respond within 8 seconds.', true, 'Confirm the local model server is running, then retry once.')
    return failure('network', 'AI model discovery failed.', error instanceof Error ? error.message : 'The browser could not reach the endpoint.', true, 'Confirm the endpoint URL, CORS policy, and local server status, then retry.')
  } finally { globalThis.clearTimeout(timeout) }
}

export async function discoverAiModels(config: ModelConfig, fetchImpl: FetchLike = fetch): Promise<ConnectionTestResult> {
  if (config.providerMode === 'known-provider') return failure('proxy-required', 'Known-provider routing requires a server-side provider proxy.', 'Use the protected server proxy before sending prompts to a hosted provider. No browser credential was used.', false, 'Check the hosted-provider status and configure its server credential.')
  return fetchModelList(config, fetchImpl)
}

export async function testAiConnection(config: ModelConfig, fetchImpl: FetchLike = fetch): Promise<ConnectionTestResult> {
  if (config.providerMode === 'known-provider') return failure('proxy-required', 'Known-provider routing requires a server-side provider proxy.', 'Use the protected server proxy before sending prompts to a hosted provider. No browser credential was used.', false, 'Check the hosted-provider status and configure its server credential.')
  if (!config.model.trim()) return failure('configuration', 'Add a model name before testing the connection.', 'The model field is empty.', false, 'Choose a discovered model or enter the model ID used by the local server.')

  const result = await discoverAiModels(config, fetchImpl)
  if (!result.ok) return result
  const models = result.models || []
  const warning = models.length && !models.includes(config.model.trim()) ? `The endpoint responded, but “${config.model.trim()}” was not listed in /models.` : undefined
  return { ...result, message: 'AI connection is live.', warning, nextAction: warning ? 'Choose a discovered model or verify the configured model ID before generating.' : 'You can generate a draft or continue refining the provider settings.' }
}
