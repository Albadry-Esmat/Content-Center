import React from 'react'
import { Clock3, History, RotateCcw, Save, Server, TriangleAlert } from 'lucide-react'

type PackVersion = { id: string; revision: number; source: 'manual_save' | 'restore' | 'run_completion'; createdAt: Date; authorName: string | null }
type ProjectRun = { id: string; status: 'running' | 'complete' | 'partial' | 'cancelled'; tasks: Record<string, unknown>[]; startedAt: Date; finishedAt: Date | null; authorName: string | null }

function sourceLabel(source: PackVersion['source']) {
  if (source === 'restore') return 'Restored snapshot'
  if (source === 'run_completion') return 'Run checkpoint'
  return 'Saved snapshot'
}

function runLabel(status: ProjectRun['status']) {
  if (status === 'partial') return 'Needs recovery'
  if (status === 'cancelled') return 'Paused'
  if (status === 'running') return 'In progress'
  return 'Complete'
}

function timeLabel(value: Date) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }

export default function ProjectHistoryPanel({ cloudActive, versions, runs, loading, restoringVersionId, onRestore }: { cloudActive: boolean; versions: PackVersion[]; runs: ProjectRun[]; loading: boolean; restoringVersionId: string | null; onRestore: (versionId: string) => void }) {
  if (!cloudActive) return <aside className="project-history-panel local-history"><div><span className="section-index">PROJECT HISTORY</span><h2>Local-first mode</h2><p>Runs and revisions stay in this browser until you select a cloud project.</p></div><Server size={20} /></aside>
  return <aside className="project-history-panel" aria-label="Project history"><div className="history-heading"><div><span className="section-index">PROJECT HISTORY</span><h2>Runs and revisions</h2></div><History size={18} /></div>{loading ? <p className="history-empty">Loading cloud history…</p> : <div className="history-columns"><section><div className="history-subheading"><Save size={13} /> <b>Pack versions</b></div>{versions.length ? <ol className="history-list">{versions.slice(0, 5).map((version) => <li key={version.id}><span><b>v{version.revision} · {sourceLabel(version.source)}</b><small>{timeLabel(version.createdAt)} · {version.authorName || 'Workspace member'}</small></span><button className="text-button" onClick={() => onRestore(version.id)} disabled={Boolean(restoringVersionId)}>{restoringVersionId === version.id ? 'Restoring…' : <><RotateCcw size={13} /> Restore</>}</button></li>)}</ol> : <p className="history-empty">Save a pack to create the first restore point.</p>}</section><section><div className="history-subheading"><Clock3 size={13} /> <b>Recent runs</b></div>{runs.length ? <ol className="history-list">{runs.slice(0, 5).map((run) => <li key={run.id} className={run.status === 'partial' ? 'attention' : ''}><span><b>{runLabel(run.status)} · {run.tasks.length} tasks</b><small>{timeLabel(run.startedAt)} · {run.authorName || 'Workspace member'}</small></span>{run.status === 'partial' && <TriangleAlert size={14} />}</li>)}</ol> : <p className="history-empty">Generation runs will appear here when started.</p>}</section></div>}</aside>
}
