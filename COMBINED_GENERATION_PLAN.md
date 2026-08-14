# Albadry Content Engine — Combined Generation Plan (v2)
**One topic + notes → Long script + Short pack + Montage + CapCut Color Grade + Hand‑off**

> Version 2 — reviewed & enhanced. Scope: full product plan — business, strategy, product, production hand‑off, AI, technical, UI/UX, QA — with best practices. Builds on the existing single‑file tool (`deepseek_html_20260810_71c0d4.html`) and its encoded "Video Content System".

---

## 1. Executive Summary

The creator enters **one topic and optional supporting content**. The engine — a local‑LLM powered, browser‑based generator — then drafts a complete **content pack in one click**:

| # | Deliverable | Count | Format |
|---|-------------|-------|--------|
| 1 | Long‑Form script (full) | 1 | Structured markdown, timeline‑anchored |
| 2 | Short / Reel scripts | 5 (#1–#5) | Structured markdown per short, platform‑aware CTA |
| 3 | Montage / edit plan | 6 (1 long + 5 shorts) | Shot table + shot sheets with timecodes, shot types, camera, on‑screen, audio |
| 4 | CapCut grade cards | 6 | Global + per‑scene recipe, filter names, export settings |
| 5 | Production run‑sheet | 1 | Record / edit / color / upload checklist for the editor |
| 6 | Combined export (.md) | 1 | All of the above for hand‑off |

**Design principle:** every AI output lands in **editable, first‑class UI** (fields, tables, cards) — never a black box. Each stage is independent, resumable, and re‑generable.

---

## 2. Business Case

### 2.1 Problem
Today the creator manually writes: a topic brief, a long script, 5 shorts, a shot list, a color grade, and upload copy — then re‑types it all into CapCut. That's hours of drafting plus a gap where the script gets edited but the montage/grade never get planned.

### 2.2 Vision
Turn the Albadry Video Content System (STORY → TECH → PROOF → VERDICT; short pack #0–#5) into a **repeatable, one‑click content factory** — from idea to a production‑ready packet — for a solo technical creator.

### 2.3 Personas
- **Primary — Albadry (creator):** Egyptian tech YouTuber (D365 / Power Platform / AI / Software Engineering), content in Egyptian Arabic (العامية المصرية). Wants speed + consistency + brand coherence, private/local, no subscriptions.
- **Secondary — editor/collaborator:** needs a shot‑by‑shot plan and a grade recipe they can execute in CapCut without making creative calls that break brand consistency.

### 2.4 Market & differentiation
| Alternative | What it does | Gap this engine fills |
|-------------|--------------|------------------------|
| Generic LLM chatbots | Free‑form scripting | No enforced channel system, timeline, pack logic, or production plan |
| Online script writers | Templates | Generic, not Arabic‑native, no local/privacy mode |
| Notion/W&B templates | Manual process | Not generative; no montage/grade hand‑off |
| Paid AI video tools | Render clips | Cloud, costly, editorial control lost |

**Differentiator:** a *system‑enforcing* generator (rules → prompts → validated JSON → assets), Arabic‑first, running fully local, that produces **edit‑ready deliverables — not just text**.

### 2.5 Value propositions
- **Time:** 1 topic write‑up → full pack in ~15 min.
- **Consistency:** every output follows the master timeline, DNA, hook + short types, golden rules, and brand voice.
- **Editability:** AI output lands in editable fields/tables/cards, not a black box.
- **Follow‑through:** montage + grade + run‑sheet remove the "script done, editing stalls" gap.
- **Ownership & privacy:** local model (LM Studio), offline‑capable, no account, no cloud upload.

### 2.6 KPIs & measurement
| KPI | Target | Measured how |
|-----|--------|--------------|
| Topic → ready‑to‑record time | < 15 min | Step timestamps captured in pack metadata (anonymous, local) |
| Fields/scripts used w/o major rewrite | ≥ 80% | Optional "accepted" rating per part (local) |
| System adherence (timeline + rules) | ≥ 90% | Human audit pass + checklist self‑score in export |
| Pack coverage (no stage failure) | ≥ 90% | Stage success flags stored per pack |
| Pack completion (reaches export/save) | ≥ 70% | Save/export events counters (local) |
| Regenerate‑hit rate by stage | ≤ 20% | retry counters per stage |

Instrumentation stays **local & anonymous** (section "Analytics", §11) — no telemetry ships anywhere.

### 2.7 Where revenue/logic sits
The product is the **systematized pipeline**: rules → prompts → validated JSON → assets. The creator's videos are the monetized output (views, sponsorships, community). Future optionality: sell the same pack pipeline as a template to other creators.

---

## 3. Content System Foundation (what the engine encodes)

### 3.1 Long‑Form (authority asset)
- **DNA:** STORY → TECH → PROOF → VERDICT.
- **Master timeline (8–15 min):** 0:00 Hook · 0:20 Brand · 0:30 Promise · 0:50 Story · 2:00 Concept #1 · 4:00 Demo · 5:30 Concept #2 · 7:00 Twist · 8:30 Deep Dive · 10:30 My Take · 12:00 Takeaways · 13:00 Comment CTA · 13:30 Subscribe · 14:00 Next.
- **Golden rules:** don't make the viewer wait for value; explain → question → answer → new question → proof → new insight; the **BUT** mechanism (expectation → BUT → reality); early indication of perspective; never hide all value.
- **"Albadry Says" moment:** one branded, expert insight delivered naturally.
- **Checklists:** pre‑production + script quality checklists (already in the tool) gate each pack.

### 3.2 Short / Reel (discovery + education)
- **Structure:** HOOK (0–3s) → PROBLEM (3–10s) → CONTEXT (5–15s) → CORE INSIGHT (10–35s) → PROOF → PAYOFF (35–50s) → CTA (5–10s).
- **Publishing cycle:** DAY −3 Short #0 Curiosity · DAY 0 Long Video · DAY +1 #1 Insight · DAY +3 #2 Mistake · DAY +5 #3 Tip · DAY +7 #4 Advanced (#5 Question optional/combined).
- **Short types:** #0 Curiosity · #1 Biggest Insight · #2 Common Mistake · #3 Quick Tip · #4 Advanced · #5 Question.
- **Hook types:** Contrarian · Mistake · Curiosity · Result · Question · Challenge · AI.
- **Short golden rules:** one short = one idea; hook fast; show don't only tell; don't spoil the long video; adapt CTA per platform (Shorts → "Watch full video", Reels → "Follow", TikTok → "Follow/Comment", LinkedIn → "Discuss", X → "Reply").
- **Pre‑Launch vs Post‑Launch:** pre‑launch teases and withholds the answer; post‑launch shorts deliver standalone value.

### 3.3 Brand voice (all outputs)
- Egyptian Arabic (professional, natural, relatable); English only for common tech terms (API, plugin, pipeline, debug).
- Personality: "وهنا بقى البدري هيقولك…" moments + natural expressions.
- Validation: claims marked **fact vs opinion**; Resources/links appended; anything uncertain flagged as opinion.

### 3.4 Rules as data (versioned source of truth)
All system rules (timelines, types, hook lists, CTA table, checklists) live in the **⚙️ config** as editable structured content, versioned with a `rulesVersion` field stored on each pack. The UI can show "Rules v3 · generated on [date]" and the creator can evolve the system without code changes. A future "Export rules" lets the creator own/share their system.

---

## 4. Product Scope — "One‑Click Content Pack"

### 4.1 User input (the only hard requirement)
1. **Topic** (required) — short, specific, outcome‑oriented. UI guidance: *"e.g. D365 Plugin Pipeline Execution Stages."*
2. **Optional content / notes** — anything the creator already has: rough draft, bullet points, build notes, roadmap, chat export. This is **grounding content**:
   - facts/claims/examples are extracted into the pack as **bound rules** ("stay true to these, never invent contradicting facts");
   - each generated field may cite its source chunk ("from your notes: …").
3. **Foundation / reference** (optional) — channel doc, existing roadmap the script must honor.
4. Optional per‑short **angle tweak** (power user).

Input format support: plain text pasted or a pasted URL's text content (no scraping by default; user opts in).

### 4.2 Deliverables spec

**A. Long script** — self‑contained markdown:
`Title / Promise / Audience / Hook / Story / Concept#1 / Demo / Concept#2 / Twist / Deep Dive / My Take / "Albadry Says" / Verdict / 3 Takeaways / Comment CTA / Subscribe CTA / Next bridge` + **Resources** (docs, Microsoft Learn, GitHub, tools, assumptions marked as opinion).

**B. Short scripts (×5)** — each independent:
`Title / Idea / Type / Audience / Hook / Problem / Context / Insight / Proof / Payoff / Platform‑specific CTA [one per platform] / On‑screen text / Caption`.

**C. Montage plan (long)** — full shot table (schema §8.3):

| Field | Meaning |
|-------|---------|
| `t_start` / `t_end` | Timecodes aligned to the script timeline |
| `shot` | Talking‑head · Screen recording · Code · B‑roll · Demo · Graphic |
| `camera` | Wide / Medium / CU / Over‑Shoulder; static · slow push‑in · pan · zoom |
| `on_screen` | Caption/title, arrows, zoom‑into‑code box, lower‑third |
| `transition` | Cut · J‑cut · L‑cut · Wipe · Zoom bump (CapCut: "Popup", "Zoom In"…) |
| `audio_cue` | Music mood, SFX (whoosh, tick, click), highlight sting at "Albadry Says" |
| `note` | Editor instruction ("paste live D365 execution clip here") |
| `asr_flag` | Auto‑subtitle on/off for this segment |

**D. Short montage sheets (×5)** — compact per‑second blocks, 9:16, caption safe‑zone, pacing advice (`cuts every 1–2s`, "open on a full‑screen visual", "end frame = CTA text 1.5s"), platform export notes (Shorts/Reels/TikTok).

**E. CapCut grade cards (×6)** — **global recipe + per‑scene notes**:

| Setting | Example | CapCut panel |
|---------|---------|--------------|
| Filter / LUT | "Cinematic 2" @ 60% (or custom LUT path) | Filters |
| Exposure / Brightness | +3 | Adjust |
| Contrast | +12 | Adjust |
| Saturation | +8 | Adjust |
| Temperature / Tint | −4 / +2 | Adjust |
| Highlights / Shadows | −8 / +15 | Adjust |
| Vignette | 25 | Effects |
| Skin‑tone guard | Oranges −5 saturation | HSL |
| Text / subtitles | Accent `#f5b342`, thickness 80, bottom safe‑zone | Text / Auto‑captions |

Rules: **one brand LUT + one Global Adjust layer** applied to every clip → long + shorts share a look; per‑scene notes (hooks warmer + contrast bump; screen recordings desaturated −10 so the UI stays true; "Albadry Says" vignette bump); export guidance (resolution, frame rate matching source, HDR off, bitrate).

**F. Production run‑sheet** — a step‑by‑step checklist bundling: which clips/recordings to capture per shot, order of assembly, color pass order, subtitle pass, review gates, and per‑platform upload specs (aspect, length cap, CTA placement). One page shared with the editor.

**G. Combined export (.md)** — single hand‑off doc: run‑sheet → long script → short scripts → montage plan(s) → grade cards, each tagged with rule references.

### 4.3 Non‑goals (v1)
- No video rendering, timeline generation, or CapCut automation (CapCut has no public API) — outputs are **executable specs**.
- No cloud sync, accounts, or multi‑device.
- No translation engine (brand voice is Arabic‑native by design).

---

## 5. User Journey + Pipeline

### 5.1 Workflow
```
0  Configure AI (⚙️) — base URL · model · key · temperature · system prompt — saved locally
1  Enter Topic + optional content/notes          →  mode: Long | Short | ⚡ Combined
2  Generate Fields  (one click) — staged Long 1/6 → Short #1…#5 6/6
3  Review & edit generated fields (long panel + collapsible short cards)
4  Generate Scripts — staged full scripts, all parts
5  Generate Montage — long shot table + 5 short shot sheets
6  Generate Grade  — global card + per‑scene notes + production run‑sheet
7  Browse deliverables (segmented viewer) &
8  Save Pack (one combined entry) or Export .md
```

### 5.2 Stage state machine
```
idle → {fields: pending} → generating(fields) → {fields: done}
fields done → {scripts: pending} → generating(scripts) → {scripts: done}
scripts done → {montage: pending} → generating(montage) → {montage: done}
montage done → {grade: pending}  → generating(grade)  → {grade: done}
Any stage may also be {error} → retry (idempotent), or {partial} (some parts ok).
```

### 5.3 Execution model
- Stages run **sequentially** (predictable, model is local/single). All parts **inside a stage** run sequentially with per‑part status; each part is a fresh request (isolation → one bad short doesn't kill the pack).
- Every part is **idempotent**: re‑generating part X only writes part X.
- Per‑request timeout (default 120s) with abort + clear error copy; model hot‑swap supported.

---

## 6. Feature Specification

### 6.1 Mode toggle
- Three segments: `🎬 Long‑Form` · `📱 Short / Reel` · `⚡ Combined`.
- Combined panel: long topic + shorts topic (secondary) + shared foundation/ref + **pack‑size control** (default 5, range 1–6, hide #0 by default) + "include Short #0 Curiosity" checkbox.
- Switching modes **preserves each mode's state** (no destructive reset).

### 6.2 State model
```js
state = {
  mode: 'long' | 'short' | 'combined',
  meta: { topic, notes, createdAt, rulesVersion, model },
  fields: { long: {…14}, short: {…13}, shorts: {1..5: {…13}} },
  scripts: { long: '…', short: '…', shorts: {1..5: '…'} },
  montage: { long: [shot…], short: [shot…], shorts: {1..5: [shot…]} },
  grade:   { global: {recipe}, scenes: { long: […], shorts: {1..5: […] } }, runSheet: […] },
  done:    { fields: bool, scripts: bool, montage: bool, grade: bool },
  retries: { fields: 0, scripts: 0, montage: 0, grade: 0 }   // for KPI §2.6
}
```

### 6.3 Staged generation (core reliability feature)
- Each stage = prompt + schema + validation + the **fixed parser** (`parseModelJSON` + `repairJSON`, `finish_reason==='length'` truncation guard, code‑fence stripping).
- Live status: `Stage 4/6 — Short #4 Advanced · scripts`.
- Per‑part success badges: `✅ fields · ✅ script · ✅ montage · ✅ grade`.
- **Re‑generate per part per stage** (fix one short without touching the rest).

### 6.4 Deliverables viewer (preview pane)
- Segmented tabs: `🎬 Long | #1…#5 | 🎞 Montage | 🎨 Grade | 📋 Run‑sheet`.
- Fields: collapsible cards (long sections; one card per short — badge #n + title, expand = 13 editable inputs).
- Scripts: rendered sectioned markdown; Montage: tables; Grade: recipe cards; Run‑sheet: checklist.
- All panes keep RTL detection + `.arabic-text` styling.

### 6.5 Save / list / export
- Save = **one combined entry** (`type:'combined'`) with all parts + generated table of contents; `⚡` badge + dedicated filter; view/duplicate/delete retained.
- Export .md assembles the full pack (run‑sheet → scripts → montage → grade), tagged with rules version + model + date.

### 6.6 AI integration
- OpenAI‑compatible `POST {baseURL}/v1/chat/completions` (LM Studio friendly).
- `max_tokens` from config (never hardcoded); `finish_reason` honored; per‑stage budget (§8.6).
- Provider‑agnostic: same contract works for a local model, a proxy, or any OpenAI‑compatible endpoint.

---

## 7. Production Hand‑Off Model (the "execute" bridge)

Montage/grade are only useful if the editor can act on them. Define the hand‑off:

1. **Run‑sheet first.** The export starts with a one‑page checklist that sequences the work: capture list → assembly → color pass → subtitle pass → review → upload.
2. **One‑click "pack" mental model.** Each short has its own mini‑sheet so the editor can cut one short start‑to‑finish without reading the long doc.
3. **Grade = one Global Adjust layer.** Because long + shorts share the LUT/global recipe, applying it once sets the whole pack's look.
4. **Timecodes are anchors, not law.** Montage is derived from script section text, so if the creator edits a script, a **Re‑generate montage** produces a fresh table (idempotent, cheap).
5. **Audit trail on every deliverable**: "Generated by [model] · [date] · rules v3" printed in export and stored in pack metadata for traceability.

---

## 8. AI Design

### 8.1 Model guidance (local, LM Studio)
- Prefer a model with ≥ 16K context, strong Arabic + code mix, ≥ 7–8B effective quality (e.g., the channel's Qwen family default).
- Recommend a dedicated quant file for the tool; display model + context in ⚙️ with a warning if `model.maxContext` is unknown → default to conservative budgets.
- Test endpoint before generating (existing "Test" button pattern).

### 8.2 Staged prompt architecture (no mega‑prompt)
| # | Stage | Input | Output |
|---|-------|-------|--------|
| 1 | Fields (long) | topic + notes + rules | 14 fields JSON |
| 2 | Fields (short #n) | topic + slot angle | 13 fields JSON |
| 3 | Script (long) | fields | full markdown script |
| 4 | Script (short #n) | fields | standalone ≤60s script |
| 5 | Montage (part) | script + rules | shot‑list JSON |
| 6 | Grade (part) | part metadata (screen‑rec-heavy?) | recipe JSON |

Each script is trimmed/structured before reaching montage to guarantee timecode alignment.

### 8.3 Montage JSON schema (long)
```json
{
  "shots": [{
    "t_start": "0:00", "t_end": "0:20",
    "shot": "talking-head|screen|code|b-roll|demo|graphic",
    "camera": "medium-static",
    "on_screen": "bold hook text",
    "transition": "cut",
    "audio_cue": "music swell",
    "asr_flag": true,
    "note": "record hook twice; keep the tighter take"
  }, {…}]
}
```
Validation: `t_start/t_end` match `\d{1,2}:\d{2}`; `t_end > t_start`; `shot` ∈ enum; missing → placeholder + warn.

### 8.4 Grade JSON schema
```json
{
  "global": { "filter": {"name":"Cinematic 2","intensity":60}, "lut_path":"",
    "exposure":3, "contrast":12, "saturation":8, "temperature":-4, "tint":2,
    "highlights":-8, "shadows":15, "vignette":25,
    "skin_hsl": {"saturation":-5, "hue":0},
    "text": {"color":"#f5b342","stroke":80,"safe":"bottom","size":11} },
  "scenes": [ { "t_start":"0:00","t_end":"0:20","notes":"warmer + contrast bump" }, {…} ]
}
```
Validation: numbers clamped to bounds (saturation ∈ [−100,100], temperature ∈ [−50,50]…); `filter.name` non‑empty.

### 8.5 Reliability & best practices (learned/encoded)
- Never trust raw `JSON.parse` → `repairJSON` (unescaped inner quotes) + strip fences first.
- Detect truncation (`finish_reason==='length'`) → actionable message + raise Max tokens prompt.
- **Validate post‑parse**: required keys exist; placeholders + warn; fail loudly only when irrecoverable.
- Stage isolation: idempotent, retries never clobber other stages.
- Token leak guard: log sanitized payloads only; never print the API key.
- System prompt loaded from config (editable), appended with the stage‑specific instruction block.

### 8.6 Token budget & latency (worst case, sequential)
| Stage | Parts | Est. tokens/part | Est. time/part | Total (6 parts full pack) |
|-------|-------|------------------|----------------|---------------------------|
| Fields | 6 | ~600 out | ~30s | ~3 min |
| Scripts | 6 | ~1200 out | ~60s | ~6 min |
| Montage | 6 | ~700 out | ~40s | ~4 min |
| Grade | 6 | ~400 out | ~25s | ~2.5 min |
| **Full pack** | 24 requests | — | — | **~15 min** |

UI must communicate this honestly (per‑part progress + ETA + pause/resume), and the run‑sheet reuses outputs so combined mode never re‑asks the model for the same content twice.

### 8.7 Content grounding
- Notes/reference are injected as a **"Grounding" section** with instruction: never invent claims not present; reuse measurements/versions/examples verbatim; mark assumptions as opinion.
- Post‑parse, generated fields are diff‑checked for invented specifics against supplied notes when feasible (warn if a claim looks like hallucinated version numbers).

---

## 9. Technical Architecture

- **Delivery:** single self‑contained HTML (zero build, works from `file://` or Live Server) — consistent with the current tool.
- **Runtime:** vanilla JS + CSS; reveal‑pattern progressive enhancement; no framework dependency.
- **Storage:** `localStorage` (config, saved packs); pack entries versioned (`packVersion`); guard `QuotaExceededError` with oldest‑first prune + compression of large files.
- **Networking:** `fetch` to `{baseURL}/v1/chat/completions`; AbortController per request; timeouts surfaced in UI.
- **Security:** API key stored client‑side by design (local model); never in logs/exports; optional "don't persist key" toggle (session‑only). No remote calls other than the configured endpoint + fonts.
- **i18n/RTL:** central `isArabic()`; `dir="rtl"` + `arabic-text` applied to all generated content incl. tables; proper mixing of LTR tokens in RTL strings.
- **Rendering:** render functions (`renderMontageTable`, `renderGradeCard`, `renderRunSheet`) fed by `state`; field inputs are static DOM, value‑filled — user edits preserved across renders.
- **ID strategy:** short pack fields `S{n}_{field}` (e.g. `S2_hook`); single‑short mode keeps legacy IDs; maps keep long/short/combined bidirectional.
- **Instrumentation:** local counters (stage success/fail, retries, save/export) behind an opt‑in flag in config (default off).
- **Versioning:** `rulesVersion`, `packVersion`, `model`, `createdAt` stored on every pack for traceability; future migrations switch on `packVersion`.

---

## 10. UI / UX Design

### 10.1 Information architecture
Flat single‑page, top tabs: **Long System · Short System · ⚡ Combined (engine) · ✍️ Generator · Saved · Export**. Generator = primary workspace; system tabs = reference. Long/Short tabs also surface the existing checklists as gates.

### 10.2 Screen‑by‑screen
- **Step indicator:** 1 Generate Fields → 2 Scripts → 3 Montage → 4 Grade → 5 Save/Export; lights on stage success (matches `done` flags).
- **Compose card:** topic input (large), collapsible "Add content / notes" textarea (with grounding toggles), foundation ref, pack count + #0 checkbox, CTA `🤖 Generate Fields`.
- **Generate button states:** idle → running (spinner + `Stage 2/7 · Short #2 Mistake · fields`) → done; re‑generate affordance per part.
- **Fields:** accordion groups (chevrons); shorts as **collapsed cards** (badge `#n` + title) → expand = 13 inputs; per‑card "clear / regenerate" actions.
- **Preview pane:** segmented tabs (`🎬 Long | #1…#5 | 🎞 Montage | 🎨 Grade | 📋 Run‑sheet`); sticky toolbar (Generate Script / Montage / Grade / Save / Copy / Export).
- **Empty states:** friendly copy + next action (`No montage yet — Generate Montage`).
- **Error states:** inline status keeps last error + `Retry`; stage card shows failed parts; never blank (global error boundary logs to console).

### 10.3 Loading & progress
- Per‑part progress with count (`Part 3/6`) — never just an indeterminate spinner.
- Progress persists across regenerate; only the affected control disables.
- Toast for "Saved ✅" (existing pattern); ETA text from budget table (§8.6).

### 10.4 RTL / Arabic
- Arabic output → `dir="rtl"`, right aligned, correct punctuation.
- Mixed text keeps LTR runs intact (bidi marks where needed); timecodes/technical tokens stay LTR.
- UI labels bilingual where helpful (label + hint), content always Arabic‑first.

### 10.5 Responsive & mobile
- Single‑column collapse; tables → horizontal scroll + sticky first column; montage/grade cards stack.
- Min touch target 44px; segmented tabs wrap on narrow widths.

### 10.6 Accessibility
- Semantic headings; `<label for>` everywhere; `role="status"` (ARIA live) on stage progress; accordion/tab keyboard patterns (expected `role=tablist/tab/region`, arrow‑key nav, `aria-expanded`).
- Focus management on expand/regenerate; contrast ≥ 4.5:1; never color‑only (badges carry emoji/icon).

### 10.7 Micro‑copy & tone
- Actionable labels ("Video topic" not "Input"); hints explain why ("The clearer the topic, the sharper the ﬁelds").
- Consistent verbs per stage (Generate → Edit → Produce); status always present‑tense during action.

### 10.8 Visual design
- Keep theme: dark `#0b0e14`, gold `#f5b342`, Inter + Cairo.
- Emoji glyphs as existing convention; one accent CTA color; neutral secondary.
- Montage/Grade panes use the timeline accent legend already established (Hook/Story/Tech/Twist/Verdict).

---

## 11. Analytics & Feedback Loop (local, opt‑in)
- Counters per pack: stage success/fail, retries, regenerate clicks, parts accepted, time per stage, exported flag.
- Stored in a separate `localStorage` namespace; **never sent anywhere**; shareable only via explicit export.
- A "system health" readout in ⚙️: average retry rate per stage → guides prompt tuning (e.g., if Fields retries > 20%, tighten the schema/prompt).
- Feedback per part: thumbs 👍/👎 (purely local) feed future prompt templates.

---

## 12. Best Practices (checklist dimension)

**Content/brand**
- One short = one idea; never spoil the long video; no filler; every claim fact vs opinion; Resources appended; checklists completed before scripting.

**AI prompting**
- One responsibility per prompt; explicit "Return ONLY valid JSON"; escape‑inner‑quotes instruction; finish‑reason handling; staged budgets; always parse defensively; ground on user notes.

**Engineering**
- Single source of state; render fns never destroy live inputs; localStorage quotas guarded; no secrets in logs; mode toggle never regresses the existing long/short flows.

**UX**
- Recoverable failures (regenerate part); visible anti‑frustration progress; empty/error states with next actions; RTL first; mobile usable; a11y patterns enforced.

**Data & operations**
- Pack metadata always stored; versioned (rules/pack/model); traceable exports; local‑only analytics; migration path by version.

---

## 13. Testing & QA Plan

### 13.1 Deterministic harness (prompt‑level tests)
- Seed topics per pillar (D365, AI/SaaS, Software Engineering) → run each stage → assert:
  - JSON parses (parser + repair fallback), missing‑key handling warnings;
  - required fields non‑empty; timecode validity; numeric clamps;
  - "Albadry Says" present in long script; each short ≤ ~60s equivalent.
- Golden files: 1 long + 5 shorts fixture pack checked in for regression on prompt/schema changes.

### 13.2 Adversarial / edge tests
- Topic empty / whitespace-only, topic > 500 chars, notes with fake version numbers (hallucination check), model returns code‑fenced vs raw JSON vs extra prose, `finish_reason='length'`, network down, slow response (>timeout), wrong endpoint, quota full.

### 13.3 UI tests (manual + scripted)
- Tab/keyboard flows, RTL rendering of all panes, expand/collapse of 5 short cards, segmented viewer switching, regenerate one part only, save→view→duplicate→delete, export contents completeness, mobile widths.

### 13.4 Acceptance criteria per milestone (see §15).

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Model emits truncated/invalid JSON | High | `repairJSON` + length detection + staged budgets + per‑part retry + clear copy |
| Local model weak at Arabic+code mix | Medium | Arabic‑first system prompt; slot prompts; editable fields as the human gate |
| Montage/grade are instructions, not automation | Medium | Sheet/run‑sheet patterns + one Global Adjust layer + .md export; standardize editor reuse |
| Timecodes drift after script edits | Medium | Montage derived from section text (not absolute); idempotent cheap regen |
| Hallucinated claims/versions from notes | Medium | Grounding block + diff warning + "fact vs opinion" marking + Resources |
| Long worst‑case latency (~15 min) | Medium | Budget transparency, per‑part ETA, pause/resume, per‑stage regen |
| Storage quota | Low | Versioned packs, prune oldest, compress |
| Scope creep (rendering inside the tool) | High | Explicit non‑goal; montage/grade = editable specs only |

---

## 15. Roadmap / Milestones + Acceptance Criteria

- **M0 — Foundation (done):** AI config, per‑type fields gen, JSON repair, truncation handling, logging.
- **M1 — Combined fields.** ACCEPT: 3‑segment toggle; long + N short prebuilt stems from one topic+notes; staged status; per‑short collapsible cards; per‑part regenerate; existing long/short modes untouched.
- **M2 — Combined scripts.** ACCEPT: staged full scripts all parts; segmented script viewer; "Albadry Says" present; each short standalone; no spoiler of long.
- **M3 — Montage.** ACCEPT: long shot table + 5 short sheets generated per part; timecode validation; montage viewer + export; regen‑after‑edit works.
- **M4 — Grade + run‑sheet.** ACCEPT: global card + per‑scene notes + run‑sheet generated; grade viewer + export; all grade values clamped & filter names present.
- **M5 — Pack save/export.** ACCEPT: one combined entry; ⚡ badge + filter; full .md export with rulesVersion/model/date; view/duplicate/delete.
- **M6 — Polish + QA.** ACCEPT: adversarial fixtures pass; empty/error states; mobile + a11y pass; optional #0; analytics readout (opt‑in).

---

## 16. Open Questions (confirm before building M1)
1. Pack default: **5 shorts (#1–#5)** per the ⚡ Combined page, or 4 = #1–#4? (UI control covers 1–6 regardless.)
2. Montage/Grade: per‑part click (recommended) vs one "Generate Full Pack" that runs scripts→montage→grade back‑to‑back (add as a convenience button).
3. Keep existing Short mode fields, or add a per‑slot type selector (Pre/Post #0–#5)?
4. Grade output: **global + per‑scene notes** (recommended) vs a brevity toggle for global only?
5. Include montage/grade in the Saved‑list pack viewer, or only in Export?
6. Grounding (**user notes → fact rules + hallucination warning**): include in v1, or simpler passthrough only?

---

## 17. Appendix — Examples

### 17.1 Montage plan (long, excerpt)
| Start | End | Shot | Camera | On‑screen | Transition | Audio | Note |
|-------|-----|------|--------|-----------|------------|-------|------|
| 0:00 | 0:20 | Talking‑head + B‑roll | Medium, slow push‑in | Bold hook text | Cut | Music swell | Record hook twice; keep tighter take |
| 4:00 | 4:10 | Screen recording | Static | Zoom‑in "Run" button | Zoom bump | Click SFX | Capture 4K@60 for punch‑in |

### 17.2 Grade card (excerpt)
| Setting | Value | CapCut panel |
|---------|-------|--------------|
| Filter | "Cinematic 2" @ 60% | Filters |
| Exposure / Contrast | +3 / +12 | Adjust |
| Screen‑recording scenes | Saturation −10, Temp −2 | Adjust per clip |
| Subtitles | `#f5b342` · 11% · bottom safe‑zone | Text |

### 17.3 Export TOC skeleton
```
ALBADRY CONTENT PACK
Topic … · Date … · Model … · Rules v3
────────────────────────────
1. Production Run‑Sheet
2. Long Script (+ Resources)
3. Short #1 Insight … #5 Question
4. Montage Plan (Long) + Short Sheets
5. Grade Cards (Global + per scene)
6. Upload Spec per Platform
```

### 17.4 Seed topics (for QA + prompts)
- D365: "Plugin execution pipeline: what happens between Save and execution"
- AI/SaaS: "LLM agents vs rule‑based workflows — when to use which"
- Software Engineering: "Refactoring legacy .NET monoliths with clean architecture"

> Everything above is a **plan**. Nothing in `deepseek_html_20260810_71c0d4.html` has been changed for this feature yet.