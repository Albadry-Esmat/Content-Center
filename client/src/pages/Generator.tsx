// Design philosophy: Editorial Control Room — the generator is a calm production desk with visible state and recovery paths.

import { useMemo, useState } from 'react'
import { Check, ChevronDown, CircleAlert, Download, FileText, Loader2, Plus, Save, Sparkles } from 'lucide-react'
import { createCombinedPack, getPart, packReducer, type CombinedPack, type FieldSet, type PartKey } from '../lib/pack-domain'
import type { GenerationStage } from '../lib/content-types'
import { saveCombinedPack } from '../lib/content-storage'
import { packToMarkdown } from '../lib/pack-export'
import { countWords } from '../lib/validators'

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

export default function Generator() {
  const [mode, setMode] = useState<'long' | 'short' | 'combined'>('combined')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [pack, setPack] = useState<CombinedPack>(() => createCombinedPack())
  const [activeStage, setActiveStage] = useState<GenerationStage>('fields')
  const [activePart, setActivePart] = useState<PartKey>('long')
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const ready = topic.trim().length > 2
  const part = getPart(pack, activePart)
  const progress = useMemo(() => stages.findIndex((stage) => stage.id === activeStage) * 25, [activeStage])

  function generate(stage = activeStage) {
    if (!ready || running) return
    setRunning(true)
    setPack((current) => packReducer(current, { type: 'set-meta', topic, notes }))
    window.setTimeout(() => {
      setPack((current) => simulateStage(current, stage, activePart))
      setRunning(false)
      const next = stages[stages.findIndex((item) => item.id === stage) + 1]
      if (next) setActiveStage(next.id)
    }, 520)
  }

  function handleSave() {
    saveCombinedPack({ ...pack, meta: { ...pack.meta, topic, notes, updatedAt: new Date().toISOString() } })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function exportPack() {
    const blob = new Blob([packToMarkdown({ ...pack, meta: { ...pack.meta, topic, notes } })], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(topic || 'albadry-content-pack').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="page page-generator">
    <div className="page-heading generator-heading"><div><span className="section-index">04 / PRODUCTION DESK</span><h1>Build the pack.</h1><p>Start with a topic. The system keeps the brief, the output, and the hand-off connected.</p></div><div className="generator-stamp"><span className="status-dot" /> NO CLOUD UPLOADS<br /><small>LOCAL-FIRST WORKFLOW</small></div></div>
    <div className="generator-grid">
      <section className="compose-panel panel-surface"><div className="panel-title"><span className="section-index">01 / COMPOSE</span><span className="source-tape">DRAFT / {mode.toUpperCase()}</span></div><div className="mode-switch" role="tablist" aria-label="Generation mode">{(['long', 'short', 'combined'] as const).map((value) => <button key={value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} role="tab" aria-selected={mode === value}>{value === 'combined' ? '⚡ Combined' : value === 'long' ? '🎬 Long-form' : '📱 Short / Reel'}</button>)}</div><label htmlFor="topic">Video topic <span>required</span></label><input id="topic" className="topic-input" value={topic} onChange={(event) => { setTopic(event.target.value); setPack((current) => packReducer(current, { type: 'set-meta', topic: event.target.value, notes })) }} placeholder="e.g. D365 Plugin Pipeline Execution Stages" /><p className="field-hint">A clear topic gives the model a sharper field breakdown.</p><div className="notes-label"><label htmlFor="notes">Foundation / reference</label><span>{countWords(notes)} words</span></div><textarea id="notes" value={notes} onChange={(event) => { setNotes(event.target.value); setPack((current) => packReducer(current, { type: 'set-meta', topic, notes: event.target.value })) }} placeholder="Paste build notes, a rough draft, or the claims the script must stay true to…" rows={8} /><div className="grounding-note"><CircleAlert size={15} /><span>Grounding is a review aid. Claims still need your judgment before recording.</span></div><button className="button button-primary full-button" onClick={() => generate('fields')} disabled={!ready || running}>{running ? <><Loader2 className="spin" size={16} /> Shaping the brief…</> : <><Sparkles size={16} /> Generate fields</>}</button></section>
      <section className="workbench-panel"><div className="stage-rail"><div className="stage-rail-top"><span className="section-index">02 / PIPELINE</span><span className="pipeline-progress">{progress}% mapped</span></div><div className="stage-track"><span style={{ width: `${Math.max(7, progress)}%` }} /></div>{stages.map((stage, index) => { const done = part.stageStatus[stage.id] === 'done'; const active = activeStage === stage.id; return <button className={`stage-item ${active ? 'active' : ''} ${done ? 'done' : ''}`} key={stage.id} onClick={() => setActiveStage(stage.id)}><span className="stage-number">{done ? <Check size={13} /> : `0${index + 1}`}</span><span><b>{stage.label}</b><small>{stage.detail}</small></span><ChevronDown size={15} /></button> })}</div><div className="part-tabs">{pack.parts.map((item) => <button key={item.key} className={activePart === item.key ? 'selected' : ''} onClick={() => setActivePart(item.key)}>{item.key === 'long' ? 'Long' : item.key.replace('short-', '#')}</button>)}</div><div className="preview-panel"><div className="preview-toolbar"><span className="section-index">03 / PREVIEW</span><span className="source-tape">{part.label} / {part.stageStatus[activeStage].toUpperCase()}</span></div>{part.fields || part.script || part.montage || part.grade ? <div className="preview-content"><div className="preview-badge"><Check size={14} /> {part.label} / {part.stageStatus[activeStage]}</div><h2>{part.fields?.title || topic || 'Your next technical story'}</h2>{part.fields && <p className="preview-copy">{part.fields.promise}</p>}{part.script && <pre className="script-preview">{part.script.markdown}</pre>}{part.montage && <div className="montage-preview">{part.montage.map((shot) => <div key={`${shot.tStart}-${shot.tEnd}`}><b>{shot.tStart}—{shot.tEnd}</b><span>{shot.shot} / {shot.onScreen}</span></div>)}</div>}{part.grade && <div className="grade-preview"><span>{part.grade.filter} @ {part.grade.intensity}%</span><span>Exposure {part.grade.exposure} · Contrast {part.grade.contrast}</span></div>}<div className="preview-actions"><button className="button button-quiet" onClick={() => generate(activeStage)} disabled={running}><Sparkles size={15} /> {part.stageStatus[activeStage] === 'done' ? 'Regenerate part' : 'Generate stage'}</button><button className="button button-quiet" onClick={exportPack}><Download size={15} /> Export .md</button></div></div> : <div className="empty-preview"><div className="empty-mark"><Plus size={20} /></div><h2>The workbench is ready.</h2><p>Generate fields to turn the topic into an editable brief. Your preview will appear here, stage by stage.</p><span className="empty-rule" /></div>}</div><div className="workbench-footer"><button className="text-button" onClick={handleSave}><Save size={15} /> {saved ? 'Saved locally' : 'Save combined pack'}</button><span><span className="status-dot" /> {pack.parts.filter((item) => item.stageStatus.fields === 'done').length}/6 field parts shaped</span></div></section>
    </div>
  </div>
}
