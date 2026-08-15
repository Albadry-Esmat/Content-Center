# Generation UX Reliability Plan

> **Purpose:** Make every content-pack generation request observable, actionable, and recoverable. A creator must be able to tell what is complete, actively generating, queued, blocked, failed, or awaiting review without inferring state from the editor.

## Decision Summary

The next implementation wave should replace the generator page's single `running` boolean with a **derived pack-progress model** and a **transient generation-run controller**. The pack remains the persisted source of truth for artifacts and stage outcomes; a runtime controller tracks the active queue, per-task timing, cancellation, and user-facing feedback while work is in flight.

The primary interaction change is explicit scope. The creator will choose between **this deliverable**, **ready deliverables**, and **the complete pack**. “Combined” will never imply a batch run while silently generating only the selected long-form item. Each action will name its exact scope, estimate its queued work, and report a final summary.

| Decision | Selected approach | Rationale |
|---|---|---|
| Generation state | Persist stage outcomes; keep active queue in runtime state | Prevents stale in-flight jobs from being restored as running after a page reload. |
| Combined-mode behavior | Explicit batch actions rather than hidden mode behavior | Makes the long-form plus five-shorts workflow predictable and cost-aware. |
| Feedback source | Persistent run panel plus concise toast summaries | A toast alone disappears; a panel alone can be missed. |
| Failure treatment | Per-task error cards with retry and configuration recovery | Avoids a generic part-level error obscuring which stage failed. |
| Fallback treatment | Show as `draft fallback / review required`, never silent success | Keeps the existing local-first resilience while preserving editorial trust. |

## Current-State Findings

| ID | Finding | Evidence | Impact |
|---|---|---|---|
| F-01 | `mode` changes the label but does not change generation scope. | `Generator.tsx` always calls generation with `activePart`; its initial value is `long`. | Combined mode appears to promise six deliverables but can generate only the long-form item. |
| F-02 | The generator exposes only a global `running` boolean. | `Generator.tsx` stores no queue, active-task title, completed count, or batch total. | The creator cannot tell what has finished or what will happen next. |
| F-03 | Clicking a stage only changes the active editor view. | Stage buttons call `setActiveStage` without prerequisite or next-action feedback. | Selection can feel non-functional, especially when the selected stage is blocked or empty. |
| F-04 | Success feedback is not emitted for generation. | Toast notifications are used for cloud save, not stage completion. | A completed request can look idle or stalled. |
| F-05 | A network failure can produce a local draft fallback without a global notification. | The fallback writes a warning into an artifact but does not identify the result in the workbench summary. | A creator may mistake placeholder material for provider-generated work. |
| F-06 | Errors are scoped to a single `PartState.error` string. | `PartState` has one `error` field while four stages share one part. | The failed stage, prior attempt, and recovery action are ambiguous. |

## Outcome and Success Criteria

The workflow will be considered complete when the following user-visible outcomes are met.

| Requirement ID | Requirement | Acceptance evidence |
|---|---|---|
| R-01 | The page shows pack-wide progress as completed, active, queued, blocked, review-required, and failed counts. | A creator can identify `x/y` completed deliverables and the active task without opening an artifact. |
| R-02 | Every stage and deliverable indicates its exact status with text as well as color. | Keyboard and screen-reader users receive the same status meaning. |
| R-03 | Every generation button identifies the exact scope before execution. | Examples: “Generate fields for Long-form,” “Generate scripts for 4 ready deliverables,” and “Generate all 6 briefs.” |
| R-04 | Selection is distinguishable from generation. | Clicking a part or stage changes context immediately; a separate action starts work. |
| R-05 | Success, warning, failure, cancellation, and fallback are announced and recoverable. | The UI provides a persistent contextual result and a concise notification summary. |
| R-06 | Combined generation processes the requested queue sequentially and surfaces partial completion. | A failed short does not discard completed items or conceal remaining work. |
| R-07 | Reloading a page never presents abandoned work as actively running. | An interrupted queue is shown as incomplete with an explicit restart action. |

## Status Model

The existing stage statuses are a useful base, but the UI needs a clearer presentation model. The implementation will preserve `idle`, `running`, `done`, `stale`, and `error`, and add derived labels rather than introducing ambiguous duplicate state.

| Display status | Source | Meaning | Primary action |
|---|---|---|---|
| Not started | `idle` | Nothing has been generated for this stage. | Generate this stage. |
| Blocked | Derived from prerequisites | Required upstream artifact is missing. | Select or generate the prerequisite. |
| Queued | Runtime task queue | This task will start after an earlier task. | View queue or remove if not started. |
| Generating | `running` + active runtime task | Provider request is active. | Cancel current run. |
| Ready to review | `done` with no warning | Artifact is available and editable. | Review or regenerate. |
| Review required | `done` with warnings or fallback provenance | Artifact exists but needs editorial confirmation. | Open review notes. |
| Needs refresh | `stale` | An upstream edit invalidated this downstream artifact. | Regenerate or keep intentionally. |
| Needs attention | `error` | The stage did not complete. | Retry, adjust connection, or use a local draft. |
| Cancelled | Runtime outcome | The creator stopped the current queue. | Resume remaining work. |

