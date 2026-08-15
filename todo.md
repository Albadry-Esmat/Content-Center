# Next implementation wave

- [x] Define typed combined-pack data structures for fields, scripts, montage, grade, run-sheet, and per-part stage state.
- [x] Add a reducer/state machine for staged, idempotent generation and scoped per-part regeneration.
- [x] Add defensive AI response parsing, truncation detection, timecode validation, and grade clamping.
- [x] Add versioned browser persistence with safe migration and quota handling.
- [x] Add complete Markdown export for saved content packs.
- [x] Integrate the combined-pack state into the generator workspace without removing the existing MVP flow.
- [x] Add automated tests for domain logic, parsing, validation, storage serialization, and export.
- [x] Run typecheck, build, and tests; save a checkpoint after successful validation.
- [x] Add authenticated personal workspaces, role-scoped cloud projects, and a local-first fallback without moving credentials to the client.
- [x] Surface cloud workspace loading and retry states so a failed bootstrap never leaves the production desk unusable.
- [x] Add route-level lazy loading, cacheable vendor chunks, and a repeatable bundle-audit script for the active Vite runtime.
- [x] Keep repository secret scanning strict while allowing clearly labeled documentation placeholders in the retained behavioral reference.
- [x] Synchronize the validated SaaS foundation to GitHub dev and verify the remote branch before reporting completion.
- [x] Replace the missing home-page visual with a durable web asset and verify its rendered state.
- [x] Add persisted script-language, RTL/LTR direction, and optional brand-phrase generation preferences.
- [x] Pass generation preferences through prompts and apply the selected direction to editable script content.
- [x] Generalize landing and settings copy, color hierarchy, feedback states, and motion for a creator-team SaaS product.
- [x] Add regression coverage for preference persistence and prompt behavior, then validate and synchronize the enhancement to GitHub dev.
