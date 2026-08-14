# Content Center Enhancement Roadmap

**Repository:** `Albadry-Esmat/Content-Center`  
**Planning baseline:** GitHub `dev` at `20dd9f6`  
**Author:** Manus AI  
**Status:** R1–R3 implementation in progress; Next.js runtime and optional hosted/collaboration work remain gated

## Decision summary

The next priority should be to turn the current combined-pack foundation into a trustworthy production workflow: real provider-backed generation, editable artifacts, recoverable failures, and a complete save/reload/export loop. The product already has the right high-level shape and visual language. The current implementation now contains the provider seam, staged artifact editors, warning-aware validation, backup/restore, and a fuller Markdown hand-off. The managed preview remains the validated Vite migration runtime while the Next.js facade is stabilized.

The recommended sequence is therefore **reliability before breadth**. First connect real, validated generation behind the provider seam. Then make every artifact editable and persistable. Then complete the Next.js runtime migration and harden security, accessibility, and end-to-end behavior. Avoid adding cloud sync, accounts, video rendering, or broad analytics until the local-first workflow is reliable and demonstrably useful.

## 1. Product baseline

The product’s primary user is a technical creator who wants to move from one topic and supporting notes to a production-ready content pack while preserving authorship, source grounding, and editorial judgment. The secondary user is an editor or collaborator who needs executable montage, grade, subtitle, and upload guidance rather than another block of generic prose.

The current repository supports the following foundation:

| Capability | Current state | Enhancement implication |
|---|---|---|
| Workspace shell | Editorial Control Room design with persistent navigation and route surfaces | Preserve the shell; deepen status and review affordances instead of redesigning it. |
| Pack domain | Typed six-part combined pack with per-stage status | Use it as the stable contract for provider responses, UI editors, storage, and export. |
| Stage workflow | Reducer supports fields, script, montage, and grade transitions | Add real async orchestration, cancellation, retry, and partial completion. |
| Generation | Browser-local provider seam for fields, script, montage, and grade | Connect a real local endpoint and verify with live model fixtures. |
| Persistence | Versioned browser-local storage for combined packs | Add migration/import from legacy keys, explicit quota errors, and backup/export. |
| Export | Markdown hand-off includes completeness metadata and review warnings | Add browser-level copy/download verification and final editor completeness rules. |
| Tests | Pure domain, parser, validation, storage serialization, and export tests | Add component and browser workflow coverage around the critical path. |
| Runtime | React/Vite runtime plus incremental Next.js App Router facade | Resolve the `/404` prerender blocker before making Next canonical. |

## 2. Prioritized enhancement portfolio

Priorities use **P0** for the next release-critical work, **P1** for improvements that make the workflow production-ready, and **P2** for capabilities that should wait until the local-first core proves its value.

| ID | Enhancement | Priority | User value | Dependency | Recommended outcome |
|---|---|---:|---|---|---|
| E-01 | Real provider-backed generation | P0 | High | `ai-provider.ts`, prompt schemas | A topic can generate a validated fields artifact through the configured OpenAI-compatible endpoint. |
| E-02 | Editable fields editor | P0 | High | Pack domain and reducer | Every generated field can be edited without losing stage status or neighboring parts. |
| E-03 | Async stage orchestration | P0 | High | E-01, reducer | Progress, timeout, abort, retry, and partial completion work per part. |
| E-04 | Response schemas and grounding | P0 | High | E-01 | Invalid JSON, missing keys, truncation, unsupported claims, and source references become visible review states. |
| E-05 | Full artifact editors | P1 | High | E-02, E-03 | Scripts, montage rows, grade cards, and run-sheet items become first-class editable artifacts. |
| E-06 | Save/reload/import hardening | P1 | High | Storage adapter | Existing browser data can be backed up, migrated, restored, and safely pruned. |
| E-07 | Complete hand-off export | P1 | High | E-05 | Markdown includes run-sheet, all parts, references, audit notes, rules version, model, and export timestamp. |
| E-08 | Browser workflow tests | P1 | High | E-01–E-07 | The critical flow is protected against regressions. |
| E-09 | Next.js App Router migration | P1 | Medium | Stable route/component contracts | Runtime matches the target architecture with narrow Client Components and shared layouts. |
| E-10 | Accessibility and Arabic QA | P1 | Medium | Stable UI components | RTL, mixed technical tokens, keyboard patterns, focus, contrast, and live status are validated. |
| E-11 | Server-side provider proxy | P2 | Medium | Security and deployment decision | Hosted credentials are kept server-side with authentication and rate controls. |
| E-12 | Accounts, cloud sync, and collaboration | P2 | Medium | E-09, E-11, data architecture | Multi-device and editor collaboration become possible without weakening local-first mode. |
| E-13 | Video rendering or CapCut automation | P2 / non-goal | Low for v1 | External product/API capability | Do not pursue unless the product scope explicitly changes; current value is the executable spec. |

