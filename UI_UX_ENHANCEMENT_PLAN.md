# Albadry Content Engine — UI/UX Enhancement Plan (v2 · reviewed & enhanced)

**Scope:** generator flow · output/preview · save & pack · saved scripts page.
**Target file:** `deepseek_html_20260810_71c0d4.html` (single-file, vanilla JS/CSS, no build).
**Builds on:** `COMBINED_GENERATION_PLAN.md` (system plan) — this plan is the UI/UX execution layer for it.

### What changed in v2 (review pass)
- Fixed a factual gap: **the Combined renderers already live in the same closure as the Saved viewer** — no `window.*` exposure needed (unlike `__videoEmbedHTML`) → D3 is cheaper than v1 implied.
- Caught a real bug the v1 analysis missed: **Combined mode leaves a dead, empty preview pane** visible in the right column (`#genPreviewContent`) — now **A9**.
- Added missing system-plan deliverable: **📋 Run-sheet** surface — the current UI has no run-sheet stage/view (new **B8**), plus pack/export wiring.
- New cross-cutting features: **staleness tracking** (B7), **AI connection status + first-run onboarding** (E5), **keyboard shortcuts** (E6), **auto-audit chips** (E7), **elapsed/remaining progress realism** (A5), **batch export & pinning** (D7/D8).
- New **§6 Implementation Notes** — concrete, file-grounded how-to for each P0 item (scope facts, element IDs, migration strategy).
- Phases now carry **effort + dependency** tags; risks and open questions updated.

---

## 1. Current-State Analysis

### 1.1 Generator flow
- **Two parallel, inconsistent UIs.** Long/Short use static HTML field groups (`#genFieldsContainer`, `#genFieldsContainerShort`) with per-section accordions and a right-pane textarea preview (`#genPreviewContent`). Combined uses a JS-rendered engine (`renderCombinedFields`, `cbGenScripts/Montage/Grade/Save/Export`) with its own viewer tabs. Same task, two mental models.
- **Dead preview pane in Combined mode.** `.gen-preview` (right column) is never hidden when `type==='combined'`; it shows an empty textarea + disabled toolbar while the real output renders in `#cbOutcome`. Wasted space and confusion.
- **Step indicator is wrong.** `.gen-step-indicator` shows 3 steps (Fields → Script → Save/Export) though Combined runs 5 real stages; `__stepAdvance`/`stepRender` hard-code 3.
- **Progress is text-only.** `⏳ Stage 2/6 — Short #2 Mistake fields…` with no ETA, no cumulative count, no part-dots, no cancel. `cbChat` has an internal 180s timeout but no user-facing Abort.
- **Per-part regenerate exists only for short *fields*** (`cbRegenerateShort`). One bad Short #2 script/montage forces re-running the whole stage.
- **CTAs detached from context.** "Generate Script"/"Save" sit in the right preview toolbar while generated fields are on the left.
- **Destructive mode switch.** `toggleGenType()` clears long/short state on every toggle (contradicts system-plan "modes preserved").
- **No crash safety.** No autosave; a refresh mid-flow loses everything.

### 1.2 Output / preview
- **Raw textarea, no rendered view.** Monospace markdown textarea (long/short); `#cbOutcome .script-view` pre-wrap text (combined). Never shows formatted headings/tables.
- **No metrics.** No word count, duration estimate, or "Short ~47s / max 60s" gauge.
- **Montage/Grade monolith scroll.** `buildCBViewerTabs` = flat `🎬 Long | #1…#5 | 🎞 Montage | 🎨 Grade`; choosing Montage stacks **all parts'** 8-column tables on one page — no "Montage of Short #3".
- **No cross-navigation.** Script timecodes aren't linked to montage rows.
- **Coarse copy/download.** Whole-scope copy only; no per-section copy, no script-only `.md` download, no copy-pack from viewer.
- **Blanket RTL.** One `dir` per document; mixed English/timecodes not bidi-wrapped.
- **No run-sheet at all.** The system plan's run-sheet + upload spec has no UI surface, isn't saved, isn't exported.

### 1.3 Save & pack
- **`fullScript` is the payload of record, not the structure.** `cbSavePack` stores `fullScript = cbExportMarkdown()` (giant .md) while the richer `entry.pack.{scripts,montage,grade}` is never rendered anywhere.
- **No custom naming / rename.** Title is auto or "Untitled"; duplicates just get " (Copy)".
- **Weak post-save feedback.** Button flashes "✅ Saved!"; no toast, no "View saved →" jump, no undo.
- **No export from the saved view.** The global Export modal exports system reference content, not a saved item.
- **No metadata stamps.** Entries lack `model`, `rulesVersion`, `packSize`, `includeZero`, `done`, `entryVersion`.

