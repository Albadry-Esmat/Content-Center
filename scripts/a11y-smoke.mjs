import { readFileSync } from 'node:fs'

const checks = [
  ['client/src/components/ArtifactEditor.tsx', 'dir={textDirection}', 'editable artifact fields should honor the configured writing direction'],
  ['client/src/pages/Generator.tsx', 'aria-live="polite"', 'generation status should be announced'],
  ['client/src/components/GenerationProgressHeader.tsx', 'aria-label="Pack production progress"', 'pack-wide progress must have an accessible landmark label'],
  ['client/src/components/GenerationRunPanel.tsx', 'aria-label="Generation run details"', 'generation run details must have an accessible label'],
  ['client/src/components/ProjectHistoryPanel.tsx', 'aria-label="Project history"', 'project history must have an accessible label'],
  ['client/src/components/GenerationRunPanel.tsx', 'aria-label="Cancel generation run"', 'generation cancellation must retain an accessible action label'],
  ['client/src/index.css', '*:focus-visible', 'keyboard focus must remain visible'],
  ['client/src/components/AppShell.tsx', 'aria-label="Primary navigation"', 'primary navigation must be named'],
  ['client/src/components/AppShell.tsx', 'rail-settings-link', 'Settings navigation link must remain addressable on narrow screens'],
  ['client/src/components/AppShell.tsx', 'aria-current={location === \'/settings\' ? \'page\' : undefined}', 'Settings navigation must expose active-page semantics'],
  ['client/src/index.css', ':where(summary, .rail-link):focus-visible', 'disclosures and rail links must retain visible keyboard focus'],
  ['client/src/index.css', 'grid-template-columns: repeat(3, minmax(0, 1fr))', 'mobile primary navigation must avoid horizontal overflow'],
  ['client/src/pages/Generator.tsx', 'aria-label="Generation mode"', 'generation mode tabs must have an accessible label'],
  ['client/src/pages/Generator.tsx', 'aria-label="Public demo campaign"', 'the public demo must expose its no-account guidance to assistive technology'],
  ['client/src/pages/Generator.tsx', 'id="foundation-action-title"', 'the foundation action card must have a named heading'],
  ['client/src/pages/Generator.tsx', 'aria-label="Foundation review actions"', 'foundation review decisions must have a named action group'],
  ['client/src/pages/Generator.tsx', 'Retry foundation draft', 'foundation errors must expose a retry action'],
  ['client/src/pages/Generator.tsx', 'placeholder="Add an angle, audience, claims, examples, sources, constraints, or open questions…"', 'the foundation empty state must explain useful grounding material'],
]

const missing = checks.filter(([file, token]) => !readFileSync(file, 'utf8').includes(token))
if (missing.length) {
  for (const [file, , reason] of missing) console.error(`Accessibility smoke failed: ${file} — ${reason}`)
  process.exit(1)
}
console.log(`Accessibility smoke passed: ${checks.length} structural checks.`)
