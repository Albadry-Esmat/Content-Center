// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCombinedPack } from '../lib/pack-domain'

const mocks = vi.hoisted(() => ({
  setLocation: vi.fn(),
  startLogin: vi.fn(() => ({ configured: false as const, missing: ['VITE_OAUTH_PORTAL_URL', 'VITE_APP_ID'] })),
  toastMessage: vi.fn(),
}))

vi.mock('wouter', () => ({ useLocation: () => ['/', mocks.setLocation] }))
vi.mock('sonner', () => ({ toast: { message: mocks.toastMessage, success: vi.fn(), error: vi.fn() } }))
vi.mock('@/const', () => ({ startLogin: mocks.startLogin }))
vi.mock('@/_core/hooks/useAuth', () => ({ useAuth: () => ({ user: null, isAuthenticated: false, loading: false }) }))
vi.mock('@/lib/trpc', () => ({
  trpc: {
    workspace: {
      bootstrap: { useQuery: () => ({ data: null, isLoading: false, isPending: false, isError: false }) },
      listProjects: { useQuery: () => ({ data: [], isLoading: false, isError: false }) },
      createProject: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
    useUtils: () => ({ workspace: { listProjects: { invalidate: vi.fn() } } }),
  },
}))
vi.mock('../contexts/WorkspaceContext', () => ({ useWorkspaceSelection: () => ({ workspaceId: null, projectId: null, setWorkspaceId: vi.fn(), setProjectId: vi.fn() }) }))

import Workspace from './Workspace'

describe('local-first workspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('albadry_combined_packs_v2', JSON.stringify([createCombinedPack('Local workspace pack')]))
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('opens a useful local project desk without OAuth configuration', () => {
    render(<Workspace />)

    expect(screen.getByRole('heading', { name: 'Your production desk.' })).toBeTruthy()
    expect(screen.getByText('Local workspace pack')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Create local content pack/i }))
    expect(mocks.setLocation).toHaveBeenCalledWith('/generator')
  })

  it('presents cloud sync as an optional enhancement instead of blocking the workspace', () => {
    render(<Workspace />)

    fireEvent.click(screen.getByRole('button', { name: /Enable cloud sync/i }))
    expect(mocks.startLogin).toHaveBeenCalledOnce()
    expect(mocks.toastMessage).toHaveBeenCalledWith('Cloud sync is optional.', expect.objectContaining({ description: expect.stringContaining('VITE_OAUTH_PORTAL_URL') }))
  })
})
