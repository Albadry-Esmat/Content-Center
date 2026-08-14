import fs from 'node:fs'
import path from 'node:path'

const mapPath = process.argv[2]

if (!mapPath) {
  console.error('Usage: node scripts/bundle-audit.mjs <asset.js.map>')
  process.exit(1)
}

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
const totals = new Map()

function packageName(source) {
  const normalized = source.replaceAll('\\', '/')
  const marker = '/node_modules/'
  const position = normalized.lastIndexOf(marker)
  if (position < 0) return 'application'

  const segments = normalized.slice(position + marker.length).split('/')
  return segments[0].startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0]
}

for (let index = 0; index < map.sources.length; index += 1) {
  const source = map.sources[index]
  const content = map.sourcesContent?.[index] ?? ''
  const key = packageName(source)
  totals.set(key, (totals.get(key) ?? 0) + Buffer.byteLength(content))
}

const rows = [...totals.entries()].sort(([, left], [, right]) => right - left)
console.log(`Bundle source audit: ${path.basename(mapPath)}`)
for (const [name, bytes] of rows.slice(0, 20)) {
  console.log(`${String(bytes).padStart(9)}  ${name}`)
}