### 1.4 Saved scripts page
- **No Packs filter.** Only `All | Long-Form | Short-Form`; ⚡ packs hide inside All.
- **No search or sort.** Newest-first hard-coded.
- **Cards carry no structure.** Pack card "preview" = first non-heading line of the md blob; no topic, parts count, model, or completion state.
- **View modal destroys structure.** `viewSavedScript → parseScriptToSections(fullScript)` splits on `##` headings into one scrolling page (RTL-forced); montage tables render as pipe text. The structured `entry.pack` data is ignored.
- **Delete uses native `confirm()`**; no toast/undo/quota awareness.

---

## 2. Design Principles

1. **One workspace, one component set.** Pack = pack whether via Long, Short, or Combined; reuse one field card, one script renderer, one montage table, one grade card.
2. **Structured data is the source of truth; markdown is a view.** Render from `entry.pack.*`; never parse the md blob back.
3. **Never a black box.** Output lands in formatted, editable, annotated UI (RTL-aware, timecoded).
4. **Recover, don't restart.** Per-part retry + preserved state across mode switch and refresh.
5. **Progress is honest.** Per-part counts, ETA, elapsed/remaining, abort, errored-part retry.
6. **Everything findable.** Search, filters, sort, grouping, structural cards.
7. **Freshness is surfaced.** Field edits mark derived outputs (script/montage/grade) as stale until regenerated.

---

## 3. Enhancement Proposals

Legend: **[P0]** ship-first · **[P1]** soon-after · **[P2]** polish/future. *(NEW = added in v2)*

### A. Generator flow

- **A1 [P0] — Unify the field/workspace UI.**
  One `renderPackWorkspace(parts, stage)` for all modes: compose card (topic + foundation/ref + pack-size) on top, part list (🎬 Long card + collapsible Short cards with badge/title/day), shared stage toolbar. Long/Short become thin wrappers (1-part pack).
- **A2 [P0] — Real 5-step indicator.**
  `1 Fields → 2 Scripts → 3 Montage → 4 Grade → 5 Save/Export`; states pending/active/done/error; live sub-label `Stage 3/6 · Short #3 Tip · montage`; completed steps clickable; replace `__stepAdvance`/`stepRender` with data-driven `renderSteps(state)` (keep the function names stubbed so nothing else breaks).
- **A3 [P0] — Inline contextual CTAs.**
  "📝 Generate Scripts" appears at the bottom of the fields area *and* in the sticky toolbar; disabled stages are clickable and show the missing prerequisite in a tooltip.
- **A4 [P0] — Per-part regenerate for every stage.**
  `↻ Regenerate · ◇ Edit · ✕ Clear` on each part card for fields, scripts, montage, grade (idempotency already guarantees isolation).
- **A5 [P0] — Progress realism + abort. *(enhanced)***
  Surface `cbChat`'s existing `AbortController` as a visible **Cancel**; per-part **dots grid** (`● ● ● ◌ …`); cumulative `4/6 parts`; ETA from the §8.6 budget table; on the running part show **elapsed timer** (`⏱ 2:15 — ~3 min left`); failure marks only the failed part with `Retry`.
- **A6 [P1] — "⚡ Generate Full Pack" fast path.**
  Confirm-guarded (≈15 min budget call-out), runs fields→scripts→montage→grade streaming status, stops at first failure with resume.
- **A7 [P1] — Preserve per-mode state + autosave.**
  Keep per-mode `state` objects; debounce-save compose + fields as drafts; restore on load.
- **A8 [P2] — Rich compose helpers.** "New from saved…", example topics, grounding toggle (hard facts vs soft context per system plan §8.7).
- **A9 [P0] — (*NEW*) Kill the dead peptide.** Hide/repurpose `.gen-preview` in Combined mode (right column becomes a compact live pack summary: topic, parts, done flags) until the unified A1 workspace lands.

### B. Output & preview

- **B1 [P0] — Rendered preview with Edit toggle.**
  `Edit ⇄ Preview` tabs sharing one element; Preview = safe-subset markdown renderer (headings, bold, lists, tables, rules, blockquotes; never raw `innerHTML` of model text — escape first), per-section RTL. Add `⬇ .md` (this script) + `📋 Copy` in the toolbar.
- **B2 [P0] — Hierarchical Combined viewer.**
  Top tabs `📖 Overview · 📝 Scripts · 🎞 Montage · 🎨 Grade · 📋 Run-sheet · 📦 Export` + persistent **part rail** (`🎬 Long | #0…#5`) filtering the open tab; montage/grade render one part at a time. Reuse `cbMontageTable`/`cbGradeCard` per part.
