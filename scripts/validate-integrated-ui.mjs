import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const css = fs.readFileSync(path.join(root, 'client/src/index.css'), 'utf8')
const dashboard = fs.readFileSync(path.join(root, 'client/src/pages/Dashboard.tsx'), 'utf8')
const generator = fs.readFileSync(path.join(root, 'client/src/pages/Generator.tsx'), 'utf8')
const settings = fs.readFileSync(path.join(root, 'client/src/pages/Settings.tsx'), 'utf8')

const failures = []
const requiredHooks = [
  [css, '.dark {', 'dark theme token block'],
  [css, '*:focus-visible', 'visible keyboard focus styling'],
  [css, '.campaign-platform-grid', 'responsive platform tile grid'],
  [css, '@media (max-width: 720px)', 'narrow-screen responsive media query'],
  [css, '.hero-art img', 'hero image runtime styling'],
  [generator, 'fieldset className="campaign-platforms"', 'native platform checkbox fieldset'],
  [generator, 'aria-label={platformLabels[platform]}', 'explicit platform checkbox accessible names'],
  [settings, 'model-discovery-notice', 'semantic model-discovery notices'],
  [settings, 'discovered-models', 'exact discovered model-ID list'],
  [settings, 'discoverAiModels(config)', 'model-less local discovery seam'],
  [dashboard, "import heroImage from '../assets/content-center-hero.jpg'", 'Vite hero asset import'],
]
for (const [source, token, description] of requiredHooks) {
  if (!source.includes(token)) failures.push(`${description} is missing.`)
}
if (dashboard.includes('/manus-storage/')) failures.push('Dashboard still contains the unavailable manus-storage hero path.')
if (settings.includes('discovery-placeholder')) failures.push('Settings must not manufacture a discovery-placeholder model that creates a false warning.')

function themeTokens(selector) {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]+)\\}`))?.[1] || ''
  const tokens = {}
  for (const match of block.matchAll(/--(color-[a-z-]+):\s*(#[0-9a-f]{6})/gi)) tokens[match[1]] = match[2]
  return tokens
}

function channel(hex) {
  const value = Number.parseInt(hex.slice(1), 16)
  return [value >> 16, (value >> 8) & 255, value & 255].map((part) => {
    const normalized = part / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
}
function contrast(foreground, background) {
  const foregroundLuminance = channel(foreground).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
  const backgroundLuminance = channel(background).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

const themes = [
  ['light', themeTokens(':root'), [
    ['color-text', 'color-bg', 4.5],
    ['color-text-subtle', 'color-bg', 4.5],
    ['color-text-muted', 'color-bg', 4.5],
    ['color-link', 'color-bg', 4.5],
    ['color-danger', 'color-bg', 3],
    ['color-on-status', 'color-selected', 3],
  ]],
  ['dark', themeTokens('\\.dark'), [
    ['color-text', 'color-bg', 4.5],
    ['color-text-subtle', 'color-bg', 4.5],
    ['color-text-muted', 'color-bg', 4.5],
    ['color-link', 'color-bg', 4.5],
    ['color-danger', 'color-bg', 3],
    ['color-on-status', 'color-selected', 3],
  ]],
]
for (const [theme, tokens, pairs] of themes) {
  for (const [foreground, background, minimum] of pairs) {
    if (!tokens[foreground] || !tokens[background]) {
      failures.push(`${theme} theme is missing ${foreground} or ${background}.`)
      continue
    }
    const ratio = contrast(tokens[foreground], tokens[background])
    if (ratio < minimum) failures.push(`${theme} ${foreground} on ${background} contrast ${ratio.toFixed(2)} is below ${minimum.toFixed(1)}.`)
  }
}

if (failures.length) {
  console.error(`Integrated UI validation failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Integrated UI validation passed: required hooks present and semantic contrast pairs meet their minimum ratios.')
