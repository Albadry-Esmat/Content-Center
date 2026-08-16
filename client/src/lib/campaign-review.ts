import type { CombinedPack, PartState } from './pack-domain'

export type ReviewSeverity = 'error' | 'warning' | 'info'

export type ReviewIssue = {
  id: string
  severity: ReviewSeverity
  scope: 'campaign' | 'part'
  partKey?: PartState['key']
  message: string
  action: string
}

export type ReviewSummary = {
  errors: number
  warnings: number
  info: number
  issues: ReviewIssue[]
  ready: boolean
}

function issue(id: string, severity: ReviewSeverity, message: string, action: string, partKey?: PartState['key']): ReviewIssue {
  return { id, severity, scope: partKey ? 'part' : 'campaign', partKey, message, action }
}

function hasVerificationMarker(value: string): boolean {
  return /\[verification required\]|verification required|source required/i.test(value)
}

function reviewPart(part: PartState): ReviewIssue[] {
  const issues: ReviewIssue[] = []
  if (!part.fields) {
    issues.push(issue(`${part.key}-fields-missing`, 'info', `${part.label} does not have a generated brief yet.`, 'Generate or write the brief before continuing.', part.key))
    return issues
  }
  const fieldValues = Object.values(part.fields)
  if (fieldValues.some(hasVerificationMarker)) {
    issues.push(issue(`${part.key}-verification-marker`, 'warning', `${part.label} contains a claim marked for verification.`, 'Check the source before recording or publishing.', part.key))
  }
  if (!part.script) {
    issues.push(issue(`${part.key}-script-missing`, 'info', `${part.label} has fields but no script yet.`, 'Generate or write the script before planning the cut.', part.key))
  }
  for (const warning of part.warnings || []) {
    issues.push(issue(`${part.key}-warning-${warning}`, 'warning', `${part.label}: ${warning}`, 'Review the artifact and resolve or accept the warning before publishing.', part.key))
  }
  return issues
}

export function reviewCampaign(pack: CombinedPack): ReviewSummary {
  const issues: ReviewIssue[] = []
  if (!pack.meta.topic.trim()) issues.push(issue('topic-missing', 'error', 'The campaign has no topic.', 'Add a clear topic before generating assets.'))
  if (!pack.meta.notes.trim()) issues.push(issue('grounding-missing', 'warning', 'No grounding notes or source material were provided.', 'Add references, claims, or production notes and verify generated statements.'))
  if (!pack.campaign.platforms.length) issues.push(issue('platforms-missing', 'error', 'No publishing platform is selected.', 'Select at least one platform for adaptation guidance.'))
  issues.push(...pack.parts.flatMap(reviewPart))
  const errors = issues.filter((item) => item.severity === 'error').length
  const warnings = issues.filter((item) => item.severity === 'warning').length
  const info = issues.filter((item) => item.severity === 'info').length
  return { errors, warnings, info, issues, ready: errors === 0 && warnings === 0 }
}
