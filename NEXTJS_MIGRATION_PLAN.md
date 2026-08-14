# Content Center → Next.js Migration Plan

**Author:** Manus AI  
**Repository:** `Albadry-Esmat/Content-Center`  
**Assessment date:** 14 August 2026  
**Status:** Recommended plan; implementation not started

## Executive decision

The repository is not currently a framework application. It is a browser-first, single-file prototype/product with embedded HTML, CSS, and vanilla JavaScript. The primary application file is approximately **7,329 lines and 362 KB**, and the repository has no `package.json`, source directory, build configuration, test suite, or server boundary. The repository also contains multiple dated HTML backups and planning documents, with only one initial Git commit.

The recommended migration is a **controlled extraction into a new Next.js App Router application**, while preserving the current local-first behavior and the existing UX contract. This should be treated as a **front-end modernization and boundary-hardening effort**, not a direct HTML-to-JSX rewrite. The safest sequence is to first freeze the current behavior with fixtures and screenshots, then extract the domain logic into typed modules, then build the Next.js shell and migrate feature slices incrementally.

Next.js is appropriate because the target can use App Router layouts and route segments while keeping interactive state in Client Components. Official guidance states that layouts and pages are Server Components by default, while state, event handlers, lifecycle logic, browser APIs such as `localStorage`, and custom hooks belong in Client Components [1] [2]. That maps well to this project: reference content and shell can be mostly static, while the generator workspace, saved packs, settings, preview panes, and browser persistence remain client-interactive.

## 1. Current-state baseline

| Area | Evidence from repository | Assessment |
|---|---|---|
| Application shape | `deepseek_html_20260810_71c0d4.html` contains the complete document, CSS, and JavaScript runtime. | Monolithic single-file application; no module boundaries. |
| UI surfaces | Long-Form, Short/Reel, Combined, Script Generator, and Saved Scripts tabs are defined in one document. | Natural route and component boundaries already exist conceptually. |
| Generator workflow | Five-stage pipeline: fields, script, montage, grade, save/export. | Strong candidate for a typed state machine and feature modules. |
| Runtime logic | Approximately 102 named functions, 75 event-listener registrations, and 138 `getElementById` references in the primary file. | High coupling to the DOM; direct JSX conversion would preserve the main maintainability problem. |
| Persistence | `localStorage` stores checklist state, AI configuration, and saved scripts/packs. | Must be wrapped behind typed storage adapters and guarded for browser-only execution. |
| AI integration | Browser `fetch` calls an OpenAI-compatible `/v1/chat/completions` endpoint using configurable base URL, model, token budget, and optional bearer key. | Preserve provider-agnostic contract, but isolate it behind a client/server policy decision. |
| Media reference | YouTube, Vimeo, and Dailymotion URLs are parsed into iframe embeds. | Extract into a validated media-reference component; do not allow arbitrary iframe URLs. |
| Styling | Custom dark/gold theme, Inter/Cairo fonts, and Bootstrap CDN in later backup variants. | Choose one styling strategy during migration; avoid carrying both legacy CSS and Bootstrap compatibility layers indefinitely. |
| Data model | Combined plan defines `meta`, `fields`, `scripts`, `montage`, `grade`, `done`, and `retries`. | Convert this into TypeScript domain types and versioned persistence schemas. |
| Tests and delivery | No package manager, test runner, CI configuration, or deployment manifest is present. | Test and release foundations must be created before functional migration. |
| Repository hygiene | Multiple `.bak.html` and dated variants coexist with the main file. | Establish a canonical source and move historical artifacts to an archive or separate branch. |

The project plan documents the intended product as a local-first content factory: one topic and optional notes produce a long script, five short scripts, montage plans, CapCut grade cards, a run-sheet, and a combined Markdown export. It explicitly calls for staged, idempotent generation, per-part regeneration, editable outputs, RTL/Arabic support, local-only analytics, and versioned packs. These are requirements to preserve during migration rather than optional redesign items.

## 2. Important security finding

The current HTML contains a hard-coded default bearer-style AI key in the client source. The value is intentionally not reproduced in this report. It must be treated as compromised: **revoke or rotate it before publishing any migrated build**, remove it from every tracked file and historical backup, and inspect Git history before pushing a replacement.

The current design stores AI configuration, including a user-supplied key, in `localStorage`. That may be acceptable for a deliberately local LM Studio workflow, but it must be explicit in the product settings and must never be confused with server-side secret storage. Next.js only exposes environment variables to the browser when they are prefixed with `NEXT_PUBLIC_`, and those values are bundled into the client build; secret values must therefore remain server-side or be entered locally at runtime [3].

