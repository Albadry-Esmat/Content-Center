import { CircleAlert, CircleCheck, Clock3, Loader2, Sparkles, TriangleAlert } from 'lucide-react'
import type { GenerationRun, PackProgressSummary } from '../lib/generation-progress'

export default function GenerationProgressHeader({ summary, run, onContinue }: { summary: PackProgressSummary; run: GenerationRun | null; onContinue: () => void }) {
  const percentage = summary.totalSteps ? Math.round((summary.completedSteps / summary.totalSteps) * 100) : 0
  const activeTask = run?.tasks.find((task) => task.outcome === 'running')
  const nextTask = run?.tasks.find((task) => task.outcome === 'queued')
  const hasAttention = summary.failed > 0 || summary.reviewRequired > 0
  return <section className="pack-progress" aria-label="Pack production progress" aria-live="polite">
    <div className="pack-progress-heading"><div><span className="section-index">PACK STATUS</span><strong>{summary.completedSteps} of {summary.totalSteps} production steps ready</strong></div><span className={`pack-progress-state ${run?.status === 'running' ? 'running' : hasAttention ? 'attention' : 'ready'}`}>{run?.status === 'running' ? <><Loader2 className="spin" size={14} /> {activeTask?.label || 'Preparing queue'}</> : hasAttention ? <><TriangleAlert size={14} /> {summary.reviewRequired + summary.failed} need review</> : <><CircleCheck size={14} /> Ready to continue</>}</span></div>
    <div className="pack-progress-track" aria-hidden="true"><span style={{ width: `${Math.max(3, percentage)}%` }} /></div>
    <div className="pack-progress-meta"><span><CircleCheck size={13} /> {summary.completedSteps} ready</span><span><Loader2 size={13} /> {summary.running} active · {summary.queued} queued</span><span><Clock3 size={13} /> {summary.blocked} blocked</span>{hasAttention && <span><CircleAlert size={13} /> {summary.reviewRequired} review · {summary.failed} retry</span>}<button className="text-button" onClick={onContinue} disabled={run?.status === 'running'}><Sparkles size={14} /> {nextTask ? `Continue ${nextTask.label}` : 'Start next recommended step'}</button></div>
  </section>
}
