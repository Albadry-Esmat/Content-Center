import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const referenceFiles = readdirSync(root).filter((name) => /^deepseek_html_.*\.html(?:\.bak)?$/.test(name))
const credentialAssignment = /((?:apiKey|api_key|secret|password)\s*[:=]\s*['"])([^'"\n]{16,})(['"])/gi
const placeholderPattern = /(?:^|[_\s-])(your|example|sample|placeholder|replace|paste|enter|insert|test|demo|redacted)(?:[_\s-]|$)|^<.+>$|^\$\{.+\}$/i

function isPlaceholder(value) {
  return placeholderPattern.test(value)
}

let updatedFiles = 0

for (const name of referenceFiles) {
  const path = join(root, name)
  const original = readFileSync(path, 'utf8')
  const sanitized = original.replace(credentialAssignment, (match, prefix, value, suffix) => {
    return isPlaceholder(value) ? match : `${prefix}REDACTED_REFERENCE_CREDENTIAL${suffix}`
  })

  if (sanitized !== original) {
    writeFileSync(path, sanitized, 'utf8')
    updatedFiles += 1
  }
}

console.log(`Reference credential sanitization complete: ${updatedFiles} file(s) updated.`)
