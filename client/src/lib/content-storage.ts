// Design philosophy: Editorial Control Room — browser persistence is explicit, versioned, and recoverable.

import type { ContentPack } from './content-types'
import type { CombinedPack } from './pack-domain'

const PACKS_KEY = 'albadry_content_packs_v1'

const COMBINED_PACKS_KEY = 'albadry_combined_packs_v2'

export function serializeCombinedPacks(packs: CombinedPack[]): string { return JSON.stringify(packs) }

export function deserializeCombinedPacks(raw: string): CombinedPack[] {
  try {
    const parsed = JSON.parse(raw) as CombinedPack[]
    return Array.isArray(parsed) ? parsed.filter((pack) => pack?.schemaVersion === 2) : []
  } catch { return [] }
}

export function loadPacks(): ContentPack[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PACKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ContentPack[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePack(pack: ContentPack): ContentPack[] {
  const next = [pack, ...loadPacks().filter((item) => item.meta.createdAt !== pack.meta.createdAt)]
  try {
    window.localStorage.setItem(PACKS_KEY, JSON.stringify(next.slice(0, 50)))
  } catch {
    // Quota errors should surface through the UI in the full migration; the MVP stays non-blocking.
  }
  return next
}

export function deletePack(createdAt: string): ContentPack[] {
  const next = loadPacks().filter((pack) => pack.meta.createdAt !== createdAt)
  try {
    window.localStorage.setItem(PACKS_KEY, JSON.stringify(next))
  } catch {
    // Keep the UI usable if storage is unavailable.
  }
  return next
}

export function loadCombinedPacks(): CombinedPack[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(COMBINED_PACKS_KEY)
    return raw ? deserializeCombinedPacks(raw) : []
  } catch { return [] }
}

export function saveCombinedPack(pack: CombinedPack): CombinedPack[] {
  const next = [pack, ...loadCombinedPacks().filter((item) => item.meta.id !== pack.meta.id)].slice(0, 50)
  try { window.localStorage.setItem(COMBINED_PACKS_KEY, serializeCombinedPacks(next)) } catch { /* UI remains usable when storage is unavailable. */ }
  return next
}

export function deleteCombinedPack(id: string): CombinedPack[] {
  const next = loadCombinedPacks().filter((pack) => pack.meta.id !== id)
  try { window.localStorage.setItem(COMBINED_PACKS_KEY, JSON.stringify(next)) } catch { /* no-op */ }
  return next
}
