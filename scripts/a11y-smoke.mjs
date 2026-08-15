import { readFileSync } from 'node:fs'

const checks = [
  ['client/src/components/ArtifactEditor.tsx', 'dir={textDirection}', 'editable artifact fields should honor the configured writing direction'],
  ['client/src/pages/Generator.tsx', 'aria-live="polite"', 'generation status should be announced'],
  ['client/src/index.css', '*:focus-visible', 'keyboard focus must remain visible'],
  ['client/src/components/AppShell.tsx', 'aria-label="Primary navigation"', 'primary navigation must be named'],
]

const missing = checks.filter(([file, token]) => !readFileSync(file, 'utf8').includes(token))
if (missing.length) {
  for (const [file, , reason] of missing) console.error(`Accessibility smoke failed: ${file} — ${reason}`)
  process.exit(1)
}
console.log(`Accessibility smoke passed: ${checks.length} structural checks.`)
