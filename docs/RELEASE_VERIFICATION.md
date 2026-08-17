# Release verification record

This record documents the final clean-checkout verification for the current public release candidate.

## Verified source

| Field | Result |
|---|---|
| Repository | `Albadry-Esmat/Content-Center` |
| Branch | `Dev` |
| Verified source commit | `1e31eae docs: add public changelog workflow` |
| Verification date | 2026-08-17 |
| Checkout state | Fresh single-branch clone with frozen dependency installation |
| Git state after verification | Clean: `## Dev...origin/Dev` |

## Automated verification

The clean checkout passed `pnpm install --frozen-lockfile` and `pnpm verify`. The gate completed typecheck, 74 tests across 23 files, security scanning, 10 accessibility smoke checks, demo-fixture validation, release-notes validation, CODEOWNERS validation, branching-guide validation, license validation, support-guide validation, changelog validation, production build, and whitespace validation.

## Public-demo smoke review

The route `/generator?demo=1` loaded without an account, provider key, or cloud workspace. The page exposed local-first status, the public-demo banner, a dashboard link, the preloaded topic and notes, one long-form asset, two pre-launch shorts, five post-launch shorts, simple CapCut and DaVinci defaults, platform selectors, and labelled generation controls.

The demo banner returned to `/` through **Back to dashboard**. The dashboard exposed both **Try demo campaign** and **Preview a demo campaign** entry points. No generation action was triggered during the review, and no provider request was made before explicit user action.

## Release decision

The clean-checkout automated gate and public-demo smoke review passed for the verified source commit. This evidence supports marking the public-demo and release-scan checks complete in [`PUBLIC_RELEASE_CHECKLIST.md`](../PUBLIC_RELEASE_CHECKLIST.md). Any source change after the verified commit must repeat the clean-checkout verification before promotion.

## Candidate-preparation recheck

After the release-candidate metadata and release-readiness validator were added in commit `8f97592`, a fresh Dev checkout again passed frozen dependency installation, `pnpm verify`, and clean Git status. The browser smoke review was repeated on the candidate checkout at `/generator?demo=1`; the public-demo banner, campaign scope, local-first status, and no-request-before-generation behavior remained intact.

The changelog promotion and checked evidence updates that follow this record are documentation-only release preparation. They must still pass the final clean-checkout gate before the preview tag is created.
