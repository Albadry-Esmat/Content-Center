import { describe, expect, it } from 'vitest'
import { getOAuthLoginConfiguration } from './const'

describe('OAuth client configuration', () => {
  it('identifies the public local OAuth settings required before sign-in can start', () => {
    expect(getOAuthLoginConfiguration({})).toEqual({ configured: false, missing: ['VITE_OAUTH_PORTAL_URL', 'VITE_APP_ID'] })
  })

  it('accepts a complete OAuth portal and application identifier', () => {
    expect(getOAuthLoginConfiguration({ oauthPortalUrl: 'https://portal.example.test', appId: 'app_local' })).toEqual({ configured: true, oauthPortalUrl: 'https://portal.example.test', appId: 'app_local' })
  })
})
