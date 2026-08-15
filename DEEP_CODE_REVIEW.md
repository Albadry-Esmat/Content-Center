# Deep Code Review — Content Center

**Review date:** 2026-08-15  
**Reviewer:** Manus AI  
**Scope:** The active React/Vite client, generation domain, authentication and cloud-workspace boundaries, tRPC router/data access, tests, retained migration scaffolding, and documentation. The inactive `app/` facade was reviewed only as technical debt; it is not part of the release runtime.

## Decision summary

The active product is **approved with follow-up work**. The review found no unresolved Critical or High issue after remediation. Three findings that could cause inconsistent content artifacts, violate the project’s credential boundary, or undermine local-first use were fixed and covered by regression tests. The remaining work is predominantly maintainability, durable-data integrity, and coverage debt; it should be addressed incrementally before expanding collaboration or hosted AI routing.

| Status | Count | Review outcome |
|---|---:|---|
| Critical | 1 | Fixed and regression-tested |
| High | 2 | Fixed and regression-tested |
| Medium | 5 | Recorded for planned refactoring slices |
| Low / Suggestions | 2 | Deferred; no release blocker |

## Fixed findings

### CR-01 — Browser-stored provider credentials violated the product security boundary

| Field | Evidence |
|---|---|
| **Severity** | Critical — fixed |
| **Location** | `client/src/lib/ai-config.ts`, `client/src/lib/ai-provider.ts`, `client/src/lib/generation-service.ts`, `client/src/lib/connection-test.ts`, `client/src/pages/Settings.tsx` |
| **Problem** | The prior implementation could persist a user API key in `localStorage` and attach it as a browser `Authorization` header. |
| **Why it matters** | It conflicts with the project requirement that credentials and secrets do not live in client-side code or public browser state. Any script able to execute in the same origin can read `localStorage`. |
| **Evidence** | `AiConfig` included `apiKey` and `persistKey`; the browser provider added `Authorization: Bearer …` to requests. |
| **Recommended solution** | Support only unauthenticated local endpoints from the browser. Route authenticated providers through a future server-side proxy that owns secrets, rate limits, audit logging, and privacy controls. |
| **Implemented improvement** | Removed credential fields from the client configuration contract and Settings UI; scrub legacy persisted keys during load; removed browser authorization headers; added an explicit no-authorization-header test. |
| **Test impact** | Added `ai-provider.test.ts`; extended configuration tests to verify legacy credential removal. |
| **Traceability** | User requirement: no credentials or secrets in client-side code or public environment variables. |

### CR-02 — Regenerated upstream artifacts left downstream hand-off artifacts marked current

| Field | Evidence |
|---|---|
| **Severity** | High — fixed |
| **Location** | `client/src/lib/pack-domain.ts` |
| **Problem** | `complete-fields` and `complete-script` replaced an upstream AI artifact without invalidating already-generated dependent artifacts. Manual edits did invalidate them, producing inconsistent behavior. |
| **Why it matters** | A regenerated brief or script could leave an old montage and grade labelled “ready,” allowing an internally inconsistent pack to be exported. |
| **Evidence** | `update-field` and `update-script` used `markDownstreamStale`, while generation-completion actions did not. |
| **Recommended solution** | Apply the same downstream invalidation invariant to AI completion and manual editing paths. |
| **Implemented improvement** | Completion actions now call `markDownstreamStale` after marking their own stage done. |
| **Test impact** | Added reducer characterization coverage for fields and script regeneration after downstream artifacts exist. |
| **Traceability** | Product requirement: artifacts remain editable, reviewable, and connected through the production hand-off. |

### CR-03 — A stale cloud selection could undermine local-first use after sign-out

| Field | Evidence |
|---|---|
| **Severity** | High — fixed |
| **Location** | `client/src/main.tsx`, `client/src/_core/hooks/useAuth.ts`, `client/src/pages/Generator.tsx` |
| **Problem** | Global query-cache error listeners could begin OAuth navigation on any unauthorized tRPC error. Generator cloud queries and cloud save behavior were enabled from remembered workspace/project IDs even if the current session was unauthenticated. The auth hook also wrote `localStorage` during memoized render work. |
| **Why it matters** | A creator returning to a locally usable desk with stale cloud selection could be forced into sign-in instead of staying local-first. Render-phase storage writes can also throw or create side effects during React rendering. |
| **Evidence** | The global client cache reacted to `UNAUTHED_ERR_MSG` with `startLogin()`, and Generator used `Boolean(workspaceId && projectId)` for cloud query enablement. |
| **Recommended solution** | Make sign-in an intentional user action only; require an authenticated session for all cloud reads, recovery, and writes; move persistence side effects to an effect. |
| **Implemented improvement** | Removed automatic OAuth redirects, added `cloudSyncActive` (`isAuthenticated && workspaceId && projectId`) to gate Generator cloud work, and moved auth cache persistence into a guarded `useEffect`. |
| **Test impact** | Added a Generator regression test that verifies stale cloud IDs remain local-first and disable cloud queries without an authenticated session. |
| **Traceability** | User requirement: cloud sync is optional and must not be a prerequisite for local workspace use. |

