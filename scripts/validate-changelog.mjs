import { readFileSync } from 'node:fs'

const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
const requiredSections = [
  '# Changelog',
  '## [Unreleased]',
  '### Added',
  '### Changed',
  '### Fixed',
  '## Release notes',
  'RELEASE_NOTES_TEMPLATE.md',
  'SECURITY.md',
  'PUBLIC_RELEASE_CHECKLIST.md',
]
const missing = requiredSections.filter((section) => !changelog.includes(section))

if (missing.length) {
  console.error(`Changelog validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Changelog valid: ${requiredSections.length} required sections and links present.`)
