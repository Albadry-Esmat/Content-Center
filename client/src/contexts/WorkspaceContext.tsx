// SaaS boundary: the active workspace and project are client preferences; authorization remains server-side.

import { createContext, useContext, useEffect, useState } from 'react'

type WorkspaceSelection = {
  workspaceId: string | null
  projectId: string | null
  setWorkspaceId: (workspaceId: string | null) => void
  setProjectId: (projectId: string | null) => void
}

const WorkspaceContext = createContext<WorkspaceSelection | undefined>(undefined)
const STORAGE_KEY = 'albadry_workspace_selection_v1'

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as Partial<{ workspaceId: string; projectId: string }>
      setWorkspaceId(stored.workspaceId || null)
      setProjectId(stored.projectId || null)
    } catch { /* Selection is optional; local mode remains available. */ }
  }, [])

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ workspaceId, projectId })) } catch { /* Storage is non-critical. */ }
  }, [workspaceId, projectId])

  return <WorkspaceContext.Provider value={{ workspaceId, projectId, setWorkspaceId, setProjectId }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspaceSelection() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspaceSelection must be used within WorkspaceProvider')
  return context
}
