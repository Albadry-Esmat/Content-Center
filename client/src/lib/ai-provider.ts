// Design philosophy: Editorial Control Room — provider access is a seam, never a hidden credential path.

export type ChatCompletionRequest = {
  baseUrl: string
  model: string
  messages: Array<{ role: 'system' | 'user'; content: string }>
  temperature: number
  maxTokens: number
  apiKey?: string
}

export type AiProvider = {
  complete: (request: ChatCompletionRequest, signal?: AbortSignal) => Promise<string>
}

export function createBrowserProvider(): AiProvider {
  return {
    async complete(request, signal) {
      const endpoint = new URL('/v1/chat/completions', request.baseUrl).toString()
      const response = await fetch(endpoint, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...(request.apiKey ? { Authorization: `Bearer ${request.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: false,
        }),
      })
      if (!response.ok) throw new Error(`AI request failed with ${response.status}`)
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
      return data.choices?.[0]?.message?.content ?? ''
    },
  }
}
