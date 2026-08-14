# Pending & Not-Yet-Completed Phases & Tasks

Tracking of workstream items still open for the
`deepseek_html_20260810_71c0d4.html` Bootstrap 5 + AI-accuracy refactor
(single-file, vanilla JS/CSS, no build).

Legend (per plan v1):
- A1–A5 = Workstream A (Bootstrap UI/UX refactor)
- B1–B3 = Workstream B (AI accuracy pipeline)
- P0 = ship-first (functional correctness), P1 = soon-after, P2 = polish/future
- Status: planned | in_progress | blocked | (omitted = done)

---

## Workstream A — Bootstrap UI/UX refactor

### A1 Foundation & theme — DONE (shipped)
CDN + `data-bs-theme="dark"` + `--bs-*` token bridge + gold `btn-primary`/nav-pills/forms/focus.

### A2 Chrome & reference tabs — DONE (shipped)
Hero + `#tabNav` → `.nav-pills`; 29 `.section-card` → `card card-theme`; 9 collapsibles → Bootstrap Collapse;
checklists → `.progress`; 8 `grid-2` → `row g-3`; `viewSavedModal`/`aiSettingsModal`/`exportModal` → Bootstrap modal;
download-bar → `.btn.btn-primary`.

### A3 Generator workspace — IN PROGRESS (partial)
- DONE: forms → `form-label`/`form-control`/`form-select`; `.gen-type-toggle`/`.pv-toggle` → `btn-group` (+ theme-bridge radius/margin overrides);
  Bootstrap `.progress` pipeline bar under the 5-step indicator, driven by `renderSteps` (gold via `--bs-primary`,
  error → `bg-danger`, `aria-valuenow` synced via JS);
  fixed pre-existing `.gen-grid` stray `</div>` so `.gen-form` | `.gen-preview` are proper 2-col grid children
  (restored side-by-side; added missing container `</div>` before `</body>`); `.gen-form`/`.gen-preview` → `card card-theme`
  + `.card.card-theme:not(.section-card)` neutralizer; contextual "Generate Script" CTA (`#genScriptsCta`) below fields,
  mirroring `#genAIBtn.disabled` via `MutationObserver`, tooltips on steps + genAIBtn.
- DONE (per-part regen): `cbRegeneratePart(stage, partKey)` + `cbClearPart` + `cbEditPart` + `cbPartActions(stage)`
  + field-edit staleness listener — covers stages `fields/script/montage/grade` per part (`long` + shorts) in the
  combined pack; delegated handlers on `#cbOutcome` (viewer) and the long fields card; stale chip on short headers.
- PENDING:
  - `.gen-form`/`.gen-preview` wrapper styling fully unified under Bootstrap card tokens (visual tweak only).
  - Contextual CTAs per the UI_UX spec: show a "Generate Scripts" button at the *bottom* of the fields area **and**
    in the sticky toolbar, with disabled-stage tooltips reading out the missing prerequisite (partially done —
    genAIBtn + step tooltips are in place; bottom-of-fields CTA done).
  - Per-part regen for the **Long/Short single-part** flow (field regenerate + script edit) — currently only the
    combined pack has per-part regen. Long/Short have genFieldsBtn/genAIBtn already; a small `↻` per stage is the gap.
  - `gen-section-group` accordions → real Bootstrap `.accordion` (currently custom maxHeight JS; functional but
    not native BS accordion semantics).

### A4 Saved, viewer & Settings — NOT DONE
- PENDING: `panel-saved` → Bootstrap:
  `.filter-btn` → `.btn btn-sm` (+ `btn-group` for the filter rail), `.saved-search` → `form-control`,
  `.saved-sort` → `form-select`, `#savedScriptsList` → `row g-3` grid, JS-rendered `.saved-script-card` →
  `card card-theme` (neutralizer already exists), filters to nav-pills / `data-bs-filter` wiring preserved.
- PENDING: Settings upgraded to **dedicated ⚙️ page/tab** with sections
  (Connection, Model & Generation, Research & Accuracy, Brand Voice, Data & Privacy) + input validation
  + live "Test Connection" status feedback. Currently `aiSettingsModal` (Bootstrap modal, partially styled)
  still holds the settings fields — must move to a real tab without dup IDs, rewire `openAISettingsBtn` to
  navigate to Settings instead of opening the modal (or keep modal as a thin launcher).
- view/pack modal already Bootstrap (done in A2).

### A5 Consistency & polish — NOT DONE
- ONE component vocabulary (audit `class="btn"` vs `btn primary` vs `filter-btn` vs `cb-mini-btn`; unify).
- Responsive checks: `.gen-grid` media query, hero, nav, saved filters on mobile.
- a11y E3 (E3): alt text, headings order, focus management on tab/panel/modal/keyboard trap.
- Print E8 (print stylesheet for scripts/markdown).
- Remove orphaned legacy CSS: `.modal-overlay`, `.modal`, `.actions`, plain `.field`, `.download-btn`,
  `.collapsible-content` rule block — confirm all gone; any remaining dead selectors.
- Vendor Bootstrap locally (P1) — CDN currently, fails offline.
- Replace native `alert()` (still ~4 hits incl. `initVideoEmbed`) → `showToast`.

---

## Workstream B — AI accuracy pipeline (the 9 rules)

### B1 Foundation (prompt-level) — DONE (shipped) ✅*
`ACCURACY_CONTRACT` in `buildSystemPrompt()`; `buildAnalysisBlock()`; references-required instructions in
long/short/combined field + script prompts; `(من المرجع)`/ `[يتطلب التحقق]`/`⚠ verify before record` tagging;
grounding in combined prompts.

*Note: `buildEvidenceBlock()` and `extractReferences()` **do not exist as functions** yet — the evidence/
references work is in prompt strings only. Adding them as real functions (B1 below) is the real remaining B1.

### B1 Remaining (named functions, add to shipped foundation) — NOT DONE
- `buildEvidenceBlock()` — reusable inline-source evidence block builder, used by script + field prompts.
- `extractReferences()` — single source of truth for the `## 📚 References / المصادر` section (parallel to
  `extractSections`), wired into `packToMarkdown`/`cbExportMarkdown`.

### B2 Review / QA / audit pass — NOT DONE
- Single combined review call per part (protects §8.6 budget ~+25–40s/part) — structure + timeline adherence
  + "Albadry Says" gap + no skipped sections.
- Static fact-audit + Arabic QA (grammar, عامية, mixed Arabic/Latin, RTL punctuation) inside the review.
- Audit chips surfaced in the viewer + a post-generation toast summary.

### B3 Settings & export integration — NOT DONE
- Research & Accuracy settings (toggles): `researchMode` strict/balanced/off, `reviewPass`, `arabicQA`,
  `factAudit`, `maxReferences`, `blockOnFail` (default false) — need a home (the Settings page above).
- References + audit summary + verify-checklist embedded into `packToMarkdown`/`cbExportMarkdown`.

---

## Other
- Native `alert()` → `showToast` (also listed under A5).
- Backup hygiene: new checkpoints after A4a / A4b / A5 / B1-B3.

---
Generated from the live state of `deepseek_html_20260810_71c0d4.html`.
Update this file as phases ship.
