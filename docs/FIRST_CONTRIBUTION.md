# First contribution guide

Content Center is a public, local-first creator tool. The easiest way to help is to make one small, reviewable improvement that keeps the workflow understandable for creators who are planning one long-form video, related pre-launch and post-launch shorts, simple CapCut montage guidance, simple DaVinci Resolve coloring guidance, or platform adaptations.

This guide is a short path from a clean checkout to a first issue, documentation change, fixture update, preset contribution, or focused code change. Read it together with [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`SUPPORT.md`](../SUPPORT.md), and the [branching and release workflow](BRANCHING_AND_RELEASE.md).

## Choose a small contribution path

Start with the path that matches what you can verify confidently. You do not need to understand the entire application before opening a focused pull request.

| Contribution path | Good first outcome | Start here |
|---|---|---|
| Documentation | Clarify setup, privacy, troubleshooting, or a beginner workflow without changing runtime behavior. | Update the relevant Markdown file and run `pnpm verify`. |
| Public demo or fixture | Improve a public-safe example, reproduction step, or screenshot scenario without private notes or credentials. | Review `fixtures/demo-campaign.json` and run `pnpm validate:demo-fixture`. |
| Platform preset | Add or correct versioned title, caption, CTA, safe-zone, schedule, or export guidance. | Follow [`docs/PRESET_AUTHORING.md`](PRESET_AUTHORING.md) and the platform issue template. |
| CapCut or DaVinci preset | Add one simple, beginner-readable production step with an explicit boundary for what to avoid. | Follow the tool-preset contract in [`docs/PRESET_AUTHORING.md`](PRESET_AUTHORING.md). |
| Provider integration | Improve local or known-provider setup, diagnostics, normalized errors, or a connection fixture. | Read [`PROVIDER_SETUP.md`](../PROVIDER_SETUP.md) and the provider issue template first. |
| UI or accessibility | Improve labels, keyboard behavior, live status, responsive layout, or RTL/mixed-direction handling. | Reproduce with the public demo and use the UX issue template when a design decision is needed. |
| Focused bug fix | Correct one reproducible behavior with a regression test where practical. | Reproduce from the public demo before including any private project data. |

When you are unsure which path fits, open a draft issue using the closest template and describe the user problem before proposing an implementation. Keep the first change narrow; a smaller pull request is easier to validate, review, and recover.

## Ten-minute local setup

Requirements are **Node.js 18 or newer** and **pnpm**. No Content Center account, cloud workspace, provider credential, or paid service is required for the demo-first contribution path.

