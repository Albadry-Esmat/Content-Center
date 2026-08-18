import { readFileSync } from 'node:fs'

const path = 'docs/SEMANTIC_COLOR_NOTIFICATION_SPEC.md'
const source = readFileSync(path, 'utf8')
const requiredSections = [
  '## Purpose',
  '## Design principles',
  '## Token contract',
  '## Notification states',
  '## Theme and contrast requirements',
  '## Motion and reduced motion',
  '## Component handoff',
  '## Acceptance criteria',
  '## Batch boundary',
]
const requiredTokens = [
  '`--color-bg`',
  '`--color-surface`',
  '`--color-text`',
  '`--color-text-muted`',
  '`--color-focus`',
  '`--color-selected`',
  '`--color-success`',
  '`--color-info`',
  '`--color-warning`',
  '`--color-danger`',
]
const requiredStates = ['| Success |', '| Info |', '| Warning |', '| Error |', '| Cancellation |', '| Loading |', '| Neutral |']
const requiredTerms = ['prefers-reduced-motion', 'role="status"', 'role="alert"', 'API keys', 'native checkbox semantics']

const missing = [...requiredSections, ...requiredTokens, ...requiredStates, ...requiredTerms].filter((item) => !source.includes(item))
if (missing.length) {
  console.error(`Semantic color/notification specification invalid. Missing: ${missing.join(', ')}`)
  process.exit(1)
}

console.log(`Semantic color/notification specification valid: ${requiredSections.length} sections, ${requiredTokens.length} tokens, ${requiredStates.length} notification states, and ${requiredTerms.length} quality terms present.`)
