# Albadry Content Center

> A local-first production desk for turning one technical idea into an editable, reviewable content pack.

The Content Center is an evolving creator workflow for long-form technical videos, short-form discovery content, montage planning, color-grade notes, and editor hand-off. The repository began as a self-contained vanilla HTML application and now contains the first componentized migration foundation: a React frontend with typed domain seams, a staged combined-pack workflow, browser-local persistence, Markdown export, and automated unit coverage.

## Current status

The current `dev` branch contains the migration foundation and combined-pack implementation wave. The managed frontend runtime is currently **React 19 + Vite + TypeScript**, not a finished Next.js application yet. The code is intentionally organized around the target Next.js boundaries so the remaining migration can proceed incrementally rather than through a risky rewrite.

| Area | Status |
|---|---|
| Editorial Control Room shell | Implemented |
| Route-based workspace navigation | Implemented with Wouter in the current Vite runtime |
| Long-form and short-form reference surfaces | Implemented |
| Combined pack domain model | Implemented |
| Six independently addressable parts | Implemented: long-form plus five shorts |
| Staged fields/script/montage/grade state | Implemented with a typed reducer |
| Per-part regeneration seam | Implemented; current UI uses deterministic placeholder stage output until provider wiring is completed |
| Browser-local combined-pack storage | Implemented with schema filtering and quota-safe writes |
| Markdown hand-off export | Implemented |
| Automated tests | Implemented with Vitest |
| Next.js App Router runtime | Planned next migration wave |
| Server-side AI proxy, authentication, cloud sync | Not implemented by design |

## Product intent

The product is designed for a solo technical creator working across D365, Power Platform, AI/SaaS, and software engineering topics. The intended flow is:

```text
Topic + notes
    → editable fields
    → long-form and short-form scripts
    → montage plans
    → grade cards
    → production run-sheet
    → Markdown hand-off
```

The system is deliberately not a video renderer or CapCut automation tool. Its output is an executable editorial specification that keeps the creator’s source notes, technical claims, timeline, and verdict connected.

## Design direction

The interface follows the **Editorial Control Room** direction. It combines a dark graphite production desk, signal amber for progress and authored judgment, steel-blue secondary structure, compact metadata labels, a persistent workspace rail, and a numbered pipeline spine.

The design language is intentionally operational rather than generic SaaS. Source-tape labels communicate rules, locality, model, and artifact state. Empty states are written as desk notes. Arabic content uses Cairo, interface copy uses Inter, and display labels use Space Grotesk.

## Getting started

### Requirements

Use Node.js 18 or newer and pnpm. The repository currently records pnpm 10 in its package metadata. Node.js 22 and pnpm are suitable for the present development environment.

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

The development command starts Vite and serves the frontend on the configured local port. The application is a browser-first interface; no database or account setup is required for the current workflow.

### Run the production build

```bash
pnpm build
pnpm start
```

### Run validation

```bash
pnpm test
pnpm check
```

`pnpm test` runs the Vitest suite. `pnpm check` runs TypeScript without emitting files. The build command also bundles the small static server used by the current template runtime.

## Main workspace routes

| Route | Purpose |
|---|---|
| `/` | Control-room landing surface and production sequence overview |
| `/generator` | Compose topic and notes, choose a pack mode, run staged generation, preview parts, save, and export |
| `/system/long` | Long-form authority system, timeline, and golden rules |
| `/system/short` | Short-form discovery system, publishing cycle, and hook library |
| `/saved` | Browser-local combined-pack library with search and deletion |
| `/settings` | Local AI endpoint, model, generation rules, and trust-boundary settings |

## Repository structure

```text
client/
  src/
    components/              Shared shell and reusable UI components
    lib/                     Domain, storage, validation, AI, and export seams
    pages/                   Route-level workspace surfaces
    App.tsx                  Current route composition
    index.css                Editorial Control Room design system
  public/                    Small configuration files only
server/                      Current static template server runtime
shared/                      Template-compatible shared constants
vitest.config.ts             Unit-test configuration
ideas.md                     Selected design direction and style decisions
todo.md                       Completed migration-wave checklist
NEXTJS_MIGRATION_PLAN.md     Architecture and phased conversion plan
COMBINED_GENERATION_PLAN.md  Product and content-system specification
pending.md                   Legacy HTML work still not yet extracted
```

The original single-file application remains in the repository as a behavioral reference. The canonical legacy artifact is `deepseek_html_20260810_71c0d4.html`; dated `.bak.html` files are historical variants and should not be treated as independent application sources.

## Combined-pack domain

The typed combined pack is defined in `client/src/lib/pack-domain.ts`. It contains one long-form part and five short-form parts. Each part has an independent status for `fields`, `script`, `montage`, and `grade`.

