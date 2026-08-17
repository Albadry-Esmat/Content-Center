import { readFileSync } from 'node:fs'

const template = readFileSync(new URL('../RELEASE_NOTES_TEMPLATE.md', import.meta.url), 'utf8')
const requiredSections = [
  '# Content Center [version or date]',
  '## Summary',
  '## What changed',
  '## Privacy and security',
  '## Compatibility and recovery',
  '## Validation evidence',
  '## Known limitations',
  '## Upgrade or contributor notes',
  '## Links',
]
const missing = requiredSections.filter((section) => !template.includes(section))

if (missing.length) {
  console.error(`Release-notes template validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Release-notes template valid: ${requiredSections.length} required sections present.`)
