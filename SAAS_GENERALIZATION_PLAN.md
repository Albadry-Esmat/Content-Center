# Content Center SaaS Generalization Plan

**Repository:** `Albadry-Esmat/Content-Center`  
**Target branch:** `dev`  
**Author:** Manus AI  
**Status:** Product and architecture planning baseline  
**Planning date:** 14 August 2026

## Decision Summary

Content Center should become a **workspace-based SaaS for technical creators and the teams that help them publish**. The product should preserve its strongest differentiator—turning one topic and its evidence into a connected, reviewable content pack—while replacing personal-browser assumptions with accounts, organizations, projects, permissions, hosted persistence, and a configurable AI trust boundary.

The recommended strategy is **cloud-capable, local-friendly, and editor-first**. A user can begin quickly with a personal workspace, create a project, import or write a brief, generate a pack, edit every artifact, review evidence warnings, and export a production hand-off. Teams can later invite collaborators, assign review responsibilities, and retain an auditable project history. Browser-local mode remains available as an offline or privacy-preserving mode, but it is no longer the only persistence model.

The first SaaS release should not attempt to become a video editor, social scheduler, agency CRM, or generic AI writing tool. The product boundary remains the **editorial specification and production hand-off system** documented in the current repository baseline.[1]

## Product Thesis and Positioning

> **Content Center turns technical knowledge into a reviewable production system—not a pile of generated copy.**

The initial ideal customer profile is a technical creator, educator, consultant, or small media team that repeatedly converts complex product or engineering knowledge into long-form videos, short clips, scripts, visual plans, and publishing notes. The product wins when it reduces the distance between “I know this topic” and “the team can record, review, and hand it off without losing the evidence.”

| Dimension | SaaS direction |
|---|---|
| Primary category | Technical content planning and production hand-off |
| Primary buyer | Independent technical creator or small creator team |
| Secondary buyer | Technical marketing, developer-relations, education, or agency lead |
| Core outcome | A grounded, editable, production-ready content pack |
| Differentiator | Connected fields, scripts, montage, grade, run-sheet, evidence, and review state |
| Trust promise | Users can see where content came from, what requires verification, and where AI requests are sent |
| Initial monetization | Free personal workspace, paid individual plan, paid team workspace |
| Deliberate non-goal | Video rendering, NLE replacement, auto-publishing, and unreviewed content automation |

## Assumptions and Decision Questions

The following are planning assumptions, not confirmed requirements. They should be validated with five to ten target users before implementation of billing or collaboration.

| ID | Assumption or question | Decision needed |
|---|---|---|
| A-01 | Users will pay for saved projects, repeatable workflows, and collaboration more readily than for raw model access. | Validate willingness to pay and the most valuable quota. |
| A-02 | A single user may belong to more than one workspace. | Confirm whether workspace switching is required for v1. |
| A-03 | Teams need private projects, shared review, and role-based access before real-time co-editing. | Approve staged collaboration rather than starting with presence/cursors. |
| A-04 | Hosted AI is optional; some users will bring a local OpenAI-compatible endpoint. | Preserve separate local and hosted trust-boundary modes. |
| A-05 | The current six-part pack model is a useful default, but organizations may need templates. | Decide whether custom pack templates are v1 or post-v1. |
| A-06 | Usage and cost controls are required before hosted AI is opened broadly. | Approve quotas, model allowlists, and overage behavior. |

## Personas and Jobs to Be Done

### P-01: Independent Technical Creator

This user has domain expertise but limited production bandwidth. They need a repeatable path from a topic and rough notes to a structured pack that can be edited and recorded without losing the original point of view.

**Job:** “When I have a technical idea and scattered notes, help me shape it into a truthful, recordable, multi-format pack that still sounds like me.”

### P-02: Technical Editor or Producer

This user reviews claims, edits scripts, plans shots, and prepares the hand-off. They need clear status, warnings, and ownership rather than another generated document.

**Job:** “When a creator submits a draft pack, help me identify what is ready, what is stale, what needs evidence, and what the recording team should do next.”