- **B3 [P0] — Metrics bar.**
  Word count · est. duration (≈145 WPM shorts, ≈150 long) · duration gauge (red >60s for shorts) · section/part count — computed from the canonical section extractor shared with B4 (single source).
- **B4 [P0] — Timecode cross-links.**
  `[0:00]`-style headings become links → jump to the matching montage row (same time window) in Montage view.
- **B5 [P1] — Per-section copy + highlights.**
  Hover → "copy section"; gold badge on "Albadry Says"; fact-vs-opinion styling per §3.3.
- **B6 [P2] — Bidi-aware rendering + focus mode.** Wrap mixed LTR tokens; full-screen reading mode.
- **B7 [P1] — (*NEW*) Staleness tracking.**
  Store per-part `generatedAt`. When a field or script is edited after its dependents were generated, show `⟳ stale — regenerate` chips on script/montage/grade cards (script edited ⇒ montage/grade stale). Cheap, honest, prevents drift (system plan §7.4).
- **B8 [P1] — (*NEW*) Run-sheet stage + view.**
  Add 📋 Run-sheet: a tab (in B2 viewer, Saved pack viewer) assembled **deterministically** from existing pack data (capture list from montage shots, color pass order from grade, subtitle/subtitle pass, per-platform upload specs incl. aspect/length/CTA) + optional AI-note call. Stored in `entry.pack.runSheet`, included in export (**C5**).

### C. Save & pack

- **C1 [P0] — Structured single Save.**
  One `saveEntry(entry)` for all modes; source of truth `{ fields, scripts, montage, grade, runSheet?, meta }`; `fullScript` becomes a derived cache. **Migrate old entries on load**: keep them viewable via `fullScript` fallback path.
- **C2 [P0] — Name at save time.** Inline name field, pre-filled; ✏️ Rename later.
- **C3 [P0] — Metadata stamps. *(enhanced)***
  `entryVersion`, `topics`, `packSize`, `includeZero`, `model`, `rulesVersion`, `createdAt`, `done:{fields,scripts,montage,grade,runSheet}` ⇒ completeness chips + view header.
- **C4 [P0] — Post-save toast + jump.** `💾 Pack saved — 6 parts · View →` opens the Saved tab to that entry. All native `alert()`/`confirm()` replaced by toasts (E1).
- **C5 [P1] — Export/Copy from view.** `packToMarkdown(entry)` (replaces `cbExportMarkdown` coupling to live `generatedPack`) → `⬇ .md` + `📋 Copy pack`, run-sheet included (B8).
- **C6 [P2] — Duplicate hygiene & undo.** Timestamped duplicate names; delete toast with `↩ Undo` (5s).

### D. Saved scripts page

- **D1 [P0] — Filters + search + sort.**
  Add `<button class="filter-btn" data-filter="combined">⚡ Packs</button>` (storage already sets `type:'combined'`; `renderSavedScripts`/`updateSavedScriptsCount` already filter by type). Search (title/topic/preview) + sort (Newest/Oldest/A–Z).
- **D2 [P0] — Structural cards.**
  Badge `⚡ Pack · 6 parts`, title, topic, date + model, completion chips `✅ scripts · 🎞 montage · 🎨 grade`; pack preview from structured data, not md line 1.
- **D3 [P0] — Full pack viewer modal.**
  `type==='combined'` → render from `entry.pack.*`: header meta (topic · date · model · rules v · schedule table), inner tabs `Overview | Scripts | Montage | Grade | Run-sheet`, part rail, Export (C5). Scripts-only entries use the B1 renderer. Per-section direction. *(Implementation: modal must widen from `max-width:700px` — see §6.3.)*
