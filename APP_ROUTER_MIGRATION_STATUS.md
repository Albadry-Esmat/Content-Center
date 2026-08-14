# App Router migration status

The repository now includes an incremental Next.js App Router facade under `app/`, including route segments for the home, generator, system, saved, and settings surfaces. Legacy Vite screens are dynamically isolated behind `app/LegacyClient.tsx` so browser-only state and local storage do not become server dependencies.

The canonical managed preview remains the validated React/Vite runtime while the facade is stabilized. The Vite path passes security scan, unit tests, TypeScript validation, and production build. The Next.js build currently reaches compilation and type validation but fails during the framework-generated `/404` prerender with a document-boundary error. This is tracked as a runtime migration blocker rather than hidden or treated as complete.

The next App Router step is to reproduce the issue in a clean Next workspace, remove the remaining legacy-runtime coupling, and only then make `next build` the release gate. The existing migration facade should not replace the working Vite runtime until that gate passes.
