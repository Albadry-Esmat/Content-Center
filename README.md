# Albadry Content Center

> A local-first production desk for turning one technical idea into an editable, reviewable content pack.

Content Center combines long-form authority content, short-form discovery content, montage planning, grade notes, and editor hand-off into one typed workflow. The original single-file HTML application remains available in the GitHub repository as a behavioral reference while the migrated implementation evolves.

## Current implementation

The validated managed runtime is **React 19 + Vite + TypeScript**. The implementation now includes:

| Area | Status |
|---|---|
| Editorial Control Room shell | Implemented |
| Six-part combined pack | Implemented: one long-form part plus five shorts |
| Staged reducer | Implemented for fields, script, montage, and grade |
| Provider-backed generation seam | Implemented with typed prompts, parsing warnings, timeout, abort, and retry |
| Editable artifacts | Implemented for fields, script, montage, grade, and run-sheet |
| Local persistence | Implemented with schema filtering, bounded writes, backup, restore, and legacy migration |
| Markdown export | Implemented with run-sheet, metadata, completeness, warnings, and artifact tables |
| Security validation | Implemented with `pnpm security` |
| Accessibility hardening | Implemented with visible focus, live generation status, labels, and `dir="auto"` fields |
| Next.js App Router facade | Staged under `app/`; not yet the release runtime |
| Hosted AI proxy and collaboration | Evaluated and deferred pending backend/security approval |

## Product flow

```text
Topic + notes → fields → scripts → montage → grade → run-sheet → Markdown hand-off
```

The product is deliberately **not** a video renderer or CapCut automation tool. It creates an executable editorial specification that keeps source notes, technical claims, timeline, and verdict connected.

## Getting started

Requirements are Node.js 18+ and pnpm.

```bash
pnpm install
pnpm dev
```

### Local macOS startup recovery

If `pnpm dev` reports `ERR_MODULE_NOT_FOUND` for a package such as `dotenv`, the local `node_modules` directory is incomplete or stale; the committed dependency manifest and lockfile already declare the package. Restore the exact dependency tree without changing project files:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The development server selects the next available port when port `3000` is occupied; use the localhost URL printed in the terminal. A missing `OAUTH_SERVER_URL` produces an OAuth configuration warning, but it is distinct from a dependency-installation failure. Configure the required Manus OAuth environment variables before testing authenticated cloud workspaces; local-first editing remains available without a cloud session.

The current preview is served by Vite. The production build is:

```bash
pnpm build
pnpm start
```

Validation commands:

```bash
pnpm security
pnpm test
pnpm check
pnpm build
```

The staged Next.js facade can be inspected with `pnpm next:dev` and validated with `pnpm next:build` while the App Router migration gate is being resolved. The current blocker is documented in `APP_ROUTER_MIGRATION_STATUS.md`; the Vite runtime remains the validated release path until the Next build is clean.

## Routes

| Route | Purpose |
|---|---|
| `/` | Control-room overview |
| `/generator` | Compose, generate, edit, save, and export packs |
| `/system/long` | Long-form authority system |
| `/system/short` | Short-form discovery system |
| `/saved` | Search, delete, restore, and export local packs |
| `/settings` | Provider, model, rules, and trust-boundary settings |

## Architecture

Pure domain logic lives in `client/src/lib/pack-domain.ts`, `ai-parser.ts`, `generation-service.ts`, `content-storage.ts`, and `pack-export.ts`. UI components consume the typed reducer rather than mutating artifacts directly. Browser-only state remains in Client Components during the Next.js transition.

The intended provider modes are:

| Mode | Current position |
|---|---|
| Browser-local provider | Supported direction; preserves the local-first trust boundary |
| Hosted provider proxy | Deferred until a server-side secret, rate-limit, privacy, and observability model is approved |

Never commit provider credentials or use `NEXT_PUBLIC_` variables for secrets. The legacy HTML source contained a hard-coded AI key; it must be treated as compromised and rotated rather than restored.

## Persistence and export

Combined packs are stored under the versioned `albadry_combined_packs_v2` localStorage namespace. The adapter accepts only schema version 2, bounds the library to the most recent 50 packs, supports JSON backup/restore, and can migrate the earlier local pack format. Markdown export preserves production metadata, run-sheet state, artifact sections, stage completeness, and review warnings.

## Testing and migration status

The current unit suite covers pack creation, reducer isolation, parser warnings, montage timecode validation, grade clamping, persistence serialization, generation-service behavior, and Markdown export. The next test layer is browser workflow coverage for compose → generate → edit → save → reload → export.

The App Router migration is intentionally incremental. `app/` contains route segments and a shared shell, while `app/LegacyClient.tsx` isolates legacy Vite screens. The Next build currently reaches compilation and type validation but fails during framework-generated `/404` prerender with a document-boundary error. This is tracked openly and must be resolved before making Next.js canonical.

See `ENHANCEMENT_ROADMAP.md`, `APP_ROUTER_MIGRATION_STATUS.md`, `HOSTED_MODE_DECISION.md`, and `COLLABORATION_DECISION.md` for the current release gates and deferred architecture decisions.

The product boundary is recorded in `NON_GOALS.md`: Content Center is an editorial specification and hand-off system, not a video renderer, NLE replacement, or auto-publishing bot.
