# SaaS Runtime Verification Notes

## 14 August 2026 — Workspace bootstrap

Visual verification confirmed that the authenticated shell recognizes the signed-in user and reports cloud sync readiness. The workspace bootstrap now waits for the authenticated user record, creates or retrieves the personal workspace, and exposes a retryable recovery state rather than retaining a permanent loading view. The browser-created personal workspace `ws_7cM1IrM9Y6ekkAGbFF` is recorded with an owner membership for the authenticated account.

The generator route still renders in local-first mode, so the existing core workflow remains available during this SaaS foundation fix.

## Active runtime boundary

The supported SaaS runtime is the React, Vite, Express, tRPC, and Drizzle application under `client/`, `server/`, `shared/`, and `drizzle/`. The historical `app/` App Router prototype is intentionally excluded from the active TypeScript release check and no longer brings the unused Next.js package into the production dependency tree. Any future Next.js migration must be planned as a dedicated replacement of the active runtime, rather than treating the prototype as deployable.

The active client now lazy-loads routed production views and separates React and data libraries into cacheable build chunks. Run `pnpm bundle:audit` when assessing retained client weight; it produces a source-map-only analysis and the regular `pnpm build` command removes those maps from the release output.
