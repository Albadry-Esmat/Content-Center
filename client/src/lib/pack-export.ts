// Design philosophy: Editorial Control Room — exports begin with the run-sheet and preserve audit metadata.

import type { CombinedPack } from './pack-domain'

export function packToMarkdown(pack: CombinedPack): string {
  const lines: string[] = []
  lines.push(`# ALBADRY CONTENT PACK`, '', `**Topic:** ${pack.meta.topic || 'Untitled pack'}  `, `**Generated:** ${pack.meta.updatedAt}  `, `**Model:** ${pack.meta.model}  `, `**Rules:** ${pack.meta.rulesVersion}`, '', '---', '', '## 1. Production run-sheet', '')
  pack.runSheet.forEach((item) => lines.push(`- [${item.done ? 'x' : ' '}] ${item.label}`))
  pack.parts.forEach((part) => {
    lines.push('', `## ${part.label}`, '')
    if (part.fields) lines.push('### Fields', '', `- **Title:** ${part.fields.title}`, `- **Promise:** ${part.fields.promise}`, `- **Audience:** ${part.fields.audience}`, `- **Hook:** ${part.fields.hook}`, `- **Story:** ${part.fields.story}`, `- **Insight:** ${part.fields.insight}`, `- **Proof:** ${part.fields.proof}`, `- **Payoff:** ${part.fields.payoff}`, `- **CTA:** ${part.fields.cta}`, '')
    if (part.script) lines.push('### Script', '', part.script.markdown, '')
    if (part.montage?.length) { lines.push('### Montage', '', '| Start | End | Shot | Camera | On-screen | Note |', '|---|---|---|---|---|---|'); part.montage.forEach((shot) => lines.push(`| ${shot.tStart} | ${shot.tEnd} | ${shot.shot} | ${shot.camera} | ${shot.onScreen} | ${shot.note} |`)) }
    if (part.grade) lines.push('', '### Grade', '', `- **Filter:** ${part.grade.filter} @ ${part.grade.intensity}%`, `- **Exposure:** ${part.grade.exposure}`, `- **Contrast:** ${part.grade.contrast}`, `- **Saturation:** ${part.grade.saturation}`, `- **Temperature:** ${part.grade.temperature}`, `- **Notes:** ${part.grade.notes}`)
  })
  return lines.join('\n') + '\n'
}
