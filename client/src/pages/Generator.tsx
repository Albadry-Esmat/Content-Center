// Design philosophy: Editorial Control Room — the generator is a calm production desk with visible state and recovery paths.

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Check, CircleAlert, Download, FileText, Loader2, Plus, Save, Sparkles } from 'lucide-react'
import { createCombinedPack, getPart, packReducer, type CombinedPack, type FieldSet, type PartKey } from '../lib/pack-domain'
import { objectiveLabel, SHORT_OBJECTIVES, shortSlotDescription, SUPPORTED_PLATFORMS, type PlatformId, type ShortObjective } from '../lib/campaign-config'
import type { GenerationStage } from '../lib/content-types'
import { saveCombinedPack } from '../lib/content-storage'
import { loadFoundationSession, saveFoundationSession } from '../lib/foundation-session'
import { packToMarkdown } from '../lib/pack-export'
import { countWords } from '../lib/validators'
import { reviewCampaign } from '../lib/campaign-review'
import { createGenerationProvenance, type GenerationProvenance } from '../lib/generation-provenance'
import type { FoundationReference } from '../lib/foundation-reference'
import { loadAiConfig } from '../lib/ai-config'
import { PROVIDER_CATALOG } from '../lib/provider-registry'
import { generateFieldsForPart, generateFoundationReference, generateGradeForPart, generateMontageForPart, generateScriptForPart } from '../lib/generation-service'
import { createGenerationTask, createRunnableStageQueue, createStageQueue, getNextRecommendedTask, getPackProgress, getStageProgress, type GenerationTask } from '../lib/generation-progress'
import { recoverLatestCloudRun } from '../lib/cloud-run-recovery'
import ArtifactEditor from '../components/ArtifactEditor'
import GenerationProgressHeader from '../components/GenerationProgressHeader'
import GenerationRunPanel from '../components/GenerationRunPanel'
import ProjectHistoryPanel from '../components/ProjectHistoryPanel'
import { useWorkspaceSelection } from '../contexts/WorkspaceContext'
import { useAuth } from '@/_core/hooks/useAuth'
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
const platformLabels: Record<PlatformId, string> = { youtube: 'YouTube', 'youtube-shorts': 'YouTube Shorts', 'instagram-reels': 'Instagram Reels', tiktok: 'TikTok', 'facebook-reels': 'Facebook Reels', linkedin: 'LinkedIn', x: 'X' }
type GroundingStatus = 'none' | 'user-notes' | 'review-required' | 'accepted-ai' | 'stale'

function groundingSnapshotKey(topic: string, notes: string): string {
  return `${topic.trim()}\u0000${notes.trim()}`
}

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

function foundationFailureMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') return 'Foundation generation was cancelled.'
  if (isNetworkFailure(error)) return 'The configured AI endpoint could not be reached. Check Settings or continue with local notes.'
  return 'Foundation generation failed. Check the configured provider in Settings and retry.'
}

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return false
  if (error instanceof TypeError) return true
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network error') || message.includes('localhost')
}

function foundationToNotes(draft: FoundationReference): string {
  const section = (title: string, value: string) => `### ${title}\n${value.trim() || '[verification required]'}`
  const list = (title: string, values: string[]) => `### ${title}\n${values.length ? values.map((value) => `- ${value}`).join('\n') : '- [verification required]'}`
  return ['## AI foundation draft', section('Working angle', draft.workingAngle), section('Audience problem', draft.audienceProblem), section('Intended promise', draft.intendedPromise), list('Key points', draft.keyPoints), list('Evidence to collect', draft.evidenceToCollect), list('Sources to check', draft.sourcesToCheck), list('Terms to define', draft.termsToDefine), list('Open questions', draft.openQuestions), list('Verification reminders', draft.verificationReminders)].join('\n\n')
}

function foundationGroundingWarnings(draft: FoundationReference): string[] {
  const warnings = ['AI-generated planning text is not verified research. Check every claim before recording or publishing.']
  const serialized = JSON.stringify(draft)
  if (serialized.includes('[source to verify]') || serialized.includes('[verification required]')) warnings.push('This draft contains verification placeholders that need a real source or creator decision.')
  if (draft.openQuestions.length) warnings.push(`${draft.openQuestions.length} open question${draft.openQuestions.length === 1 ? '' : 's'} remain in the planning draft.`)
  return warnings
}

