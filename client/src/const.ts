import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

type OAuthClientEnvironment = { oauthPortalUrl?: string; appId?: string };

export function getOAuthLoginConfiguration(environment: OAuthClientEnvironment = { oauthPortalUrl: import.meta.env.VITE_OAUTH_PORTAL_URL, appId: import.meta.env.VITE_APP_ID }) {
  const oauthPortalUrl = environment.oauthPortalUrl?.trim() ?? "";
  const appId = environment.appId?.trim() ?? "";
  const missing = [
    !oauthPortalUrl ? "VITE_OAUTH_PORTAL_URL" : null,
    !appId ? "VITE_APP_ID" : null,
  ].filter((value): value is string => Boolean(value));
  if (missing.length) return { configured: false as const, missing };
  try {
    new URL(oauthPortalUrl);
  } catch {
    return { configured: false as const, missing: ["VITE_OAUTH_PORTAL_URL (valid URL)"] };
  }
  return { configured: true as const, oauthPortalUrl, appId };
}

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// cookie, and navigates immediately — so the cookie nonce always matches the
// `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// call would desync it from an in-flight login and the callback would reject it
// with "invalid oauth state". It returns void by design, so there is no URL to
// stash across renders.
export const startLogin = () => {
  const configuration = getOAuthLoginConfiguration();
  if (!configuration.configured) return configuration;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${configuration.oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", configuration.appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
  return configuration;
};