### P-03: Developer-Relations or Technical Marketing Team

This workspace has multiple creators and reviewers working from shared product facts, rules, and brand constraints. They need reusable templates, permission boundaries, and an audit trail.

**Job:** “When several people produce related technical content, help us keep the source of truth, review policy, and production output consistent without slowing individual creators.”

### P-04: Agency or Fractional Content Team

This user manages multiple clients or brands. They need workspace separation, reusable operating procedures, exports, and billing clarity.

**Job:** “When I move between clients, help me keep content, credentials, rules, reviewers, and exports isolated and easy to hand off.”

## Core Journeys

### J-01: Sign-up to First Pack

1. The user creates an account or signs in.
2. The system creates a personal workspace and explains local versus hosted AI modes.
3. The user chooses a starter template: technical explainer, product walkthrough, comparison, or discovery short.
4. The user enters a topic and supporting notes.
5. The system generates the fields stage or clearly explains why generation is unavailable.
6. The user reviews warnings, edits the fields, and continues to script.
7. The user saves the project and exports a first hand-off.

**Success condition:** the user reaches a reviewable fields artifact without needing to understand tenant architecture, model configuration, or billing first.

### J-02: Team Review

1. A workspace owner invites an editor or reviewer.
2. The collaborator opens a project with the least privilege required.
3. The reviewer comments on or edits an artifact.
4. Upstream edits mark dependent stages stale.
5. The creator resolves review notes and regenerates only the affected stage.
6. The project history records who changed what and when.

### J-03: Hosted AI Configuration

1. A workspace owner selects hosted AI mode.
2. The system explains provider, model, data-retention, and quota implications.
3. The owner chooses an approved provider/model or adds an organization-managed provider configuration.
4. The system performs a connection and policy check without exposing secrets to the browser.
5. Generation requests are authorized, metered, logged with sanitized metadata, and linked to a workspace/project.

### J-04: Local or Private Mode

1. A user chooses browser-local mode or a local OpenAI-compatible endpoint.
2. The system stores credentials only according to the user’s explicit persistence choice.
3. The user can continue without hosted usage billing.
4. The UI clearly indicates that cloud collaboration may be limited or disabled for local-only artifacts.

## Requirements Catalogue

### Identity, Workspace, and Access

| ID | Requirement | Priority | Acceptance summary |
|---|---|---:|---|
| REQ-IAM-01 | Users can create an account, sign in, sign out, and recover access. | P0 | Authenticated sessions survive refresh and unauthorized routes redirect safely. |
| REQ-IAM-02 | Each user receives a personal workspace during onboarding. | P0 | A new account has an isolated workspace and starter project template. |
| REQ-IAM-03 | Users can belong to multiple workspaces. | P1 | Workspace switcher changes visible projects and permissions without leakage. |
| REQ-IAM-04 | Workspace roles include owner, admin, editor, reviewer, and viewer. | P0 | Every project mutation and invitation is authorized server-side. |
| REQ-IAM-05 | Workspace and project data are tenant-isolated. | P0 | Queries and mutations cannot access another workspace by identifier alone. |
| REQ-IAM-06 | Sensitive operations produce audit events. | P1 | Invitations, role changes, exports, provider changes, and deletions are recorded. |

### Project and Pack Workflow

| ID | Requirement | Priority | Acceptance summary |
|---|---|---:|---|
| REQ-PACK-01 | A workspace can create projects from templates. | P0 | New projects have a typed pack schema, rules version, and owner. |
| REQ-PACK-02 | The six-part pack remains the default workflow. | P0 | Long-form and five short parts remain independently addressable. |
| REQ-PACK-03 | Every stage exposes idle, running, done, stale, partial, and error states. | P0 | The state is visible in the project UI and export metadata. |
| REQ-PACK-04 | Upstream edits invalidate only dependent artifacts. | P0 | Editing fields marks script, montage, and grade appropriately without deleting user edits. |
| REQ-PACK-05 | Users can duplicate, archive, restore, and delete projects. | P1 | Destructive actions require confirmation and respect retention rules. |
| REQ-PACK-06 | Users can export Markdown and JSON backups. | P0 | Export contains source notes, warnings, completeness, history metadata, and artifacts. |