## 3. Recommended release sequence

### Release R1 — Trustworthy fields generation

R1 should replace the deterministic sample output with one real provider-backed stage: fields generation for the long-form part and one short part. The implementation should add a typed request builder, a stage-specific response schema, timeout and abort handling, defensive JSON parsing, truncation messaging, and a reviewable source-grounding block.

The release is complete when a user can enter a topic and notes, run a real request, see progress, inspect warnings, edit every returned field, retry only the failed part, and continue without damaging the rest of the pack. The provider should remain browser-local by default; do not introduce a server proxy in R1.

**Acceptance gate:** ten representative topics across D365, AI/SaaS, and software engineering produce either valid field artifacts or an actionable error state. No raw provider exception, API key, or unreviewed failure should appear in the UI.

### Release R2 — Editable production artifacts

R2 should complete the artifact editors. Long and short scripts should render as structured sections with editable text. Montage should use an editable table with validated timecode fields. Grade should use bounded numeric controls and a visible global-versus-scene distinction. The run-sheet should support checklist completion and preserve state in the pack.

The preview should stop being only a display surface. It should become the working document where the creator can make a correction and regenerate only the downstream artifact that depends on it. Editing a script should mark montage as stale, not silently rewrite it.

**Acceptance gate:** editing a field or script changes the correct stale indicators, regeneration is scoped to the affected artifact, all numeric and timecode validations are visible, and the entire pack remains serializable.

### Release R3 — Reliable save, export, and recovery

R3 should harden the local library. Add a one-time importer for legacy `localStorage` namespaces where feasible, a JSON backup/export for full-fidelity restoration, clear quota and unavailable-storage messages, schema migration tests, and explicit duplicate/delete confirmation. Markdown export should include a table of contents, source notes, references, audit warnings, model, rules version, and timestamps.

**Acceptance gate:** a pack can be generated, edited, saved, reloaded, duplicated, exported, backed up, restored, and deleted. A malformed or old schema is rejected or migrated with a visible explanation rather than disappearing.

### Release R4 — Next.js runtime and quality hardening

Only after the R1–R3 behavior is stable should the runtime move to Next.js App Router. Routes should map to system, generator, saved, and settings pages. Static reference content should remain server-renderable; generator state, browser APIs, and interactive editors should be isolated in Client Components. Next.js documents this server/client boundary and route-segment migration model in [1] [2].

R4 should also add browser end-to-end tests, accessibility checks, performance checks, secret scanning, dependency review, and responsive verification. The legacy HTML should remain available as a rollback/reference artifact until acceptance is signed off.

**Acceptance gate:** the same critical workflow passes in the Next.js runtime, with no lost browser data, no route regressions, no accessibility blocker, and no secret exposure.

### Release R5 — Optional hosted mode

R5 is conditional. If the creator needs hosted models or shared access, add a server-side provider proxy with explicit authentication, rate limiting, request limits, sanitized errors, provider health, and server-side secrets. Keep local-browser mode as a separate option rather than replacing it.

**Acceptance gate:** hosted and local modes have clear trust-boundary copy, separate configuration paths, observable failures, and no credential exposure in client bundles or logs.

## 4. Critical path and dependency map

```text
E-01 Provider-backed fields
  → E-03 Async orchestration
  → E-04 Schemas and grounding
  → E-02 Editable fields
  → E-05 Script / montage / grade / run-sheet editors
  → E-06 Storage hardening
  → E-07 Complete export
  → E-08 Browser workflow tests
  → E-09 Next.js runtime migration
  → E-10 Accessibility and Arabic QA
```

The key architectural rule is that the **pack domain and provider contract must stabilize before the runtime migration**. Moving the current UI to Next.js before the async and persistence semantics are settled would duplicate work and make it harder to distinguish framework problems from product-state problems.

## 5. UX enhancements

The existing Editorial Control Room direction should be extended through operational clarity rather than more decoration. Every stage needs a compact status block that says whether it is idle, running, complete, stale, partial, or failed. Every error should explain whether the user should retry, edit the input, increase the model budget, or check the connection.

The generator should add a two-level review pattern. The first level is **artifact review**, where the creator edits the generated content. The second is **evidence review**, where grounded claims, references, model metadata, and “needs verification” warnings are visible alongside the artifact. The interface should never imply that a generated field is factually approved merely because the model returned JSON.

The Arabic-first experience should be treated as a quality feature, not a translation layer. Add mixed-direction rendering tests for Arabic prose containing timecodes, API names, code identifiers, URLs, and version strings. Use clear RTL indicators in previews and maintain LTR runs for technical tokens.

## 6. Technical hardening