## Proposed Interaction Design

### 1. Pack Progress Header

Place a compact, persistent header above the two-column workbench. It should show a segmented completion bar, text such as **“8 of 24 production steps ready”**, the active task, and a “View run details” disclosure. It must report counts by status rather than showing a percentage without context.

The header has one primary action appropriate to the current context: **Start next recommended step**, **Continue 5 queued tasks**, or **Review 2 items**. The action is deterministic and its label includes scope.

### 2. Deliverable Navigator

Replace ambiguous `Long / #1 / #2 …` tabs with compact deliverable cards or tabs that each carry a text status and stage-completion fraction, for example **“Short 2 · 1/4 ready”**. Selecting a deliverable must only change the editor context, never start generation. Selection state must have an obvious visible label such as **“Editing: Short 2.”**

### 3. Stage Rail and Action Area

Keep the stage rail, but change it into an explicit status navigator. Each row shows a named status and an enabled or blocked state. Selecting a stage opens an action area that explains the prerequisite and provides the correct next action. The row should never look expandable if it does not reveal a different panel.

| Stage state | Stage-row copy | Action-area behavior |
|---|---|---|
| Idle fields | “Not started” | “Generate fields for Short 2.” |
| Blocked script | “Needs fields” | Link to fields and explain why script is unavailable. |
| Running montage | “Generating now” | Show elapsed time, cancel control, and queue position. |
| Done grade | “Ready to review” | Open editable grade and offer regenerate. |
| Stale script | “Refresh recommended” | Explain that fields changed and offer regenerate. |
| Failed stage | “Needs attention” | Show error summary, retry, connection settings, and local-draft option. |

### 4. Generation Run Panel

Add a persistent but collapsible **Run Panel** in the workbench. It contains a chronological queue of tasks with status icons, human-readable task names, elapsed time while active, outcomes, and inline actions.

The controller will use sequential tasks by default to avoid hidden fan-out, unpredictable provider load, and confusing out-of-order results. A task queue for “Generate scripts for ready deliverables” might read: `Long-form script — ready`, `Short 1 script — queued`, `Short 2 script — queued`, and so on.

### 5. Notification and Error Rules

| Event | Persistent surface | Notification | Accessibility behavior |
|---|---|---|---|
| Run starts | Run panel and progress header | One informational notification | Polite announcement with scope and task count. |
| Individual task completes in batch | Run panel | No per-task toast by default | Status text changes in the live region. |
| Batch completes | Progress header and run panel summary | One success summary | Announce completed and review-required counts. |
| Warning or fallback | Artifact warning plus run row | Warning summary | Identify fallback origin and review requirement. |
| Retryable provider error | Recovery card plus run row | Error notification | Assertive announcement with retry target. |
| Cancellation | Run panel summary | Informational summary | Announce completed and remaining counts. |
| Cloud save issue | Existing save feedback | Existing error notification | Keep local backup and visible recovery action. |

## Domain and Architecture Plan

### A. Derived Progress Selectors

Create pure selectors alongside `pack-domain.ts`:

```ts
type StageSummary = {
  stage: GenerationStage
  completed: number
  total: number
  running: number
  blocked: number
  stale: number
  errors: number
  reviewRequired: number
}

type PackProgressSummary = {
  completedSteps: number
  totalSteps: number
  activeTaskLabel?: string
  nextRecommendedTask?: GenerationTask
  byStage: Record<GenerationStage, StageSummary>
}
```

Selectors must calculate results from the persisted pack state and the transient run state. They must not rely on the active tab, so the full combined pack remains observable even when a creator reviews a single short.

### B. Generation Task Queue

Add a focused `useGenerationRun` hook to own queue execution, cancellation, runtime outcomes, and progress events. Keep provider calls in `generation-service.ts`; the hook orchestrates calls without embedding queue control in the page component.

```ts
type GenerationTask = {
  id: string
  partKey: PartKey
  stage: GenerationStage
  label: string
}

type GenerationTaskOutcome = 'queued' | 'running' | 'succeeded' | 'warning' | 'failed' | 'cancelled'
```

The hook will accept a queue builder that validates prerequisites first. It will stop or continue after a failure according to the selected recovery policy; the default is **continue independent queued work, then show a partial-result summary**. Dependent tasks for the failed item become blocked rather than failing noisily.

