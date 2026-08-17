// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { createCombinedPack } from './pack-domain'
import { deserializeCombinedPacks, importCombinedPacksJson, serializeCombinedPacks } from './content-storage'

beforeEach(() => window.localStorage.clear())

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

  it('normalizes accepted records and reports rejected records', () => {
    const pack = createCombinedPack('Accepted')
    const result = importCombinedPacksJson(JSON.stringify({ format: 'content-center-backup', version: 1, exportedAt: new Date().toISOString(), packs: [pack, { invalid: true }] }))

    expect(result.packs).toHaveLength(1)
    expect(result.rejected).toBe(1)
    expect(result.packs[0]?.meta.topic).toBe('Accepted')
  })
})
