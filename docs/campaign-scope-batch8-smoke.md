# Campaign Scope Batch 8 validation smoke

Reviewed `/generator?demo=1` on the Batch 8 working tree on 2026-08-18.

The public demo loaded without an account in local-first mode and displayed the accessible public-demo banner, `NO CLOUD UPLOADS`, the 1 long-form + 2 before + 5 after campaign shape, simple CapCut and DaVinci defaults, native progressive-disclosure summaries, the explicit `Generate foundation draft` action, and the `Creator notes · usable context` handoff status. The page states that no provider request is made until the user chooses to generate and that downstream generation uses current notes with claim-review responsibility.

The browser smoke also confirmed that the foundation action and Campaign Scope controls are exposed as native buttons, inputs, selects, checkboxes, and `summary` disclosure elements. The screenshot showed the grouped Campaign Scope card and review panels within the responsive generator grid; CSS includes a narrow-screen single-column fallback for foundation fields, campaign controls, review groups, and action rows.

No provider request was triggered during this review. Full structural accessibility smoke, focused regression tests, full `pnpm verify`, and `git diff --check` passed before this record was created.
