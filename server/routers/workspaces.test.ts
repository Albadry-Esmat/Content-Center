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

  it('creates an immutable version when saving a project pack', async () => {
    mocks.saveProjectPack.mockResolvedValue({ id: 'ver_3', revision: 3 })
    const packData = { meta: { topic: 'Versioned pack' }, parts: [] }

    await expect(caller().savePack({ workspaceId: 'ws_history', projectId: 'prj_history', packData })).resolves.toEqual({ id: 'ver_3', revision: 3 })
    expect(mocks.saveProjectPack).toHaveBeenCalledWith(7, 'ws_history', 'prj_history', packData)
  })

  it('lists immutable revisions and restores a selected version within the project boundary', async () => {
    mocks.listProjectPackVersions.mockResolvedValue([{ id: 'ver_2', revision: 2, source: 'manual_save' }])
    mocks.restoreProjectPackVersion.mockResolvedValue({ id: 'ver_3', revision: 3, packData: { meta: { topic: 'Restored' }, parts: [] } })

    await expect(caller().listPackVersions({ workspaceId: 'ws_history', projectId: 'prj_history' })).resolves.toEqual([{ id: 'ver_2', revision: 2, source: 'manual_save' }])
    await expect(caller().restorePackVersion({ workspaceId: 'ws_history', projectId: 'prj_history', versionId: 'ver_2' })).resolves.toMatchObject({ revision: 3, packData: { meta: { topic: 'Restored' } } })
    expect(mocks.listProjectPackVersions).toHaveBeenCalledWith(7, 'ws_history', 'prj_history')
    expect(mocks.restoreProjectPackVersion).toHaveBeenCalledWith(7, 'ws_history', 'prj_history', 'ver_2')
  })
})
