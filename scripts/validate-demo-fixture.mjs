import { readFileSync } from 'node:fs'

const fixture = JSON.parse(readFileSync(new URL('../fixtures/demo-campaign.json', import.meta.url), 'utf8'))
const campaign = fixture.campaign
const errors = []

if (fixture.fixtureVersion !== 1) errors.push('fixtureVersion must be 1')
if (!fixture.privacy?.safeForPublicRepository) errors.push('fixture must be marked safeForPublicRepository')
if (fixture.privacy?.containsPrivateNotes || fixture.privacy?.containsProviderCredentials || fixture.privacy?.containsGeneratedClaims) errors.push('fixture privacy flags must remain false')
if (campaign.preLaunchCount !== campaign.preLaunchObjectives.length) errors.push('preLaunchCount must match preLaunchObjectives length')
if (campaign.postLaunchCount !== campaign.postLaunchObjectives.length) errors.push('postLaunchCount must match postLaunchObjectives length')
if (campaign.montageTool !== 'capcut') errors.push('default montageTool must be capcut')
if (campaign.coloringTool !== 'davinci-resolve') errors.push('default coloringTool must be davinci-resolve')
if (!Array.isArray(fixture.expectedWorkflow) || fixture.expectedWorkflow.length < 4) errors.push('expectedWorkflow must describe the public demo path')

if (errors.length) {
  console.error(`Demo fixture validation failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`Demo fixture valid: ${fixture.title}`)
