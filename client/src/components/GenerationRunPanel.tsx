import { Check, CircleAlert, Clock3, Loader2, PauseCircle, TriangleAlert, X } from 'lucide-react'
import type { GenerationRun, GenerationTask, GenerationTaskOutcome } from '../lib/generation-progress'

function outcomeIcon(outcome: GenerationTaskOutcome) {
  if (outcome === 'running') return <Loader2 className="spin" size={15} />
  if (outcome === 'succeeded') return <Check size={15} />
  if (outcome === 'warning' || outcome === 'fallback') return <TriangleAlert size={15} />
  if (outcome === 'failed') return <CircleAlert size={15} />
  if (outcome === 'cancelled') return <PauseCircle size={15} />
  return <Clock3 size={15} />
}

function outcomeLabel(outcome: GenerationTaskOutcome) {
  return outcome === 'succeeded' ? 'Ready to review' : outcome === 'warning' ? 'Review required' : outcome === 'fallback' ? 'Local draft fallback' : outcome === 'failed' ? 'Needs attention' : outcome === 'cancelled' ? 'Cancelled' : outcome === 'running' ? 'Generating now' : 'Queued'
}

export default function GenerationRunPanel({ run, onCancel, onRetry }: { run: GenerationRun | null; onCancel: () => void; onRetry: (task: GenerationTask) => void }) {
  if (!run) return <aside className="generation-run-panel idle"><div><span className="section-index">RUN DETAILS</span><h2>No active generation.</h2><p>Select a deliverable and stage to review it. Use a labelled generate action to start work.</p></div></aside>
  const complete = run.tasks.filter((task) => ['succeeded', 'warning', 'fallback'].includes(task.outcome)).length
  return <aside className={`generation-run-panel ${run.status}`} aria-label="Generation run details"><div className="run-panel-heading"><div><span className="section-index">RUN DETAILS</span><h2>{run.status === 'running' ? 'Generation is in progress.' : run.status === 'partial' ? 'Run finished with recovery actions.' : run.status === 'cancelled' ? 'Generation was paused.' : 'Generation run complete.'}</h2><p>{complete} of {run.tasks.length} queued tasks produced an artifact.</p></div>{run.status === 'running' && <button className="icon-button" onClick={onCancel} aria-label="Cancel generation run" title="Cancel generation run"><X size={17} /></button>}</div><ol className="generation-run-list">{run.tasks.map((task) => <li key={task.id} className={`run-task ${task.outcome}`}><span className="run-task-icon">{outcomeIcon(task.outcome)}</span><span><b>{task.label}</b><small>{outcomeLabel(task.outcome)}{task.message ? ` · ${task.message}` : ''}</small>{(task.outcome === 'failed' || task.outcome === 'fallback') && <button className="text-button run-retry" onClick={() => onRetry(task)}><span>Retry this stage</span></button>}</span></li>)}</ol></aside>
}
