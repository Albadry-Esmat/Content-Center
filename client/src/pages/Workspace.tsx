// Design philosophy: Editorial Control Room — the SaaS layer keeps projects, membership, and cloud state visible without obscuring the craft desk.

import { useEffect, useState } from 'react'
import { ArrowUpRight, Cloud, FolderPlus, Loader2, LogIn, UsersRound } from 'lucide-react'
import { useLocation } from 'wouter'
import { toast } from 'sonner'
import { startLogin } from '@/const'
import { useAuth } from '@/_core/hooks/useAuth'
import { trpc } from '@/lib/trpc'
import { useWorkspaceSelection } from '../contexts/WorkspaceContext'

export default function Workspace() {
  const [, setLocation] = useLocation()
  const { user, loading, isAuthenticated } = useAuth()
  const { workspaceId, projectId, setWorkspaceId, setProjectId } = useWorkspaceSelection()
  const [projectTitle, setProjectTitle] = useState('')
  const bootstrap = trpc.workspace.bootstrap.useQuery(undefined, { enabled: Boolean(user?.id), retry: false, refetchOnWindowFocus: false })
  const activeWorkspaceId = workspaceId || bootstrap.data?.defaultWorkspace.id || null
  const projects = trpc.workspace.listProjects.useQuery({ workspaceId: activeWorkspaceId || 'pending' }, { enabled: Boolean(activeWorkspaceId) })
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

  if (loading) return <div className="page workspace-page"><div className="workspace-loading"><Loader2 className="spin" size={20} /> Loading workspace desk…</div></div>
  if (!isAuthenticated || !user) return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">SAAS / PERSONAL WORKSPACE</span><span>PROJECTS · CLOUD SYNC · LOCAL MODE</span></div><section className="workspace-empty"><Cloud size={28} /><span className="section-index">YOUR CONTENT, ON ANY DESK</span><h1>Create a workspace.</h1><p>Sign in to save production packs as cloud projects, return from another device, and prepare for review collaboration. The existing local-first generator stays available if you prefer not to sign in.</p><button className="button button-primary" onClick={() => startLogin()}><LogIn size={16} /> Sign in to create workspace</button></section></div>
  if (bootstrap.isLoading || bootstrap.isPending) return <div className="page workspace-page"><div className="workspace-loading"><Loader2 className="spin" size={20} /> Loading workspace desk…</div></div>
  if (bootstrap.isError) return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">SAAS / WORKSPACE CONTROL</span><span>RECOVERY / CLOUD PROJECTS</span></div><section className="workspace-empty"><Cloud size={28} /><span className="section-index">WORKSPACE TEMPORARILY UNAVAILABLE</span><h1>Keep working locally.</h1><p>We could not load your cloud workspace. Your generator and local library remain available while the connection recovers.</p><button className="button button-primary" onClick={() => bootstrap.refetch()}><Loader2 className={bootstrap.isFetching ? 'spin' : ''} size={16} /> Retry workspace connection</button></section></div>

  const selectedWorkspace = bootstrap.data?.workspaces.find(item => item.id === activeWorkspaceId)
  return <div className="page workspace-page"><div className="source-strip"><span className="source-tape">SAAS / WORKSPACE CONTROL</span><span>MEMBERSHIP / {selectedWorkspace?.role?.toUpperCase() || 'OWNER'} · CLOUD PROJECTS / {projects.data?.length || 0}</span></div><div className="page-heading workspace-heading"><div><span className="section-index">07 / CLOUD WORKSPACE</span><h1>{selectedWorkspace?.name || 'My workspace'}.</h1><p>Projects are private to this workspace. Local-first mode remains available whenever you need it.</p></div><div className="workspace-badge"><UsersRound size={17} /><span>{selectedWorkspace?.role || 'owner'}<small>Current workspace role</small></span></div></div><div className="workspace-grid"><section className="panel-surface workspace-create"><div className="panel-title"><span className="section-index">NEW PROJECT</span><FolderPlus size={17} /></div><h2>Start from a topic.</h2><p>Each cloud project carries its pack, review state, and export history. You can still create a local-only pack from the generator.</p><label htmlFor="project-title">Project title</label><input id="project-title" value={projectTitle} onChange={event => setProjectTitle(event.target.value)} placeholder="e.g. D365 Plugin Pipeline" maxLength={180} /><button className="button button-primary full-button" disabled={projectTitle.trim().length < 3 || createProject.isPending || !activeWorkspaceId} onClick={() => activeWorkspaceId && createProject.mutate({ workspaceId: activeWorkspaceId, title: projectTitle.trim() })}>{createProject.isPending ? <><Loader2 className="spin" size={15} /> Creating project…</> : <><FolderPlus size={15} /> Create cloud project</>}</button><span className="workspace-local-note"><Cloud size={14} /> No project selected? The generator continues to save locally.</span></section><section className="panel-surface workspace-projects"><div className="panel-title"><span className="section-index">PROJECT LIBRARY</span><span className="source-tape">{projects.data?.length || 0} ACTIVE</span></div>{projects.isError ? <div className="workspace-message error">Cloud projects are temporarily unavailable. You can continue in local mode and retry later.</div> : projects.isLoading ? <div className="workspace-loading"><Loader2 className="spin" size={18} /> Fetching projects…</div> : projects.data?.length ? <div className="workspace-project-list">{projects.data.map(project => <button key={project.id} className={`workspace-project ${projectId === project.id ? 'selected' : ''}`} onClick={() => { setProjectId(project.id); setLocation('/generator') }}><span><b>{project.title}</b><small>Updated {new Date(project.updatedAt).toLocaleDateString()}</small></span><ArrowUpRight size={16} /></button>)}</div> : <div className="workspace-message"><Cloud size={18} /><span><b>No cloud projects yet.</b><small>Create a project to save packs across browsers and prepare for team review.</small></span></div>}</section></div></div>
}
