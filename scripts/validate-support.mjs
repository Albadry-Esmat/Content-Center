import { readFileSync } from 'node:fs'

const support = readFileSync(new URL('../SUPPORT.md', import.meta.url), 'utf8')
const requiredStatements = [
  '# Support and troubleshooting',
  'Try demo campaign',
  'fixtures/demo-campaign.json',
  'PROVIDER_SETUP.md',
  'SECURITY.md',
  'Do not include API keys',
  'pnpm verify',
  'Advanced montage, advanced color grading, rendering, auto-publishing, and mandatory cloud usage',
]
const missing = requiredStatements.filter((statement) => !support.includes(statement))

if (missing.length) {
  console.error(`Support guide validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`Support guide valid: ${requiredStatements.length} required statements present.`)
