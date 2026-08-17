import { readFileSync } from 'node:fs'

const guide = readFileSync(new URL('../docs/BRANCHING_AND_RELEASE.md', import.meta.url), 'utf8')
const requiredStatements = [
  '`Dev`',
  '`main`',
  '`v*` tags',
  'capital `D` in `Dev` is intentional',
  '`pnpm verify`',
  '`0 ahead / 0 behind`',
  'PUBLIC_RELEASE_CHECKLIST.md',
]
const missing = requiredStatements.filter((statement) => !guide.includes(statement))

if (missing.length) {
  console.error(`Branching and release guide validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Branching and release guide valid: ${requiredStatements.length} required statements present.`)
