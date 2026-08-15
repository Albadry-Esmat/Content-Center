import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  ensurePersonalWorkspace: vi.fn(), listWorkspacesForUser: vi.fn(), listProjectsForWorkspace: vi.fn(), createProjectForWorkspace: vi.fn(), getProjectForWorkspace: vi.fn(), saveProjectPack: vi.fn(), listProjectPackVersions: vi.fn(), restoreProjectPackVersion: vi.fn(), saveProjectGenerationRun: vi.fn(), listProjectGenerationRuns: vi.fn(),
}))

vi.mock('../db', () => mocks)

import { workspaceRouter } from './workspaces'

const caller = () => workspaceRouter.createCaller({ user: { id: 7, name: 'Creator' } } as never)

describe('workspace durable history procedures', () => {
  beforeEach(() => vi.clearAllMocks())

  it('persists a running pack snapshot through the protected generation-run contract', async () => {
    mocks.saveProjectGenerationRun.mockResolvedValue(undefined)
    const result = await caller().saveGenerationRun({ workspaceId: 'ws_history', projectId: 'prj_history', run: { id: 'run-history', status: 'running', tasks: [{ id: 'long:fields', outcome: 'running' }], packData: { meta: {}, parts: [] }, startedAt: 100, finishedAt: null } })

    expect(result).toEqual({ ok: true })
    expect(mocks.saveProjectGenerationRun).toHaveBeenCalledWith(7, 'ws_history', 'prj_history', expect.objectContaining({ status: 'running', packData: { meta: {}, parts: [] }, startedAt: new Date(100), finishedAt: null }))
  })

  it('returns project run records so the client can recover an interrupted cloud session', async () => {
    mocks.listProjectGenerationRuns.mockResolvedValue([{ id: 'run-history', status: 'running', tasks: [], packData: { meta: {}, parts: [] } }])

    await expect(caller().listGenerationRuns({ workspaceId: 'ws_history', projectId: 'prj_history' })).resolves.toEqual([{ id: 'run-history', status: 'running', tasks: [], packData: { meta: {}, parts: [] } }])
    expect(mocks.listProjectGenerationRuns).toHaveBeenCalledWith(7, 'ws_history', 'prj_history')
  })
})
