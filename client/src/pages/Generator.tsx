// Design philosophy: Editorial Control Room — the generator is a calm production desk with visible state and recovery paths.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, CircleAlert, Download, FileText, Loader2, Plus, Save, Sparkles } from 'lucide-react'
import { createCombinedPack, getPart, packReducer, type CombinedPack, type FieldSet, type PartKey } from '../lib/pack-domain'
import type { GenerationStage } from '../lib/content-types'
import { saveCombinedPack } from '../lib/content-storage'
import { packToMarkdown } from '../lib/pack-export'
import { countWords } from '../lib/validators'
import { loadAiConfig } from '../lib/ai-config'
import { generateFieldsForPart, generateGradeForPart, generateMontageForPart, generateScriptForPart } from '../lib/generation-service'
import ArtifactEditor from '../components/ArtifactEditor'
import { useWorkspaceSelection } from '../contexts/WorkspaceContext'
import { trpc } from '@/lib/trpc'
import { toast } from 'sonner'

const stages: Array<{ id: GenerationStage; label: string; detail: string }> = [
  { id: 'fields', label: 'Fields', detail: 'Shape the brief' },
  { id: 'script', label: 'Script', detail: 'Draft the story' },
  { id: 'montage', label: 'Montage', detail: 'Plan the cut' },
  { id: 'grade', label: 'Grade', detail: 'Set the look' },
]

const emptyFields: FieldSet = { title: '', promise: '', audience: '', hook: '', story: '', insight: '', proof: '', payoff: '', cta: '' }

function sampleFields(topic: string, part: PartKey): FieldSet {
  const short = part !== 'long'
  return { title: topic, promise: short ? 'One sharp insight the viewer can use now.' : 'A practical technical story with proof and a clear verdict.', audience: 'Technical practitioners and curious builders', hook: short ? `The mistake most people make with ${topic}.` : `What really happens when ${topic}?`, story: 'Start with the friction the viewer already recognizes, then make the hidden mechanism visible.', insight: 'Explain the system in plain language before introducing the implementation detail.', proof: 'Show one concrete example, version, or screen recording before making the claim.', payoff: 'The viewer leaves with a decision they can apply in a real project.', cta: short ? 'Follow for the next practical breakdown.' : 'Tell me where this shows up in your project.' }
}

function simulateStage(pack: CombinedPack, stage: GenerationStage, partKey: PartKey): CombinedPack {
  const current = packReducer(pack, { type: 'start-stage', stage, partKey })
  if (stage === 'fields') return packReducer(current, { type: 'complete-fields', partKey, fields: sampleFields(pack.meta.topic, partKey) })
  if (stage === 'script') return packReducer(current, { type: 'complete-script', partKey, markdown: `## ${partKey === 'long' ? 'Long-form script' : 'Short script'}\n\n### Hook\n${pack.meta.topic}: make the hidden mechanism visible.\n\n### Core idea\nExplain the system, show the proof, then give the viewer a practical decision.\n\n### Verdict\nKeep the claim grounded in the supplied notes and mark anything that still needs verification.` })
  if (stage === 'montage') return packReducer(current, { type: 'complete-montage', partKey, shots: [{ tStart: '0:00', tEnd: '0:12', shot: 'talking-head', camera: 'medium-static', onScreen: 'Hook title', note: 'Record two takes; keep the tighter opening.' }, { tStart: '0:12', tEnd: '0:30', shot: 'screen', camera: 'slow push-in', onScreen: 'Key proof', note: 'Keep technical UI readable.' }] })
  return packReducer(current, { type: 'complete-grade', partKey, grade: { filter: 'Cinematic 2', intensity: 60, exposure: 3, contrast: 12, saturation: 8, temperature: -4, notes: 'Keep screen recordings slightly desaturated so the UI stays true.' } })
}

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return false
  if (error instanceof TypeError) return true
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network error') || message.includes('localhost')
}

