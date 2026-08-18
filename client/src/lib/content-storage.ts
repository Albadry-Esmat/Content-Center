// Design philosophy: Editorial Control Room — browser persistence is explicit, versioned, and recoverable.

import type { ContentPack } from './content-types'
import { normalizeCampaignConfig, type CampaignConfig } from './campaign-config'
import { normalizeCombinedPack, type CombinedPack } from './pack-domain'
import { deleteFoundationSession, loadFoundationSessions, normalizeFoundationSession, saveFoundationSession, type FoundationSession } from './foundation-session'

const PACKS_KEY = 'albadry_content_packs_v1'
const COMBINED_PACKS_KEY = 'albadry_combined_packs_v2'

export type ImportResult = { packs: CombinedPack[]; rejected: number; foundationSessions: FoundationSession[]; error?: string }
export type BackupEnvelope = { format: 'content-center-backup'; version: 1; exportedAt: string; packs: CombinedPack[]; foundationSessions?: FoundationSession[] }

export function serializeCombinedPacks(packs: CombinedPack[], foundationSessions: FoundationSession[] = []): string {
  const envelope: BackupEnvelope = { format: 'content-center-backup', version: 1, exportedAt: new Date().toISOString(), packs }
  if (foundationSessions.length) envelope.foundationSessions = foundationSessions
  return JSON.stringify(envelope) satisfies string
}

export function deserializeFoundationSessions(raw: string): FoundationSession[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const records = parsed && typeof parsed === 'object' && 'foundationSessions' in parsed && Array.isArray((parsed as { foundationSessions?: unknown }).foundationSessions) ? (parsed as { foundationSessions: unknown[] }).foundationSessions : []
    return records.map(normalizeFoundationSession).filter((session): session is FoundationSession => Boolean(session))
  } catch { return [] }
}

export function deserializeCombinedPacks(raw: string): CombinedPack[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const records = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' && 'packs' in parsed && Array.isArray((parsed as { packs?: unknown }).packs) ? (parsed as { packs: unknown[] }).packs : null
    if (!records) return []
    return records
      .map((pack) => normalizeCombinedPack(pack))
      .filter((pack): pack is CombinedPack => Boolean(pack))
  } catch { return [] }
}

export function exportCombinedPacksJson(): string { return serializeCombinedPacks(loadCombinedPacks(), loadFoundationSessions()) }

export function importCombinedPacksJson(raw: string): ImportResult {
  try {
    const parsed = JSON.parse(raw) as unknown
    const records = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' && 'packs' in parsed && Array.isArray((parsed as { packs?: unknown }).packs) ? (parsed as { packs: unknown[] }).packs : null
    if (!records) return { packs: [], rejected: 0, foundationSessions: [], error: 'Backup must contain a Content Center backup envelope or a JSON array of combined packs.' }
    const valid = records.map((pack) => normalizeCombinedPack(pack)).filter((pack): pack is CombinedPack => Boolean(pack && pack.schemaVersion === 2 && pack.meta?.id))
    const rejected = records.length - valid.length
    const candidateSessions = parsed && typeof parsed === 'object' && 'foundationSessions' in parsed && Array.isArray((parsed as { foundationSessions?: unknown }).foundationSessions) ? (parsed as { foundationSessions: unknown[] }).foundationSessions.map(normalizeFoundationSession).filter((session): session is FoundationSession => Boolean(session)) : []
    const merged = [...valid, ...loadCombinedPacks().filter((existing) => !valid.some((pack) => pack.meta.id === existing.meta.id))].slice(0, 50)
    const validPackIds = new Set(merged.map((pack) => pack.meta.id))
    const importedSessions = candidateSessions.filter((session) => validPackIds.has(session.packId))
    importedSessions.forEach(saveFoundationSession)
    const foundationSessions = loadFoundationSessions().filter((session) => validPackIds.has(session.packId))
    window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(merged, foundationSessions))
    return { packs: merged, rejected, foundationSessions }
  } catch (error) { return { packs: [], rejected: 0, foundationSessions: [], error: error instanceof Error ? error.message : 'Could not read this backup.' } }
}

export function loadPacks(): ContentPack[] {
  if (typeof window === 'undefined') return []
  try { const raw = window.localStorage.getItem(PACKS_KEY); const parsed = raw ? JSON.parse(raw) as ContentPack[] : []; return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}

export function savePack(pack: ContentPack): ContentPack[] {
  const next = [pack, ...loadPacks().filter((item) => item.meta.createdAt !== pack.meta.createdAt)]
  try { window.localStorage.setItem(PACKS_KEY, JSON.stringify(next.slice(0, 50))) } catch { /* UI remains usable when storage is unavailable. */ }
  return next
}

export function deletePack(createdAt: string): ContentPack[] {
  const next = loadPacks().filter((pack) => pack.meta.createdAt !== createdAt)
  try { window.localStorage.setItem(PACKS_KEY, JSON.stringify(next)) } catch { /* no-op */ }
  return next
}

export function loadCombinedPacks(): CombinedPack[] {
  if (typeof window === 'undefined') return []
  try { const raw = window.localStorage.getItem(COMBINED_PACKS_KEY); return raw ? deserializeCombinedPacks(raw) : [] } catch { return [] }
}

export function saveCombinedPack(pack: CombinedPack): CombinedPack[] {
  const next = [pack, ...loadCombinedPacks().filter((item) => item.meta.id !== pack.meta.id)].slice(0, 50)
  try { window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(next, loadFoundationSessions())) } catch { /* UI remains usable when storage is unavailable. */ }
  return next
}

export function deleteCombinedPack(id: string): CombinedPack[] {
  const next = loadCombinedPacks().filter((pack) => pack.meta.id !== id)
  deleteFoundationSession(id)
  try { window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(next)) } catch { /* no-op */ }
  return next
}

export function migrateLegacyPacks(): { migrated: number; packs: CombinedPack[] } {
  if (typeof window === 'undefined') return { migrated: 0, packs: [] }
  try {
    const raw = window.localStorage.getItem(PACKS_KEY)
    if (!raw || loadCombinedPacks().length) return { migrated: 0, packs: loadCombinedPacks() }
    const legacy = JSON.parse(raw) as Array<{ meta?: { topic?: string; notes?: string; createdAt?: string }; fields?: { title?: string; promise?: string } }>
    const migrated = legacy.filter(Boolean).map((item, index) => ({ schemaVersion: 2 as const, packVersion: 2 as const, meta: { id: `legacy-${item.meta?.createdAt || index}`, topic: item.meta?.topic || '', notes: item.meta?.notes || '', createdAt: item.meta?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), rulesVersion: 'v3.2', model: 'Legacy import' }, campaign: normalizeCampaignConfig({}) as CampaignConfig, parts: [{ key: 'long' as const, label: 'Long-form', stageStatus: { fields: 'done' as const, script: 'idle' as const, montage: 'idle' as const, grade: 'idle' as const }, fields: { title: item.fields?.title || '', promise: item.fields?.promise || '', audience: '', hook: '', story: '', insight: '', proof: '', payoff: '', cta: '' } }, ...(['short-1', 'short-2', 'short-3', 'short-4', 'short-5', 'short-6', 'short-7'] as const).map((key) => ({ key, label: `Short ${key.replace('short-', '#')}`, stageStatus: { fields: 'idle' as const, script: 'idle' as const, montage: 'idle' as const, grade: 'idle' as const } }))], runSheet: [] }))
    if (migrated.length) window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(migrated))
    return { migrated: migrated.length, packs: migrated }
  } catch { return { migrated: 0, packs: [] } }
}
