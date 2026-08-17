# AI Provider Setup

Content Center is **local-first**. The simplest setup keeps prompts on the creator’s machine through an OpenAI-compatible local endpoint. Hosted providers are optional and use the protected server proxy when enabled by the deployment.

## Choose a provider

| Provider | Route | Credential location | Best use |
|---|---|---|---|
| OpenAI-compatible local | Browser to local endpoint | No hosted credential | LM Studio, compatible local servers, or a self-hosted endpoint. |
| Ollama | Browser to local endpoint | No hosted credential | Local models for private drafting and experimentation. |
| LM Studio | Browser to local endpoint | No hosted credential | A beginner-friendly local model desktop workflow. |
| OpenAI | Browser to protected server proxy | Server environment only | Hosted generation when a deployment owner manages the credential. |
| Anthropic | Browser to protected server proxy | Server environment only | Hosted generation through an approved server boundary. |
| Google AI provider | Browser to protected server proxy | Server environment only | Hosted generation through an approved server boundary. |

> **Privacy rule:** Never paste a hosted-provider API key into the browser settings. The browser stores provider preferences and model names only; hosted credentials belong in the server environment.

## Local setup

Start a local model server that exposes an OpenAI-compatible API. In Content Center Settings, choose **Local OpenAI-compatible endpoint**, **Ollama**, or **LM Studio**, enter the base URL, and choose a model. Use **Discover models** to query the local `/v1/models` endpoint, then use **Test connection** before generating.

Typical endpoint examples are `http://localhost:1234` for an OpenAI-compatible local server, `http://localhost:11434/v1` for an Ollama-compatible route, and `http://localhost:1234/v1` for LM Studio. The exact endpoint depends on the local server configuration. If discovery fails, verify that the server is running, the browser is allowed by its CORS policy, and the URL does not contain an extra `/v1/v1` segment.

## Hosted setup

Hosted providers use the protected `ai.providerStatus`, `ai.listModels`, and `ai.complete` routes. A deployment owner configures the server environment, not the browser. The settings panel reports whether the server credential is configured without returning the credential value.

The supported server variables are:

```text
OPENAI_API_KEY
OPENAI_BASE_URL
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
```

Restart the server after changing environment variables. Sign in before inspecting hosted-provider status because provider status is protected. If the status says that a server credential is not configured, do not retry repeatedly; configure the server environment or switch to a local provider.

## Troubleshooting

| Symptom | Meaning | Recommended action |
|---|---|---|
| Base URL is invalid | The address cannot be parsed as a complete URL. | Use `http://localhost:1234` or another complete endpoint URL. |
| Connection timed out | The local server did not respond within eight seconds. | Start the model server, confirm the port, and retry once. |
| HTTP 401 or 403 | The endpoint rejected authentication. | Check the server credential or proxy configuration. Never add a hosted key to browser settings. |
| HTTP 429 | The provider rate-limited the request. | Wait briefly, then retry once. Avoid repeated test clicks. |
| HTTP 5xx | The upstream provider or local server failed. | Check provider status or local logs before retrying. |
| Model was not listed | The endpoint works, but the configured model ID was absent from `/models`. | Choose a discovered model or verify the model ID manually. |
| Hosted status unavailable | The protected status route could not be read, often because the user is not signed in. | Sign in or use a local provider. |

## Reporting a provider issue

When opening a public GitHub issue, include the provider type, operating system, endpoint shape without secrets, model name, failure category, HTTP status if present, and the relevant redacted diagnostic message. Do not include API keys, cookies, full prompt content, or private campaign notes.
