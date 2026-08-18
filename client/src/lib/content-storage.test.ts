// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { createCombinedPack } from './pack-domain'
import { deserializeCombinedPacks, deserializeFoundationSessions, importCombinedPacksJson, serializeCombinedPacks } from './content-storage'

beforeEach(() => window.localStorage.clear())

const foundationSession = { schemaVersion: 1 as const, packId: 'pack-backup', topicSnapshot: 'Backup topic', notesSnapshot: 'Grounded notes', draft: null, warnings: [], provenance: null, edited: false, decision: 'review' as const, acceptedSnapshot: null, updatedAt: '2026-08-18T00:00:00.000Z' }

describe('combined pack backups', () => {
  it('exports a self-describing backup envelope', () => {
    const pack = createCombinedPack('Backup topic')
    const parsed = JSON.parse(serializeCombinedPacks([pack]))

    expect(parsed).toMatchObject({ format: 'content-center-backup', version: 1, packs: [{ meta: { topic: 'Backup topic' } }] })
    expect(typeof parsed.exportedAt).toBe('string')
  })

  it('loads both the new envelope and legacy array backups', () => {
    const pack = createCombinedPack('Legacy compatible')
    expect(deserializeCombinedPacks(JSON.stringify([pack]))[0]?.meta.topic).toBe('Legacy compatible')
    expect(deserializeCombinedPacks(serializeCombinedPacks([pack]))[0]?.meta.topic).toBe('Legacy compatible')
  })

  it('preserves sanitized foundation sessions in the backup envelope and restores them', () => {
    const pack = createCombinedPack('Backup topic')
    const raw = serializeCombinedPacks([pack], [foundationSession])

    expect(deserializeFoundationSessions(raw)).toMatchObject([{ packId: 'pack-backup', decision: 'review' }])
    expect(importCombinedPacksJson(raw).foundationSessions).toHaveLength(1)
    expect(deserializeFoundationSessions(JSON.stringify([pack]))).toEqual([])
  })

  it('normalizes accepted records and reports rejected records', () => {
    const pack = createCombinedPack('Accepted')
    const result = importCombinedPacksJson(JSON.stringify({ format: 'content-center-backup', version: 1, exportedAt: new Date().toISOString(), packs: [pack, { invalid: true }] }))

    expect(result.packs).toHaveLength(1)
    expect(result.rejected).toBe(1)
    expect(result.packs[0]?.meta.topic).toBe('Accepted')
  })
})