```bash
gh repo clone Albadry-Esmat/Content-Center
cd Content-Center
git switch Dev
pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

Open the localhost URL printed by the development server. If the default port is busy, the server selects the next available port. The complete verification command may take longer than the first setup; run it before pushing or opening a pull request, not only after a reviewer asks for it.

> Do not copy real provider keys into the repository, browser storage, issue text, screenshots, logs, or exports. Use `.env.example` only for placeholder documentation. Provider-backed work must preserve the local/remote trust boundary described in [`PROVIDER_SETUP.md`](../PROVIDER_SETUP.md).

## Start with the public demo

The public demo is the safest reproduction path because it uses a fixture designed for screenshots, manual QA, and issue reports. With the development server running, open `/generator?demo=1` or choose **Try demo campaign** from the dashboard.

Before reporting a problem, record the route, the visible stage, the selected platform and tool presets, the expected behavior, and the actual behavior. Do not paste private campaign notes or raw provider responses. If the change touches the fixture, run:

```bash
pnpm validate:demo-fixture
```

The demo does not make a provider request until you choose a labelled generation action. This makes it suitable for reviewing campaign structure, short publication phases, simple montage and coloring guidance, warning states, and responsive behavior without connecting an AI service.

## Make a focused branch and pull request

The active implementation branch is `Dev` with a capital `D`. Contributors should normally create a focused working branch from the current `Dev` branch and open the pull request against `Dev`. Do not create or target a lowercase `dev` branch.

```bash
git switch Dev
git pull --ff-only origin Dev
git switch -c docs/describe-your-change
```

Use a branch name that describes one outcome, such as `docs/first-contribution-guide`, `fix/demo-warning`, or `preset/tiktok-caption`. Keep unrelated formatting, dependency upgrades, and speculative refactors out of the same pull request.

The pull-request description should explain the user problem, affected routes or modules, compatibility impact, privacy and security impact, validation results, and any known limitations. Meaningful UI changes should include a public-safe screenshot or short recording. Follow the repository pull-request template and confirm that no secrets or personal data were added.

## Validate before asking for review

Use the complete gate for every focused contribution:

```bash
pnpm verify
git diff --check
git status --short --branch
git rev-list --left-right --count HEAD...origin/Dev
```

The expected final branch status is a clean working tree. For maintainer-controlled batches, the local `Dev` branch should report `0 0` relative to `origin/Dev` after the push. A contributor branch will normally be ahead of `Dev` until its pull request is merged; do not force-push or rewrite shared `Dev` history.

Use narrower checks while iterating, then run the full gate before review. The most common focused commands are shown below.

| Change | Focused check before the full gate |
|---|---|
| TypeScript or runtime behavior | `pnpm check` and the relevant Vitest test file. |
| Public fixture or demo | `pnpm validate:demo-fixture` and the relevant UI smoke review. |
| Security or provider boundary | `pnpm security` and the provider contract tests. |
| Accessibility or layout | `pnpm a11y:smoke` plus keyboard and responsive review. |
| Markdown or release documentation | The relevant validator, `git diff --check`, and link/path review. |
| Preset data or guidance | Preset contract tests and `pnpm validate:demo-fixture` when the public fixture is affected. |

If a check fails, keep the failure reproducible, fix the smallest clear cause, and rerun the check. Do not hide failures by deleting coverage, weakening the validator, or committing generated build output.

## Safe evidence for issues and pull requests

A useful report is reproducible without exposing private content. Include the commit or version, browser and runtime, provider mode and model when relevant, selected platform and tool presets, exact reproduction steps, expected behavior, actual behavior, and whether a local backup is available.

| Safe to include | Do not include |
|---|---|
| Public demo route, sanitized error text, test output, browser/runtime versions, preset identifiers, and redacted screenshots. | API keys, OAuth tokens, authorization headers, private endpoint URLs, personal data, private prompts, raw provider payloads, or undisclosed exploit details. |

Use [`SUPPORT.md`](../SUPPORT.md) to choose the correct issue template. Use the private security reporting path in [`SECURITY.md`](../SECURITY.md) for vulnerabilities; do not put them in a public issue.

## What reviewers look for

Reviewers should be able to understand the user problem, reproduce the behavior, and see why the change belongs within the project boundary. New guidance should remain beginner-friendly. New provider work must make local versus remote behavior visible and keep credentials outside the browser and repository. New presets should be versioned, editable, sourced or clearly labelled as assumptions, and explicit about what the simple default workflow does not attempt.

A first contribution is successful when it is **small, reproducible, privacy-safe, scope-aligned, and validated**. If a proposal needs a larger architecture decision, document the question in an issue before beginning implementation.

## Next reading

| If you want to… | Read next |
|---|---|
| Understand product boundaries | [`README.md`](../README.md) and [`ENHANCEMENT_PLAN_SCOPE_ALIGNED.md`](../ENHANCEMENT_PLAN_SCOPE_ALIGNED.md) |
| Add a platform or editing-tool preset | [`docs/PRESET_AUTHORING.md`](PRESET_AUTHORING.md) |
| Add or troubleshoot a provider | [`PROVIDER_SETUP.md`](../PROVIDER_SETUP.md) and [`SECURITY.md`](../SECURITY.md) |
| Report a user problem | [`SUPPORT.md`](../SUPPORT.md) and `.github/ISSUE_TEMPLATE/` |
| Prepare a release | [`PUBLIC_RELEASE_CHECKLIST.md`](../PUBLIC_RELEASE_CHECKLIST.md) and [`docs/BRANCHING_AND_RELEASE.md`](BRANCHING_AND_RELEASE.md) |