### AI and Usage

| ID | Requirement | Priority | Acceptance summary |
|---|---|---:|---|
| REQ-AI-01 | The provider adapter supports local and hosted modes behind one typed contract. | P0 | UI does not duplicate provider-specific stage logic. |
| REQ-AI-02 | Hosted requests are authorized by workspace and user policy. | P0 | A user cannot spend another workspace’s quota or use a disabled model. |
| REQ-AI-03 | Quotas and limits are visible before generation. | P0 | The user sees remaining units, estimated cost where available, and failure behavior. |
| REQ-AI-04 | Provider errors are sanitized. | P0 | Credentials, raw upstream payloads, and internal stack traces never reach the client. |
| REQ-AI-05 | Generation is retryable and idempotent at the stage/request level. | P1 | A retry does not duplicate projects or corrupt downstream state. |
| REQ-AI-06 | Users can mark source claims as verified, needs review, or rejected. | P1 | Evidence state is visible in the artifact and export. |

### Billing and Plan Controls

| ID | Requirement | Priority | Acceptance summary |
|---|---|---:|---|
| REQ-BILL-01 | Plans are defined by workspace entitlement, not individual UI flags. | P0 | Server-side authorization enforces limits consistently. |
| REQ-BILL-02 | The system supports free, individual, and team plans. | P1 | Workspace plan and billing status are visible to authorized admins. |
| REQ-BILL-03 | Quota exhaustion is recoverable. | P0 | The user can wait, upgrade, switch to local mode, or reduce scope. |
| REQ-BILL-04 | Billing events are idempotent and auditable. | P1 | Duplicate webhooks do not duplicate entitlements or invoices. |

## Business Rules

| ID | Rule |
|---|---|
| BR-01 | Every project belongs to exactly one workspace. |
| BR-02 | Every mutation must be authorized against the current user, workspace membership, and resource role. |
| BR-03 | Workspace owners and admins may configure hosted providers; viewers may never change provider or billing settings. |
| BR-04 | Local-only projects may be exported or explicitly shared, but they are not silently uploaded for collaboration. |
| BR-05 | A generated artifact is never considered factually approved solely because the provider returned a valid schema. |
| BR-06 | Editing an upstream artifact marks only downstream dependent artifacts stale. |
| BR-07 | Export is allowed with warnings by default; strict review gates are workspace-configurable. |
| BR-08 | Usage is charged to the workspace that authorizes a hosted generation request. |
| BR-09 | Deleting a workspace is a privileged, confirmed, auditable operation with a defined retention window. |
| BR-10 | Provider credentials are never stored in browser-exposed variables or returned through client APIs. |

## Target SaaS Architecture

### Application Boundaries

The target should use a Next.js App Router application with a clear server/client boundary. Static route chrome, marketing pages, authenticated route layout, and read-only project summaries can be server-rendered. The generator, editors, provider status, and browser-local mode remain Client Components. This continues the current incremental approach, but the server becomes the source of truth for authenticated workspaces and projects.[1][2]

| Boundary | Responsibility | Trust level |
|---|---|---|
| Browser client | Compose/edit UI, optimistic state, local mode, safe display of server data | Untrusted |
| Next.js route handlers/server actions | Authorization, project mutations, provider proxy, export jobs, usage checks | Trusted application boundary |
| Relational database | Users, workspaces, memberships, projects, packs, versions, usage, audit events | Trusted persistence |
| Object storage | Optional large exports, source attachments, backups | Controlled data store |
| Hosted provider adapter | Provider-specific requests, model policy, retries, usage accounting | Restricted outbound boundary |
| Billing provider | Subscription and entitlement events | External system; verify signatures |
| Observability | Sanitized metrics/logs/traces with no prompt secrets | Restricted operational data |

