// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCombinedPack } from '../lib/pack-domain'

const mocks = vi.hoisted(() => ({
  runs: [] as Array<Record<string, unknown>>,
  saveRun: vi.fn().mockResolvedValue({ ok: true }),
  toastMessage: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    workspace: {
      getProject: { useQuery: () => ({ data: null }) },
      savePack: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      listPackVersions: { useQuery: () => ({ data: [], isLoading: false }) },
      listGenerationRuns: { useQuery: () => ({ data: mocks.runs, isLoading: false }) },
      saveGenerationRun: { useMutation: () => ({ mutateAsync: mocks.saveRun }) },
      restorePackVersion: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false, variables: undefined }) },
    },
    useUtils: () => ({ workspace: { listGenerationRuns: { invalidate: mocks.invalidate }, listPackVersions: { invalidate: mocks.invalidate }, getProject: { invalidate: mocks.invalidate } } }),
  },
}))

vi.mock('../contexts/WorkspaceContext', () => ({ useWorkspaceSelection: () => ({ workspaceId: 'ws_history', projectId: 'prj_history' }) }))
vi.mock('sonner', () => ({ toast: { message: mocks.toastMessage, success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('../components/ArtifactEditor', () => ({ default: () => <div data-testid="artifact-editor" /> }))
vi.mock('../components/GenerationProgressHeader', () => ({ default: () => <div data-testid="progress-header" /> }))
vi.mock('../components/GenerationRunPanel', () => ({ default: ({ run }: { run: { status?: string; tasks?: unknown[] } | null }) => <div data-testid="run-state">{run ? `${run.status}:${run.tasks?.length}` : 'none'}</div> }))
vi.mock('../components/ProjectHistoryPanel', () => ({ default: () => <div data-testid="project-history" /> }))

import Generator from './Generator'

describe('Generator cloud reload recovery', () => {
  afterEach(() => { mocks.runs = []; vi.clearAllMocks() })

  it('restores a persisted running cloud snapshot and surfaces resumable cancelled tasks', async () => {
    const pack = createCombinedPack('Reloaded cloud pack')
    mocks.runs = [{ id: 'run-reload', status: 'running', packData: pack, tasks: [{ id: 'long:fields', partKey: 'long', stage: 'fields', label: 'Long-form · fields', outcome: 'running' }, { id: 'short-1:fields', partKey: 'short-1', stage: 'fields', label: 'Short #1 · fields', outcome: 'queued' }], startedAt: new Date(100), finishedAt: null }]

    render(<Generator />)

    await waitFor(() => expect(screen.getByTestId('run-state').textContent).toBe('cancelled:2'))
    expect((screen.getByLabelText(/Video topic/i) as HTMLInputElement).value).toBe('Reloaded cloud pack')
    expect(mocks.saveRun).toHaveBeenCalledWith(expect.objectContaining({ run: expect.objectContaining({ id: 'run-reload', status: 'cancelled' }) }))
    expect(mocks.toastMessage).toHaveBeenCalledWith('Recovered an interrupted generation run.', expect.any(Object))
  })
})
