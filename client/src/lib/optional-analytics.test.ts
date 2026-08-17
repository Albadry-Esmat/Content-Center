// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { getAnalyticsScriptUrl, initializeOptionalAnalytics } from './optional-analytics'

describe('optional analytics', () => {
  afterEach(() => { document.head.querySelectorAll('script[data-website-id]').forEach((script) => script.remove()) })

  it('rejects empty, malformed, and non-http endpoints', () => {
    expect(getAnalyticsScriptUrl('')).toBeNull()
    expect(getAnalyticsScriptUrl('not a url')).toBeNull()
    expect(getAnalyticsScriptUrl('javascript:alert(1)')).toBeNull()
    expect(getAnalyticsScriptUrl('https://analytics.example/')).toBe('https://analytics.example/umami')
  })

  it('stays disabled without complete configuration', () => {
    expect(initializeOptionalAnalytics({ endpoint: '', websiteId: '', document })).toBe(false)
    expect(document.head.querySelectorAll('script[data-website-id]')).toHaveLength(0)
  })

  it('injects one deferred script and does not duplicate it', () => {
    expect(initializeOptionalAnalytics({ endpoint: 'https://analytics.example/', websiteId: 'site-demo', document })).toBe(true)
    expect(initializeOptionalAnalytics({ endpoint: 'https://analytics.example/', websiteId: 'site-demo', document })).toBe(false)
    const script = document.head.querySelector('script[data-website-id="site-demo"]') as HTMLScriptElement | null
    expect(script?.src).toBe('https://analytics.example/umami')
    expect(script?.defer).toBe(true)
  })
})
