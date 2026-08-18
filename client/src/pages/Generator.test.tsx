// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCombinedPack } from '../lib/pack-domain'

vi.mock('wouter', async () => {
  const actual = await vi.importActual<typeof import('wouter')>('wouter')
  return { ...actual, useLocation: () => [window.location.pathname + window.location.search] }
})

const mocks = vi.hoisted(() => ({
  runs: [] as Array<Record<string, unknown>>,
  versions: [] as Array<Record<string, unknown>>,
  saveRun: vi.fn().mockResolvedValue({ ok: true }),
  restoreVersion: vi.fn(),
  toastMessage: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: true,
  getProjectQuery: vi.fn(() => ({ data: null })),
  packVersionsQuery: vi.fn(() => ({ data: mocks.versions, isLoading: false })),
  generationRunsQuery: vi.fn(() => ({ data: mocks.runs, isLoading: false })),
  generateFoundationReference: vi.fn(),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    workspace: {
      getProject: { useQuery: mocks.getProjectQuery },
      savePack: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      listPackVersions: { useQuery: mocks.packVersionsQuery },
      listGenerationRuns: { useQuery: mocks.generationRunsQuery },
      saveGenerationRun: { useMutation: () => ({ mutateAsync: mocks.saveRun }) },
      restorePackVersion: { useMutation: () => ({ mutateAsync: mocks.restoreVersion, isPending: false, variables: undefined }) },
    },
    useUtils: () => ({ workspace: { listGenerationRuns: { invalidate: mocks.invalidate }, listPackVersions: { invalidate: mocks.invalidate }, getProject: { invalidate: mocks.invalidate } } }),
  },
}))

