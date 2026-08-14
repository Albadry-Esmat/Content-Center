#!/usr/bin/env bash
set -euo pipefail

repo="Albadry-Esmat/Content-Center"

create_issue() {
  local title="$1"
  local labels="$2"
  local body="$3"
  gh issue create --repo "$repo" --title "$title" --label "$labels" --body "$body"
}

create_issue "E-01: Add real provider-backed generation" "enhancement" "$(cat <<'EOF'
## Objective
Replace deterministic sample artifacts with real fields generation through the configured OpenAI-compatible provider.

## Scope
Implement a typed request builder for one long-form part and one short part. Include topic, grounding notes, rules version, model, temperature, and token budget. Keep browser-local provider mode as the default.

## Dependencies
Uses `client/src/lib/ai-provider.ts` and `client/src/lib/pack-domain.ts`. This is the first implementation task in the R1 critical path.

## Acceptance criteria
- A valid topic can call the configured provider and return a typed fields artifact.
- The request does not log or export credentials.
- Provider errors become sanitized, user-readable states.
- The long-form and one short-form path share the provider contract without duplicating transport logic.
EOF
)"

create_issue "E-02: Build editable fields editors" "enhancement" "$(cat <<'EOF'
## Objective
Make every generated field a first-class editable input instead of a read-only preview.

## Scope
Create long-form and short-form field panels connected to the combined-pack reducer. Preserve user edits across stage transitions and mode changes. Add dirty and stale indicators.

## Dependencies
Depends on E-01 provider output and the existing typed pack domain.

## Acceptance criteria
- All required fields can be edited and saved in the pack.
- Editing one part does not mutate another part.
- Upstream edits mark only dependent artifacts stale.
- Keyboard labels, focus states, and Arabic/LTR mixed content are supported.
EOF
)"

create_issue "E-03: Add async stage orchestration and recovery" "enhancement" "$(cat <<'EOF'
## Objective
Turn the reducer into a reliable asynchronous generation workflow with progress, cancellation, retries, and partial completion.

## Scope
Add per-request timeout, AbortController cancellation, sequential stage execution, per-part progress, retry counters, idempotent stage keys, and recoverable error states.

## Dependencies
Depends on E-01 and the current `packReducer` stage states.

## Acceptance criteria
- A slow or unavailable provider produces an actionable part-level error.
- Retrying one part does not reset completed neighboring parts.
- Cancellation leaves the pack valid and identifies the interrupted part.
- Progress identifies stage, part, and current operation.
EOF
)"

create_issue "E-04: Add response schemas, grounding, and evidence warnings" "enhancement" "$(cat <<'EOF'
## Objective
Make model output reviewable and safe by validating structure, grounding claims, and surfacing uncertainty.

## Scope
Add stage-specific schemas for fields, scripts, montage, and grade. Extend parsing to detect missing keys, invalid enums, truncation, unsupported claims, and references from supplied notes.

## Dependencies
Depends on E-01 and the existing `ai-parser.ts` helpers.

## Acceptance criteria
- Invalid JSON never renders as silently valid output.
- Missing fields and unsupported values produce visible warnings.
- Truncated responses provide a regenerate or budget-adjustment action.
- Grounding notes and “needs verification” markers are preserved in the pack and export.
EOF
)"

create_issue "E-05: Build editable script, montage, grade, and run-sheet artifacts" "enhancement" "$(cat <<'EOF'
## Objective
Complete the production artifact editor so the creator can review and modify the entire hand-off in one workspace.

## Scope
Add structured script sections, editable montage tables, bounded grade controls, per-scene notes, and run-sheet checklist items. Add stale-state behavior when upstream artifacts change.

## Dependencies
Depends on E-02, E-03, and E-04.

## Acceptance criteria
- Long and short scripts are editable by section.
- Montage timecodes validate on edit and display clear errors.
- Grade values are clamped and visibly labeled by CapCut panel.
- Run-sheet completion persists in the combined pack.
EOF
)"

create_issue "E-06: Harden save, reload, import, and backup" "enhancement" "$(cat <<'EOF'
## Objective
Protect creator work in the browser-local library and make schema evolution recoverable.

## Scope
Add schema migrations, legacy localStorage import where feasible, full-fidelity JSON backup/restore, explicit quota errors, duplicate confirmation, and bounded pruning with user-visible messaging.

## Dependencies
Depends on E-02 through E-05 so all artifact types can be persisted.

## Acceptance criteria
- A saved pack survives reload and schema migration.
- Backup and restore round-trip all pack artifacts and metadata.
- Storage quota or unavailable-storage failures are actionable.
- Destructive deletion is explicit and does not affect other packs.
EOF
)"

create_issue "E-07: Complete the production hand-off export" "enhancement" "$(cat <<'EOF'
## Objective
Make Markdown export a complete, traceable hand-off for the creator or editor.

## Scope
Add table of contents, run-sheet, all fields and scripts, montage tables, grade cards, sources, audit warnings, model, rules version, and timestamps. Add copy/download success feedback.

## Dependencies
Depends on E-04 through E-06.