### Recommended Domain Model

```text
User
 └─ Membership ─ Workspace
                   ├─ WorkspacePlan
                   ├─ ProviderPolicy
                   ├─ Project
                   │    ├─ PackVersion
                   │    ├─ ArtifactRevision
                   │    ├─ EvidenceItem
                   │    └─ ProjectMember (optional for v1)
                   ├─ UsageLedger
                   ├─ AuditEvent
                   └─ ExportJob
```

The existing `CombinedPack` should become a versioned application document inside a `Project`, not the top-level identity of the product. Store immutable revisions for audit and recovery, while exposing a current editable revision for the main UI. Keep artifact-level JSON typed and validate it at the server boundary before persistence.

### Tenant Isolation Strategy

Use a shared relational database with explicit `workspace_id` on every tenant-owned table, repository methods that require workspace context, and authorization tests that attempt cross-tenant access. Row-level security may be added if supported by the selected database, but it should complement—not replace—application authorization and tests.

Do not accept `workspace_id` from the browser as proof of access. Resolve the active workspace from the authenticated session and membership, then scope every query and mutation through that context.

### AI Trust Boundary

Local mode and hosted mode must be visually and technically distinct. Local mode can call a user-configured OpenAI-compatible endpoint from the browser. Hosted mode must call a server-side provider adapter, where provider keys, model allowlists, quotas, abuse controls, retries, and sanitized errors are enforced. The browser should receive only the normalized generation result and non-sensitive usage metadata.

## Information Architecture and Screen Map

| Area | Screens | SaaS additions |
|---|---|---|
| Marketing | Landing, pricing, security, docs | Positioning, plan comparison, trust-boundary explanation |
| Auth | Sign up, sign in, recovery, invite acceptance | Workspace creation and invite hand-off |
| Workspace | Overview, switcher, members, settings | Role management, usage, provider policy, billing |
| Projects | Project list, create, archive, project detail | Search, filters, project ownership, status, activity |
| Generator | Compose, pipeline, artifact editor | Hosted/local mode status, quota, collaborator presence later |
| Review | Evidence, warnings, comments, approvals | Reviewer queue and audit history |
| Exports | Markdown, JSON, export history | Download links, retention, access controls |
| Administration | Billing, provider settings, audit, retention | Admin-only controls and irreversible action safeguards |

## Release Plan

### SaaS-0: Product Validation and Instrumented Local Core

**Goal:** Validate the product promise before introducing accounts or billing.

Deliverables include onboarding copy, template selection, a stable first-pack journey, local anonymous funnel counters, user interviews, and a clear distinction between local and hosted modes. Add browser workflow tests for compose → generate → edit → save → export.

**Gate:** target users can complete the first-pack journey and describe the value as a production hand-off rather than generic AI writing.

### SaaS-1: Identity and Personal Workspace

**Goal:** Move from personal browser state to authenticated cloud projects without forcing collaboration.

Deliverables include authentication, personal workspace creation, project CRUD, server-side pack persistence, JSON backup/restore, migration from localStorage, and secure session handling.

**Gate:** a user can sign in from a second browser, see the same project, recover after refresh, and export without losing or duplicating a revision.

### SaaS-2: Hosted AI and Usage Controls

**Goal:** Add a safe hosted provider path while preserving local mode.

Deliverables include provider adapter, model policy, server-side secrets, request normalization, quotas, usage ledger, sanitized errors, rate limiting, connection health, and a workspace usage screen.

**Gate:** hosted requests cannot expose keys, bypass workspace policy, exceed quotas silently, or leak raw provider errors.

### SaaS-3: Team Workspaces and Review

**Goal:** Make the product useful to small creator and technical marketing teams.

Deliverables include invitations, membership roles, project-level access, reviewer queue, comments or review notes, revision history, activity log, and assignment of review responsibility.

**Gate:** an editor can review and amend a project while a viewer cannot mutate it, and every sensitive action is traceable.

### SaaS-4: Billing, Templates, and Operational Readiness