vi.mock('../contexts/WorkspaceContext', () => ({ useWorkspaceSelection: () => ({ workspaceId: 'ws_history', projectId: 'prj_history' }) }))
vi.mock('@/_core/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: mocks.isAuthenticated }) }))
vi.mock('sonner', () => ({ toast: { message: mocks.toastMessage, success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('../components/ArtifactEditor', () => ({ default: () => <div data-testid="artifact-editor" /> }))
vi.mock('../components/GenerationProgressHeader', () => ({ default: () => <div data-testid="progress-header" /> }))
vi.mock('../components/GenerationRunPanel', () => ({ default: ({ run }: { run: { status?: string; tasks?: unknown[] } | null }) => <div data-testid="run-state">{run ? `${run.status}:${run.tasks?.length}` : 'none'}</div> }))
vi.mock('../lib/generation-service', async () => {
  const actual = await vi.importActual<typeof import('../lib/generation-service')>('../lib/generation-service')
  return { ...actual, generateFoundationReference: mocks.generateFoundationReference }
})

import Generator from './Generator'

describe('Generator cloud reload recovery', () => {
  afterEach(() => { cleanup(); window.history.pushState({}, '', '/'); mocks.runs = []; mocks.versions = []; mocks.isAuthenticated = true; vi.clearAllMocks() })

  it('restores a persisted running cloud snapshot and surfaces resumable cancelled tasks', async () => {
    const pack = createCombinedPack('Reloaded cloud pack')
    mocks.runs = [{ id: 'run-reload', status: 'running', packData: pack, tasks: [{ id: 'long:fields', partKey: 'long', stage: 'fields', label: 'Long-form · fields', outcome: 'running' }, { id: 'short-1:fields', partKey: 'short-1', stage: 'fields', label: 'Short #1 · fields', outcome: 'queued' }], startedAt: new Date(100), finishedAt: null }]

    render(<Generator />)

    await waitFor(() => expect(screen.getByTestId('run-state').textContent).toBe('cancelled:2'))
    expect((screen.getByLabelText(/Video topic/i) as HTMLInputElement).value).toBe('Reloaded cloud pack')
    expect(mocks.saveRun).toHaveBeenCalledWith(expect.objectContaining({ run: expect.objectContaining({ id: 'run-reload', status: 'cancelled' }) }))
    expect(mocks.toastMessage).toHaveBeenCalledWith('Recovered an interrupted generation run.', expect.any(Object))
  })

  it('renders cloud versions and runs in the production desk and restores a selected version', async () => {
    const restoredPack = createCombinedPack('Restored from history')
    mocks.versions = [{ id: 'ver_1', revision: 1, source: 'manual_save', createdAt: new Date(100), authorName: 'Creator' }]
    mocks.runs = [{ id: 'run_1', status: 'partial', tasks: [], packData: null, startedAt: new Date(100), finishedAt: new Date(120), authorName: 'Creator' }]
    mocks.restoreVersion.mockResolvedValue({ id: 'ver_2', revision: 2, packData: restoredPack })

    render(<Generator />)

    expect(await screen.findByText('v1 · Saved snapshot')).toBeTruthy()
    expect(screen.getByText('Needs recovery · 0 tasks')).toBeTruthy()
    screen.getByRole('button', { name: /Restore/i }).click()
    await waitFor(() => expect(mocks.restoreVersion).toHaveBeenCalledWith({ workspaceId: 'ws_history', projectId: 'prj_history', versionId: 'ver_1', expectedRevision: 0 }))
    await waitFor(() => expect((screen.getByLabelText(/Video topic/i) as HTMLInputElement).value).toBe('Restored from history'))
  })

  it('shows public demo guidance without requiring a provider account', () => {
    mocks.isAuthenticated = false
    window.history.pushState({}, '', '/generator?demo=1')

    render(<Generator />)

    expect(screen.getByRole('complementary', { name: 'Public demo campaign' })).toBeTruthy()
    expect(screen.getByText('Explore without an AI account')).toBeTruthy()
    expect((screen.getByLabelText(/Video topic/i) as HTMLInputElement).value).toBe('How to turn one long video into a useful short-form campaign')
    expect(screen.getByRole('heading', { name: 'Shape the campaign.' })).toBeTruthy()
    expect(screen.getByText('Editing defaults')).toBeTruthy()
    expect(screen.getByText('Short timeline')).toBeTruthy()
    expect(screen.getByText('Short objectives')).toBeTruthy()
    expect(screen.getByText('Platforms')).toBeTruthy()
    expect(screen.getByText('4 platforms')).toBeTruthy()
  })

  it('requires an explicit action before requesting a foundation draft and shows the review preview', async () => {
    mocks.isAuthenticated = false
    window.localStorage.setItem('albadry_ai_config_v2', JSON.stringify({ providerMode: 'local', providerId: 'openai-compatible-local', model: 'local-model' }))
    mocks.generateFoundationReference.mockResolvedValue({ foundation: { workingAngle: 'A practical creator workflow', audienceProblem: 'Creators need a clear repeatable plan.', intendedPromise: 'Leave with a usable planning method.', keyPoints: ['Start with the audience problem.'], evidenceToCollect: ['A real workflow example.'], sourcesToCheck: ['[source to verify]'], termsToDefine: ['Foundation notes'], openQuestions: ['Which constraint matters most?'], verificationReminders: ['Verify every specific claim before publishing.'] }, warnings: [], truncated: false, provenance: { providerId: 'openai-compatible-local', providerMode: 'local', model: 'local-model', source: 'ai', generatedAt: new Date().toISOString() } })
    window.history.pushState({}, '', '/generator?demo=1')

    render(<Generator />)

    expect(mocks.generateFoundationReference).not.toHaveBeenCalled()
    expect(screen.getByText(/Local provider · stays on this device/)).toBeTruthy()
    screen.getByRole('button', { name: 'Generate foundation draft' }).click()
    await waitFor(() => expect(mocks.generateFoundationReference).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('AI draft · review required')).toBeTruthy()
    expect(screen.getByText('Review foundation draft')).toBeTruthy()
    expect(screen.getByText('A practical creator workflow')).toBeTruthy()
  })

  it('marks accepted foundation context as stale when the topic changes', async () => {
    mocks.isAuthenticated = false
    window.localStorage.setItem('albadry_ai_config_v2', JSON.stringify({ providerMode: 'local', providerId: 'openai-compatible-local', model: 'local-model' }))
    mocks.generateFoundationReference.mockResolvedValue({ foundation: { workingAngle: 'A practical creator workflow', audienceProblem: 'Creators need a clear repeatable plan.', intendedPromise: 'Leave with a usable planning method.', keyPoints: ['Start with the audience problem.'], evidenceToCollect: ['A real workflow example.'], sourcesToCheck: ['[source to verify]'], termsToDefine: ['Foundation notes'], openQuestions: ['Which constraint matters most?'], verificationReminders: ['Verify every specific claim before publishing.'] }, warnings: [], truncated: false, provenance: { providerId: 'openai-compatible-local', providerMode: 'local', model: 'local-model', source: 'ai', generatedAt: new Date().toISOString() } })
    window.history.pushState({}, '', '/generator?demo=1')

    render(<Generator />)

    screen.getByRole('button', { name: 'Generate foundation draft' }).click()
    await waitFor(() => expect(mocks.generateFoundationReference).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByRole('textbox', { name: 'Key points · one per line' }), { target: { value: 'First point\nSecond point' } })
    expect((screen.getByRole('textbox', { name: 'Key points · one per line' }) as HTMLTextAreaElement).value).toBe('First point\nSecond point')
    screen.getByRole('button', { name: 'Append to notes' }).click()
    expect(await screen.findByText('AI foundation accepted')).toBeTruthy()
    expect((screen.getByLabelText('Foundation / reference') as HTMLTextAreaElement).value).toContain('\n\n## AI foundation draft')

    fireEvent.change(screen.getByLabelText(/Video topic/i), { target: { value: 'A changed campaign topic' } })
    expect(screen.getByText('Foundation stale · review required')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Review foundation' })).toBeTruthy()
  })

  it('shows a safe provider-not-connected state for an unsupported provider selection', () => {
    mocks.isAuthenticated = false
    window.localStorage.setItem('albadry_ai_config_v2', JSON.stringify({ providerMode: 'known-provider', providerId: 'unsupported-provider', model: 'secret-model' }))
    window.history.pushState({}, '', '/generator?demo=1')

    render(<Generator />)

    expect(screen.getByText(/Provider not connected · choose a supported provider in Settings/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open AI settings' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Generate foundation draft' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('sanitizes foundation failures and exposes a retry action', async () => {
    mocks.isAuthenticated = false
    window.localStorage.setItem('albadry_ai_config_v2', JSON.stringify({ providerMode: 'local', providerId: 'openai-compatible-local', model: 'local-model' }))
    mocks.generateFoundationReference.mockRejectedValue(new Error('https://secret.example/api?apiKey=do-not-show'))
    window.history.pushState({}, '', '/generator?demo=1')

    render(<Generator />)

    screen.getByRole('button', { name: 'Generate foundation draft' }).click()
    expect(await screen.findByText('Foundation generation failed. Check the configured provider in Settings and retry.')).toBeTruthy()
    expect(screen.queryByText(/secret\.example|do-not-show/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Retry foundation draft' })).toBeTruthy()
  })

  it('stays local-first when a stale cloud selection exists without an authenticated session', () => {
    mocks.isAuthenticated = false

    render(<Generator />)

    expect(screen.getByText('LOCAL-FIRST MODE')).toBeTruthy()
    expect(mocks.getProjectQuery).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ enabled: false }))
    expect(mocks.packVersionsQuery).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ enabled: false }))
    expect(mocks.generationRunsQuery).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ enabled: false }))
  })
})