## Remaining debt register

### CR-04 — Persisted JSON contracts are only shallowly narrowed

| Field | Evidence |
|---|---|
| **Severity** | Medium |
| **Location** | `client/src/pages/Generator.tsx`, `client/src/lib/cloud-run-recovery.ts`, `drizzle/schema.ts` |
| **Problem** | Pack and run JSON arrive from persistence as `Record<string, unknown>` and are converted using casts after shallow checks such as `parts` and `meta` existence. |
| **Why it matters** | Malformed historical or externally altered cloud data can enter reducer/UI paths with incomplete nested state and fail far from the storage boundary. |
| **Recommended solution** | Define versioned Zod schemas for `CombinedPack`, `GenerationRun`, task records, and persisted snapshots; parse at router/recovery boundaries; return a recoverable “unsupported snapshot” result rather than casting. |
| **Example improvement** | Replace `packData as unknown as CombinedPack` with `combinedPackSchema.safeParse(packData)` and surface parse issues to the history panel. |
| **Test impact** | Add malformed nested stage-status, invalid timestamps, and unknown schema-version fixtures. |
| **Traceability** | Supports CR-02’s artifact consistency guarantees. |

### CR-05 — Project revision allocation is vulnerable to concurrent saves

| Field | Evidence |
|---|---|
| **Severity** | Medium |
| **Location** | `server/db.ts` (`saveProjectPack`, `restoreProjectPackVersion`) |
| **Problem** | Each method reads the latest revision before opening its transaction, then inserts `latest + 1`. Concurrent tabs or collaborators can choose the same revision despite the unique index. |
| **Why it matters** | One save can fail at the unique constraint, degrading history reliability as collaboration increases. Local backup prevents data loss, but cloud versioning becomes non-deterministic. |
| **Recommended solution** | Allocate the revision inside a transaction using a lock or an atomic project revision counter; retry only the narrow unique-conflict case. |
| **Example improvement** | Add `currentRevision` to `projects`, atomically increment it, and use the returned value for the immutable version insert. |
| **Test impact** | Add a data-access integration test that simulates parallel save requests. |
| **Traceability** | Durable project-history requirement. |

### CR-06 — Generator remains a multi-responsibility orchestration component

| Field | Evidence |
|---|---|
| **Severity** | Medium |
| **Location** | `client/src/pages/Generator.tsx` |
| **Problem** | One page owns compose state, reducer dispatch, AI orchestration, cloud synchronization, recovery, history restoration, exports, notifications, and the bulk of the page view. |
| **Why it matters** | It increases the chance that an unrelated UI change affects generation or persistence behavior and makes targeted testing difficult. |
| **Recommended solution** | Extract `usePackEditor`, `useCloudPackSync`, and `usePackGeneration` hooks with a small page-level composition layer; retain the reducer as the artifact-state authority. |
| **Example improvement** | Move cloud query/mutation effects and restore actions into `useCloudPackSync({ pack, replacePack, workspaceSelection })`. |
| **Test impact** | Move current Generator tests down to hook-level tests plus a lean smoke render. |
| **Traceability** | Clean-code responsibility and testability goals. |

### CR-07 — Data-access module mixes user, workspace, project, history, and run persistence

| Field | Evidence |
|---|---|
| **Severity** | Medium |
| **Location** | `server/db.ts` |
| **Problem** | A single helper module contains distinct persistence domains and repeats workspace authorization plus project existence checks. |
| **Why it matters** | It will become a merge-conflict and consistency hotspot as team management, templates, and reviews are added. |
| **Recommended solution** | Split into `server/data/users.ts`, `workspaces.ts`, `projects.ts`, and `project-history.ts`; leave role-policy rules in `workspace-access.ts`. |
| **Example improvement** | Centralize verified project lookup in a private `requireProjectInWorkspace` helper used by save/run/history functions. |
| **Test impact** | Preserve router tests; add data-access tests around project boundary failures. |
| **Traceability** | SaaS modularity and authorization boundary. |

### CR-08 — Dormant migration/template code creates architecture drift

