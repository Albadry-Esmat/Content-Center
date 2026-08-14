# Hosted provider mode decision

## Decision

Hosted provider mode is **not enabled in the current release**. The default remains browser-local generation through the configured OpenAI-compatible endpoint.

## Rationale

The current application is local-first and frontend-only. A hosted provider requires a server-side secret boundary, authentication, request limits, rate limiting, provider health, redacted logs, and an explicit privacy statement. Adding a proxy without those controls would create a larger security risk than the feature value justifies at this stage.

## Entry criteria for implementation

Implementation may begin after the Next.js runtime is the canonical production runtime and the product owner approves hosted processing. The proxy must then be implemented as a server-side route, never as a client-visible secret or `NEXT_PUBLIC_` variable.

## Required acceptance gates

The hosted path must preserve local-browser mode, normalize timeouts and provider failures into the existing stage state machine, avoid logging prompts or credentials, enforce request and rate limits, and make the trust boundary visible before a request is submitted.
