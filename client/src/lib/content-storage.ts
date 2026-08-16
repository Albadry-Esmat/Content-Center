// Design philosophy: Editorial Control Room — browser persistence is explicit, versioned, and recoverable.

import type { ContentPack } from './content-types'
import { normalizeCampaignConfig, type CampaignConfig } from './campaign-config'
import { normalizeCombinedPack, type CombinedPack } from './pack-domain'

const PACKS_KEY = 'albadry_content_packs_v1'
const COMBINED_PACKS_KEY = 'albadry_combined_packs_v2'

export type ImportResult = { packs: CombinedPack[]; rejected: number; error?: string }

export function serializeCombinedPacks(packs: CombinedPack[]): string { return JSON.stringify(packs) }

export function deserializeCombinedPacks(raw: string): CombinedPack[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((pack) => normalizeCombinedPack(pack))
      .filter((pack): pack is CombinedPack => Boolean(pack))
  } catch { return [] }
}

export function exportCombinedPacksJson(): string { return serializeCombinedPacks(loadCombinedPacks()) }

export function importCombinedPacksJson(raw: string): ImportResult {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return { packs: [], rejected: 0, error: 'Backup must contain a JSON array of combined packs.' }
    const valid = parsed.filter((pack): pack is CombinedPack => Boolean(pack && typeof pack === 'object' && (pack as CombinedPack).schemaVersion === 2 && (pack as CombinedPack).meta?.id))
    const rejected = parsed.length - valid.length
    const merged = [...valid, ...loadCombinedPacks().filter((existing) => !valid.some((pack) => pack.meta.id === existing.meta.id))].slice(0, 50)
    window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(merged))
    return { packs: merged, rejected }
  } catch (error) { return { packs: [], rejected: 0, error: error instanceof Error ? error.message : 'Could not read this backup.' } }
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
  try { window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(next)) } catch { /* UI remains usable when storage is unavailable. */ }
  return next
}

export function deleteCombinedPack(id: string): CombinedPack[] {
  const next = loadCombinedPacks().filter((pack) => pack.meta.id !== id)
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
