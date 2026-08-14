import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const ignored = new Set(['.git', 'node_modules', 'dist', '.manus-logs'])
const patterns = [
  /sk-[A-Za-z0-9]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /xox[baprs]-[0-9A-Za-z-]{10,}/,
  /Bearer\s+[A-Za-z0-9._-]{24,}/,
]
const genericCredentialPattern = /(?:apiKey|api_key|secret|password)\s*[:=]\s*['"]([^'"\n]{16,})['"]/gi
const placeholderPattern = /(?:^|[_\s-])(your|example|sample|placeholder|replace|paste|enter|insert|test|demo|redacted)(?:[_\s-]|$)|^<.+>$|^\$\{.+\}$/i

function hasNonPlaceholderCredential(content) {
  return [...content.matchAll(genericCredentialPattern)].some(([, value]) => !placeholderPattern.test(value))
}

function walk(directory) {
  const files = []
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) continue
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) files.push(...walk(path))
    else if (stats.isFile() && !path.endsWith('.lock')) files.push(path)
  }
  return files
}

const findings = []
for (const path of walk(root)) {
  let content
  try { content = readFileSync(path, 'utf8') } catch { continue }
  const hasHighConfidenceMatch = patterns.some((pattern) => pattern.test(content))
  if (hasHighConfidenceMatch || hasNonPlaceholderCredential(content)) findings.push(relative(root, path))
}

if (findings.length) {
  console.error(`Potential secrets found in: ${findings.join(', ')}`)
  process.exit(1)
}
console.log('Secret scan passed: no committed credential patterns found.')