**Goal:** Support paid plans and repeatable organization workflows.

Deliverables include billing integration, entitlement service, plan limits, template library, workspace-level rules, retention controls, support diagnostics, observability dashboards, backups, and incident runbooks.

**Gate:** subscription lifecycle events are idempotent, plan enforcement is server-side, and operators can diagnose generation, storage, and billing failures without accessing prompt contents.

### SaaS-5: Collaboration Depth and Ecosystem

**Goal:** Add deeper collaboration only after the core workflow is reliable.

Potential deliverables include real-time presence, comments anchored to artifact fields, API/webhooks, import connectors, version comparisons, and organization-level governance. These are intentionally post-core because they add concurrency, retention, and support complexity.

## Work Breakdown and Dependency Map

| Epic | Scope | Depends on | Estimate |
|---|---|---|---:|
| EPIC-01 Product validation | ICP interviews, onboarding hypothesis, pricing research, success metrics | None | 1–2 weeks |
| EPIC-02 Domain extraction | Workspace/project/revision vocabulary, invariants, migration rules | EPIC-01 | 1 week |
| EPIC-03 Identity | Auth, sessions, workspace creation, membership | EPIC-02 | 1–2 weeks |
| EPIC-04 Cloud project persistence | Schema, repositories, pack revisions, local migration | EPIC-02, EPIC-03 | 2 weeks |
| EPIC-05 Next.js runtime | Canonical App Router, server/client boundaries, route auth | EPIC-03, EPIC-04 | 1–2 weeks |
| EPIC-06 Hosted AI | Provider proxy, secrets, quotas, usage ledger, sanitized errors | EPIC-03, EPIC-04, EPIC-05 | 2–3 weeks |
| EPIC-07 Review collaboration | Roles, invitations, comments, activity, revision history | EPIC-04, EPIC-05 | 2–3 weeks |
| EPIC-08 Billing | Plans, checkout, webhooks, entitlements, customer portal | EPIC-03, EPIC-06 | 1–2 weeks |
| EPIC-09 Operations | Observability, backups, alerts, runbooks, security testing | EPIC-03–08 | 1–2 weeks |
| EPIC-10 Ecosystem | API, webhooks, imports, deeper real-time collaboration | EPIC-07–09 | Post-v1 |

The critical path is **EPIC-01 → EPIC-02 → EPIC-03 → EPIC-04 → EPIC-05 → EPIC-06**, with EPIC-07 and EPIC-08 branching after cloud persistence and identity are stable.

## Metrics and Release Signals

| Metric | Definition | Product decision it informs |
|---|---|---|
| Activation rate | New users reaching a saved first fields artifact | Whether onboarding and first value are clear |
| Pack completion rate | Projects reaching script, montage, grade, and export | Where the workflow loses users |
| Review resolution rate | Warnings or comments resolved before export | Whether trust features help rather than obstruct |
| Recovery success | Failed generation attempts that later complete | Whether error UX and retries are effective |
| Workspace retention | Workspaces returning with an existing project | Whether the product becomes a repeatable operating system |
| Hosted generation margin | Revenue or plan value relative to provider cost | Whether quotas and packaging are sustainable |
| Local-mode continuation | Users completing work without hosted AI | Whether the privacy-preserving mode remains valuable |
| Collaboration adoption | Projects with more than one active member | Whether team features merit deeper investment |

Do not optimize for raw generations, token volume, or time spent in the editor. The meaningful outcome is a trustworthy pack reaching a reviewable production hand-off.

## Security, Privacy, and Operational Risks