Recommended policy:

| Scenario | Recommendation |
|---|---|
| Local LM Studio endpoint on the user’s machine | Keep an opt-in client-side configuration path, with a “do not persist key” option and clear privacy copy. |
| Hosted/proxy provider | Route requests through a Next.js Route Handler or server-side service; keep provider credentials in non-public environment variables. |
| Shared or multi-user deployment | Do not store provider secrets in browser storage; add authentication, rate limiting, audit logging, and a server-side provider abstraction before enabling it. |

## 3. Target Next.js architecture

### 3.1 Route and screen map

Use the App Router with a shared root layout and feature routes. The existing tab metaphor can remain in the UI, but route-based navigation will make state, deep links, browser history, accessibility, and future expansion more reliable.

| Route | Purpose | Rendering boundary |
|---|---|---|
| `/` | Redirect or landing page into the workspace. | Server page with client navigation. |
| `/system/long` | Long-form content system and checklists. | Mostly Server Component; checklist widget is Client Component. |
| `/system/short` | Short/Reel system, types, hooks, and checklists. | Mostly Server Component; checklist widget is Client Component. |
| `/generator` | Main compose-and-generate workspace. | Client feature shell composed inside a Server page. |
| `/saved` | Search, filter, sort, view, duplicate, delete, and export saved packs. | Client page because storage is browser-local. |
| `/settings` | AI connection, model, generation, research/accuracy, brand voice, and privacy settings. | Client page for local settings; server connection route only when hosted provider mode is enabled. |
| `/api/ai/chat` | Optional hosted-provider proxy with timeout and sanitized errors. | Route Handler; only if server-side provider mode is required. |

Next.js supports incremental adoption of the App Router and route-segment layouts, but this repository has no existing Pages Router to preserve. The practical equivalent is a feature-by-feature extraction into `app/` rather than a big-bang rewrite [1].

### 3.2 Suggested source structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    system/long/page.tsx
    system/short/page.tsx
    generator/page.tsx
    saved/page.tsx
    settings/page.tsx
    api/ai/chat/route.ts              # optional hosted mode
  components/
    app-shell/
    navigation/
    ui/
    markdown/
    media/
    accessibility/
  features/
    generator/
      components/
      hooks/
      prompts/
      validators/
      generator-reducer.ts
      generator-types.ts
      generator-selectors.ts
    saved-packs/
      components/
      storage.ts
      schema.ts
    settings/
      components/
      storage.ts
      schema.ts
    checklists/
      components/
      storage.ts
  lib/
    ai/
      provider.ts
      openai-compatible.ts
      client-provider.ts
      server-provider.ts
      errors.ts
    export/
      pack-to-markdown.ts
    storage/
      browser-storage.ts
      migrations.ts
      quota.ts
    validation/
      common.ts
      timecodes.ts
      grade.ts
    media/
      parse-video-url.ts
  content/
    long-system.ts
    short-system.ts
    rules.ts
  test-fixtures/
    packs/
    ai-responses/
```

### 3.3 Client/server boundary

Keep static reference material, metadata, fonts, and non-interactive layout in Server Components. Mark only stateful or browser-dependent components with `'use client'`: generator forms, progress/status widgets, preview editors, checklists, saved-pack browser, settings form, and media embed controls. This avoids placing the entire application under one large client boundary; Next.js documentation specifically recommends using Client Components narrowly to reduce client JavaScript [2].

Do not move the current browser-side AI request to the server automatically. The user’s local LM Studio endpoint is intentionally configured at runtime and may be reachable only from the browser. Instead, implement an explicit provider interface with two modes:

```ts
export type AiProviderMode = 'browser-openai-compatible' | 'server-proxy'

