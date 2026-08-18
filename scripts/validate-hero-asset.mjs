import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dashboardPath = path.join(root, 'client/src/pages/Dashboard.tsx')
const assetPath = path.join(root, 'client/src/assets/content-center-hero.jpg')
const dashboard = fs.readFileSync(dashboardPath, 'utf8')

const requiredImport = "import heroImage from '../assets/content-center-hero.jpg'"
const requiredUsage = '<img src={heroImage}'
const forbiddenReference = '/manus-storage/'

const failures = []
if (!dashboard.includes(requiredImport)) failures.push('Dashboard.tsx must import the repository-backed hero asset through Vite.')
if (!dashboard.includes(requiredUsage)) failures.push('Dashboard.tsx must use the imported hero asset in the hero image.')
if (dashboard.includes(forbiddenReference)) failures.push('Dashboard.tsx must not reference the unavailable manus-storage path.')
if (!fs.existsSync(assetPath)) failures.push('The repository-backed hero asset is missing from client/src/assets/.')
if (fs.existsSync(assetPath) && fs.statSync(assetPath).size < 50_000) failures.push('The repository-backed hero asset is unexpectedly small.')

if (failures.length > 0) {
  console.error(`Hero asset validation failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Hero asset valid: Dashboard imports the tracked Vite asset and the image file is present.')
