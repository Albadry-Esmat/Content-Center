// Design philosophy: Editorial Control Room — the generator is a calm production desk with visible state and recovery paths.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CircleAlert, Download, FileText, Loader2, Plus, Save, Sparkles } from 'lucide-react'
import { createCombinedPack, getPart, packReducer, type CombinedPack, type FieldSet, type PartKey } from '../lib/pack-domain'
import type { GenerationStage } from '../lib/content-types'
import { saveCombinedPack } from '../lib/content-storage'
import { packToMarkdown } from '../lib/pack-export'
import { countWords } from '../lib/validators'
import { loadAiConfig } from '../lib/ai-config'
import { generateFieldsForPart, generateGradeForPart, generateMontageForPart, generateScriptForPart } from '../lib/generation-service'
import { createGenerationTask, createRunnableStageQueue, createStageQueue, getNextRecommendedTask, getPackProgress, getStageProgress, type GenerationTask } from '../lib/generation-progress'
import ArtifactEditor from '../components/ArtifactEditor'
import GenerationProgressHeader from '../components/GenerationProgressHeader'
import GenerationRunPanel from '../components/GenerationRunPanel'
import { useWorkspaceSelection } from '../contexts/WorkspaceContext'
import { trpc } from '@/lib/trpc'
import { toast } from 'sonner'
import { useGenerationRun } from '../hooks/useGenerationRun'

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
  const [saved, setSaved] = useState(false)
  const { workspaceId, projectId } = useWorkspaceSelection()
  const cloudProject = trpc.workspace.getProject.useQuery({ workspaceId: workspaceId || 'pending', projectId: projectId || 'pending' }, { enabled: Boolean(workspaceId && projectId), retry: false })
  const saveCloudPack = trpc.workspace.savePack.useMutation()
  const packRef = useRef(pack)
  const reportedRunRef = useRef<string | null>(null)
  const ready = topic.trim().length > 2
  const part = getPart(pack, activePart)
  const progress = useMemo(() => stages.filter((stage) => part.stageStatus[stage.id] === 'done').length * 25, [part.stageStatus])

  function applyPackAction(action: Parameters<typeof packReducer>[1]) {
    const next = packReducer(packRef.current, action)
    packRef.current = next
    setPack(next)
  }

  function replacePack(next: CombinedPack) {
    packRef.current = next
    setPack(next)
  }

  useEffect(() => {
    const cloudPack = cloudProject.data?.packData
    if (!cloudPack || typeof cloudPack !== 'object' || !('parts' in cloudPack) || !('meta' in cloudPack)) return
    const restored = cloudPack as unknown as CombinedPack
    setPack(restored)
    packRef.current = restored
    setTopic(restored.meta.topic || '')
    setNotes(restored.meta.notes || '')
  }, [cloudProject.data?.id])

  async function runTask(task: GenerationTask, signal: AbortSignal) {
    const config = loadAiConfig()
    const { stage, partKey } = task
    const currentPart = getPart(packRef.current, partKey)
    setActivePart(partKey)
    setActiveStage(stage)
    applyPackAction({ type: 'start-stage', stage, partKey })
    try {
      if (stage === 'fields') {
        const result = await generateFieldsForPart({ partKey, topic, notes, rulesVersion: packRef.current.meta.rulesVersion, config, signal })
        applyPackAction({ type: 'complete-fields', partKey, fields: result.fields, warnings: result.warnings })
        return result.warnings.length ? 'warning' : 'succeeded'
      } else if (stage === 'script') {
        if (!currentPart.fields) throw new Error('Generate fields for this deliverable before generating its script.')
        const result = await generateScriptForPart({ partKey, topic, notes, fields: currentPart.fields, config, signal })
        applyPackAction({ type: 'complete-script', partKey, markdown: result.markdown })
        return 'succeeded'
      } else if (stage === 'montage') {
        if (!currentPart.script) throw new Error('Generate a script for this deliverable before generating its montage.')
        const result = await generateMontageForPart({ partKey, topic, script: currentPart.script, config, signal })
        applyPackAction({ type: 'complete-montage', partKey, shots: result.shots, warnings: result.warnings })
        return result.warnings.length ? 'warning' : 'succeeded'
      } else if (stage === 'grade') {
        if (!currentPart.script) throw new Error('Generate a script for this deliverable before generating its grade.')
        const result = await generateGradeForPart({ partKey, topic, script: currentPart.script, config, signal })
        applyPackAction({ type: 'complete-grade', partKey, grade: result })
        return 'succeeded'
      }
      throw new Error(`Unsupported generation stage: ${stage}`)
    } catch (error) {
      if (signal.aborted) throw error
      if (isNetworkFailure(error)) {
        const fallbackMessage = 'Local draft fallback used because the configured AI endpoint could not be reached. Review every claim before recording.'
        let fallback = simulateStage(packRef.current, stage, partKey)
        if (stage === 'fields') fallback = packReducer(fallback, { type: 'complete-fields', partKey, fields: sampleFields(topic, partKey), warnings: [fallbackMessage] })
        fallback = packReducer(fallback, { type: 'stage-fallback', stage, partKey, message: fallbackMessage })
        replacePack(fallback)
        return 'fallback'
      } else {
        applyPackAction({ type: 'stage-error', stage, partKey, message: error instanceof Error ? error.message : 'Generation failed. Check the connection and retry.' })
        throw error
      }
    }
  }

  const { run, isRunning, start, cancel } = useGenerationRun(runTask)
  const packProgress = useMemo(() => getPackProgress(pack, run), [pack, run])
  const selectedStageProgress = getStageProgress(part, activeStage, run)

  function startGeneration(tasks: GenerationTask[]) {
    if (!ready || isRunning || !tasks.length) return
    applyPackAction({ type: 'set-meta', topic, notes })
    setActivePart(tasks[0].partKey)
    setActiveStage(tasks[0].stage)
    toast.message(`Generation started: ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} queued.`, { description: tasks.length === 1 ? tasks[0].label : `${tasks[0].label} is first in the queue.` })
    void start(tasks)
  }

  function generate(stage = activeStage) { startGeneration([createGenerationTask(getPart(packRef.current, activePart), stage)]) }

  function modePartKeys() {
    return mode === 'long' ? ['long'] as PartKey[] : mode === 'short' ? packRef.current.parts.filter((item) => item.key !== 'long').map((item) => item.key) : packRef.current.parts.map((item) => item.key)
  }

  function generateForMode(stage: GenerationStage) {
    const partKeys = modePartKeys()
    const tasks = stage === 'fields' ? createStageQueue(packRef.current, stage, partKeys) : createRunnableStageQueue(packRef.current, stage, partKeys, run)
    if (!tasks.length) { toast.message('No deliverables are ready for this stage yet.', { description: 'Complete the prerequisite shown in the pipeline, then try again.' }); return }
    startGeneration(tasks)
  }

  function retryTask(task: GenerationTask) {
    setActivePart(task.partKey)
    setActiveStage(task.stage)
    startGeneration([task])
  }

  const activeModeStageCount = activeStage === 'fields' ? modePartKeys().length : createRunnableStageQueue(pack, activeStage, modePartKeys(), run).length

  function continueRecommended() {
    const next = getNextRecommendedTask(packRef.current, run)
    if (!next) { toast.message('All available steps are ready to review.', { description: 'Edit an artifact or refresh a stale stage when you are ready.' }); return }
    setActivePart(next.partKey)
    setActiveStage(next.stage)
    startGeneration([next])
  }

  function cancelGeneration() { cancel(); toast.message('Generation cancellation requested.', { description: 'Completed artifacts remain available. Remaining tasks can be restarted.' }) }

  useEffect(() => {
    if (!run || run.status === 'running' || reportedRunRef.current === run.id) return
    reportedRunRef.current = run.id
    const succeeded = run.tasks.filter((task) => task.outcome === 'succeeded' || task.outcome === 'warning' || task.outcome === 'fallback').length
    const fallbacks = run.tasks.filter((task) => task.outcome === 'fallback').length
    const failed = run.tasks.filter((task) => task.outcome === 'failed').length
    if (run.status === 'cancelled') toast.message('Generation paused.', { description: `${succeeded} completed; remaining tasks can be restarted.` })
    else if (run.status === 'partial') toast.error('Generation finished with items needing attention.', { description: `${succeeded} completed; ${failed} need retry or connection review.` })
    else if (fallbacks) toast.warning('Generation completed with local draft fallbacks.', { description: `${fallbacks} item${fallbacks === 1 ? '' : 's'} require review before use.` })
    else toast.success('Generation complete.', { description: `${succeeded} task${succeeded === 1 ? '' : 's'} are ready to review.` })
  }, [run])

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
    <GenerationProgressHeader summary={packProgress} run={run} onContinue={continueRecommended} />
    <div className="generator-grid">
      <section className="compose-panel panel-surface"><div className="panel-title"><span className="section-index">01 / COMPOSE</span><span className="source-tape">DRAFT / {mode.toUpperCase()}</span></div><div className="generation-profile-chip"><span className="status-dot" /> {generationProfile.scriptLanguage || 'Language not selected'} · {generationProfile.textDirection.toUpperCase()}<small>{generationProfile.brandPhrases.trim() ? 'Brand voice enabled' : 'No brand phrases'}</small></div><div className="mode-switch" role="tablist" aria-label="Generation mode">{(['long', 'short', 'combined'] as const).map((value) => <button key={value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} role="tab" aria-selected={mode === value}>{value === 'combined' ? '⚡ Combined' : value === 'long' ? '🎬 Long-form' : '📱 Short / Reel'}</button>)}</div><label htmlFor="topic">Video topic <span>required</span></label><input id="topic" dir="auto" className="topic-input" value={topic} onChange={(event) => { setTopic(event.target.value); applyPackAction({ type: 'set-meta', topic: event.target.value, notes }) }} placeholder="e.g. D365 Plugin Pipeline Execution Stages" /><p className="field-hint">A clear topic gives the model a sharper field breakdown.</p><div className="notes-label"><label htmlFor="notes">Foundation / reference</label><span>{countWords(notes)} words</span></div><textarea id="notes" dir={generationProfile.textDirection} value={notes} onChange={(event) => { setNotes(event.target.value); applyPackAction({ type: 'set-meta', topic, notes: event.target.value }) }} placeholder="Paste build notes, a rough draft, or the claims the script must stay true to…" rows={8} /><div className="grounding-note"><CircleAlert size={15} /><span>Grounding is a review aid. Claims still need your judgment before recording.</span></div><div className="compose-button-row"><button className="button button-primary full-button" onClick={() => generateForMode('fields')} disabled={!ready || isRunning}>{isRunning ? <><Loader2 className="spin" size={16} /> Generating queued briefs…</> : <><Sparkles size={16} /> {mode === 'combined' ? 'Generate 6 briefs' : mode === 'short' ? 'Generate 5 short briefs' : 'Generate long-form brief'}</>}</button>{isRunning && <button className="button button-quiet cancel-button" onClick={cancelGeneration}>Cancel run</button>}</div><div className="sr-only" aria-live="polite">{isRunning ? `Generating ${activeStage} for ${part.label}` : `${part.label} ${part.stageStatus[activeStage]}`}</div></section>
      <section className="workbench-panel"><div className="stage-rail"><div className="stage-rail-top"><span className="section-index">02 / PIPELINE</span><span className="pipeline-progress">{packProgress.completedSteps}/{packProgress.totalSteps} ready</span></div><div className="stage-track"><span style={{ width: `${Math.max(7, Math.round((packProgress.completedSteps / packProgress.totalSteps) * 100))}%` }} /></div>{stages.map((stage, index) => { const stageProgress = getStageProgress(part, stage.id, run); const done = stageProgress.status === 'ready-to-review' || stageProgress.status === 'review-required'; const active = activeStage === stage.id; return <button className={`stage-item ${active ? 'active' : ''} ${done ? 'done' : ''} ${stageProgress.status}`} key={stage.id} onClick={() => setActiveStage(stage.id)} aria-pressed={active}><span className="stage-number">{done ? <Check size={13} /> : `0${index + 1}`}</span><span><b>{stage.label}</b><small>{stageProgress.label} · {stage.detail}</small></span></button> })}</div><div className="stage-context" aria-live="polite"><span className="section-index">EDITING / {part.label.toUpperCase()} · {activeStage.toUpperCase()}</span><b>{selectedStageProgress.label}</b><p>{selectedStageProgress.detail}</p>{selectedStageProgress.status === 'blocked' ? <button className="button button-quiet" onClick={() => setActiveStage(activeStage === 'script' ? 'fields' : 'script')}>Open prerequisite</button> : <button className="button button-quiet" onClick={() => generateForMode(activeStage)} disabled={!ready || isRunning || activeModeStageCount === 0}><Sparkles size={14} /> {activeModeStageCount > 1 ? `Generate ${activeStage} for ${activeModeStageCount} deliverables` : selectedStageProgress.status === 'ready-to-review' ? 'Regenerate this stage' : `Generate ${activeStage}`}</button>}</div><GenerationRunPanel run={run} onCancel={cancelGeneration} onRetry={retryTask} /><div className="part-tabs" role="tablist" aria-label="Content deliverables">{pack.parts.map((item) => { const complete = stages.filter((stage) => item.stageStatus[stage.id] === 'done').length; return <button key={item.key} className={activePart === item.key ? 'selected' : ''} onClick={() => setActivePart(item.key)} role="tab" aria-selected={activePart === item.key}>{item.key === 'long' ? 'Long-form' : item.key.replace('short-', 'Short #')} <small>{complete}/4</small></button> })}</div><ArtifactEditor pack={pack} part={part} activeStage={activeStage} running={isRunning} textDirection={generationProfile.textDirection} onAction={applyPackAction} onGenerate={() => generate(activeStage)} onExport={exportPack} /><div className="workbench-footer"><button className="text-button" onClick={handleSave}><Save size={15} /> {saved ? 'Saved locally' : 'Save combined pack'}</button><span><span className="status-dot" /> {packProgress.completedSteps}/{packProgress.totalSteps} production steps ready</span></div></section>
    </div>
  </div>
}