export interface AiProvider {
  complete(request: ChatCompletionRequest, signal?: AbortSignal): Promise<ChatCompletionResponse>
}
```

The browser provider preserves local-first behavior. The server proxy is an optional deployment capability for hosted credentials and should be enabled only after its trust, privacy, and rate-limit behavior are defined.

## 4. Migration strategy

A **strangler-style extraction** is safer than rewriting every function at once. Keep the current HTML artifact runnable as a reference during the first migration waves, but stop adding features to it after the baseline is captured.

| Wave | Scope | Main output | Exit gate |
|---|---|---|---|
| 0. Baseline and hygiene | Select canonical HTML, archive backups, rotate exposed key, record current flows, create seed fixtures, add screenshots/manual acceptance checklist. | Reproducible behavior baseline. | Existing HTML passes smoke checklist and no credential remains in tracked source/history to be retained. |
| 1. Next.js foundation | Create TypeScript App Router project, root layout, fonts, theme tokens, navigation, metadata, linting, formatting, test runner, and CI. | Running shell with no product regression yet. | `dev`, `build`, lint, typecheck, and test commands pass. |
| 2. Static system pages | Extract Long-Form and Short/Reel reference tabs and checklists. | `/system/long` and `/system/short`. | Content parity, RTL, keyboard navigation, responsive layout, checklist persistence. |
| 3. Domain extraction | Define typed pack schema, rules version, stage status, validators, parser/repair logic, reducer, selectors, storage adapters, and Markdown exporter. | Framework-independent core modules. | Unit tests cover valid, malformed, truncated, partial, and version-migrated fixtures. |
| 4. Generator MVP | Migrate long and short single-mode flows first: compose form, fields, editable inputs, script generation, progress, errors, retry, and preview. | `/generator` supports existing single flows. | Golden fixtures and manual parity checks pass; only intended client components use browser APIs. |
| 5. Combined pack | Migrate combined fields, scripts, montage, grade, per-part regeneration, stage isolation, and pack viewer. | Full staged content-pack workflow. | Each part can regenerate independently without clobbering other stages; partial/error states are recoverable. |
| 6. Saved/settings/export | Migrate saved-pack CRUD, duplication, deletion, filters, settings page, local analytics, and complete Markdown export. | `/saved`, `/settings`, production-ready hand-off flow. | Save → view → duplicate → delete → export passes; schema migrations and quota handling pass. |
| 7. Hardening and cutover | Accessibility, mobile, security, performance, visual regression, deployment, documentation, and rollback rehearsal. | Release candidate and deprecation decision. | Release gates pass and legacy HTML remains available as rollback until acceptance is signed off. |

## 5. Domain extraction priorities

The current functions should be grouped by responsibility rather than translated one-for-one. The first extraction should create pure functions with no DOM access.

| Current responsibility | Target module | Notes |
|---|---|---|
| `parseModelJSON`, `repairJSON`, truncation handling | `lib/ai/parse-response.ts` | Pure parser with explicit warnings and failure reasons. |
| Prompt builders and system rules | `features/generator/prompts/*`, `content/rules.ts` | Keep rules versioned and data-driven. |
| `generatedPack`, `done`, `retries`, per-part statuses | `generator-reducer.ts` and `generator-types.ts` | Use discriminated unions for `idle`, `running`, `done`, `partial`, and `error`. |
| Stage generation loops | `features/generator/services/*` | One service per stage; idempotent by part key. |
| Timecode and grade validation | `lib/validation/timecodes.ts`, `grade.ts` | Clamp numeric values and return warnings rather than silently corrupting output. |
| `localStorage` reads/writes | `lib/storage/*` and feature storage adapters | Guard SSR, catch quota errors, migrate `packVersion`, and prune only by explicit policy. |
| `renderMarkdown`, `packToMarkdown` | `components/markdown/*`, `lib/export/pack-to-markdown.ts` | Sanitize rendered content and retain source metadata. |
| `parseVideoUrl` and iframe rendering | `lib/media/parse-video-url.ts`, `components/media/VideoEmbed.tsx` | Allowlist providers and validate IDs. |
| Direct DOM event wiring | React props, hooks, reducer dispatch, and form actions | Remove `getElementById` as an application coordination mechanism. |

## 6. Validation and QA strategy

The current plan already defines strong test dimensions. Convert them into automated gates instead of relying on browser-console inspection.

| Test layer | Coverage |
|---|---|
| Unit tests | JSON repair, truncation detection, timecode ordering, grade clamping, word counts, video URL parsing, rules/version migrations, storage quota behavior, and Markdown export. |
| Contract tests | OpenAI-compatible request shape, provider error normalization, timeout/abort behavior, malformed response handling, and server-proxy redaction if enabled. |
| Fixture/golden tests | Seed topics for D365, AI/SaaS, and software engineering; validate long and short pack structures, required fields, references, and stage completeness. |
| Component tests | Generator mode switching, accordion/tab semantics, editable fields, progress/status announcements, per-part regeneration, empty states, and error retry. |
| End-to-end tests | Generate fields → edit → scripts → montage → grade → save → view → duplicate → delete → export. Include refresh/reload and local-storage restoration. |
| Accessibility tests | Labels, heading order, focus management, keyboard tab/accordion patterns, live status region, contrast, RTL/LTR mixed content, and 44px touch targets. |
| Visual regression | Reference pages, generator empty/loading/error/done states, Arabic output, montage tables, grade cards, saved pack viewer, and mobile widths. |
| Security checks | Secret scanning, no credential literals, iframe allowlist, Markdown sanitization, safe error messages, dependency audit, and server-route authentication/rate limiting if hosted mode is enabled. |

A release is not complete until the migrated application demonstrates behavior parity for the baseline flows and the legacy HTML remains available for rollback. The migration should also add an explicit `schemaVersion`/`packVersion` migration test before changing persisted data structures.

## 7. Open issues and decisions required

1. **Canonical source:** confirm whether `deepseek_html_20260810_71c0d4.html` is the authoritative product source or whether the later Bootstrap-oriented backup is the intended visual baseline. The repository currently contains several variants.
2. **AI security mode:** decide whether the first Next.js release remains local-browser-only or includes a server-side proxy. The recommendation is browser-local first, server proxy later.
3. **Persistence scope:** confirm that no account, cloud sync, or multi-device support is required for the first release, consistent with the current product plan.
4. **UI library:** choose between formalizing the current Bootstrap direction, replacing it with a small internal design system, or retaining custom CSS tokens. Do not carry duplicated Bootstrap and legacy selector vocabularies into the new app.
5. **Combined pack defaults:** confirm whether the default is five shorts (`#1–#5`) and whether optional `#0` is hidden by default, as proposed in the plan.
6. **Provider and CORS behavior:** document the expected LM Studio base URL, CORS requirements, request timeout, model context assumptions, and behavior when the endpoint is unavailable.
7. **Data migration:** decide whether existing `localStorage` data from the HTML app must be imported. If yes, define a one-time importer for the existing keys and a backup/export step before migration.

## 8. Recommended first implementation slice

The first implementation task should not begin with JSX conversion. It should create a migration branch and complete Wave 0 plus the foundation of Wave 1:

- remove and rotate the exposed credential;
- choose and rename the canonical source artifact;
- create `package.json`, TypeScript, Next.js App Router, lint, formatting, test, and CI configuration;
- add the root layout with Inter/Cairo font handling and the existing dark/gold tokens;
- add a route shell with `/system/long`, `/system/short`, `/generator`, `/saved`, and `/settings`;
- define the initial `Pack` TypeScript schema and `schemaVersion`;
- add fixture files for one valid pack and representative malformed AI responses;
- add a browser-storage adapter and a provider interface without migrating all UI behavior yet.

This slice creates the seams needed for safe parallel work and exposes unresolved product decisions early. The full conversion should then proceed by vertical feature slices, with the old HTML treated as the behavioral oracle until the new route passes its acceptance checklist.

## Decision summary

**Proceed with a new TypeScript Next.js App Router application and an incremental extraction strategy.** Preserve the local-first product model and staged generator workflow, but replace DOM-driven coordination with typed domain modules, a reducer/state machine, feature components, storage adapters, and an explicit AI provider boundary. Do not perform a blind HTML-to-JSX conversion, do not retain the exposed key, and do not introduce server-side credentials until the deployment and privacy model is decided.

## Artifact register

| ID | Artifact | Role |
|---|---|---|
| A-01 | `deepseek_html_20260810_71c0d4.html` | Primary application baseline inspected. |
| A-02 | `deepseek_html_20260812_a3rest.bak.html` | Later Bootstrap-oriented variant; treated as a visual reference, not a confirmed canonical source. |
| A-03 | `COMBINED_GENERATION_PLAN.md` | Product, domain model, staged pipeline, risks, milestones, and QA requirements. |
| A-04 | `pending.md` | Current unfinished UI/UX and AI-accuracy work. |
| A-05 | `NEXTJS_MIGRATION_PLAN.md` | This migration plan. |

## Next handoffs

The next execution handoff is to product/architecture for the seven open decisions above, followed by implementation with the **Wave 0 foundation slice**. After that, the recommended specialist handoffs are: frontend architecture for the route/component map; backend/API architecture only if server proxy mode is selected; security review for secret handling and Markdown/iframe safety; testing strategy for fixture and end-to-end gates; and release management for the legacy rollback window.

## References

[1]: https://nextjs.org/docs/app/guides/migrating/app-router-migration "Next.js: How to migrate from Pages to the App Router"

[2]: https://nextjs.org/docs/app/getting-started/server-and-client-components "Next.js: Server and Client Components"

[3]: https://nextjs.org/docs/pages/guides/environment-variables "Next.js: How to use environment variables"