export default function Generator() {
  const [location] = useLocation()
  const [mode, setMode] = useState<'long' | 'short' | 'combined'>('combined')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [pack, setPack] = useState<CombinedPack>(() => createCombinedPack())
  const [activeStage, setActiveStage] = useState<GenerationStage>('fields')
  const [activePart, setActivePart] = useState<PartKey>('long')
  const [saved, setSaved] = useState(false)
  const [foundationStatus, setFoundationStatus] = useState<'idle' | 'generating' | 'success' | 'warning' | 'cancelled' | 'error'>('idle')
  const [foundationDraft, setFoundationDraft] = useState<FoundationReference | null>(null)
  const [foundationWarnings, setFoundationWarnings] = useState<string[]>([])
  const [foundationError, setFoundationError] = useState('')
  const [foundationProvenance, setFoundationProvenance] = useState<GenerationProvenance | null>(null)
  const [foundationDraftEdited, setFoundationDraftEdited] = useState(false)
  const [foundationDecision, setFoundationDecision] = useState<'review' | 'kept' | 'appended' | 'replaced' | 'discarded'>('review')
  const [acceptedFoundationSnapshot, setAcceptedFoundationSnapshot] = useState<string | null>(null)
  const [cloudRevision, setCloudRevision] = useState(0)
  const foundationControllerRef = useRef<AbortController | null>(null)
  const { isAuthenticated } = useAuth()
  const { workspaceId, projectId } = useWorkspaceSelection()
  const cloudSyncActive = Boolean(isAuthenticated && workspaceId && projectId)
  const cloudProject = trpc.workspace.getProject.useQuery({ workspaceId: workspaceId || 'pending', projectId: projectId || 'pending' }, { enabled: cloudSyncActive, retry: false })
  const saveCloudPack = trpc.workspace.savePack.useMutation()
  const packVersions = trpc.workspace.listPackVersions.useQuery({ workspaceId: workspaceId || 'pending', projectId: projectId || 'pending' }, { enabled: cloudSyncActive, retry: false })
  const generationRuns = trpc.workspace.listGenerationRuns.useQuery({ workspaceId: workspaceId || 'pending', projectId: projectId || 'pending' }, { enabled: cloudSyncActive, retry: false })
  const saveCloudRun = trpc.workspace.saveGenerationRun.useMutation()
  const restoreCloudVersion = trpc.workspace.restorePackVersion.useMutation()
  const trpcUtils = trpc.useUtils()
  const packRef = useRef(pack)
  const reportedRunRef = useRef<string | null>(null)
  const persistedRunRef = useRef<string | null>(null)
  const recoveredCloudRunRef = useRef<string | null>(null)
  const demoAppliedRef = useRef(false)
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

  function hydrateFoundationSession(packId: string) {
    const session = loadFoundationSession(packId)
    if (!session) {
      setFoundationDraft(null)
      setFoundationWarnings([])
      setFoundationProvenance(null)
      setFoundationDraftEdited(false)
      setFoundationDecision('review')
      setAcceptedFoundationSnapshot(null)
      setFoundationStatus('idle')
      return
    }
    setFoundationDraft(session.draft)
    setFoundationWarnings(session.warnings)
    setFoundationProvenance(session.provenance)
    setFoundationDraftEdited(session.edited)
    setFoundationDecision(session.decision)
    setAcceptedFoundationSnapshot(session.acceptedSnapshot)
    setFoundationStatus(session.draft ? session.warnings.length ? 'warning' : 'success' : 'idle')
  }

  useEffect(() => {
    const demoRequested = new URLSearchParams(window.location.search).get('demo') === '1'
    if (demoRequested && !demoAppliedRef.current && !cloudSyncActive) {
      demoAppliedRef.current = true
      const demoTopic = 'How to turn one long video into a useful short-form campaign'
      const demoNotes = 'Show a beginner-friendly workflow: one practical long-form lesson, two curiosity-building teasers before publication, and five simple follow-up shorts after publication. Keep the editing guidance simple for CapCut montage and DaVinci Resolve correction.'
      const demoPack = createCombinedPack(demoTopic)
      replacePack(demoPack)
      hydrateFoundationSession(demoPack.meta.id)
      setTopic(demoTopic)
      setNotes(demoNotes)
      setAcceptedFoundationSnapshot(null)
      toast.message('Demo campaign loaded.', { description: 'Edit the topic or notes, then generate locally or connect an AI provider in Settings.' })
    }
  }, [cloudSyncActive, location])

  useEffect(() => {
    const cloudData = cloudProject.data
    if (!cloudData) return
    setCloudRevision(cloudData.revision || 0)
    const cloudPack = cloudData.packData
    if (!cloudPack || typeof cloudPack !== 'object' || !('parts' in cloudPack) || !('meta' in cloudPack)) return
    const restored = cloudPack as unknown as CombinedPack
    setPack(restored)
    packRef.current = restored
    setTopic(restored.meta.topic || '')
    setNotes(restored.meta.notes || '')
    hydrateFoundationSession(restored.meta.id)
  }, [cloudProject.data?.id, cloudProject.data?.updatedAt])

  async function runTask(task: GenerationTask, signal: AbortSignal) {
    const config = loadAiConfig()
    const { stage, partKey } = task
    const currentPart = getPart(packRef.current, partKey)
    setActivePart(partKey)
    setActiveStage(stage)
    applyPackAction({ type: 'start-stage', stage, partKey })
    try {
      if (stage === 'fields') {
        const result = await generateFieldsForPart({ partKey, topic, notes, rulesVersion: packRef.current.meta.rulesVersion, campaign: packRef.current.campaign, config, signal })
        applyPackAction({ type: 'complete-fields', partKey, fields: result.fields, warnings: result.warnings, provenance: createGenerationProvenance(config) })
        return result.warnings.length ? 'warning' : 'succeeded'
      } else if (stage === 'script') {
        if (!currentPart.fields) throw new Error('Generate fields for this deliverable before generating its script.')
        const result = await generateScriptForPart({ partKey, topic, notes, fields: currentPart.fields, campaign: packRef.current.campaign, config, signal })
        applyPackAction({ type: 'complete-script', partKey, markdown: result.markdown, provenance: createGenerationProvenance(config) })
        return 'succeeded'
      } else if (stage === 'montage') {
        if (!currentPart.script) throw new Error('Generate a script for this deliverable before generating its montage.')
        const result = await generateMontageForPart({ partKey, topic, script: currentPart.script, config, signal })
        applyPackAction({ type: 'complete-montage', partKey, shots: result.shots, warnings: result.warnings, provenance: createGenerationProvenance(config) })
        return result.warnings.length ? 'warning' : 'succeeded'
      } else if (stage === 'grade') {
        if (!currentPart.script) throw new Error('Generate a script for this deliverable before generating its grade.')
        const result = await generateGradeForPart({ partKey, topic, script: currentPart.script, config, signal })
        applyPackAction({ type: 'complete-grade', partKey, grade: result, provenance: createGenerationProvenance(config) })
        return 'succeeded'
      }
      throw new Error(`Unsupported generation stage: ${stage}`)
    } catch (error) {
      if (signal.aborted) throw error
      if (isNetworkFailure(error)) {
        const fallbackMessage = 'Local draft fallback used because the configured AI endpoint could not be reached. Review every claim before recording.'
        const fallbackProvenance = createGenerationProvenance(config, 'fallback')
        let fallback = simulateStage(packRef.current, stage, partKey)
        if (stage === 'fields') fallback = packReducer(fallback, { type: 'complete-fields', partKey, fields: sampleFields(topic, partKey), warnings: [fallbackMessage], provenance: fallbackProvenance })
        fallback = packReducer(fallback, { type: 'stage-fallback', stage, partKey, message: fallbackMessage, provenance: fallbackProvenance })
        replacePack(fallback)
        return 'fallback'
      } else {
        applyPackAction({ type: 'stage-error', stage, partKey, message: error instanceof Error ? error.message : 'Generation failed. Check the connection and retry.' })
        throw error
      }
    }
  }

  const { run, isRunning, start, cancel, recover } = useGenerationRun(runTask)
  const packProgress = useMemo(() => getPackProgress(pack, run), [pack, run])
  const review = useMemo(() => reviewCampaign(pack), [pack])
  const selectedStageProgress = getStageProgress(part, activeStage, run)
  useEffect(() => { if (!pack.parts.some((item) => item.key === activePart)) setActivePart('long') }, [activePart, pack.parts])

  useEffect(() => {
    if (!pack.meta.id) return
    const hasSession = Boolean(foundationDraft || foundationWarnings.length || foundationProvenance || acceptedFoundationSnapshot || foundationDecision !== 'review')
    if (!hasSession) return
    saveFoundationSession({ schemaVersion: 1, packId: pack.meta.id, topicSnapshot: topic, notesSnapshot: notes, draft: foundationDraft, warnings: foundationWarnings, provenance: foundationProvenance, edited: foundationDraftEdited, decision: foundationDecision, acceptedSnapshot: acceptedFoundationSnapshot, updatedAt: new Date().toISOString() })
  }, [acceptedFoundationSnapshot, foundationDecision, foundationDraft, foundationDraftEdited, foundationProvenance, foundationWarnings, notes, pack.meta.id, topic])

  useEffect(() => {
    if (!run || run.status === 'idle' || !cloudSyncActive || !workspaceId || !projectId) return
    const persistenceKey = `${run.id}:${run.status}:${run.tasks.map((task) => task.outcome).join(':')}`
    if (persistedRunRef.current === persistenceKey) return
    persistedRunRef.current = persistenceKey
    void saveCloudRun.mutateAsync({
      workspaceId,
      projectId,
      run: {
        id: run.id,
        status: run.status,
        tasks: run.tasks as unknown as Record<string, unknown>[],
        packData: packRef.current as unknown as Record<string, unknown>,
        startedAt: run.startedAt || Date.now(),
        finishedAt: run.finishedAt ?? null,
      },
    }).then(() => trpcUtils.workspace.listGenerationRuns.invalidate({ workspaceId, projectId })).catch((error) => {
      if (persistedRunRef.current === persistenceKey) persistedRunRef.current = null
      toast.error('Run history was not saved to cloud.', { description: error instanceof Error ? error.message : 'Your local artifacts are still available.' })
    })
  }, [cloudSyncActive, projectId, run, saveCloudRun, trpcUtils.workspace.listGenerationRuns, workspaceId])

  useEffect(() => {
    if (!cloudSyncActive || !workspaceId || !projectId || isRunning || run || !generationRuns.data) return
    const recovered = recoverLatestCloudRun(generationRuns.data)
    if (!recovered || recoveredCloudRunRef.current === recovered.run.id) return
    recoveredCloudRunRef.current = recovered.run.id
    replacePack(recovered.pack)
    hydrateFoundationSession(recovered.pack.meta.id)
    setTopic(recovered.pack.meta.topic || '')
    setNotes(recovered.pack.meta.notes || '')
    recover(recovered.run)
    toast.message('Recovered an interrupted generation run.', { description: 'Completed artifacts were restored. Restart any cancelled stage when ready.' })
  }, [cloudSyncActive, generationRuns.data, isRunning, projectId, recover, run, workspaceId])

  function startGeneration(tasks: GenerationTask[]) {
    if (!ready || isRunning || !tasks.length) return
    if (groundingStatus === 'review-required') toast.warning('Foundation review is incomplete.', { description: 'Downstream generation will use the current notes only; the AI draft has not been accepted.' })
    else if (groundingStatus === 'stale') toast.warning('Foundation context is stale.', { description: 'Downstream generation will use the current notes, but review or regenerate the foundation before relying on it.' })
    applyPackAction({ type: 'set-meta', topic, notes })
    setActivePart(tasks[0].partKey)
    setActiveStage(tasks[0].stage)
    toast.message(`Generation started: ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} queued.`, { description: tasks.length === 1 ? tasks[0].label : `${tasks[0].label} is first in the queue.` })
    void start(tasks)
  }

  function generate(stage = activeStage) { startGeneration([createGenerationTask(getPart(packRef.current, activePart), stage)]) }

  async function generateFoundation() {
    if (!ready || foundationStatus === 'generating') return
    const controller = new AbortController()
    foundationControllerRef.current = controller
    setFoundationStatus('generating')
    setFoundationError('')
    setFoundationWarnings([])
    setFoundationDraftEdited(false)
    setFoundationDecision('review')
    const config = loadAiConfig()
    try {
      const result = await generateFoundationReference({ topic, notes, rulesVersion: packRef.current.meta.rulesVersion, campaign: packRef.current.campaign, config, signal: controller.signal })
      setFoundationDraft(result.foundation)
      setFoundationWarnings(result.warnings)
      setFoundationProvenance(result.provenance)
      setFoundationStatus(result.warnings.length ? 'warning' : 'success')
      toast.message(result.warnings.length ? 'Foundation draft needs review.' : 'Foundation draft ready for review.', { description: 'Nothing replaced your existing notes.' })
    } catch (error) {
      if (controller.signal.aborted) {
        setFoundationStatus('cancelled')
        toast.message('Foundation draft cancelled.', { description: 'Your existing notes and any previous draft remain available.' })
      } else {
        const message = foundationFailureMessage(error)
        setFoundationError(message)
        setFoundationStatus('error')
        toast.error('Foundation draft unavailable.', { description: message })
      }
    } finally {
      if (foundationControllerRef.current === controller) foundationControllerRef.current = null
    }
  }

  function cancelFoundation() {
    foundationControllerRef.current?.abort()
  }

  function updateFoundationText(field: 'workingAngle' | 'audienceProblem' | 'intendedPromise', value: string) {
    setFoundationDraft((current) => current ? { ...current, [field]: value } : current)
    setFoundationDraftEdited(true)
    setFoundationDecision('review')
  }

  function updateFoundationList(field: 'keyPoints' | 'evidenceToCollect' | 'sourcesToCheck' | 'termsToDefine' | 'openQuestions' | 'verificationReminders', value: string) {
    setFoundationDraft((current) => current ? { ...current, [field]: value.split('\n').map((item) => item.trim()).filter(Boolean) } : current)
    setFoundationDraftEdited(true)
    setFoundationDecision('review')
  }

  function decideFoundation(action: 'keep' | 'append' | 'replace' | 'discard') {
    if (!foundationDraft) return
    if (action === 'keep') {
      setFoundationDecision('kept')
      toast.message('Existing notes kept.', { description: 'The AI draft remains available for comparison and was not added to your notes.' })
    } else if (action === 'append') {
      const nextNotes = notes.trim() ? `${notes.trim()}\n\n${foundationToNotes(foundationDraft)}` : foundationToNotes(foundationDraft)
      setNotes(nextNotes)
      applyPackAction({ type: 'set-meta', topic, notes: nextNotes })
      setAcceptedFoundationSnapshot(groundingSnapshotKey(topic, nextNotes))
      setFoundationDecision('appended')
      toast.success('Foundation draft appended.', { description: 'Review the combined notes before generating content.' })
    } else if (action === 'replace') {
      const nextNotes = foundationToNotes(foundationDraft)
      setNotes(nextNotes)
      applyPackAction({ type: 'set-meta', topic, notes: nextNotes })
      setAcceptedFoundationSnapshot(groundingSnapshotKey(topic, nextNotes))
      setFoundationDecision('replaced')
      toast.success('Foundation notes replaced.', { description: 'The previous notes are not lost from this screen until you save or navigate away.' })
    } else {
      setFoundationDraft(null)
      setFoundationWarnings([])
      setFoundationProvenance(null)
      setFoundationDraftEdited(false)
      setFoundationDecision('discarded')
      toast.message('AI foundation draft discarded.', { description: 'Your existing notes remain unchanged.' })
    }
  }

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
    if (cloudSyncActive && workspaceId && projectId) {
      try {
        const savedVersion = await saveCloudPack.mutateAsync({ workspaceId, projectId, packData: nextPack as unknown as Record<string, unknown>, expectedRevision: cloudRevision })
        setCloudRevision(savedVersion.revision)
        await trpcUtils.workspace.listPackVersions.invalidate({ workspaceId, projectId })
        toast.success(`Saved as version ${savedVersion.revision}`, { description: 'A local backup was also kept in this browser.' })
      } catch (error) {
        if (typeof error === 'object' && error && 'data' in error && (error as { data?: { code?: string } }).data?.code === 'CONFLICT') {
          const refreshed = await trpcUtils.workspace.getProject.fetch({ workspaceId, projectId })
          setCloudRevision(refreshed?.revision || cloudRevision)
          toast.error('Cloud version conflict', { description: 'Your local pack is safe. Refresh or merge the newer cloud version before retrying this save.' })
        } else toast.error('Saved locally only', { description: error instanceof Error ? error.message : 'Cloud sync is unavailable. Retry when the workspace reconnects.' })
      }
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  async function handleRestoreVersion(versionId: string) {
    if (!workspaceId || !projectId) return
    try {
      const restored = await restoreCloudVersion.mutateAsync({ workspaceId, projectId, versionId, expectedRevision: cloudRevision })
      const restoredPack = restored.packData as unknown as CombinedPack
      setCloudRevision(restored.revision)
      replacePack(restoredPack)
      hydrateFoundationSession(restoredPack.meta.id)
      setTopic(restoredPack.meta.topic || '')
      setNotes(restoredPack.meta.notes || '')
      saveCombinedPack(restoredPack)
      await Promise.all([
        trpcUtils.workspace.getProject.invalidate({ workspaceId, projectId }),
        trpcUtils.workspace.listPackVersions.invalidate({ workspaceId, projectId }),
      ])
      toast.success(`Restored version ${restored.revision}`, { description: 'The restored pack is protected as a new cloud revision.' })
    } catch (error) {
      if (typeof error === 'object' && error && 'data' in error && (error as { data?: { code?: string } }).data?.code === 'CONFLICT') toast.error('Restore conflict', { description: 'A newer cloud revision exists. Refresh the project history and choose the restore action again.' })
      else toast.error('Unable to restore this version.', { description: error instanceof Error ? error.message : 'Retry when the workspace reconnects.' })
    }
  }

  function exportPack() {
    const blob = new Blob([packToMarkdown({ ...pack, meta: { ...pack.meta, topic, notes } })], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(topic || 'albadry-content-pack').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`; anchor.click(); URL.revokeObjectURL(url)
  }

  const generationProfile = loadAiConfig()
  const configuredProvider = PROVIDER_CATALOG.find((provider) => provider.id === generationProfile.providerId)
  const providerReady = Boolean(configuredProvider && configuredProvider.mode === generationProfile.providerMode)
  const foundationProviderLabel = !providerReady ? 'Provider not connected · choose a supported provider in Settings' : generationProfile.providerMode === 'local' ? 'Local provider · stays on this device' : 'Known provider · routed through the server proxy'
  const foundationStatusLabel = foundationStatus === 'generating' ? 'Generating a draft…' : foundationDraftEdited ? 'Edited draft · review required' : foundationStatus === 'success' ? 'AI draft · review required' : foundationStatus === 'warning' ? 'AI draft · warnings to review' : foundationStatus === 'cancelled' ? 'Draft generation cancelled' : foundationStatus === 'error' ? 'Draft generation failed' : 'Ready when you choose to generate'
  const foundationReviewWarnings = useMemo(() => foundationDraft ? [...new Set([...foundationWarnings, ...foundationGroundingWarnings(foundationDraft)])] : foundationWarnings, [foundationDraft, foundationWarnings])
  const foundationDecisionLabel = foundationDecision === 'kept' ? 'Existing notes kept' : foundationDecision === 'appended' ? 'Draft appended to notes' : foundationDecision === 'replaced' ? 'Notes replaced with draft' : foundationDecision === 'discarded' ? 'Draft discarded' : 'Review required before acceptance'
  const groundingStatus: GroundingStatus = useMemo(() => {
    if (!notes.trim()) return foundationDraft ? 'review-required' : 'none'
    if (foundationDecision === 'review') return foundationDraft ? 'review-required' : 'user-notes'
    if (foundationDecision === 'appended' || foundationDecision === 'replaced') return acceptedFoundationSnapshot === groundingSnapshotKey(topic, notes) ? 'accepted-ai' : 'stale'
    return 'user-notes'
  }, [acceptedFoundationSnapshot, foundationDecision, foundationDraft, notes, topic])
  const groundingStatusLabel = groundingStatus === 'accepted-ai' ? 'AI foundation accepted' : groundingStatus === 'stale' ? 'Foundation stale · review required' : groundingStatus === 'review-required' ? 'Foundation draft · review required' : groundingStatus === 'user-notes' ? 'Creator notes · usable context' : 'No foundation notes yet'
  const groundingStatusNote = groundingStatus === 'accepted-ai' ? 'Downstream generation will use the accepted notes captured at the last review.' : groundingStatus === 'stale' ? 'The topic or notes changed after acceptance. Review or regenerate before relying on this context.' : groundingStatus === 'review-required' ? 'Review the draft and choose an explicit decision before treating it as accepted context.' : groundingStatus === 'user-notes' ? 'Downstream generation can use these notes, but you remain responsible for checking every claim.' : 'Add notes or generate an AI foundation draft before building the content pack.'
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1'
  return <div className="page page-generator">
    <div className="page-heading generator-heading"><div><span className="section-index">04 / PRODUCTION DESK</span><h1>Build the pack.</h1><p>Start with a topic. The system keeps the brief, the output, and the hand-off connected.</p></div><div className="generator-stamp"><span className="status-dot" /> {cloudSyncActive ? 'CLOUD PROJECT ACTIVE' : 'LOCAL-FIRST MODE'}<br /><small>{cloudSyncActive ? 'LOCAL BACKUP ENABLED' : 'NO CLOUD UPLOADS'}</small></div></div>
    {demoMode && <aside className="demo-banner" aria-label="Public demo campaign"><div><span className="section-index">PUBLIC DEMO</span><strong>Explore without an AI account</strong><p>This campaign is preloaded with a long-form topic, two pre-launch shorts, and five post-launch shorts. No provider request is made until you choose to generate.</p></div><Link href="/" className="text-link">Back to dashboard</Link></aside>}
    <GenerationProgressHeader summary={packProgress} run={run} onContinue={continueRecommended} />
    <section className={`campaign-review-panel ${review.ready ? 'ready' : 'needs-review'}`} aria-live="polite"><div><span className="section-index">REVIEW GATE</span><strong>{review.ready ? 'Ready for creator review' : 'Review before publishing'}</strong><small>{review.errors} blocking · {review.warnings} warnings · {review.info} open steps</small></div><div className="campaign-review-issues">{review.issues.filter((item) => item.severity !== 'info').slice(0, 3).map((item) => <span key={item.id} className={`review-chip ${item.severity}`}>{item.message}</span>)}</div></section>
    <ProjectHistoryPanel cloudActive={cloudSyncActive} versions={packVersions.data || []} runs={generationRuns.data || []} loading={packVersions.isLoading || generationRuns.isLoading} restoringVersionId={restoreCloudVersion.isPending ? restoreCloudVersion.variables?.versionId || null : null} onRestore={handleRestoreVersion} />
    <div className="generator-grid">
      <section className="compose-panel panel-surface"><div className="panel-title"><span className="section-index">01 / COMPOSE</span><span className="source-tape">DRAFT / {mode.toUpperCase()}</span></div><div className="generation-profile-chip"><span className="status-dot" /> {generationProfile.scriptLanguage || 'Language not selected'} · {generationProfile.textDirection.toUpperCase()}<small>{generationProfile.brandPhrases.trim() ? 'Brand voice enabled' : 'No brand phrases'}</small></div><div className="mode-switch" role="tablist" aria-label="Generation mode">{(['long', 'short', 'combined'] as const).map((value) => <button key={value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} role="tab" aria-selected={mode === value}>{value === 'combined' ? '⚡ Campaign' : value === 'long' ? '🎬 Long-form' : '📱 Shorts'}</button>)}</div><label htmlFor="topic">Video topic <span>required</span></label><input id="topic" dir="auto" className="topic-input" value={topic} onChange={(event) => { setTopic(event.target.value); applyPackAction({ type: 'set-meta', topic: event.target.value, notes }) }} placeholder="e.g. D365 Plugin Pipeline Execution Stages" /><p className="field-hint">A clear topic gives the model a sharper field breakdown.</p><div className="notes-label"><label htmlFor="notes">Foundation / reference</label><span>{countWords(notes)} words</span></div><textarea id="notes" dir={generationProfile.textDirection} value={notes} onChange={(event) => { setNotes(event.target.value); applyPackAction({ type: 'set-meta', topic, notes: event.target.value }) }} placeholder="Add an angle, audience, claims, examples, sources, constraints, or open questions…" rows={8} /><div className={`grounding-note grounding-${groundingStatus}`} role="status"><CircleAlert size={15} /><span><b>{groundingStatusLabel}</b> {groundingStatusNote}</span>{groundingStatus === 'stale' && foundationDraft && <button className="text-button" onClick={() => { setFoundationDecision('review'); setFoundationDraftEdited(false) }}>Review foundation</button>}</div><section className={`foundation-action-card foundation-${foundationStatus}`} aria-labelledby="foundation-action-title" aria-live="polite"><div className="foundation-action-header"><div><span className="section-index">AI FOUNDATION DRAFT</span><h2 id="foundation-action-title">Build the grounding plan.</h2><p>Ask the configured provider to turn your topic, notes, and campaign shape into an editable planning draft. It will not replace your notes in this batch.</p></div><span className="foundation-status-label">{foundationStatusLabel}</span></div><small className="foundation-provider-note">{foundationProviderLabel}. Nothing is sent until you choose this action. {!providerReady && <Link href="/settings" className="text-link">Open AI settings</Link>}</small><div className="foundation-action-row"><button className="button button-primary" onClick={() => void generateFoundation()} disabled={!ready || !providerReady || foundationStatus === 'generating'}>{foundationStatus === 'generating' ? <><Loader2 className="spin" size={16} /> Generating foundation draft…</> : <><Sparkles size={16} /> Generate foundation draft</>}</button>{foundationStatus === 'generating' && <button className="button button-quiet" onClick={cancelFoundation}>Cancel draft</button>}</div>{foundationStatus === 'error' && <div className="foundation-error" role="alert"><p>{foundationError}</p><button className="button button-quiet" onClick={() => void generateFoundation()} disabled={!providerReady}><Sparkles size={14} /> Retry foundation draft</button></div>}{foundationStatus === 'cancelled' && <p className="foundation-feedback">Draft generation stopped. Your existing notes remain unchanged.</p>}{foundationReviewWarnings.length > 0 && <div className="foundation-warning" role="status"><b>Review warnings</b>{foundationReviewWarnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}{foundationDraft && <details className="foundation-draft-preview" open><summary>Review foundation draft<small>{foundationProvenance ? `${foundationProvenance.source.toUpperCase()} · ${foundationProvenance.providerMode}` : 'Review required'} · {foundationDecisionLabel}</small></summary><div className="foundation-preview-grid"><label className="foundation-edit-field"><span>Working angle</span><textarea dir={generationProfile.textDirection} value={foundationDraft.workingAngle} onChange={(event) => updateFoundationText('workingAngle', event.target.value)} rows={3} /></label><label className="foundation-edit-field"><span>Audience problem</span><textarea dir={generationProfile.textDirection} value={foundationDraft.audienceProblem} onChange={(event) => updateFoundationText('audienceProblem', event.target.value)} rows={3} /></label><label className="foundation-edit-field"><span>Intended promise</span><textarea dir={generationProfile.textDirection} value={foundationDraft.intendedPromise} onChange={(event) => updateFoundationText('intendedPromise', event.target.value)} rows={3} /></label><label className="foundation-edit-field"><span>Key points · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.keyPoints.join('\n')} onChange={(event) => updateFoundationList('keyPoints', event.target.value)} rows={4} /></label><label className="foundation-edit-field"><span>Evidence to collect · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.evidenceToCollect.join('\n')} onChange={(event) => updateFoundationList('evidenceToCollect', event.target.value)} rows={4} /></label><label className="foundation-edit-field"><span>Sources to check · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.sourcesToCheck.join('\n')} onChange={(event) => updateFoundationList('sourcesToCheck', event.target.value)} rows={4} /></label><label className="foundation-edit-field"><span>Terms to define · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.termsToDefine.join('\n')} onChange={(event) => updateFoundationList('termsToDefine', event.target.value)} rows={4} /></label><label className="foundation-edit-field"><span>Open questions · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.openQuestions.join('\n')} onChange={(event) => updateFoundationList('openQuestions', event.target.value)} rows={4} /></label><label className="foundation-edit-field"><span>Verification reminders · one per line</span><textarea dir={generationProfile.textDirection} value={foundationDraft.verificationReminders.join('\n')} onChange={(event) => updateFoundationList('verificationReminders', event.target.value)} rows={4} /></label></div><div className="foundation-review-actions" aria-label="Foundation review actions"><span className="foundation-review-hint">{foundationDecisionLabel}. Choose an explicit action after reviewing the draft.</span><button className="button button-quiet" onClick={() => decideFoundation('keep')}>Keep existing notes</button><button className="button button-quiet" onClick={() => decideFoundation('append')}>Append to notes</button><button className="button button-primary" onClick={() => decideFoundation('replace')}>Replace notes</button><button className="button button-quiet" onClick={() => decideFoundation('discard')}>Discard draft</button></div><small className="foundation-preview-note"><CircleAlert size={14} /> {foundationDraftEdited ? 'You edited this draft locally. Review the changed sections and warnings before accepting it.' : 'This AI draft is editable planning material, not verified research. Keep your existing notes, append this draft, replace them explicitly, or discard it.'}</small></details>}</section><section className="campaign-scope-card" aria-labelledby="campaign-scope-title"><div className="campaign-scope-header"><div><span className="section-index">CAMPAIGN SCOPE</span><h2 id="campaign-scope-title">Shape the campaign.</h2><strong>1 long-form · {pack.campaign.preLaunchCount} before · {pack.campaign.postLaunchCount} after</strong><small>Shorts are labelled by publication phase so teasers stay before the main video and standalone extensions stay after it.</small></div><span className="campaign-scope-count">{pack.campaign.platforms.length} platforms</span></div><details className="campaign-scope-group" open><summary>Editing defaults<small>Simple CapCut montage · DaVinci Resolve correction</small></summary><div className="campaign-selects"><label>Montage tool<select value={pack.campaign.montageTool} onChange={(event) => applyPackAction({ type: 'update-campaign', campaign: { montageTool: event.target.value === 'generic' ? 'generic' : 'capcut' } })}><option value="capcut">CapCut · simple montage</option><option value="generic">Generic · simple editing</option></select></label><label>Coloring tool<select value={pack.campaign.coloringTool} onChange={(event) => applyPackAction({ type: 'update-campaign', campaign: { coloringTool: event.target.value === 'generic' ? 'generic' : 'davinci-resolve' } })}><option value="davinci-resolve">DaVinci Resolve · simple correction</option><option value="generic">Generic · simple correction</option></select></label></div></details><details className="campaign-scope-group" open><summary>Short timeline<small>{pack.campaign.preLaunchCount} before · {pack.campaign.postLaunchCount} after</small></summary><div className="campaign-counts"><label>Pre-launch shorts<select value={pack.campaign.preLaunchCount} onChange={(event) => applyPackAction({ type: 'update-campaign', campaign: { preLaunchCount: Number(event.target.value) } })}>{Array.from({ length: 7 }, (_, count) => <option key={count} value={count}>{count}</option>)}</select></label><label>Post-launch shorts<select value={pack.campaign.postLaunchCount} onChange={(event) => applyPackAction({ type: 'update-campaign', campaign: { postLaunchCount: Number(event.target.value) } })}>{Array.from({ length: 7 }, (_, count) => <option key={count} value={count}>{count}</option>)}</select></label></div></details><details className="campaign-scope-group"><summary>Short objectives<small>Before and after publication roles</small></summary><div className="campaign-objectives"><div>{pack.campaign.preLaunchObjectives.map((objective, index) => <label key={`pre-${index}`}>Before #{index + 1}<select value={objective} onChange={(event) => { const objectives = [...pack.campaign.preLaunchObjectives]; objectives[index] = event.target.value as ShortObjective; applyPackAction({ type: 'update-campaign', campaign: { preLaunchObjectives: objectives } }) }}>{SHORT_OBJECTIVES.map((item) => <option key={item} value={item}>{objectiveLabel(item)}</option>)}</select></label>)}</div><div>{pack.campaign.postLaunchObjectives.map((objective, index) => <label key={`post-${index}`}>After #{index + 1}<select value={objective} onChange={(event) => { const objectives = [...pack.campaign.postLaunchObjectives]; objectives[index] = event.target.value as ShortObjective; applyPackAction({ type: 'update-campaign', campaign: { postLaunchObjectives: objectives } }) }}>{SHORT_OBJECTIVES.map((item) => <option key={item} value={item}>{objectiveLabel(item)}</option>)}</select></label>)}</div></div></details><details className="campaign-scope-group" open><summary>Platforms<small>{pack.campaign.platforms.length} selected</small></summary><fieldset className="campaign-platforms"><legend><span>Adapt the campaign for each selected channel.</span><small>Native checkboxes · {pack.campaign.platforms.length} selected</small></legend><div className="campaign-platform-grid">{SUPPORTED_PLATFORMS.map((platform) => { const selected = pack.campaign.platforms.includes(platform); return <label key={platform} className={`platform-option ${selected ? 'selected' : ''}`}><input type="checkbox" aria-label={platformLabels[platform]} checked={selected} onChange={() => applyPackAction({ type: 'update-campaign', campaign: { platforms: selected ? pack.campaign.platforms.filter((item) => item !== platform) : [...pack.campaign.platforms, platform] } })} /><span className="platform-option-copy"><b>{platformLabels[platform]}</b><small>{selected ? 'Included in campaign' : 'Available for adaptation'}</small></span><span className="platform-option-state" aria-hidden="true">{selected ? <Check size={14} /> : '+'}</span></label> })}</div></fieldset></details></section><div className="compose-button-row"><button className="button button-primary full-button" onClick={() => generateForMode('fields')} disabled={!ready || isRunning}>{isRunning ? <><Loader2 className="spin" size={16} /> Generating queued briefs…</> : <><Sparkles size={16} /> {mode === 'combined' ? `Generate ${pack.parts.length} campaign assets` : mode === 'short' ? `Generate ${pack.parts.length - 1} shorts` : 'Generate long-form brief'}</>}</button>{isRunning && <button className="button button-quiet cancel-button" onClick={cancelGeneration}>Cancel run</button>}</div><div className="sr-only" aria-live="polite">{isRunning ? `Generating ${activeStage} for ${part.label}` : `${part.label} ${part.stageStatus[activeStage]}`}</div></section>
      <section className="workbench-panel"><div className="stage-rail"><div className="stage-rail-top"><span className="section-index">02 / PIPELINE</span><span className="pipeline-progress">{packProgress.completedSteps}/{packProgress.totalSteps} ready</span></div><div className="stage-track"><span style={{ width: `${Math.max(7, Math.round((packProgress.completedSteps / packProgress.totalSteps) * 100))}%` }} /></div>{stages.map((stage, index) => { const stageProgress = getStageProgress(part, stage.id, run); const done = stageProgress.status === 'ready-to-review' || stageProgress.status === 'review-required'; const active = activeStage === stage.id; return <button className={`stage-item ${active ? 'active' : ''} ${done ? 'done' : ''} ${stageProgress.status}`} key={stage.id} onClick={() => setActiveStage(stage.id)} aria-pressed={active}><span className="stage-number">{done ? <Check size={13} /> : `0${index + 1}`}</span><span><b>{stage.label}</b><small>{stageProgress.label} · {stage.detail}</small></span></button> })}</div><div className="stage-context" aria-live="polite"><span className="section-index">EDITING / {part.label.toUpperCase()} · {activeStage.toUpperCase()}</span><b>{selectedStageProgress.label}</b><p>{selectedStageProgress.detail}</p>{selectedStageProgress.status === 'blocked' ? <button className="button button-quiet" onClick={() => setActiveStage(activeStage === 'script' ? 'fields' : 'script')}>Open prerequisite</button> : <button className="button button-quiet" onClick={() => generateForMode(activeStage)} disabled={!ready || isRunning || activeModeStageCount === 0}><Sparkles size={14} /> {activeModeStageCount > 1 ? `Generate ${activeStage} for ${activeModeStageCount} deliverables` : selectedStageProgress.status === 'ready-to-review' ? 'Regenerate this stage' : `Generate ${activeStage}`}</button>}</div><GenerationRunPanel run={run} onCancel={cancelGeneration} onRetry={retryTask} /><div className="part-tabs" role="tablist" aria-label="Content deliverables">{pack.parts.map((item) => { const complete = stages.filter((stage) => item.stageStatus[stage.id] === 'done').length; const slot = item.key === 'long' ? null : shortSlotDescription(Number(item.key.replace('short-', '')), pack.campaign); return <button key={item.key} className={activePart === item.key ? 'selected' : ''} onClick={() => setActivePart(item.key)} role="tab" aria-selected={activePart === item.key}><span>{item.key === 'long' ? 'Long-form' : item.key.replace('short-', 'Short #')}</span><small>{slot ? slot.label : 'Main video'} · {complete}/4</small></button> })}</div>
<ArtifactEditor pack={pack} part={part} activeStage={activeStage} running={isRunning} textDirection={generationProfile.textDirection} onAction={applyPackAction} onGenerate={() => generate(activeStage)} onExport={exportPack} /><div className="workbench-footer"><button className="text-button" onClick={handleSave}><Save size={15} /> {saved ? 'Saved locally' : 'Save combined pack'}</button><span><span className="status-dot" /> {packProgress.completedSteps}/{packProgress.totalSteps} production steps ready</span></div></section>
    </div>
  </div>
}
