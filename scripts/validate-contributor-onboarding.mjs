import { readFileSync } from 'node:fs'

const guide = readFileSync(new URL('../docs/FIRST_CONTRIBUTION.md', import.meta.url), 'utf8')
const requiredSections = [
  '# First contribution guide',
  '## Choose a small contribution path',
  '## Ten-minute local setup',
  '## Start with the public demo',
  '## Make a focused branch and pull request',
  '## Validate before asking for review',
  '## Safe evidence for issues and pull requests',
  '## What reviewers look for',
  '## Next reading',
]
const requiredLinks = [
  '[`CONTRIBUTING.md`](../CONTRIBUTING.md)',
  '[`SUPPORT.md`](../SUPPORT.md)',
  '[`PROVIDER_SETUP.md`](../PROVIDER_SETUP.md)',
  '[`docs/PRESET_AUTHORING.md`](PRESET_AUTHORING.md)',
  '[`SECURITY.md`](../SECURITY.md)',
]
const requiredCommands = [
  'pnpm install --frozen-lockfile',
  'pnpm verify',
  'pnpm validate:demo-fixture',
  'git switch Dev',
]

const missingSections = requiredSections.filter((section) => !guide.includes(section))
const missingLinks = requiredLinks.filter((link) => !guide.includes(link))
const missingCommands = requiredCommands.filter((command) => !guide.includes(command))

if (missingSections.length || missingLinks.length || missingCommands.length) {
  console.error('Contributor onboarding validation failed.')
  if (missingSections.length) console.error(`Missing sections:\n- ${missingSections.join('\n- ')}`)
  if (missingLinks.length) console.error(`Missing links:\n- ${missingLinks.join('\n- ')}`)
  if (missingCommands.length) console.error(`Missing commands:\n- ${missingCommands.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `Contributor onboarding valid: ${requiredSections.length} sections, ${requiredLinks.length} links, and ${requiredCommands.length} setup commands present.`,
)
