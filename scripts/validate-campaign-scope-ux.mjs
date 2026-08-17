import { readFileSync } from 'node:fs'

const spec = readFileSync(new URL('../docs/CAMPAIGN_SCOPE_UX_SPEC.md', import.meta.url), 'utf8')
const requiredSections = [
  '# Campaign Scope UX specification',
  '## Purpose',
  '## Design principles',
  '## Information architecture',
  '## Foundation/reference workspace contract',
  '## Interaction state model',
  '## Keyboard and accessibility behavior',
  '## Responsive behavior',
  '## Batch boundaries',
  '## Traceability',
]
const requiredStates = ['CS-EMPTY', 'CS-READY', 'CS-USER-NOTES', 'CS-AI-DRAFT', 'CS-REVIEWED', 'CS-GENERATING', 'CS-CANCELLED', 'CS-WARNING', 'CS-ERROR', 'CS-LOCAL-DEMO']
const requiredTerms = ['local-first', 'review aid', 'replace', 'append', 'discard', 'aria-expanded', 'RTL']
const missingSections = requiredSections.filter((section) => !spec.includes(section))
const missingStates = requiredStates.filter((state) => !spec.includes(state))
const missingTerms = requiredTerms.filter((term) => !spec.includes(term))

if (missingSections.length || missingStates.length || missingTerms.length) {
  console.error('Campaign Scope UX specification validation failed.')
  if (missingSections.length) console.error(`Missing sections:\n- ${missingSections.join('\n- ')}`)
  if (missingStates.length) console.error(`Missing states:\n- ${missingStates.join('\n- ')}`)
  if (missingTerms.length) console.error(`Missing terms:\n- ${missingTerms.join('\n- ')}`)
  process.exit(1)
}

console.log(`Campaign Scope UX specification valid: ${requiredSections.length} sections, ${requiredStates.length} states, and ${requiredTerms.length} quality terms present.`)