| Risk | Impact | Mitigation | Gate |
|---|---|---|---|
| Cross-tenant data access | Critical | Workspace-scoped repositories, authz tests, optional database RLS | Before cloud persistence |
| Provider key exposure | Critical | Server-only hosted secrets, secret scanning, no public env vars | Before hosted AI |
| Unbounded AI spend | High | Workspace quotas, rate limits, model allowlists, usage ledger | Before hosted AI |
| Prompt/source leakage | High | Data-retention policy, redaction, provider terms, explicit trust copy | Before hosted AI |
| Destructive deletion | High | Confirmation, retention window, audit event, backup/export | Before paid launch |
| Stale collaborative edits | Medium | Revision IDs, conflict states, immutable history | Before team review |
| Billing entitlement drift | High | Signed idempotent webhooks, reconciliation job, audit trail | Before paid launch |
| Silent migration loss | High | Dry-run importer, backups, visible migration report, rollback | Before cloud migration |
| Framework migration regression | Medium | Browser workflow parity and App Router acceptance gate | Before Next canonical |

## Status Model

Use the following status model for SaaS execution:

| Status | Meaning |
|---|---|
| Proposed | Requires product or architecture decision |
| Ready | Scope, owner, dependency, and acceptance gate are defined |
| In progress | Implementation is underway on a tracked branch |
| Blocked | A dependency, decision, or environment prevents safe progress |
| Ready for validation | Implementation complete; checks and user-flow validation remain |
| Accepted | Acceptance gate passed and documentation is current |
| Deferred | Intentionally moved to a later release with a recorded reason |

## Supporting Skills and Handoffs

The requested skill search was attempted against the configured verified GitHub skill sources. The real-time fetch failed and the cache returned no matches, so no external skill recommendation is treated as authoritative. The project can proceed using the internal specialist handoffs below.

| Handoff | Specialist capability | Deliverable |
|---|---|---|
| H-01 | Product discovery and management | Validated ICP, pricing hypotheses, activation definition |
| H-02 | Domain and backend architecture | Workspace/project/revision domain model and service boundaries |
| H-03 | Database architecture and database guard | Tenant isolation, indexes, migrations, retention, backup |
| H-04 | Security architecture and security testing | Threat model, authz matrix, provider trust boundary, abuse cases |
| H-05 | API integration design | Provider adapter, webhooks, idempotency, retry, rate limits |
| H-06 | Frontend architecture and UX/UI design | IA, route map, onboarding, workspace switcher, review flows |
| H-07 | Payments/release management | Plans, entitlements, billing lifecycle, release gates |
| H-08 | Observability/production operations | Metrics, logs, alerts, runbooks, support diagnostics |

## Artifact Register

| ID | Artifact | Role |
|---|---|---|
| A-01 | `README.md` | Current product and implementation baseline |
| A-02 | `ENHANCEMENT_ROADMAP.md` | Local-first enhancement sequence and non-goals |
| A-03 | `NEXTJS_MIGRATION_PLAN.md` | Runtime migration baseline |
| A-04 | `SAAS_GENERALIZATION_PLAN.md` | This product, requirements, architecture, and delivery plan |
| A-05 | `HOSTED_MODE_DECISION.md` | Existing hosted AI decision boundary |
| A-06 | `COLLABORATION_DECISION.md` | Existing collaboration decision boundary |
| A-07 | `NON_GOALS.md` | Explicit v1 product boundary |

## Next Handoffs

The immediate next action should be **EPIC-01 Product Validation**. Before building authentication or billing, interview target users about their current content-production workflow, where claims and sources are lost, which hand-off artifacts they already use, and whether they would pay for project history, collaboration, hosted AI, or reusable templates.

After EPIC-01, the implementation handoff is to **EPIC-02 Domain Extraction**. Define `User`, `Workspace`, `Membership`, `Project`, `PackRevision`, `ArtifactRevision`, `EvidenceItem`, `UsageLedger`, and `AuditEvent` before introducing a database schema. Then create GitHub issues from EPIC-02 through EPIC-06 with acceptance tests and dependency links.

## References

[1]: ./README.md "Content Center current implementation baseline"

[2]: ./ENHANCEMENT_ROADMAP.md "Content Center local-first enhancement roadmap"

[3]: https://nextjs.org/docs/app/guides/migrating/app-router-migration "Next.js App Router migration guide"

[4]: https://nextjs.org/docs/app/getting-started/server-and-client-components "Next.js Server and Client Components"
