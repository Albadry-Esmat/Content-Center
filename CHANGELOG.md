# Changelog

All notable public changes to Content Center should be documented in this file. The project follows a simple unreleased-to-tagged flow: maintainers update the `Unreleased` section, run `pnpm verify`, prepare [`RELEASE_NOTES_TEMPLATE.md`](RELEASE_NOTES_TEMPLATE.md), and move the verified entries under a versioned heading when a release tag is created.

## [Unreleased]

### Added

- Added the semantic color and notification-state contract for light/dark themes, readable status feedback, focus, disabled states, reduced motion, provider privacy, and platform-selection handoff; added `validate:semantic-color-notifications` to the quality gate.
- Applied the semantic palette to the shared light/dark runtime theme, improved text and status contrast, updated focus and connection feedback colors, preserved legacy aliases for compatibility, and added `validate:theme-tokens` to `pnpm verify`.
- Improved notification presentation with semantic neutral, success, info, warning, loading, and error states; mapped global Sonner toasts to the shared palette; and added exact local/hosted model-ID discovery with duplicate removal, empty-state guidance, sanitized recovery actions, and one-click model selection in Settings.
- Redesigned Campaign Scope platform selection as responsive accessible tiles while preserving native checkboxes, explicit platform names, selected/available state copy, visible non-color cues, keyboard focus, and the existing campaign platform values.
- Replaced the broken homepage `/manus-storage/...` hero reference with a repository-tracked Vite-imported hero asset, added deterministic asset-path validation, and verified the image in light/dark runtime smoke tests and the production build.
- Added integrated UI validation for semantic light/dark contrast pairs, responsive platform behavior, native platform accessibility hooks, exact model-discovery surfaces, and the tracked hero import; corrected the light selected-status foreground to meet the minimum contrast threshold.

- Beginner-friendly first-contribution guide covering setup, public-demo reproduction, safe contribution paths, validation, privacy boundaries, and the capital-D `Dev` pull-request workflow.
- Contributor-onboarding validation included in the consolidated `pnpm verify` quality gate and linked from the README and GitHub issue chooser.
- Versioned Facebook Reels platform preset with simple 9:16 guidance for title, captions, calls to action, safe zones, and phone review before sharing.
- Versioned CapCut and DaVinci Resolve guidance now includes a beginner review cue and surfaces the preset version in the editor while preserving the simple default boundaries.
- Campaign Scope UX specification defining grouped information architecture, foundation/reference states, explicit AI actions, accessibility, responsive behavior, and recovery boundaries; its validator is included in `pnpm verify`.
- Campaign Scope now uses a clearer summary, grouped editing defaults, short timeline, objectives, and platform sections with native progressive disclosure while preserving the existing campaign values and local-first demo behavior.
- Added a structured foundation/reference AI draft contract with deterministic normalization, missing-section warnings, verification reminders, campaign context, local/remote provenance, and explicit no-browsing or no-invented-source safety rules; the visible generation action remains gated for the next batch.
- Added an explicit Campaign Scope foundation-draft action with local/remote provider status, no-request-before-action messaging, loading, cancellation, success, warning, error, and read-only review-preview states; keep, append, replace, and discard controls remain gated for the next batch.
- Added editable foundation review with explicit keep-existing-notes, append-to-notes, replace-notes, and discard-draft decisions, plus persistent grounding warnings for unverified AI planning text, verification placeholders, open questions, and locally edited drafts.
- Connected accepted foundation notes to the downstream generation handoff with a topic-plus-notes freshness snapshot, accepted/stale/review-required status messaging, a review recovery action, and non-blocking warnings before generation when the AI foundation is not accepted or has become stale.
- Added versioned local foundation-session persistence keyed by pack ID, sanitized foundation-session backup/restore alongside saved packs, legacy pack-only compatibility, deletion cleanup, and Saved-page restore messaging; provider credentials, endpoint URLs, and authorization values are excluded from persisted foundation metadata.
- Completed Campaign Scope and AI-foundation accessibility, responsive, public-demo, and regression validation, including native disclosure/control checks, no-request-before-action review, local-first demo safety, foundation persistence coverage, full `pnpm verify`, and browser smoke evidence.
- Review hardening fixed multiline foundation list editing and append separators, prevented orphan foundation sessions during backup restore, added a safe provider-not-connected state, sanitized provider failures, exposed retry recovery, improved empty-state guidance, applied direction-aware foundation fields, and expanded accessibility smoke coverage to 14 checks.

## [1.0.0-rc.1] - 2026-08-17

### Added

- Public-safe demo campaign fixture with a direct `/generator?demo=1` route and dashboard entry point.
- Campaign support for one long-form video, configurable pre-launch shorts, configurable post-launch shorts, objective selectors, platform presets, simple CapCut montage guidance, and simple DaVinci Resolve coloring guidance.
- Local-first provider support plus documented known-provider routing, model discovery, diagnostics, credential isolation, and revision-conflict safety.
- Public contribution workflow artifacts: issue templates, pull request checklist, CODEOWNERS, Dependabot configuration, support guidance, branching and release guidance, preset authoring guidance, release-notes template, and MIT license.

### Changed

- Consolidated the contributor and release verification commands under `pnpm verify`.
- Added accessibility smoke checks, demo-fixture validation, release-notes validation, CODEOWNERS validation, branching-guide validation, license validation, and support-guide validation to the verification gate.
- CI now verifies pushes to `main`, capital-D `Dev`, and version tags matching `v*`.

### Fixed

- Optional analytics no longer emits placeholder URLs when analytics configuration is absent; it initializes only with explicit HTTP(S) endpoint and site-ID settings.
- Public demo query detection reliably uses the browser search string and displays accessible no-account guidance.

## Release notes

Use [`RELEASE_NOTES_TEMPLATE.md`](RELEASE_NOTES_TEMPLATE.md) for public announcements. Do not publish credentials, private prompts, personal data, authorization headers, or unresolved vulnerability details. Follow [`SECURITY.md`](SECURITY.md) for undisclosed security reports and [`PUBLIC_RELEASE_CHECKLIST.md`](PUBLIC_RELEASE_CHECKLIST.md) before tagging a release.