### C. Error Provenance

Replace the single generic `PartState.error` rendering path with stage-scoped metadata. The persisted model should retain a safe, user-readable error message and timestamp for the affected stage. Never store provider credentials, raw headers, or sensitive response content in this metadata.

### D. Local Draft Fallback

Retain local fallback only as an explicit outcome. The run row, artifact badge, and export metadata must state **“Local draft fallback — verify before use.”** A fallback counts as review-required, not as a fully complete provider-generated artifact.

## Implementation Work Breakdown

| Work ID | Deliverable | Dependencies | Validation |
|---|---|---|---|
| GUX-01 | Add pure progress selectors and stage-summary tests. | Existing `CombinedPack` state. | Unit tests for idle, running, stale, error, warning, and multi-part counts. |
| GUX-02 | Add task queue types and `useGenerationRun` orchestration hook. | GUX-01. | Unit tests for queue order, prerequisite blocking, cancellation, partial failure, and completion. |
| GUX-03 | Introduce stage-scoped result and error provenance. | GUX-01. | Reducer tests ensure one failed stage does not hide other outcomes. |
| GUX-04 | Build Pack Progress Header and Run Panel. | GUX-01, GUX-02. | Visual and accessibility verification across empty, running, failed, and complete states. |
| GUX-05 | Redesign deliverable navigator and stage action area. | GUX-01, GUX-03. | Keyboard selection, explicit prerequisites, and editable artifact handoff tests. |
| GUX-06 | Add notification policy, fallback labelling, retry, and cancellation flows. | GUX-02, GUX-03. | Browser workflow tests and live-region smoke checks. |
| GUX-07 | Add combined-scope actions and an unambiguous queue preview. | GUX-02, GUX-05. | End-to-end run for one deliverable, ready deliverables, and all six briefs. |
| GUX-08 | Validate, document, synchronize, and checkpoint. | GUX-01 through GUX-07. | Tests, type check, secret scan, accessibility, build, screenshots, GitHub `dev` verification. |

## Validation Matrix

| Scenario | Expected result |
|---|---|
| Select a completed short and its script stage | The editor changes context instantly and states “Ready to review”; no generation starts. |
| Select a script before fields exist | The UI names fields as the prerequisite and offers the scoped fields action. |
| Start fields for all six deliverables | Queue preview states “6 briefs”; each completion updates pack-wide and part-level counts. |
| One short fails in a combined batch | Completed results remain editable; failed short exposes retry; later independent briefs continue; summary reports partial completion. |
| Cancel a batch after two tasks | Two completed artifacts persist; remaining tasks become cancelled or queued-for-resume; no running state persists after reload. |
| Provider network failure | The creator sees retry, settings, and explicit local-draft choices; a fallback is not marked as final success. |
| Update fields after downstream artifacts exist | Downstream stages are labelled “Refresh recommended,” and the next action is clear. |
| RTL writing profile | Status text remains readable, action order remains predictable, and editable content respects selected direction. |

## Risks and Open Decisions

| Risk or decision | Mitigation or decision needed |
|---|---|
| Full-pack generation may use meaningful provider quota or time. | Require explicit scope selection and show task count before starting. |
| More persistent state may complicate local migrations. | Keep queue transient; migrate only stage-scoped provenance with a versioned adapter. |
| Provider calls can exceed a single UI session. | Make cancellation and partial recovery first-class; defer durable server jobs to the hosted-routing SaaS slice. |
| Local fallback can reduce trust if it resembles provider output. | Use unmistakable provenance and review-required status in the artifact and export. |
| User expectation of “complete pack” may mean different artifact depth. | Confirm the default batch preset: all six briefs first, or full four-stage production for every deliverable. Until confirmed, label each preset precisely. |

## Artifact Register

| Artifact | Role |
|---|---|
| `GENERATION_UX_RELIABILITY_PLAN.md` | Approved planning baseline for the next reliability wave. |
| `client/src/lib/pack-domain.ts` | Persisted stage outcomes and reducer evolution target. |
| `client/src/lib/generation-service.ts` | Provider-call boundary retained beneath the new queue hook. |
| `client/src/pages/Generator.tsx` | Current orchestration and UI composition target. |
| `client/src/components/ArtifactEditor.tsx` | Editable review surface that will consume clearer stage context. |
| `client/src/lib/workflow.test.ts` | Existing workflow coverage baseline to extend. |

## Next Handoffs

The next implementation handoff should use **requirements/problem analysis**, **frontend architecture**, **code implementation**, **clean code engineering**, **testing strategy**, and **premium product UI/UX motion design**. No additional verified external skill was adopted: the requested external skill search fell back to cache and found no specific match for this workflow.
