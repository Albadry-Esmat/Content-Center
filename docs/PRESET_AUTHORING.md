# Preset authoring guide

Content Center keeps platform adaptation and simple editing guidance in typed preset data. Contributors should update the preset source of truth and its tests rather than embedding platform or tool-specific behavior in scattered prompt strings.

## Scope and defaults

The default campaign contains one long-form video, two pre-launch shorts, and five post-launch shorts. The default montage guidance is **CapCut · simple montage**, and the default coloring guidance is **DaVinci Resolve · simple correction**. A preset contribution must preserve the local-first workflow and must not make a hosted account, auto-publishing, rendering, advanced montage, or advanced color grading a prerequisite.

The supported platform identifiers are `youtube`, `youtube-shorts`, `instagram-reels`, `tiktok`, `linkedin`, and `x`. The supported tool identifiers are `capcut`, `generic` for montage, `davinci-resolve`, and `generic` for coloring. Keep identifiers stable because they are persisted in campaign backups and used by normalization logic.

## Platform presets

Platform presets are defined in [`client/src/lib/platform-presets.ts`](../client/src/lib/platform-presets.ts). Each entry implements the following contract:

| Field | Purpose | Authoring rule |
|---|---|---|
| `id` | Stable platform identifier | Use the existing `PlatformId` union; do not rename persisted IDs casually. |
| `label` | Human-readable platform name | Keep it concise and recognizable in the UI. |
| `role` | How the platform contributes to the campaign | Describe the publication role, not a guaranteed algorithmic outcome. |
| `aspectRatio` | Starting frame-shape guidance | State a practical starting shape and identify alternatives when the preset supports them. |
| `titleGuidance` | Title or opening framing guidance | Explain the viewer promise without encouraging unsupported claims. |
| `captionGuidance` | Caption or accompanying-text guidance | Keep it platform-aware, editable, and concise. |
| `ctaGuidance` | Suggested next action | Match the CTA to the asset phase and objective; do not imply auto-publishing. |
| `safeZoneGuidance` | Placement reminder | Use cautious language because interface overlays and platform conventions can change. |
| `exportGuidance` | Final hand-off reminder | Focus on readability, source quality, and a simple export decision. |
| `version` | Preset revision marker | Increment it when guidance changes materially and record the reason in the change description. |

The current script-stage platform card surfaces the label, aspect ratio, role, and CTA. The remaining fields remain important source-of-truth metadata for exports, future UI surfaces, and contributor review; do not remove them merely because a field is not currently shown in every panel.

Platform guidance should distinguish a stable production recommendation from a time-sensitive platform practice. Prefer phrases such as “starting guidance,” “keep important text away from interface areas,” and “verify current platform requirements” over fixed claims about limits or distribution.

## Montage and coloring presets

Tool guidance is defined in [`client/src/lib/production-guidance.ts`](../client/src/lib/production-guidance.ts). Both `getMontageGuidance` and `getColoringGuidance` return a common contract:

| Field | Purpose | Authoring rule |
|---|---|---|
| `toolLabel` | Name shown to the creator | Include the tool and the simple scope, such as `CapCut · simple montage`. |
| `summary` | One-sentence workflow promise | Tell a beginner what the guidance helps them do. |
| `steps` | Ordered production actions | Use observable actions in a safe beginner sequence. Keep the list short enough to follow during production. |
| `avoid` | Explicit boundary | Name advanced or distracting operations that are outside the default path. |
| `reviewCue` | Beginner QA prompt | Give one short visual or listening check before repeating the simple recipe across the campaign. |
| `version` | Preset revision marker | Use a `vN` marker and increment it when user-facing behavior changes. |

The CapCut default should stay centered on hard cuts, removing pauses, short punch-ins, screen recordings or B-roll, readable captions, and restrained audio ducking. The DaVinci Resolve default should stay centered on exposure, white balance, moderate contrast, restrained saturation, natural skin tones, and readable screen recordings. Do not add masks, motion tracking, advanced keyframes, complex effect stacks, LUT design, advanced node trees, or HDR finishing to the default workflow.

## Contribution workflow

Start with the user-facing production decision the preset should improve. Add or update the typed data, increment the preset version when the behavior changes, and add a focused test for the public contract. For a platform change, test the identifier, ordering behavior, version, aspect-ratio guidance, CTA, safe-zone reminder, and any source or assumption that matters. For a tool change, test the tool label, at least one ordered action, the explicit boundary in `avoid`, the beginner `reviewCue`, and the `vN` version marker.

Use the public demo campaign in [`fixtures/demo-campaign.json`](../fixtures/demo-campaign.json) for manual review. Confirm that the preset remains editable in the Generator, that the campaign still works without a provider account, and that the default path stays simple. Do not include provider credentials, private prompts, account data, or unsupported factual claims in fixtures or screenshots.

Run the repository checks before opening a pull request:

```bash
pnpm check
pnpm test
pnpm security
pnpm validate:demo-fixture
pnpm build
git diff --check
```

A pull request should explain the user problem, identify the changed preset and version, describe any platform assumption or source, include test evidence, and state whether the public README or provider documentation needs an update. Use the [new preset](../.github/ISSUE_TEMPLATE/new_preset.md) or [platform update](../.github/ISSUE_TEMPLATE/platform_update.md) issue template when discussion is needed before implementation.

## Review checklist

Before approving a preset contribution, confirm that the change is data-driven, uses a stable identifier, keeps the default workflow beginner-friendly, distinguishes recommendations from hard requirements, preserves local-first behavior, avoids secrets and private data, includes regression coverage, and does not silently change existing persisted campaign values.
