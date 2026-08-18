import { readFileSync } from 'node:fs'

const path = 'client/src/index.css'
const source = readFileSync(path, 'utf8')
const requiredTokens = [
  '--color-bg', '--color-surface', '--color-surface-raised', '--color-surface-inset',
  '--color-border', '--color-border-strong', '--color-text', '--color-text-subtle',
  '--color-text-muted', '--color-text-placeholder', '--color-text-disabled', '--color-link',
  '--color-focus', '--color-selected', '--color-success', '--color-info', '--color-warning',
  '--color-danger', '--color-on-accent', '--color-on-status',
]
const bannedUiColors = ['#677585', '#718093', '#627182', '#657588', '#5c6b7a', '#748293', '#596574', '#637282', '#f2b4a9']
const missing = requiredTokens.filter((token) => !source.includes(token))
const stale = bannedUiColors.filter((color) => source.toLowerCase().includes(color.toLowerCase()))

if (missing.length || stale.length) {
  if (missing.length) console.error(`Theme token validation failed; missing: ${missing.join(', ')}`)
  if (stale.length) console.error(`Theme token validation failed; hard-coded UI colors remain: ${stale.join(', ')}`)
  process.exit(1)
}

console.log(`Theme tokens valid: ${requiredTokens.length} semantic tokens present and ${bannedUiColors.length} high-risk hard-coded UI colors removed.`)
