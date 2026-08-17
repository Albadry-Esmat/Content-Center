import { readFileSync } from 'node:fs'

const candidate = readFileSync(new URL('../docs/RELEASE_CANDIDATE.md', import.meta.url), 'utf8')
const requiredStatements = [
  '# Public release candidate',
  '`v1.0.0-rc.1`',
  'Capital-D `Dev`',
  'local-first path remains available without an account',
  'simple CapCut montage guidance',
  'simple DaVinci Resolve coloring guidance',
  'PUBLIC_RELEASE_CHECKLIST.md',
  'CHANGELOG.md',
  'RELEASE_NOTES_TEMPLATE.md',
]
const missing = requiredStatements.filter((statement) => !candidate.includes(statement))

if (missing.length) {
  console.error(`Release-candidate validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Release candidate valid: ${requiredStatements.length} required statements present.`)
