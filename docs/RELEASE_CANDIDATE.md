# Public release candidate

This record prepares the first public preview without implying that a final release has been published.

## Candidate identity

| Field | Value |
|---|---|
| Candidate tag | `v1.0.0-rc.1` |
| Source branch | Capital-D `Dev` |
| Release line | `1.0.0` |
| Release mode | Public preview; local-first path remains available without an account |

The candidate tag should point to the final verified `Dev` commit after this preparation record and any required hardening are complete. Do not tag a dirty checkout or a commit that has not passed the clean-checkout procedure in [`RELEASE_VERIFICATION.md`](RELEASE_VERIFICATION.md).

## Included scope

The candidate includes the supported public workflow: one long-form video, configurable pre-launch and post-launch shorts, simple CapCut montage guidance, simple DaVinci Resolve coloring guidance, multi-platform adaptation, local AI connectivity, documented known-provider connectivity with exact model-ID discovery where exposed, review gates, local persistence, backup/revision safety, semantic light/dark theme and notification states, accessible responsive platform selection, a repository-backed dashboard hero asset, integrated contrast/accessibility validation, accessible public-demo onboarding, and public contributor workflows.

## Explicit non-goals

This candidate does not add advanced montage, advanced color grading, rendering automation, auto-publishing, mandatory cloud usage, or provider credentials in the browser or repository.

## Required evidence before tagging

- [x] `Dev` is clean and synchronized with `origin/Dev`.
- [x] A fresh checkout passes `pnpm install --frozen-lockfile` and `pnpm verify`.
- [x] `/generator?demo=1` passes the public-demo smoke review without an account or provider request before explicit generation.
- [x] [`PUBLIC_RELEASE_CHECKLIST.md`](../PUBLIC_RELEASE_CHECKLIST.md) is complete.
- [x] [`CHANGELOG.md`](../CHANGELOG.md) and [`RELEASE_NOTES_TEMPLATE.md`](../RELEASE_NOTES_TEMPLATE.md) are ready for the candidate announcement.
- [x] No secrets, private notes, unsupported claims, or unrelated generated artifacts are present.
- [x] Integrated UI validation covers semantic contrast, responsive platform hooks, exact model-discovery surfaces, native platform accessibility, and the tracked hero asset.

## Candidate announcement

Use the release-notes template to describe the creator workflow, local/remote privacy boundary, supported limitations, validation evidence, and recovery path. Link to the public demo and setup documentation. Do not include credentials, private prompts, personal data, authorization headers, or unresolved exploit details.
