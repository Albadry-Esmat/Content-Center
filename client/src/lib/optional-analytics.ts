type AnalyticsOptions = {
  endpoint?: string
  websiteId?: string
  document?: Document
}

function normalizeEndpoint(endpoint: string): string | null {
  const trimmed = endpoint.trim().replace(/\/+$/, '')
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

export function getAnalyticsScriptUrl(endpoint: string): string | null {
  const normalized = normalizeEndpoint(endpoint)
  return normalized ? `${normalized}/umami` : null
}

export function initializeOptionalAnalytics({ endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT, websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID, document: documentRef = globalThis.document }: AnalyticsOptions = {}): boolean {
  const src = getAnalyticsScriptUrl(endpoint || '')
  const trimmedWebsiteId = websiteId?.trim()
  const alreadyLoaded = documentRef ? Array.from(documentRef.querySelectorAll('script[data-website-id]')).some((script) => script.getAttribute('data-website-id') === trimmedWebsiteId) : false
  if (!src || !trimmedWebsiteId || !documentRef || alreadyLoaded) return false

  const script = documentRef.createElement('script')
  script.defer = true
  script.src = src
  script.dataset.websiteId = trimmedWebsiteId
  documentRef.head.appendChild(script)
  return true
}