- **D4 [P1] — Actions in view.** `⬇ .md · 📋 Copy · 📝 Open in Generator · ✏️ Rename · 📋 Duplicate · 🗑️ Delete`, all toast-backed.
- **D5 [P1] — Grouping & bulk.** Group-by-type sections, batch select/delete, storage meter + prune prompt.
- **D6 [P2] — Visual richness.** Type accent strips, pack cards show mini schedule row (Long + #0…#5 chips), empty states with next-action buttons ("⚡ Generate a pack" / "⚙️ Configure AI").
- **D7 [P2] — (*NEW*) Batch export.** "Export selected (N) as one .md" for hand-off of multiple packs.
- **D8 [P2] — (*NEW*) Pin/favorite.** Pin important packs; pinned-first sort.

### E. Shared foundation

- **E1 [P0] — Toast system.** `showToast(msg, type, opts)` — success/info/error, optional action link + undo, stacked, above modals (`z-index > 1000`), auto-dismiss with manual close.
- **E2 [P0] — Component tokens.** One button/card/chip/tab/table/empty-state vocabulary across both UIs; remove duplicated CSS (multiple `.arabic-text`, `.spinner` blocks).
- **E3 [P1] — Accessibility.** `role=tablist/tab/tabpanel` + arrow keys, `aria-live=polite` on progress, focus trap/restore on modals, `aria-expanded` on toggles, never color-only.
- **E4 [P2] — Performance.** Debounce preview/metrics while typing; avoid full `innerHTML` field rerenders on keystroke.
- **E5 [P0] — (*NEW*) Connection status + first-run onboarding.**
  Live badge next to Generate: `● connected · qwen/…` / `○ offline — open ⚙️` (lightweight probe or last-success cache). When `aiConfig.baseURL` empty, Generator tab shows one setup card with a `⚙️ Configure AI` button instead of only inline errors.
- **E6 [P1] — (*NEW*) Keyboard shortcuts.** `⌘/Ctrl+Enter` = generate current stage, `⌘/Ctrl+S` = save, `Esc` = close modal, `1–5` = jump step (when generator active). Listed in a small `?` hint.
- **E7 [P1] — (*NEW*) Auto-audit chips.**
  Post-generation, a lightweight local audit in the viewer: long script contains "Albadry Says" ✓/⚠, each short is ≤60s-equivalent (gauge), takeaways present, "from your notes" claims exist — directly supports system-plan KPIs §2.6. Warning chips, never blocking.
- **E8 [P2] — (*NEW*) Print styles.** `@media print` renders the active script/pack cleanly for offline review.

---

## 4. Implementation Notes (file-grounded how-to for P0)

1. **Reuse scope — no `window.*` needed for the viewer.** `cbMontageTable`, `cbGradeCard`, `CB_SHORT_META`, `cbSlotList` are defined *inside the same IIFE* (lines ~5287–5850) as `viewSavedScript` (~4071). D3 can call them directly. The only helpers needing the `window.*` pattern are `__videoEmbedHTML`/`__stepAdvance` (defined *outside* the IIFE). If files are ever split, expose the renderers like those.
2. **A9 is a 5-line change:** in `toggleGenType()`, set `.gen-preview` display `none`/`block` alongside the field containers (fields set at ~3819–3825), or render a compact pack summary there.
3. **D3 needs a wider modal:** `#viewSavedModal` has inline `max-width:700px` (line ~3343) — raise to ~1100px for the pack viewer and give the body its own scroll region; keep scripts-only view at a comfortable width.
4. **D1 is cheap:** add one filter button (`data-filter="combined"`) and change nothing else — `renderSavedScripts`/`updateSavedScriptsCount` already branch on `s.type`, and combined saves are stored with `type:'combined'`.
5. **C1 migration:** write `entryVersion:2` on new saves. `upgradeSavedEntries()` on load: entries without `entry.version` (or `entry.pack`) keep the `fullScript` text-view path so nothing breaks; strip the migration once a pack is re-saved.
6. **Storage guard:** wrap `saveSavedScripts` in try/catch on `QuotaExceededError` → prune oldest entries + toast. Keep large pack scripts raw (simplest) and rely on prune; compression is a P2 option.
7. **Single canonical section extractor:** implement `extractSections(script)` (headings, timecodes, text) used by B1 (render), B3 (metrics), B4 (cross-links), E7 (audit) — one source of truth for parsing scripts.
8. **Steps refactor safety:** keep `window.__stepAdvance`/`__stepReset` signatures as thin wrappers delegating to `renderSteps(state)` so call-sites (e.g., line ~4520, ~5112, ~5660, ~5696) don't need changes in Phase 1.

---

## 5. Phased Implementation Plan (effort · dependencies)

### Phase 1 — Read / Navigate correctly (P0, biggest impact) ✅ SHIPPED
| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 1 | **B2** hierarchical viewer (top tabs + part rail, one-part montage/grade) ✅ | M | — |
| 2 | **B1 + B3** rendered preview (Edit/Preview) + metrics/duration gauge ✅ | M | §4.7 extractor |
| 3 | **A2** 5-step indicator via `renderSteps` ✅ | S | — |
| 4 | **A9** hide/repurpose dead pane in Combined ✅ | S | — |
| 5 | **E1** toast system (build once, reuse everywhere) ✅ | S | — |
| 6 | **D1 + D3** filters/search/sort + full structured pack viewer ✅ | M | 1 (renderers), §4.3 modal |
- **Accept:** Montage/Grade navigable per part; scripts render as formatted markdown with metrics; steps reflect the real 5 stages; no dead pane in combined; saved packs open with tabs + part rail + real tables; filters include ⚡ Packs. **All acceptance criteria met 2026-08-11.**

### Phase 2 — Save & recover (P0)
| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 1 | **C1–C4** structured single save, naming, metadata, toast+jump, migration (§4.5/4.6) | M | E1 |
| 2 | **D2** structural cards + completion chips | S | C3 |
| 3 | **A1** unify field/workspace UI across modes | L | Phase 1 |
| 4 | **E5** connection status badge + first-run card | S | — |
- **Accept:** one save path everywhere; entries carry model/topics/done/entryVersion; old entries still viewable; post-save toast jumps to the entry; generator visual states consistent; connected/offline visible at a glance.

### Phase 3 — Control & continuity (P1)
| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 1 | **A4 + A5** per-part regen for all stages, abort, dots, ETA, elapsed | M | Phase 1 (viewer) |
| 2 | **A6** Generate Full Pack fast path | S | A5 |
| 3 | **B4 + B5** timecode links, per-section copy, Albadry Says highlight | S | §4.7 |
| 4 | **B7** staleness tracking | S | §4.7 |
| 5 | **B8** Run-sheet stage + view + save/export wiring | M | 1, C5 |
| 6 | **C5 + D4 + E6** export/copy/rename/open-in-generator, shortcuts | M | C1 |
| 7 | **E7** auto-audit chips | M | §4.7 |
- **Accept:** a weak Short #2 can be regenerated alone; long runs are cancellable with honest progress; timecodes jump to montage; edited fields flag stale outputs; run-sheet exists in viewer, save, and export; saved items export/rename/reopen without regeneration.

### Phase 4 — Polish (P2)
| # | Task | Effort |
|---|------|--------|
| 1 | **A7 + A8** per-mode state preservation, autosave drafts, new-from-saved | M |
| 2 | **D5–D8** grouping, bulk ops, batch export, pinning, quota meter, empty states | M |
| 3 | **E3 + E4 + E8 + B6** a11y, perf, print, bidi, focus mode | M |
- **Accept:** refresh-safe drafts; saved items reopen in generator; keyboard-only usage; storage quota surfaced; mobile + RTL pass.

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unifying UIs regresses the working long/short flow | High | Do A1 in Phase 2 after viewers are shared; keep old markup functional behind the new engine; per-mode smoke tests (system plan §13.3) |
| Raw model text injected as HTML | High | Safe-subset renderer; escape-first; never `innerHTML` model output directly |
| Parse drift between renderer/metrics/audit | Medium | One `extractSections()` (§4.7) as the single parser |
| Old saved entries break | Medium | `entryVersion` + fallback path (§4.5); migration deferred until re-save |
| Malformed AI JSON on combined parts | High | Existing `repairJSON`/`parseModelJSON`; per-part error + Retry (A5) |
| ~15-min run leaves the tab vulnerable | Medium | Autosave drafts (A7), resume (A6), abort (A5), honest ETA |
| localStorage quota with structured packs | Medium | Prune-oldest + toast (§4.6), batch delete (D5), meter |
| Scope creep (rendering inside the tool) | High | Run-sheet/grades stay **executable specs**; no video rendering (system plan §4.3) |

---

## 7. Open Questions

1. **Unification depth:** Long/Short *fully* inherit the combined field cards (recommended), or only share viewer/renderer + toolbar?
2. **Duration WPM:** hard-code (~145 shorts / ~150 long) or expose in ⚙️ settings?
3. **Run-sheet (B8):** deterministic-from-pack only, or optional single AI call for per-platform upload copy? (Deterministic recommended.)
4. **Open-in-generator (D4):** include in Phase 3 or defer to Phase 4?
5. **Markdown renderer:** ~150-line safe-subset renderer (recommended, zero-dep) vs pull a tiny library?
6. **Auto-audit (E7) strictness:** warnings only (recommended) or allow blocking save when a short exceeds 60s?

---

*Companion to COMBINED_GENERATION_PLAN.md — **Phase 1 shipped 2026-08-11** (A2/A9, B1/B2/B3, D1/D3, E1: `renderSteps`, `renderMarkdown`/`renderMetrics`/`showToast`, hierarchical `renderCBViewer` + `cbViewState`, Saved search/sort/⚡ filter + `renderSavedPackViewer`/`bindSavedPackViewer`). Phase 2 (C1–C4, D2, A1, E5) is next.*