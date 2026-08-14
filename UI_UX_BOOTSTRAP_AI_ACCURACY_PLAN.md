# Albadry Content Engine — Bootstrap UI/UX + AI Accuracy Pipeline Plan (v1)

**Scope:** full-site UI/UX refactor onto **Bootstrap 5** + a 9-step **AI research/verification/accuracy** workflow.
**Target:** `deepseek_html_20260810_71c0d4.html` (single-file, vanilla JS/CSS, no build).
**Builds on:** `UI_UX_ENHANCEMENT_PLAN.md` (Phase 1 shipped: renderSteps, renderMarkdown/metrics, showToast, hierarchical CB viewer, Saved search/sort/⚡filter + pack viewer) and `COMBINED_GENERATION_PLAN.md`.

---

## 0. Honest constraint (read first)

A **local model cannot browse the web live**. "Search and verify" is therefore implemented as:

1. **Evidence-grounded generation** — the model may assert only what it can support from (a) the user's reference/foundation text or (b) its own high-confidence knowledge; everything else is framed as opinion.
2. **A post-generation review+QA pass** — structure/accuracy review, Arabic QA, and a local fact-audit that flags specifics (versions, numbers, dates, stats) that are NOT present in the user's reference → `⚠ verify before record`.
3. **References surfaced** — every script ends with a `## 📚 References / المصادر` section; shown in a viewer tab and in exports, plus an auto "suggested references" fallback when the model omits it.
4. Optional (P2): tool-calling web research when the endpoint is a hosted model that supports it.

---

## 1. Current-State Assessment (facts)

- Single file: 7,326 lines (~362 KB), one `<style>` block lines 10–2636 (**~2,630 CSS lines** + 162 inline `style=""` usages), one IIFE + a trailing "Extra UI" block.
- Dark theme tokens in `:root` (lines 19–33) map cleanly onto Bootstrap CSS variables.
- Tabs: `#tabNav` (2656–2672) + panels `panel-long/short/combined/generator/saved`; JS `activateTab()` toggles `.active` states.
- Generator: `.gen-type-toggle`, 5-step indicator (`renderSteps`), compose cards, static long/short fields, JS-rendered combined fields/toolbar/hierarchical viewer (`cbOutcome`).
- Preview pane `.gen-preview` (toolbar, Edit/Preview, metrics, `genPreviewContent` / `genPreviewRendered`).
- Saved page: filters/search/sort/cards; modals `viewSavedModal`, `aiSettingsModal`, `exportModal`.
- Native `alert()` still used in `initVideoEmbed`; `showToast` exists (E1).
- AI: `aiConfig` (`baseURL/apiKey/model/temperature/maxTokens/systemPrompt/identity`, key `albadry_ai_config`), `buildSystemPrompt()` = systemPrompt + identity, `cbChat` (180 s AbortController), `parseModelJSON`/`repairJSON`, prompt builders `cbLong/ShortFieldsPrompt`, `cbLong/ShortScriptPrompt`, `cbMontage/`cbGradePrompt`, `cbRefBlock`.
- Settings is currently a **modal** (`aiSettingsModal`) — to be upgraded to a first-class Settings experience.

---

## 2. Workstream A — Bootstrap UI/UX refactor

**Target design system:** Bootstrap 5.3.8 (CDN now; vendor to stay offline = P1). Theme via Bootstrap CSS variables; custom CSS only for brand tokens (dark `#0b0e14`, gold `#f5b342`, Cairo+Inter) and one-off brand components. **Rule — IDs are sacred:** every JS-queryed ID/class preserved during conversions.

Component mapping (today → Bootstrap): `.section-card`→`.card.card-theme` · `.btn primary`→`.btn.btn-primary` (gold-themed) · `.gen-section-group` accordions→`.accordion` · toggles/segment controls→`.btn-group`+`.btn-check` · `.filter-btn`→`.btn.btn-sm` · form fields→`.form-label`+`.form-control/.form-select` + `.is-invalid/.invalid-feedback` · modals→Bootstrap `.modal` · toasts→Bootstrap Toasts · nav tags→`.nav-pills` · tables→`.table`+`.table-responsive` · step indicator→custom stepper over `.progress`.

### Phases
| Phase | Scope | Effort |
|---|---|---|
| **A1 Foundation & theme** | Bootstrap CDN + dark theme attr + `--bs-*` token bridge + gold primary/nav-pills/forms/focus styling; legacy CSS stays (later stylesheet wins, so it overrides Bootstrap — no surprise regressions). | S |
| A2 Chrome & reference tabs | Hero + `#tabNav`→`.nav-pills`; Long/Short/Combined content → themed cards/accordions/checklists; Export modal + download bar → Bootstrap. | M |
| A3 Generator workspace | Compose cards, static + combined fields, toolbar, preview pane (Edit/Preview), step indicator → Bootstrap; contextual CTAs, per-part regen (UI_UX A3/A4). | L |
| A4 Saved, viewer & Settings | Saved page → BS; view/pack modals → BS modal; **Settings upgraded to dedicated ⚙️ page with sections** (Connection, Model & Generation, Research & Accuracy, Brand Voice, Data & Privacy) + validation + status/test feedback. | M |
| A5 Consistency & polish | One component vocabulary (E2), responsive, a11y (E3), print (E8), remove orphaned legacy CSS. | M |

