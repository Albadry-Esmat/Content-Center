# Branching and release workflow

Content Center uses a small, explicit branch workflow so public contributions remain reviewable and release checks remain reproducible.

## Working branches

| Ref | Purpose | Expected validation |
|---|---|---|
| `Dev` | Active controlled implementation branch for the current enhancement batches. | Run `pnpm verify` before pushing or opening a pull request. |
| `main` | Release-oriented integration branch. | Only promote changes that have passed the public-release checklist. |
| `v*` tags | Release verification trigger, such as `v1.0.0`. | The quality workflow runs again for the tag. |

The capital `D` in `Dev` is intentional. Do not create or target a lowercase `dev` branch for current work. Contributors should normally open pull requests against `Dev`; maintainers can promote reviewed work to `main` when the release checklist is satisfied.

## Batch workflow

Each controlled batch should remain focused on one coherent outcome. Before pushing, review the diff, run `pnpm verify`, and confirm that no secrets, private notes, generated factual claims, or unrelated formatting changes were introduced. After the push, confirm that the local `Dev` branch reports `0 ahead / 0 behind` relative to `origin/Dev`.

A release candidate should be taken from a clean commit after the public demo smoke check. Prepare release communication with [`RELEASE_NOTES_TEMPLATE.md`](../RELEASE_NOTES_TEMPLATE.md), then create a version tag only after [`PUBLIC_RELEASE_CHECKLIST.md`](../PUBLIC_RELEASE_CHECKLIST.md) is complete. The tag-triggered quality workflow is a second verification point; it does not replace the maintainer’s manual release review.

## Recovery

If a batch or release check fails, keep the failing commit available for diagnosis, fix the smallest clear cause, rerun `pnpm verify`, and do not promote the change until the checks pass. If a release causes data loss, unsafe credential handling, or a broken local-first path, pause promotion and follow the recovery guidance in [`SECURITY.md`](../SECURITY.md) and the public-release checklist.
