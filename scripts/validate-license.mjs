import { readFileSync } from 'node:fs'

const license = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8')
const requiredStatements = [
  'MIT License',
  'Copyright (c) 2026 Albadry Esmat',
  'Permission is hereby granted, free of charge',
  'THE SOFTWARE IS PROVIDED "AS IS"',
]
const missing = requiredStatements.filter((statement) => !license.includes(statement))

if (missing.length) {
  console.error(`License validation failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

console.log(`License valid: ${requiredStatements.length} required statements present.`)
