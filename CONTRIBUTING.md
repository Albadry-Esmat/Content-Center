# Contributing to Content Center

Thank you for helping improve Content Center. The project is a public, local-first tool for turning one idea into a long-form video campaign with related pre-launch and post-launch shorts, simple CapCut montage guidance, and simple DaVinci Resolve coloring guidance.

## Before you start

Read the [README](README.md) and [scope-aligned enhancement plan](ENHANCEMENT_PLAN_SCOPE_ALIGNED.md). The product is intentionally simpler than a professional video editor. Contributions should help creators understand the next production action without forcing advanced montage, advanced color grading, rendering, auto-publishing, or mandatory cloud usage into the core workflow.

## Development setup

Requirements are Node.js 18+ and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm security
pnpm build
pnpm dev
```

Do not commit `.env` files, provider keys, OAuth secrets, database credentials, or private endpoint tokens. Use `.env.example` for placeholder documentation only.

## Contribution areas

| Area | Preferred contribution shape |
|---|---|
| Campaign model | Typed domain change, migration behavior, reducer tests, and export coverage. |
| Long or short content | Prompt/schema change, representative fixture, validation, and review-warning behavior. |
| Platform preset | Versioned data, documentation, tests, and a note explaining the source or assumption. |
| CapCut montage preset | Simple, beginner-readable action vocabulary and fixture coverage. |
| DaVinci coloring preset | Simple correction order, safe starting guidance, and screen-recording/skin-tone notes. |
| AI provider | Adapter contract, connection test, normalized errors, credential/privacy design, and provider fixtures. |
| UI/accessibility | Keyboard behavior, labels, live status, responsive behavior, and RTL/mixed-direction checks. |
| Documentation | Setup, privacy, troubleshooting, examples, or contributor experience improvements. |

## Design rules

Content Center uses structured artifacts as its source of truth. Markdown is an export view, not the canonical storage model. AI output must be parsed and validated before it is marked complete. When an upstream artifact changes, dependent montage, coloring, or downstream content must be marked stale rather than silently left in a current-looking state.

Default user-facing guidance must remain simple. A contribution should not make advanced editing knowledge a prerequisite for completing the default workflow. New complexity belongs behind an explicit advanced option or in the deferred roadmap.

Provider integrations must make the trust boundary visible. Local and remote modes must be distinguishable. Provider errors must be sanitized, actionable, and free of credentials or sensitive prompt logging.

## Pull requests

A pull request should explain the user problem, scope, affected modules, tests, migration or compatibility impact, privacy/security impact, and any follow-up work. Keep changes focused. Avoid combining a large runtime migration with an unrelated feature or broad formatting change.

Every pull request should include:

- A concise description of the behavior change.
- The relevant scope or requirement identifier, when available.
- Tests for successful behavior and important failure states.
- Updated documentation for user-visible configuration or provider behavior.
- Screenshots or a short recording for meaningful UI changes.
- Confirmation that no secrets or private data were added.

The required quality checks are:

```bash
pnpm check
pnpm test
pnpm security
pnpm build
```

## Adding a platform preset

Add platform guidance as versioned data rather than embedding it in many prompt strings. Document the preset’s title/caption style, CTA, aspect-ratio guidance, safe-zone notes, schedule role, and export reminders. Avoid presenting changing platform limits as permanent facts. Include fixture coverage and make the UI display the preset version or update note when appropriate.

## Adding a tool preset

Keep creative instructions separate from tool-specific labels. A tool preset should map simple actions such as hard cut, punch-in, caption emphasis, audio ducking, exposure correction, white-balance correction, and moderate contrast to the selected tool. Do not make advanced editing or color-grading operations part of the default path.

## Adding an AI provider

Before implementing a provider, document whether it is local or remote, how credentials are handled, where content is sent, whether structured output is supported, how cancellation behaves, what rate or context limits apply, and how errors are normalized. Add connection and generation fixtures. Never commit a real credential, use a public frontend environment variable for a secret, or log raw authorization headers.

## Reporting issues

Use issue templates where available. Include the runtime, browser, provider mode, model, selected platform/tool presets, reproduction steps, expected behavior, actual behavior, and whether a local backup is available. Remove private notes, tokens, and personal data before sharing logs or exports.
