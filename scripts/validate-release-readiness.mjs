import { readFileSync } from 'node:fs'

const checklist = readFileSync(new URL('../PUBLIC_RELEASE_CHECKLIST.md', import.meta.url), 'utf8')
const candidate = readFileSync(new URL('../docs/RELEASE_CANDIDATE.md', import.meta.url), 'utf8')
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const requiredChecklistSections = ['## Product readiness', '## Privacy and security', '## Contributor and repository readiness', '## Release verification']
const requiredCandidateStatements = ['`v1.0.0-rc.1`', '`1.0.0`', 'Capital-D `Dev`', 'RELEASE_VERIFICATION.md']
const missingSections = requiredChecklistSections.filter((section) => !checklist.includes(section))
const missingCandidateStatements = requiredCandidateStatements.filter((statement) => !candidate.includes(statement))
const unresolved = checklist.match(/\|[^\n]*\|[^\n]*\|\s*(Verify before release|TODO|TBD)\s*\|/g) ?? []
const failures = [
  ...missingSections.map((item) => `missing checklist section: ${item}`),
  ...missingCandidateStatements.map((item) => `missing candidate statement: ${item}`),
  ...unresolved.map((item) => `unresolved checklist item: ${item}`),
  ...(packageJson.version !== '1.0.0' ? [`package version ${packageJson.version} does not match the candidate release line`] : []),
]

if (failures.length) {
  console.error(`Release-readiness validation failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Release readiness valid: checklist, candidate metadata, and package version are aligned.')
