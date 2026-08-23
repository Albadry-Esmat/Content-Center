// Design philosophy: every creator gets a useful desk immediately; cloud sync enriches rather than gates that local workflow.

import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Cloud, FolderPlus, HardDrive, Library, Loader2, LogIn, Plus, UsersRound } from 'lucide-react'
import { useLocation } from 'wouter'
import { toast } from 'sonner'
import { startLogin } from '@/const'
import { useAuth } from '@/_core/hooks/useAuth'
import { trpc } from '@/lib/trpc'
import { loadCombinedPacks, selectLocalPack } from '../lib/content-storage'
import type { CombinedPack } from '../lib/pack-domain'
import { useWorkspaceSelection } from '../contexts/WorkspaceContext'

function CloudSignInButton() {
  return <button className="button button-quiet" onClick={() => {
    const result = startLogin()
    if (!result.configured) toast.message('Cloud sync is optional.', { description: `To enable it later, configure ${result.missing.join(' and ')} in .env and restart the app.` })
  }}><Cloud size={15} /> Enable cloud sync</button>
}

function LocalWorkspace({ onCreate, onLibrary, onOpenPack }: { onCreate: () => void; onLibrary: () => void; onOpenPack: (pack: CombinedPack) => void }) {
  const [packs, setPacks] = useState<CombinedPack[]>([])

  useEffect(() => { setPacks(loadCombinedPacks()) }, [])

  const recentPacks = packs.slice(0, 3)
  return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">LOCAL / CREATOR WORKSPACE</span><span>THIS BROWSER · PRIVATE BY DEFAULT · CLOUD SYNC OPTIONAL</span></div><div className="page-heading workspace-heading"><div><span className="section-index">07 / LOCAL WORKSPACE</span><h1>Your production desk.</h1><p>Create, edit, and export content packs in this browser. Nothing requires an account to get started.</p></div><div className="workspace-badge local-workspace-badge"><HardDrive size={17} /><span>Local-first<small>Stored in this browser</small></span></div></div><div className="workspace-grid local-workspace-grid"><section className="panel-surface workspace-create"><div className="panel-title"><span className="section-index">NEW LOCAL PACK</span><Plus size={17} /></div><h2>Start with a topic.</h2><p>Build a six-part content pack, save it locally, and return whenever you are ready. Your cloud account is never required for this workflow.</p><button className="button button-primary full-button" onClick={onCreate}><Plus size={15} /> Create local content pack</button><span className="workspace-local-note"><HardDrive size={14} /> Pack data stays in this browser until you export or opt into sync.</span></section><section className="panel-surface workspace-projects"><div className="panel-title"><span className="section-index">RECENT LOCAL PACKS</span><span className="source-tape">{packs.length} SAVED</span></div>{recentPacks.length ? <div className="workspace-project-list">{recentPacks.map(pack => <button key={pack.meta.id} className="workspace-project" onClick={() => onOpenPack(pack)}><span><b>{pack.meta.topic || 'Untitled content pack'}</b><small>Updated {new Date(pack.meta.updatedAt).toLocaleDateString()}</small></span><ArrowUpRight size={16} /></button>)}<button className="button button-quiet local-library-button" onClick={onLibrary}><Library size={15} /> Open local library</button></div> : <div className="workspace-message"><Library size={18} /><span><b>No local packs yet.</b><small>Your saved packs will appear here. Create one now; no sign-in or server setup is needed.</small></span></div>}</section></div><section className="panel-surface workspace-sync-option"><div><span className="section-index">OPTIONAL / CLOUD SYNC</span><h2>Sync only when it helps.</h2><p>Use the local desk as long as you like. Sign in later if you want shared projects, cloud history, or review collaboration across devices.</p></div><CloudSignInButton /></section></div>
}