| Area | Enhancement | Quality gate |
|---|---|---|
| Async behavior | AbortController, per-request timeout, retry policy, stage cancellation, idempotency key | A slow or disconnected endpoint leaves a recoverable part-level error. |
| Validation | Typed schemas for every stage, required-field checks, enum checks, timecode ordering, numeric clamps | Invalid output never renders as silently valid. |
| State | Explicit stale/partial/error states and downstream invalidation rules | Editing an upstream artifact marks only dependent artifacts stale. |
| Storage | Schema migration, bounded writes, backup/restore, quota messaging | Existing packs remain readable across version changes. |
| Security | Remove exposed credentials, secret scanning, iframe provider allowlist, Markdown sanitization | No credential or unsafe embed reaches the client or export unexpectedly. |
| Observability | Local opt-in counters for stage time, retries, failure classes, export completion | Metrics stay local and never leave the browser without explicit export. |
| Runtime | Next.js App Router with narrow Client Components | Static content is not forced into the full client bundle. |

## 7. Metrics and release signals

Use local, anonymous metrics only unless the product’s privacy decision changes. The existing product plan provides a useful starting set:

| Metric | Initial signal | Why it matters |
|---|---|---|
| Topic-to-first-fields time | Median and p90 | Measures whether the brief stage is useful. |
| Fields retry rate | By stage and part | Indicates prompt/schema reliability. |
| Part completion rate | Fields → script → montage → grade | Shows where the workflow loses the creator. |
| Edit-before-accept rate | Per artifact type | Reveals whether outputs are close enough to be useful. |
| Export completion rate | Saved packs reaching Markdown export | Measures hand-off value. |
| Recovery success rate | Error → retry → completion | Measures whether error UX works. |
| Local storage failures | Count and cause | Protects against silent data loss. |

Do not optimize for request count or raw AI output volume. The product’s meaningful outcome is a creator reaching a reviewable, production-ready hand-off with fewer manual gaps.

## 8. Open decisions

| Decision | Recommendation |
|---|---|
| Provider mode for next release | Browser-local only; defer server proxy until hosted credentials are required. |
| Pack default | Five shorts `#1–#5`; expose optional `#0` after the main flow is stable. |
| Review behavior | Warnings by default; do not block export unless the creator explicitly enables a strict review gate. |
| Persistence | Continue local-first; add explicit backup/restore before any cloud feature. |
| Runtime migration | Do it after R1–R3 behavior stabilizes. |
| Video automation | Keep as a non-goal for the current product boundary. |

## 9. Recommended next implementation slice

The first R1/R2 slice is implemented in the working frontend. Continue with live endpoint fixtures and browser workflow coverage. The remaining R4 work is the Next.js runtime gate, not a reason to discard the validated local workflow.

The first concrete tickets should be:

| Ticket | Deliverable |
|---|---|
| R1-01 | Typed fields schema and prompt builder with topic, notes, rules, and response-only-JSON instruction |
| R1-02 | Provider request adapter with timeout, abort, sanitized error normalization, and no credential logging |
| R1-03 | Fields response parser with code-fence removal, truncation warnings, required-field warnings, and safe fallback |
| R1-04 | Generator status panel for idle, running, done, partial, stale, and error states |
| R1-05 | Editable long and short field forms connected to the reducer |
| R1-06 | Unit and browser tests for successful generation, invalid JSON, timeout, retry, and part isolation |

## Artifact register

| ID | Artifact | Role |
|---|---|---|
| A-01 | `COMBINED_GENERATION_PLAN.md` | Product scope, content system, staged workflow, risks, and QA plan |
| A-02 | `NEXTJS_MIGRATION_PLAN.md` | Current/target architecture and migration waves |
| A-03 | `README.md` | Repository setup and current implementation status |
| A-04 | `client/src/lib/pack-domain.ts` | Combined-pack types and reducer |
| A-05 | `client/src/lib/ai-provider.ts` | AI provider seam |
| A-06 | `client/src/lib/ai-parser.ts` | Response parsing and artifact validation helpers |
| A-07 | `client/src/lib/pack-export.ts` | Markdown hand-off export |
| A-08 | `client/src/lib/pack-domain.test.ts` | Current pure-logic test coverage |

## Risks and next handoffs

The highest risks are provider variability in Arabic-plus-technical output, long local-model latency, accidental loss of user edits, and secret exposure if hosted mode is introduced prematurely. The next handoff is to implementation for R1-01 through R1-06, followed by security review of provider configuration and testing review of browser workflow coverage.

## References

[1]: https://nextjs.org/docs/app/guides/migrating/app-router-migration "Next.js App Router migration guide"

[2]: https://nextjs.org/docs/app/getting-started/server-and-client-components "Next.js Server and Client Components"
