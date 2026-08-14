# Next implementation wave

- [x] Define typed combined-pack data structures for fields, scripts, montage, grade, run-sheet, and per-part stage state.
- [x] Add a reducer/state machine for staged, idempotent generation and scoped per-part regeneration.
- [x] Add defensive AI response parsing, truncation detection, timecode validation, and grade clamping.
- [x] Add versioned browser persistence with safe migration and quota handling.
- [x] Add complete Markdown export for saved content packs.
- [x] Integrate the combined-pack state into the generator workspace without removing the existing MVP flow.
- [x] Add automated tests for domain logic, parsing, validation, storage serialization, and export.
- [x] Run typecheck, build, and tests; save a checkpoint after successful validation.