**Progress:**
- [x] **A1** shipped (Bootstrap 5.3.8 CDN, `data-bs-theme="dark"`, theme-bridge, gold `btn-primary`/nav-pills/forms).
- [x] **A2** shipped — modals button/download/export converted (see earlier note) AND content panels converted: all 29 `.section-card` → `card card-theme` (`.section-card` kept for the scroll observer + animations); 9 collapsibles → Bootstrap Collapse (`data-bs-toggle`/`data-bs-target`, chevron mirrored via `shown/hidden.bs.collapse`); checklists → Bootstrap `.progress`/`.progress-bar` + `.btn` reset + `form-check-input`/`form-check-label` items (aria-valuenow kept fresh); 8 `grid-2` reference panels → `row g-3` + `col-md-6`/`col-12` (mobile stacking). Backups: `deepseek_html_20260812_a2_modal.bak.html`, `deepseek_html_20260812_a2_panels.bak.html`.
- [ ] A3–A5, B2–B3 pending.
  - **A3 (partial):** generator workspace form components → Bootstrap. Converted static + JS-rendered combined fields to `form-label`/`form-control`/`form-select` (custom `.gen-form` CSS still owns the look — later stylesheet wins), segment controls to `.btn-group` (`.gen-type-toggle`, `.pv-toggle` + `btn` on their buttons), theme-bridge adds `.btn-group > .btn + .btn { margin-left:0 }` + radius restore for `.gen-type-toggle`. Added a real Bootstrap `.progress` pipeline bar (`#genStepProgress`/`#genStepProgressBar`) under the 5-step indicator driven by `renderSteps()` (per cent from active-stage position, error paints the bar `bg-danger`; already-gold via themed `--bs-primary`). **Generator layout fix:** removed the pre-existing Phase-1 flush-left stray `</div>` in `#genFieldsShort` that was mis-nesting `.gen-grid` — `.gen-preview` is now a proper grid column (form | preview side-by-side restored) — and added the explicit missing `</div>` for `<div class="container">` before `</body>` (Phase-1 relied on implicit close). File is now **332/332 div-balanced with zero orphans**, all 5 panels + 3 modals balanced. `gen-grid`/`gen-form`/`gen-preview` panes kept as custom (already card-like; converting wrappers needs a `.card-theme` neutralizer — deferred). Remaining A3: contextual CTAs (needs disabled-state sync across the gen flow), per-part regen (UI_UX A4). Backup: `deepseek_html_20260812_a3_gen.bak.html` (pre-layout-fix).

---

## 3. Workstream B — AI accuracy pipeline (the 9 rules)

```
[inputs] topic + reference/foundation + settings
 1 ANALYZE    buildAnalysisBlock() — restate topic, enumerate claims, flag evidence needs
 2 SEARCH     grounding: only reference text + high-confidence knowledge allowed
 3 EVIDENCE   inline source tags (من المرجع), no invented versions/numbers/stats/dates
 4 ACCURACY   accuracy-first contract appended to buildSystemPrompt()
 5 GENERATE   existing stage calls with new prompt blocks
 6 REVIEW     optional review pass (structure/timeline adherence, Albadry Says, no skipped sections)
 7 ARABIC QA  static checks + Arabic review (grammar, عامية, mixed Arabic/Latin, RTL punctuation)
 8 FACT-CHECK local fact-audit: specifics not in reference → ⚠ warn-only chips (never blocking)
 9 REFERENCES extractReferences() → viewer tab + export + auto suggested-refs fallback
```

- **Phase B1 (foundation, additive):** `buildAnalysisBlock()` + `buildEvidenceBlock()` + references requirement wired into all long/short/combined field & script prompts; accuracy contract in `buildSystemPrompt()`. Default on, zero settings UI needed yet.
- **Phase B2 (review/QA/audit):** single combined review call per part (protects §8.6 budget ~+25–40 s/part), static fact-audit + Arabic checks, audit chips in viewer + post-generation toast summary.
- **Phase B3 (settings & export):** Research & Accuracy settings toggles (`researchMode` strict/balanced/off, `reviewPass`, `arabicQA`, `factAudit`, `maxReferences`, `blockOnFail` default false); references + audit summary + verify checklist in `packToMarkdown`/`cbExportMarkdown`.

---

## 4. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Refactor regresses a working 7.3k-line file | Phased, ID-preservation contract, backup `.bak.html`, per-phase smoke tests |
| Bootstrap vs existing class helpers | Legacy `<style>` loads after CDN → custom wins ties; migrate component-by-component |
| Review pass doubles latency/cost | Single combined review call; default on only for script stage; configurable |
| "Search/verify" expectation gap | Honest constraint (§0) + reference-grounded options + verify checklist |
| Reference parse drift | Single `extractReferences()` source (parallel to `extractSections`, UI_UX §4.7) |
| CDN offline (single-file local tool) | Vendor Bootstrap min files next to HTML (P1) |

---

## 5. Phase 1 (this work) — deliverables

1. Backup → `deepseek_html_20260810_71c0d4.bak.html` ✅
2. Bootstrap 5.3.8 CDN (CSS in head, bundle JS before app script) + `data-bs-theme="dark"` ✅
3. Theme-bridge CSS (tail of `<style>`): `--bs-*` token map, gold `.btn-primary`, `.nav-pills` theme, dark form controls, focus ring ✅
4. Hero + primary tab nav converted to Bootstrap classes (IDs/data-tab/`activateTab` wiring intact, `tab-btn` kept for CSS hooks) ✅
5. AI accuracy foundation (prompt-level): `ACCURACY_CONTRACT` in `buildSystemPrompt()`, `buildAnalysisBlock()`, upgraded `cbRefBlock()`/`cbLong-ScriptPrompt`/`cbShortScriptPrompt`/fields prompts with references + `[يتطلب التحقق]` + `(من المرجع)` tagging, grounding added to combined script prompts ✅
6. Sanity checks: `node --check` on app script passes; single `--- Begin Script ---` marker; key IDs/`data-tab` hooks intact; CDN URLs resolve (200) ✅

*Phase-1 edits are low-risk/additive; visual component swaps (A2–A5) and the review/QA passes (B2–B3) come next.*