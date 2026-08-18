# Public release checklist

This checklist is the maintainer hand-off for the first public GitHub release of Content Center. It is intentionally focused on the current scope: local-first campaign planning, one long-form video, related pre-launch and post-launch shorts, simple CapCut montage guidance, simple DaVinci Resolve coloring guidance, known-provider connections, and multi-platform adaptation.

## Product readiness

| Check | Evidence or owner | Status |
|---|---|---|
| A new user can understand the product promise and non-goals from `README.md`. | README and scope-aligned plan | Complete |
| README includes public-safe screenshots of the dashboard and demo generator. | `docs/screenshots/` and README preview | Complete |
| Dashboard hero art is repository-tracked and survives a fresh Vite build. | `client/src/assets/content-center-hero.jpg` and `pnpm validate:hero-asset` | Complete |
| The no-provider demo path works through `/generator?demo=1` and the Dashboard action. | `docs/RELEASE_VERIFICATION.md` and manual browser check | Complete |
| The public fixture contains no credentials, private notes, or generated factual claims. | `pnpm validate:demo-fixture` | Complete |
| The default campaign supports one long-form asset, configurable pre-launch shorts, and configurable post-launch shorts. | Campaign configuration and Generator UI | Complete |
| Default editing guidance remains simple CapCut montage and simple DaVinci Resolve correction. | Preset data and production guidance panels | Complete |
| Platform and tool preset contributors have a typed contract, versioning rules, and validation workflow. | `docs/PRESET_AUTHORING.md` | Complete |
| Platform adaptation remains editable and does not imply auto-publishing. | Platform preset data and exports | Complete |

## Privacy and security

| Check | Evidence or owner | Status |
|---|---|---|
| Provider credentials are not stored in public frontend configuration, browser storage, fixtures, logs, or exports. | `SECURITY.md`, provider proxy, security scan | Complete |
| Remote-provider requests disclose that prompts and notes may leave the device. | Settings/provider status UI and `PROVIDER_SETUP.md` | Complete |
| Undisclosed vulnerabilities are directed to private reporting rather than public issues. | `SECURITY.md` and issue-template configuration | Complete |
| Backup and revision conflicts preserve user data rather than silently overwriting changes. | Storage and cloud revision tests | Complete |
| A release scan and dependency review are run from the release commit. | `docs/RELEASE_VERIFICATION.md` and clean-checkout `pnpm verify` | Complete |
| Optional analytics is disabled by default and cannot emit placeholder URLs. | `client/src/lib/optional-analytics.ts` and regression tests | Complete |

## Contributor and repository readiness

| Check | Evidence or owner | Status |
|---|---|---|
| `CONTRIBUTING.md` explains local setup, tests, provider boundaries, presets, pull requests, and demo-fixture usage. | Contributor guide | Complete |
| Bug, provider, platform, UX, and preset issue templates are enabled. | `.github/ISSUE_TEMPLATE/` | Complete |
| Pull requests use the repository validation and privacy checklist. | `.github/pull_request_template.md` | Complete |
| Public and security-sensitive changes have a default maintainer review owner. | `.github/CODEOWNERS` | Complete |
| CI runs on `main`, capital-D `Dev`, and version tags matching `v*`. | `.github/workflows/quality.yml` | Complete |
| Dependency updates are surfaced weekly and must pass the normal verification gate. | `.github/dependabot.yml` and `pnpm verify` | Complete |
| Public release announcements use a consistent scope, privacy, validation, and recovery structure. | `RELEASE_NOTES_TEMPLATE.md` | Complete |
| Branch, tag, promotion, and recovery expectations are documented for maintainers and contributors. | `docs/BRANCHING_AND_RELEASE.md` | Complete |
| Community conduct and security policies are linked from the public repository surface. | `CODE_OF_CONDUCT.md`, `SECURITY.md`, `README.md` | Complete |
| The repository includes a public MIT license and validates its required terms. | `LICENSE` and `pnpm validate:license` | Complete |
| Public support requests have safe troubleshooting and issue-routing guidance. | `SUPPORT.md` and `pnpm validate:support` | Complete |
| Public history and unreleased release-candidate changes are maintained in a validated changelog. | `CHANGELOG.md` and `pnpm validate:changelog` | Complete |
| The final clean-checkout verification record is retained with the release evidence. | `docs/RELEASE_VERIFICATION.md` | Complete |
| The public preview tag identity, scope, evidence, and announcement requirements are documented. | `docs/RELEASE_CANDIDATE.md` | Complete |
| Integrated UI validation covers semantic contrast, responsive platform hooks, exact model discovery, native platform accessibility, hero wiring, Settings workspace structure, privacy/diagnostics disclosures, mobile navigation semantics, and horizontal-overflow containment. | `pnpm validate:integrated-ui` | Complete |
| Tagging is blocked when release evidence, candidate metadata, or package version is incomplete. | `pnpm validate:release-readiness` | Complete |

## Release verification

Before tagging or announcing a release, run the following from a clean checkout of the release commit:

```bash
pnpm install --frozen-lockfile
pnpm verify
git status --short --branch
```

`pnpm verify` is the repository’s consolidated gate for typecheck, tests, security scanning, accessibility smoke checks, public-fixture, release-notes-template, CODEOWNERS, branching-guide, license, support-guide, changelog, release-candidate, release-readiness, semantic theme, hero-asset, and integrated UI contrast/responsive validation, including the Settings workspace, provider diagnostics, privacy disclosures, mobile navigation semantics, and horizontal-overflow containment, followed by the production build and whitespace validation.

Then perform a manual smoke check using the public demo campaign. Confirm that the dashboard entry point opens the generator, the public-demo banner explains that no AI account is required, the campaign phase labels are visible, the simple montage and coloring guidance render, the platform selectors work as native accessible checkboxes with selected/available state copy, local mode remains available without an account, and no provider request occurs until the user explicitly chooses to generate. Also confirm that the dashboard hero image renders in both theme modes and that Settings presents actionable model-discovery recovery when the local endpoint is unavailable.

## Release notes and recovery

Release notes should describe the supported workflow, provider privacy boundary, known limitations, and any migration or backup guidance. Do not include exploit details for an unresolved security issue. If a release causes data loss, unsafe credential handling, or a broken local-first path, pause promotion, preserve the affected commit, communicate the impact, and roll back to the last verified release while preparing a corrective patch.
