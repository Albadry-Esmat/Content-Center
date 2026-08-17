# Campaign Scope UX specification

## Purpose

This specification defines the information architecture and interaction states for the Campaign Scope area of the Generator. It is the design contract for the later visual and AI-generation batches. Batch 1 does not change runtime behavior, provider calls, persistence, or generation prompts.

The current Campaign Scope is a dense card inside the compose panel. It combines the campaign summary, CapCut and DaVinci defaults, short counts, objective selectors, and platform checkboxes. The foundation/reference textarea is currently adjacent to this card but has no dedicated source status or AI-assisted review state. The redesign must make the creator’s next decision easier without hiding important controls.

## Design principles

| Principle | Application |
|---|---|
| **Summary before detail** | Show the campaign shape and current readiness before the full configuration controls. |
| **One decision per group** | Keep campaign shape, editing defaults, short objectives, platforms, and foundation/reference as separate groups. |
| **Progressive disclosure** | Keep the common path visible; place secondary details behind native expandable sections or clearly labelled controls. |
| **Explicit AI action** | AI foundation generation will always require a labelled user action. It must never run on page load, demo load, or ordinary field edits. |
| **Review before trust** | Generated foundation/reference text is an editable draft and review aid, not verified research or factual approval. |
| **Preserve user work** | Existing notes remain safe by default. Replace, append, keep, and discard actions must be deliberate. |
| **Simple production defaults** | CapCut simple montage and DaVinci Resolve simple correction remain visible as the default path. |
| **Local-first clarity** | The interface must show whether content stays local or will be sent to a remote provider before generation. |

## Information architecture

The Campaign Scope area should be organized in this order:

| Order | Group | Primary question | Default state |
|---:|---|---|---|
| 1 | Campaign summary | What will this pack contain? | Always visible |
| 2 | Editing defaults | Which simple tools will guide the hand-off? | Always visible, compact |
| 3 | Short timeline | How many shorts come before and after the main video? | Expanded when editing campaign shape |
| 4 | Objectives | What job does each short perform? | Collapsed when counts are unchanged; expanded when editing objectives |
| 5 | Platforms | Where will the campaign be adapted? | Expanded enough to show selected platforms; full list available |
| 6 | Foundation / reference | What should the AI and creator stay grounded in? | Always visible as the primary editable workspace |
| 7 | Source status and actions | Is the foundation user-authored, AI-drafted, empty, or needing review? | Always visible in the foundation workspace |

The summary must remain concise and should not duplicate every control label. It should communicate the current shape, for example: **1 long-form · 2 before · 5 after · 4 platforms**. When the summary is clicked or activated, focus should move to the first editable group rather than triggering generation.

## Foundation/reference workspace contract

The foundation/reference area is the central future extension point. Its visual contract is:

| Element | Required behavior |
|---|---|
| Label | Use `Foundation / reference` and explain that it is a grounding aid for creator review. |
| Current content | Keep the existing textarea editable and preserve user-authored text. |
| Empty state | Explain what useful material can be added: topic angle, audience, claims, examples, sources, constraints, and open questions. |
| AI action | Use an explicit label such as `Generate foundation draft`; never imply that generation is automatic or verified. |
| Mode status | Show `Local-first`, `Remote provider`, or `Provider not connected` before any request. |
| Draft status | Distinguish `Empty`, `User-authored`, `AI draft — review required`, `Edited after AI draft`, and `Ready for generation`. |
| Safety note | State that unsupported claims require verification and that generated text does not replace source review. |
| Recovery | Provide a visible path to cancel, retry, discard, keep existing notes, or compare before replacement. |

## Interaction state model

The later implementation must support these observable states without changing the meaning of the existing campaign values:

| State ID | Condition | Visible behavior | Primary action |
|---|---|---|---|
| `CS-EMPTY` | Topic and notes are empty | Campaign controls remain usable; foundation area explains what to add first. | Enter topic or notes |
| `CS-READY` | Topic is present; foundation may be empty or populated | Summary and campaign controls are usable; generation actions are labelled. | Review or generate foundation |
| `CS-USER-NOTES` | Notes contain user-authored content | Preserve text and show user-authored status. | Edit, review, or generate a non-destructive draft |
| `CS-AI-DRAFT` | AI returned foundation material | Show draft status, provenance, warning, and editable content. | Keep, append, replace after confirmation, or discard |
| `CS-REVIEWED` | Creator edited or accepted the foundation | Show edited/ready status and review reminder. | Generate fields or continue to next stage |
| `CS-GENERATING` | Foundation request is running | Disable conflicting actions, show progress text, keep existing notes safe, and expose cancel. | Cancel |
| `CS-CANCELLED` | User cancelled or request aborted | Preserve existing notes and any completed draft; explain what was retained. | Retry or continue editing |
| `CS-WARNING` | Output is partial, malformed, or includes verification warnings | Keep the content editable and show the warning near the affected material. | Review, edit, regenerate, or discard |
| `CS-ERROR` | Provider unavailable, timeout, or sanitized failure | Show actionable error without credentials or raw authorization data. | Retry, switch mode, or continue locally |
| `CS-LOCAL-DEMO` | Public demo route is active | Show no-account, local-first, no-request-before-action messaging. | Explore or explicitly generate |

## Keyboard and accessibility behavior

The group headings must use semantic headings and, where collapsible, buttons with `aria-expanded` and a relationship to the controlled region. Every select, checkbox, input, textarea, and generation action must have an accessible name. Status changes such as generation started, completed, cancelled, or failed must be announced through the existing live-region pattern or an equivalent accessible status mechanism.

Focus must move predictably: opening a group keeps focus on the triggering control; starting generation keeps focus on or moves it to the status/action region; completion moves focus only when needed to expose the result without interrupting typing; errors return focus to the retry or recovery action. Keyboard users must be able to reach all platform checkboxes and objective selectors without entering a mouse-only control.

Text direction must follow the existing language preference behavior. Labels and status copy should remain understandable in RTL and mixed-direction content. Generated foundation text must remain editable with the correct direction while controls and status labels retain stable layout.

## Responsive behavior

On narrow screens, groups stack vertically and never require horizontal scrolling. The summary stays near the top of the compose panel. Editing defaults use one column when space is limited. Short objectives may be grouped by publication phase, with before and after labels remaining visible. The foundation textarea and generation/recovery actions must remain fully usable without clipping or requiring a desktop-only hover state.

## Batch boundaries

This batch defines the contract only. It does not implement the visual redesign, add AI prompts or provider calls, add new persisted fields, change generation queue behavior, or alter the public demo. Those changes are gated behind the subsequent batches in the approved roadmap.

## Traceability

| Requirement | Covered by |
|---|---|
| FR-01 | Information architecture and summary contract |
| FR-02 | Foundation/reference workspace contract and `CS-GENERATING` |
| FR-03 | Mode status and local-demo state |
| FR-04 / FR-05 | User-authored, AI-draft, and recovery states |
| FR-06 | Safety note and `CS-WARNING` |
| FR-08 | `CS-LOCAL-DEMO` and batch boundaries |
| NFR-01 | Keyboard, accessibility, RTL, and responsive sections |
| NFR-02 / NFR-03 | Provider status, sanitized error, cancellation, and timeout states |