```ts
type PartKey = 'long' | `short-${number}`
type GenerationStage = 'fields' | 'script' | 'montage' | 'grade'
type StageStatus = 'idle' | 'running' | 'done' | 'partial' | 'error'
```

The reducer is intentionally scoped by stage and part. Regenerating `short-3` fields does not replace the long-form script, the other shorts, or any completed montage or grade artifact. This is the core reliability seam that the original monolithic application did not have as a reusable typed module.

## AI provider boundary

The provider interface is defined in `client/src/lib/ai-provider.ts`. It follows the OpenAI-compatible chat completion shape and is designed to support a local LM Studio-style endpoint first.

The current combined-pack screen uses deterministic sample artifacts to exercise the reducer, preview, save, and export workflows. The next implementation wave should connect real prompt builders and response schemas to the provider interface.

The intended provider modes are:

| Mode | Intended use |
|---|---|
| Browser-local provider | Local endpoint configured by the creator; preserves the current privacy-first workflow |
| Server-side proxy | Future hosted deployment where provider credentials must remain server-side |

Do not place provider credentials in committed source. Do not use `NEXT_PUBLIC_` variables for secrets. If hosted provider mode is added later, credentials should be kept in non-public server environment variables and requests should be protected with authentication, rate limits, timeout handling, and sanitized errors.

## Persistence and export

Combined packs are stored in browser `localStorage` under the versioned `albadry_combined_packs_v2` namespace. The storage adapter filters for the current schema version and keeps writes bounded to the most recent 50 packs. Storage failures are non-fatal to the UI; the next hardening wave should expose quota failures as an actionable status message.

Markdown export is implemented in `client/src/lib/pack-export.ts`. The exported hand-off begins with:

1. Production run-sheet.
2. Long-form and short-form fields.
3. Scripts.
4. Montage tables.
5. Grade cards.
6. Rules and model metadata.

## Testing strategy

The current tests live beside the domain code in `client/src/lib/pack-domain.test.ts`. They cover the highest-risk pure logic:

| Test area | Coverage |
|---|---|
| Domain creation | Six-part pack shape and run-sheet creation |
| Reducer isolation | One part and one stage update without clobbering other parts |
| AI parsing | Code-fence removal and truncation warnings |
| Montage validation | Invalid and reversed timecode ranges |
| Grade validation | Numeric clamping and default filter handling |
| Persistence | Current-schema filtering and serialization round-trip |
| Export | Artifact-oriented Markdown structure |

Before the Next.js cutover, add browser end-to-end coverage for the full flow: compose → generate fields → regenerate one part → save → reload → search → export.

## Migration roadmap

The remaining conversion should follow the architecture plan in `NEXTJS_MIGRATION_PLAN.md`.

| Wave | Focus |
|---|---|
| Next | Replace deterministic sample outputs with real provider-backed prompt stages and editable field forms |
| Following | Add montage table, grade card, and run-sheet editors with validation feedback |
| Following | Move route composition to Next.js App Router and keep browser-only behavior inside narrow Client Components |
| Hardening | Add browser end-to-end tests, accessibility coverage, secret scanning, and local-storage import from the legacy application |
| Optional | Add a server-side provider proxy only after the hosting and privacy model is approved |

The Next.js target should use route segments and shared layouts for the system, generator, saved, and settings surfaces. Interactive generator state and browser storage should remain in Client Components, while static reference material and shell content can move toward Server Components. The official Next.js guidance describes this server/client separation and the App Router migration model in [1] [2].

## Security notes

The legacy HTML artifact previously contained a hard-coded AI key. That value must be considered compromised and must not be restored, reused, or committed. Before publishing a production build, rotate any related credential and run a repository secret scan across current and historical branches.

The current application is intentionally local-first and does not provide authentication, cloud sync, multi-device persistence, or server-side secret management. Those capabilities require an explicit architecture and security review before implementation.

## Contributing workflow

Work from the `dev` branch for migration changes. Keep the legacy HTML behavior available as a comparison reference while extracting a feature. New domain logic should be pure and typed before it is connected to UI components. Every feature should include an error state, a recoverable retry path, and tests for its highest-risk logic.

Before opening a pull request, run:

```bash
pnpm test
pnpm check
pnpm build
```

Do not commit generated `dist/`, dependency directories, local credentials, or personal AI configuration. Keep large visual assets outside the project’s source tree and reference managed asset URLs when they are required by the frontend runtime.

## References

[1]: https://nextjs.org/docs/app/guides/migrating/app-router-migration "Next.js App Router migration guide"

[2]: https://nextjs.org/docs/app/getting-started/server-and-client-components "Next.js Server and Client Components"