## Acceptance criteria
- Export includes every completed artifact in deterministic order.
- Audit warnings and references are preserved.
- Empty or partial stages are labeled rather than omitted silently.
- Exported Markdown is safe to render and does not include API credentials.
EOF
)"

create_issue "E-08: Add browser workflow and regression tests" "enhancement" "$(cat <<'EOF'
## Objective
Protect the critical user journey with browser-level tests in addition to current pure-logic tests.

## Scope
Cover compose → generate fields → edit → regenerate one part → save → reload → search → export. Include timeout, malformed JSON, empty state, RTL content, and mobile layout checks.

## Dependencies
Depends on E-01 through E-07 for stable behavior.

## Acceptance criteria
- The critical workflow passes in a clean browser context.
- Error and retry paths are covered.
- Tests verify part isolation and persistence after reload.
- The suite runs in CI with a documented command.
EOF
)"

create_issue "E-09: Migrate the runtime to Next.js App Router" "enhancement" "$(cat <<'EOF'
## Objective
Complete the planned runtime migration from the current React/Vite scaffold to Next.js App Router.

## Scope
Create shared layouts and route segments for system, generator, saved, and settings surfaces. Keep browser APIs and interactive state in narrow Client Components; keep static reference content server-renderable.

## Dependencies
Depends on E-01 through E-08 so behavior is stable before runtime migration.

## Acceptance criteria
- All current routes have equivalent Next.js route segments.
- Browser-local storage is guarded from server rendering.
- Static system content is not forced into the full client bundle.
- Existing workflow tests pass against the Next.js runtime.
EOF
)"

create_issue "E-10: Harden accessibility and Arabic-first quality" "accessibility" "$(cat <<'EOF'
## Objective
Make the content desk reliably usable for keyboard, screen-reader, RTL, and mixed technical-language workflows.

## Scope
Validate headings, labels, focus management, live status regions, tabs/accordions, contrast, touch targets, Arabic punctuation, mixed-direction timecodes, URLs, APIs, and code tokens.

## Dependencies
Can begin alongside E-02, but final acceptance depends on E-05 and E-09.

## Acceptance criteria
- No critical keyboard or focus trap remains.
- Generation status is announced without relying on color alone.
- Arabic prose and LTR technical tokens render correctly in every artifact view.
- Desktop and mobile accessibility checks are documented.
EOF
)"

create_issue "E-11: Add an optional server-side AI provider proxy" "enhancement" "$(cat <<'EOF'
## Objective
Support hosted AI providers without exposing credentials to the browser.

## Scope
Add an authenticated server-side proxy only after the deployment and privacy model is approved. Include rate limiting, request limits, timeouts, provider health, redacted logs, and separate local/hosted configuration.

## Dependencies
Depends on E-01, E-03, E-04, E-09, and a security review.

## Acceptance criteria
- Provider credentials never reach client bundles.
- Hosted requests require the approved authentication boundary.
- Rate and timeout failures are normalized for the existing UI.
- Local-browser mode continues to work independently.
EOF
)"

create_issue "E-12: Add accounts, cloud sync, and editor collaboration" "enhancement" "$(cat <<'EOF'
## Objective
Evaluate and, if approved, add multi-device persistence and editor collaboration without weakening local-first mode.

## Scope
Define account, ownership, sharing, conflict resolution, synchronization, audit, and retention behavior before implementation. Do not start with UI-only cloud storage.

## Dependencies
Depends on E-09 and E-11 plus a data, security, and privacy architecture decision.

## Acceptance criteria
- Product and security decisions are documented before coding.
- Local-only mode remains available and clearly distinguished.
- Sync conflicts and offline edits have a defined resolution strategy.
- Shared pack access is authorized and auditable.
EOF
)"

create_issue "E-13: Protect the v1 non-goal for video rendering and CapCut automation" "question" "$(cat <<'EOF'
## Objective
Keep the current product boundary explicit: Content Center produces executable editorial specifications, not rendered video or CapCut automation.

## Scope
Document the non-goal in product copy and contribution guidance. Capture evidence for any future API or workflow change rather than allowing incidental scope creep.

## Dependencies
None. This is a scope-control task.

## Acceptance criteria
- README and roadmap state the non-goal clearly.
- No video-rendering or CapCut automation dependency is introduced accidentally.
- Any future change requires an explicit product decision and architecture review.
EOF
)"

create_issue "Roadmap: Track Content Center enhancement sequence" "documentation" "$(cat <<'EOF'
## Objective
Provide one issue that tracks the enhancement roadmap and its critical path.

## Critical path
E-01 → E-03 → E-04 → E-02 → E-05 → E-06 → E-07 → E-08 → E-09 → E-10.

## Optional future path
E-11 → E-12.

## Immediate milestone
Start with E-01, E-03, and E-04 for the first real provider-backed fields-generation slice. Keep E-13 as a scope guard.

## Source artifacts
- `ENHANCEMENT_ROADMAP.md`
- `NEXTJS_MIGRATION_PLAN.md`
- `COMBINED_GENERATION_PLAN.md`
- `README.md`
EOF
)"