| Field | Evidence |
|---|---|
| **Severity** | Medium |
| **Location** | `app/`, `client/src/pages/ComponentShowcase.tsx`, `client/src/components/DashboardLayout.tsx`, `client/src/components/AIChatBox.tsx` |
| **Problem** | The repository retains a Next-style facade and large template components that are not imported by the active Vite routes. The manifest has no Next package or Next scripts. |
| **Why it matters** | It increases review noise, creates stale branding and unaudited auth paths, and can mislead maintainers about the supported runtime. |
| **Recommended solution** | After confirming no external consumers, delete the dormant scaffolding in a dedicated cleanup change, or archive it outside the active product tree with a single migration decision record. |
| **Example improvement** | Remove the unused `ComponentShowcase` and dashboard template family first; then decide whether to remove the entire `app/` facade. |
| **Test impact** | Run full build and route smoke validation after each cleanup slice. |
| **Traceability** | README now identifies Vite/Express as the sole supported runtime. |

### CR-09 — Accessibility and UI regression coverage is still structural rather than behavioral

| Field | Evidence |
|---|---|
| **Severity** | Low |
| **Location** | `scripts/a11y-smoke.mjs`, page/component tests |
| **Problem** | The current accessibility gate checks eight structural conditions, but interactive production-desk controls lack keyboard/focus and accessible-name behavior tests. |
| **Why it matters** | Visual and structural checks can miss keyboard traps, disabled-state semantics, or status-announcement regressions. |
| **Recommended solution** | Add Testing Library coverage for stage selection, retry/cancel controls, artifact editing, history restore, and theme toggle; add axe-based checks where suitable. |
| **Test impact** | Create component tests for `ArtifactEditor`, `GenerationProgressHeader`, `GenerationRunPanel`, and `AppShell`. |
| **Traceability** | Existing smoke gate and user-facing generation-reliability requirements. |

### CR-10 — Global styling has a growing change surface

| Field | Evidence |
|---|---|
| **Severity** | Suggestion |
| **Location** | `client/src/index.css` |
| **Problem** | The Editorial Control Room design system and page-specific rules share one large stylesheet. |
| **Why it matters** | Styling changes may have broad unintended effects as team and template features are added. |
| **Recommended solution** | Retain global tokens/reset in `index.css`, then move page and component rules into feature-scoped style files in a gradual, behavior-preserving migration. |
| **Test impact** | Pair moves with desktop/mobile screenshot checks. |
| **Traceability** | UI maintainability. |

## Refactoring slices and risk controls

| Slice | Priority | Scope | Safety controls | Completion evidence |
|---|---:|---|---|---|
| S1 | Completed | Credential boundary, local-first cloud gating, reducer invalidation | Characterization tests and full release gate | 45 tests, typecheck, security, accessibility smoke, production build |
| S2 | Next | Versioned Zod contracts for cloud JSON | Parse-only adapter, no schema migration | Malformed snapshot fixtures and recovery UI test |
| S3 | Next | Atomic project revision allocation | Additive schema migration and concurrency test | Parallel save test and migration verification |
| S4 | Planned | Generator hook extraction | Preserve reducer actions and existing UI tests first | Hook tests plus Generator smoke test |
| S5 | Planned | Data-access module split | No API contract changes | Existing router tests remain green |
| S6 | Planned | Retired scaffold cleanup | Dedicated deletion-only pull request | Full build, route smoke, and GitHub diff review |

## Artifact register

| Artifact | Purpose | Status |
|---|---|---|
| `DEEP_CODE_REVIEW.md` | Severity-ranked debt register, remediation evidence, and refactoring plan | Added |
| `client/src/lib/pack-domain.test.ts` | Characterizes stale-downstream behavior after regeneration | Extended |
| `client/src/lib/ai-config.test.ts` | Ensures legacy browser credentials are removed | Extended |
| `client/src/lib/ai-provider.test.ts` | Prevents client authorization headers from returning | Added |
| `client/src/pages/Generator.test.tsx` | Protects local-first behavior with stale cloud selection | Extended |

## Open issues and risks

The dedicated server-side AI proxy remains intentionally **out of scope** for this remediation. Authenticated external AI providers are unavailable from the browser until the project has a server-side credential, quota, privacy, audit, and abuse-prevention design. The current local-first AI mode therefore supports unauthenticated local endpoints only.

Cloud snapshot parsing and revision allocation have not been changed in this review because they require an explicit data-contract design and, for atomic revisions, an additive migration. The current project keeps browser-local copies as a recovery path, but cloud history should not be expanded to collaborative editing before CR-04 and CR-05 are addressed.

## Next handoffs

The next implementation slice should address **CR-04** and **CR-05** together: establish typed persistence schemas, add an atomic revision allocation strategy, write a single additive migration, and validate recovery with malformed-data and parallel-save tests. After that, extract Generator cloud synchronization into a focused hook before adding brand kits, comments, or multi-user review workflows.
