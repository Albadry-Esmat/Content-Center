import { readFileSync } from 'node:fs'

const content = readFileSync(new URL('../.github/CODEOWNERS', import.meta.url), 'utf8')
const requiredRules = ['* @Albadry-Esmat', '/.github/ @Albadry-Esmat', '/SECURITY.md @Albadry-Esmat', '/server/ @Albadry-Esmat']
const missing = requiredRules.filter((rule) => !content.split('\n').some((line) => line.trim() === rule))

if (missing.length) {
  console.error(`CODEOWNERS validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`CODEOWNERS valid: ${requiredRules.length} required ownership rules present.`)