export default function Generator() {
  const [mode, setMode] = useState<'long' | 'short' | 'combined'>('combined')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [pack, setPack] = useState<CombinedPack>(() => createCombinedPack())
  const [activeStage, setActiveStage] = useState<GenerationStage>('fields')
  const [activePart, setActivePart] = useState<PartKey>('long')
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const { workspaceId, projectId } = useWorkspaceSelection()
  const cloudProject = trpc.workspace.getProject.useQuery({ workspaceId: workspaceId || 'pending', projectId: projectId || 'pending' }, { enabled: Boolean(workspaceId && projectId), retry: false })
  const saveCloudPack = trpc.workspace.savePack.useMutation()
  const abortRef = useRef<AbortController | null>(null)
  const ready = topic.trim().length > 2
  const part = getPart(pack, activePart)
  const progress = useMemo(() => stages.filter((stage) => part.stageStatus[stage.id] === 'done').length * 25, [part.stageStatus])

  useEffect(() => {
    const cloudPack = cloudProject.data?.packData
    if (!cloudPack || typeof cloudPack !== 'object' || !('parts' in cloudPack) || !('meta' in cloudPack)) return
    const restored = cloudPack as unknown as CombinedPack
    setPack(restored)
    setTopic(restored.meta.topic || '')
    setNotes(restored.meta.notes || '')
  }, [cloudProject.data?.id])

  async function generate(stage = activeStage) {
    if (!ready || running) return
    const config = loadAiConfig()
    setRunning(true)
    setActiveStage(stage)
    setPack((current) => packReducer(current, { type: 'set-meta', topic, notes }))
    setPack((current) => packReducer(current, { type: 'start-stage', stage, partKey: activePart }))
    const controller = new AbortController(); abortRef.current = controller
    try {
      if (stage === 'fields') {
        const result = await generateFieldsForPart({ partKey: activePart, topic, notes, rulesVersion: pack.meta.rulesVersion, config, signal: controller.signal })
        setPack((current) => packReducer(current, { type: 'complete-fields', partKey: activePart, fields: result.fields, warnings: result.warnings }))
      } else if (stage === 'script') {
        if (!part.fields) throw new Error('Generate fields for this part before generating its script.')
        const result = await generateScriptForPart({ partKey: activePart, topic, notes, fields: part.fields, config, signal: controller.signal })
        setPack((current) => packReducer(current, { type: 'complete-script', partKey: activePart, markdown: result.markdown }))
      } else if (stage === 'montage') {
        if (!part.script) throw new Error('Generate a script for this part before generating its montage.')
        const result = await generateMontageForPart({ partKey: activePart, topic, script: part.script, config, signal: controller.signal })
        setPack((current) => packReducer(current, { type: 'complete-montage', partKey: activePart, shots: result.shots, warnings: result.warnings }))
      } else if (stage === 'grade') {
        if (!part.script) throw new Error('Generate a script for this part before generating its grade.')
        const result = await generateGradeForPart({ partKey: activePart, topic, script: part.script, config, signal: controller.signal })
        setPack((current) => packReducer(current, { type: 'complete-grade', partKey: activePart, grade: result }))
      }
      const next = stages[stages.findIndex((item) => item.id === stage) + 1]
      if (next) setActiveStage(next.id)
    } catch (error) {
      if (isNetworkFailure(error)) {
        setPack((current) => {
          const withMeta = { ...current, meta: { ...current.meta, topic, notes } }
          const fallback = simulateStage(withMeta, stage, activePart)
          if (stage === 'fields') return packReducer(fallback, { type: 'complete-fields', partKey: activePart, fields: sampleFields(topic, activePart), warnings: ['Local draft fallback used because the configured AI endpoint could not be reached. Review every claim before recording.'] })
          return fallback
        })
      } else {
        setPack((current) => packReducer(current, { type: 'stage-error', stage, partKey: activePart, message: error instanceof Error ? error.message : 'Generation failed. Check the connection and retry.' }))
      }
    } finally { abortRef.current = null; setRunning(false) }
  }

  function cancelGeneration() { abortRef.current?.abort() }

  async function handleSave() {
    const nextPack = { ...pack, meta: { ...pack.meta, topic, notes, updatedAt: new Date().toISOString() } }
    saveCombinedPack(nextPack)
    if (workspaceId && projectId) {
      try {
        await saveCloudPack.mutateAsync({ workspaceId, projectId, packData: nextPack as unknown as Record<string, unknown> })
        toast.success('Saved to cloud project', { description: 'A local backup was also kept in this browser.' })
      } catch (error) {
        toast.error('Saved locally only', { description: error instanceof Error ? error.message : 'Cloud sync is unavailable. Retry when the workspace reconnects.' })
      }
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function exportPack() {
    const blob = new Blob([packToMarkdown({ ...pack, meta: { ...pack.meta, topic, notes } })], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(topic || 'albadry-content-pack').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`; anchor.click(); URL.revokeObjectURL(url)
  }

  const generationProfile = loadAiConfig()
  return <div className="page page-generator">
    <div className="page-heading generator-heading"><div><span className="section-index">04 / PRODUCTION DESK</span><h1>Build the pack.</h1><p>Start with a topic. The system keeps the brief, the output, and the hand-off connected.</p></div><div className="generator-stamp"><span className="status-dot" /> {workspaceId && projectId ? 'CLOUD PROJECT ACTIVE' : 'LOCAL-FIRST MODE'}<br /><small>{workspaceId && projectId ? 'LOCAL BACKUP ENABLED' : 'NO CLOUD UPLOADS'}</small></div></div>
    <div className="generator-grid">
      <section className="compose-panel panel-surface"><div className="panel-title"><span className="section-index">01 / COMPOSE</span><span className="source-tape">DRAFT / {mode.toUpperCase()}</span></div><div className="generation-profile-chip"><span className="status-dot" /> {generationProfile.scriptLanguage || 'Language not selected'} · {generationProfile.textDirection.toUpperCase()}<small>{generationProfile.brandPhrases.trim() ? 'Brand voice enabled' : 'No brand phrases'}</small></div><div className="mode-switch" role="tablist" aria-label="Generation mode">{(['long', 'short', 'combined'] as const).map((value) => <button key={value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} role="tab" aria-selected={mode === value}>{value === 'combined' ? '⚡ Combined' : value === 'long' ? '🎬 Long-form' : '📱 Short / Reel'}</button>)}</div><label htmlFor="topic">Video topic <span>required</span></label><input id="topic" dir="auto" className="topic-input" value={topic} onChange={(event) => { setTopic(event.target.value); setPack((current) => packReducer(current, { type: 'set-meta', topic: event.target.value, notes })) }} placeholder="e.g. D365 Plugin Pipeline Execution Stages" /><p className="field-hint">A clear topic gives the model a sharper field breakdown.</p><div className="notes-label"><label htmlFor="notes">Foundation / reference</label><span>{countWords(notes)} words</span></div><textarea id="notes" dir={generationProfile.textDirection} value={notes} onChange={(event) => { setNotes(event.target.value); setPack((current) => packReducer(current, { type: 'set-meta', topic, notes: event.target.value })) }} placeholder="Paste build notes, a rough draft, or the claims the script must stay true to…" rows={8} /><div className="grounding-note"><CircleAlert size={15} /><span>Grounding is a review aid. Claims still need your judgment before recording.</span></div><div className="compose-button-row"><button className="button button-primary full-button" onClick={() => generate('fields')} disabled={!ready || running}>{running ? <><Loader2 className="spin" size={16} /> Working the brief…</> : <><Sparkles size={16} /> Generate fields</>}</button>{running && <button className="button button-quiet cancel-button" onClick={cancelGeneration}>Cancel</button>}</div><div className="sr-only" aria-live="polite">{running ? `Generating ${activeStage} for ${part.label}` : `${part.label} ${part.stageStatus[activeStage]}`}</div></section>
      <section className="workbench-panel"><div className="stage-rail"><div className="stage-rail-top"><span className="section-index">02 / PIPELINE</span><span className="pipeline-progress">{progress}% mapped</span></div><div className="stage-track"><span style={{ width: `${Math.max(7, progress)}%` }} /></div>{stages.map((stage, index) => { const done = part.stageStatus[stage.id] === 'done'; const active = activeStage === stage.id; return <button className={`stage-item ${active ? 'active' : ''} ${done ? 'done' : ''}`} key={stage.id} onClick={() => setActiveStage(stage.id)}><span className="stage-number">{done ? <Check size={13} /> : `0${index + 1}`}</span><span><b>{stage.label}</b><small>{stage.detail}</small></span><ChevronDown size={15} /></button> })}</div><div className="part-tabs">{pack.parts.map((item) => <button key={item.key} className={activePart === item.key ? 'selected' : ''} onClick={() => setActivePart(item.key)}>{item.key === 'long' ? 'Long' : item.key.replace('short-', '#')}</button>)}</div><ArtifactEditor pack={pack} part={part} activeStage={activeStage} running={running} textDirection={generationProfile.textDirection} onAction={(action) => setPack((current) => packReducer(current, action))} onGenerate={() => generate(activeStage)} onExport={exportPack} /><div className="workbench-footer"><button className="text-button" onClick={handleSave}><Save size={15} /> {saved ? 'Saved locally' : 'Save combined pack'}</button><span><span className="status-dot" /> {pack.parts.filter((item) => item.stageStatus.fields === 'done').length}/6 field parts shaped</span></div></section>
    </div>
  </div>
}
