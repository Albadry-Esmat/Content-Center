# Semantic Color and Notification-State Specification

## Purpose

This document defines the shared visual contract for Content Center’s light and dark themes and for user-facing notifications. It is an implementation contract for later phases; this phase does not change runtime styling or notification behavior.

The system should make the creator’s current state legible at a glance while preserving the project’s editorial control-room visual language. Color reinforces meaning, but text, icons, structure, and accessible roles remain the primary communication channels.

## Design principles

| Principle | Application |
|---|---|
| Semantic before decorative | A token describes meaning such as success, warning, danger, focus, selected, or muted rather than a component-specific color. |
| Readability in both themes | Every foreground/background pairing is defined for light and dark surfaces; components must not assume the light palette. |
| Color is not the only cue | Notifications and selection states include text, iconography, border or pattern differences, and accessible status text. |
| Stable hierarchy | Primary text, supporting text, labels, metadata, placeholders, and disabled text retain predictable relative emphasis. |
| Local-first trust | Provider, upload, connection, and privacy feedback uses explicit copy and does not imply a cloud action that did not occur. |
| Interruptible feedback | Loading and success feedback should be brief and purposeful; reduced-motion users receive the same information without animation dependence. |

## Token contract

The implementation should expose semantic tokens for each theme. Token names may be implemented as CSS custom properties, but component styles must consume semantic names rather than hard-coded hex values.

| Token family | Required meaning |
|---|---|
| `--color-bg` | Application background |
| `--color-surface` | Main panel or card surface |
| `--color-surface-raised` | Elevated surface, menu, toast, or selected panel |
| `--color-surface-inset` | Input, code, or nested content surface |
| `--color-border` | Default divider and control border |
| `--color-border-strong` | Emphasized divider or active control border |
| `--color-text` | Primary readable text |
| `--color-text-subtle` | Secondary readable text and descriptions |
| `--color-text-muted` | Metadata and low-priority text that still meets readability requirements |
| `--color-text-placeholder` | Placeholder text, never used for required content |
| `--color-text-disabled` | Disabled content, paired with a non-color disabled cue |
| `--color-link` | Links and non-button navigation actions |
| `--color-focus` | Keyboard focus outline and focus ring |
| `--color-selected` | Selected tabs, platform controls, and active states |
| `--color-success` | Completed or successful action |
| `--color-info` | Neutral progress, discovery, or explanatory feedback |
| `--color-warning` | Review-needed, partial, or cautionary feedback |
| `--color-danger` | Failed, blocked, destructive, or invalid state |
| `--color-on-accent` | Text and icons placed on primary accent backgrounds |
| `--color-on-status` | Text and icons placed on status backgrounds |

Each state token should have a compatible border and soft-background treatment, either as paired tokens or deterministic `color-mix` variants. Components must not use a dark-theme-only error color in the light theme or vice versa.

## Notification states

Notifications follow the workflow **Entry → Context → Action → Feedback → Result → Next action**. They may appear as a toast, inline status, banner, or field-level message depending on persistence and user action needs.

| State | Purpose | Required visual cues | Accessible behavior | Example next action |
|---|---|---|---|---|
| Success | An explicit action completed | Success icon, readable status color, concise confirmation | `role="status"`; announce once without stealing focus | Continue, review, or undo when available |
| Info | Neutral explanation or discovery result | Info icon or marker, neutral status surface | `role="status"`; remain visible long enough to read | Select a model, inspect details, or continue |
| Warning | Review required or partial result | Warning icon, amber/attention border, clear reason | `role="status"` or `aria-live="polite"`; do not imply failure | Review, verify, retry, or choose a mode |
| Error | Action failed or is blocked | Danger icon, clear cause, recovery action | `role="alert"` for actionable failure; never expose secrets | Retry, open Settings, or continue locally |
| Cancellation | User stopped an in-progress action | Neutral or warning marker, retained-work explanation | Announce cancellation and preserved data | Retry or continue editing |
| Loading | Work is in progress | Progress indicator plus plain-language action copy | `aria-live="polite"`; expose cancel when supported | Cancel or wait |
| Neutral | Persistent state or context label | No alarm color; rely on structure and text | Do not over-announce static labels | Read or continue |

Notifications must not communicate state through color alone. Every non-neutral status includes an explicit label or sentence. Toast descriptions must not contain API keys, authorization headers, raw endpoint secrets, or unreviewed provider error payloads.

## Theme and contrast requirements

The light palette must use dark enough text on light backgrounds; the dark palette must use light enough text on dark backgrounds. Primary body text, interactive labels, form values, links, status copy, and focus indicators require strong contrast. Muted metadata may be lower emphasis but must remain readable at its rendered size.

Focus indicators must remain visible against both the component surface and the surrounding page. Selected platform controls and tabs must remain distinguishable when color vision is limited by combining border, background, checkmark, text weight, or icon cues. Disabled controls must retain a visible disabled treatment without becoming indistinguishable from placeholder text.

Hard-coded colors are allowed only for visual assets or intentionally fixed imagery overlays, and those overlays must be validated against the text placed above them. All application copy and controls should use semantic tokens.

## Motion and reduced motion

State transitions may use short opacity, border, or transform transitions to communicate cause and effect. Loading indicators and decorative hero motion must honor `prefers-reduced-motion: reduce`. Removing motion must not remove the state label, action feedback, or recovery path.

## Component handoff

| Component area | Required follow-up |
|---|---|
| Root theme tokens | Replace ad hoc text, border, surface, status, and focus values with semantic variables. |
| Sonner wrapper | Map toast success, info, warning, error, and neutral styles to semantic tokens while forwarding the active theme. |
| Settings connection result | Use success/error semantic states and add discovery-specific info, warning, empty, and retry feedback. |
| Generator and Campaign Scope | Apply semantic status tokens to grounding, generation, provider, and platform-selection states. |
| Platform controls | Use selected, unselected, hover, focus, disabled, and error tokens without losing native checkbox semantics. |
| Dashboard hero | Validate fixed image overlays separately; do not use them as substitutes for readable application colors. |

## Acceptance criteria

| ID | Criterion |
|---|---|
| COLOR-01 | Light and dark themes define all required semantic token families. |
| COLOR-02 | Application UI components do not rely on the current ad hoc hard-coded muted/status colors where semantic tokens apply. |
| COLOR-03 | Primary text, labels, values, links, focus, selected controls, and status copy remain readable in both themes. |
| NOTIFY-01 | Success, info, warning, error, cancellation, loading, and neutral states are visually distinct and textually explicit. |
| NOTIFY-02 | Error and provider feedback is sanitized and provides a recovery action when recovery is possible. |
| NOTIFY-03 | Status announcements use appropriate `role`/`aria-live` behavior without unnecessary focus theft. |
| NOTIFY-04 | Reduced motion preserves all state meaning and action feedback. |
| HANDOFF-01 | Later phases add automated structural checks, focused component tests, light/dark browser smoke, and `git diff --check`. |

## Implementation status

The semantic root tokens and shared light/dark palette are implemented in `client/src/index.css`. The Sonner wrapper now maps neutral, success, info, warning, and error toast states to those tokens. Settings now exposes explicit discovery loading, success, info, warning, and error states, lists exact model IDs returned by a provider, and provides a keyboard-accessible action to select a listed ID. Platform controls and the homepage asset remain scheduled for later phases.

## Batch boundary

This specification remains the contract for later implementation phases. Any new notification surface must preserve the state vocabulary, text-plus-icon requirement, appropriate `role`/`aria-live` behavior, sanitized provider feedback, and reduced-motion meaning defined above.