export default function Workspace() {
  const [, setLocation] = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { workspaceId, projectId, setWorkspaceId, setProjectId } = useWorkspaceSelection()
  const [projectTitle, setProjectTitle] = useState('')
  const bootstrap = trpc.workspace.bootstrap.useQuery(undefined, { enabled: Boolean(user?.id), retry: false, refetchOnWindowFocus: false })
  const activeWorkspaceId = workspaceId || bootstrap.data?.defaultWorkspace.id || null
  const projects = trpc.workspace.listProjects.useQuery({ workspaceId: activeWorkspaceId || 'pending' }, { enabled: Boolean(isAuthenticated && activeWorkspaceId) })
  const utils = trpc.useUtils()
  const createProject = trpc.workspace.createProject.useMutation({
    onSuccess: async project => {
      setProjectId(project.id)
      setProjectTitle('')
      await utils.workspace.listProjects.invalidate({ workspaceId: project.workspaceId })
      toast.success('Cloud project created', { description: 'The generator will now save this pack to the selected workspace project.' })
      setLocation('/generator')
    },
    onError: error => toast.error('Could not create the project', { description: error.message }),
  })

  useEffect(() => {
    if (!workspaceId && bootstrap.data?.defaultWorkspace.id) setWorkspaceId(bootstrap.data.defaultWorkspace.id)
  }, [bootstrap.data?.defaultWorkspace.id, setWorkspaceId, workspaceId])

  if (!isAuthenticated || !user) return <LocalWorkspace onCreate={() => setLocation('/generator')} onLibrary={() => setLocation('/saved')} onOpenPack={(pack) => { selectLocalPack(pack); setLocation('/generator') }} />
  if (bootstrap.isLoading || bootstrap.isPending) return <div className="page workspace-page"><div className="workspace-loading"><Loader2 className="spin" size={20} /> Loading cloud workspace…</div></div>
  if (bootstrap.isError) return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">CLOUD / WORKSPACE CONTROL</span><span>RECOVERY / LOCAL-FIRST AVAILABLE</span></div><section className="workspace-empty"><Cloud size={28} /><span className="section-index">CLOUD WORKSPACE TEMPORARILY UNAVAILABLE</span><h1>Your local desk is still ready.</h1><p>Cloud projects could not load, but your browser workspace remains fully available while the connection recovers.</p><div className="workspace-recovery-actions"><button className="button button-primary" onClick={() => bootstrap.refetch()}><Loader2 className={bootstrap.isFetching ? 'spin' : ''} size={16} /> Retry cloud connection</button><button className="button button-quiet" onClick={() => setLocation('/generator')}>Use local creator desk</button></div></section></div>

  const selectedWorkspace = bootstrap.data?.workspaces.find(item => item.id === activeWorkspaceId)
  return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">CLOUD / WORKSPACE CONTROL</span><span>MEMBERSHIP / {selectedWorkspace?.role?.toUpperCase() || 'OWNER'} · CLOUD PROJECTS / {projects.data?.length || 0}</span></div><div className="page-heading workspace-heading"><div><span className="section-index">07 / CLOUD WORKSPACE</span><h1>{selectedWorkspace?.name || 'My workspace'}.</h1><p>Cloud projects add shared history and collaboration; local-first mode remains available whenever you need it.</p></div><div className="workspace-badge"><UsersRound size={17} /><span>{selectedWorkspace?.role || 'owner'}<small>Current workspace role</small></span></div></div><div className="workspace-grid"><section className="panel-surface workspace-create"><div className="panel-title"><span className="section-index">NEW CLOUD PROJECT</span><FolderPlus size={17} /></div><h2>Start from a topic.</h2><p>Each cloud project carries its pack, review state, and export history. You can still create a local-only pack from the generator.</p><label htmlFor="project-title">Project title</label><input id="project-title" value={projectTitle} onChange={event => setProjectTitle(event.target.value)} placeholder="e.g. D365 Plugin Pipeline" maxLength={180} /><button className="button button-primary full-button" disabled={projectTitle.trim().length < 3 || createProject.isPending || !activeWorkspaceId} onClick={() => activeWorkspaceId && createProject.mutate({ workspaceId: activeWorkspaceId, title: projectTitle.trim() })}>{createProject.isPending ? <><Loader2 className="spin" size={15} /> Creating project…</> : <><FolderPlus size={15} /> Create cloud project</>}</button><span className="workspace-local-note"><HardDrive size={14} /> Prefer this browser? The generator continues to save locally.</span></section><section className="panel-surface workspace-projects"><div className="panel-title"><span className="section-index">CLOUD PROJECT LIBRARY</span><span className="source-tape">{projects.data?.length || 0} ACTIVE</span></div>{projects.isError ? <div className="workspace-message error">Cloud projects are temporarily unavailable. You can continue in local mode and retry later.</div> : projects.isLoading ? <div className="workspace-loading"><Loader2 className="spin" size={18} /> Fetching projects…</div> : projects.data?.length ? <div className="workspace-project-list">{projects.data.map(project => <button key={project.id} className={`workspace-project ${projectId === project.id ? 'selected' : ''}`} onClick={() => { setProjectId(project.id); setLocation('/generator') }}><span><b>{project.title}</b><small>Updated {new Date(project.updatedAt).toLocaleDateString()}</small></span><ArrowUpRight size={16} /></button>)}</div> : <div className="workspace-message"><Cloud size={18} /><span><b>No cloud projects yet.</b><small>Create one to save packs across browsers and prepare for team review.</small></span></div>}</section></div></div>
}
