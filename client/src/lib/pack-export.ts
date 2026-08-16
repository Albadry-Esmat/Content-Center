// Design philosophy: Editorial Control Room — exports begin with the run-sheet and preserve audit metadata.

import { reviewCampaign } from './campaign-review'
import { getPlatformPresets } from './platform-presets'
import type { CombinedPack } from './pack-domain'

export function packToMarkdown(pack: CombinedPack): string {
  const lines: string[] = []
  const completedStages = pack.parts.reduce((total, part) => total + Object.values(part.stageStatus).filter((status) => status === 'done').length, 0)
  lines.push(`# ALBADRY CONTENT CAMPAIGN`, '', `**Topic:** ${pack.meta.topic || 'Untitled campaign'}  `, `**Generated:** ${pack.meta.updatedAt}  `, `**Model:** ${pack.meta.model}  `, `**Rules:** ${pack.meta.rulesVersion}  `, `**Campaign:** 1 long-form · ${pack.campaign.preLaunchCount} pre-launch shorts · ${pack.campaign.postLaunchCount} post-launch shorts  `, `**Montage:** ${pack.campaign.montageTool === 'capcut' ? 'CapCut (simple)' : 'Generic (simple)'}  `, `**Coloring:** ${pack.campaign.coloringTool === 'davinci-resolve' ? 'DaVinci Resolve (simple)' : 'Generic (simple)'}  `, `**Stage completeness:** ${completedStages}/${pack.parts.length * 4}`, '', '## Contents', '', '1. [Production run-sheet](#1-production-run-sheet)', ...pack.parts.map((part, index) => `${index + 2}. [${part.label}](#${part.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`), '', '---', '', '## 1. Production run-sheet', '')
  pack.runSheet.forEach((item) => lines.push(`- [${item.done ? 'x' : ' '}] ${item.label}`))
  const review = reviewCampaign(pack)
  lines.push('', '## Review gate', '', `- **Status:** ${review.ready ? 'Ready for creator review' : 'Review before publishing'}`, `- **Blocking issues:** ${review.errors}`, `- **Warnings:** ${review.warnings}`, `- **Open steps:** ${review.info}`, '')
  review.issues.forEach((item) => lines.push(`- **${item.severity.toUpperCase()}** ${item.partKey ? `${item.partKey}: ` : ''}${item.message} — ${item.action}`))
  lines.push('', '## Platform adaptation', '')
  getPlatformPresets(pack.campaign.platforms).forEach((preset) => {
    lines.push(`### ${preset.label} · ${preset.role}`, '', `- **Preset:** ${preset.version}`, `- **Aspect ratio:** ${preset.aspectRatio}`, `- **Title:** ${preset.titleGuidance}`, `- **Caption:** ${preset.captionGuidance}`, `- **CTA:** ${preset.ctaGuidance}`, `- **Safe zone:** ${preset.safeZoneGuidance}`, `- **Export:** ${preset.exportGuidance}`, '')
  })
  pack.parts.forEach((part) => {
    lines.push('', `## ${part.label}`, '')
    if (part.warnings?.length) lines.push('> **Review notes:**', ...part.warnings.map((warning) => `> - ${warning}`), '')
    if (part.fields) lines.push('### Fields', '', `- **Title:** ${part.fields.title}`, `- **Promise:** ${part.fields.promise}`, `- **Audience:** ${part.fields.audience}`, `- **Hook:** ${part.fields.hook}`, `- **Story:** ${part.fields.story}`, `- **Insight:** ${part.fields.insight}`, `- **Proof:** ${part.fields.proof}`, `- **Payoff:** ${part.fields.payoff}`, `- **CTA:** ${part.fields.cta}`, '')
    if (part.script) lines.push('### Script', '', part.script.markdown, '')
    if (part.montage?.length) { lines.push('### Montage', '', '| Start | End | Shot | Camera | On-screen | Note |', '|---|---|---|---|---|---|'); part.montage.forEach((shot) => lines.push(`| ${shot.tStart} | ${shot.tEnd} | ${shot.shot} | ${shot.camera} | ${shot.onScreen} | ${shot.note} |`)) }
    if (part.grade) lines.push('', '### Grade', '', `- **Filter:** ${part.grade.filter} @ ${part.grade.intensity}%`, `- **Exposure:** ${part.grade.exposure}`, `- **Contrast:** ${part.grade.contrast}`, `- **Saturation:** ${part.grade.saturation}`, `- **Temperature:** ${part.grade.temperature}`, `- **Notes:** ${part.grade.notes}`)
  })
  return lines.join('\n') + '\n'
}
