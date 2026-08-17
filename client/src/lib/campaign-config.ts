export type CampaignPhase = 'pre-launch' | 'main' | 'post-launch'

export type ShortObjective =
  | 'curiosity'
  | 'promise'
  | 'insight'
  | 'mistake'
  | 'quick-tip'
  | 'advanced-context'
  | 'question'

export type PlatformId = 'youtube' | 'youtube-shorts' | 'instagram-reels' | 'tiktok' | 'facebook-reels' | 'linkedin' | 'x'
export type MontageTool = 'capcut' | 'generic'
export type ColoringTool = 'davinci-resolve' | 'generic'

export type CampaignConfig = {
  version: 1
  preLaunchCount: number
  postLaunchCount: number
  preLaunchObjectives: ShortObjective[]
  postLaunchObjectives: ShortObjective[]
  platforms: PlatformId[]
  montageTool: MontageTool
  coloringTool: ColoringTool
}

export const DEFAULT_PRE_LAUNCH_OBJECTIVES: ShortObjective[] = ['curiosity', 'promise']
export const DEFAULT_POST_LAUNCH_OBJECTIVES: ShortObjective[] = ['insight', 'mistake', 'quick-tip', 'advanced-context', 'question']
export const DEFAULT_PLATFORMS: PlatformId[] = ['youtube', 'youtube-shorts', 'instagram-reels', 'tiktok']
export const SUPPORTED_PLATFORMS: PlatformId[] = ['youtube', 'youtube-shorts', 'instagram-reels', 'tiktok', 'facebook-reels', 'linkedin', 'x']

const PLATFORM_IDS: PlatformId[] = SUPPORTED_PLATFORMS
export const SHORT_OBJECTIVES: ShortObjective[] = ['curiosity', 'promise', 'insight', 'mistake', 'quick-tip', 'advanced-context', 'question']

function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === 'string' && PLATFORM_IDS.includes(value as PlatformId)
}

function isShortObjective(value: unknown): value is ShortObjective {
  return typeof value === 'string' && SHORT_OBJECTIVES.includes(value as ShortObjective)
}

function boundedCount(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(6, Math.round(value))) : fallback
}

function objectiveList(value: unknown, fallback: ShortObjective[]): ShortObjective[] {
  if (!Array.isArray(value)) return [...fallback]
  const valid = value.filter(isShortObjective)
  return valid.length ? valid : [...fallback]
}

function fitObjectives(value: unknown, count: number, fallback: ShortObjective[]): ShortObjective[] {
  if (count === 0) return []
  const source = objectiveList(value, fallback)
  return Array.from({ length: count }, (_, index) => source[index % source.length])
}

function platformList(value: unknown): PlatformId[] {
  if (!Array.isArray(value)) return [...DEFAULT_PLATFORMS]
  const unique = value.filter(isPlatformId).filter((item, index, items) => items.indexOf(item) === index)
  return unique.length ? unique : [...DEFAULT_PLATFORMS]
}

export function createDefaultCampaignConfig(overrides: Partial<CampaignConfig> = {}): CampaignConfig {
  return {
    version: 1,
    preLaunchCount: boundedCount(overrides.preLaunchCount, DEFAULT_PRE_LAUNCH_OBJECTIVES.length),
    postLaunchCount: boundedCount(overrides.postLaunchCount, DEFAULT_POST_LAUNCH_OBJECTIVES.length),
    preLaunchObjectives: fitObjectives(overrides.preLaunchObjectives, boundedCount(overrides.preLaunchCount, DEFAULT_PRE_LAUNCH_OBJECTIVES.length), DEFAULT_PRE_LAUNCH_OBJECTIVES),
    postLaunchObjectives: fitObjectives(overrides.postLaunchObjectives, boundedCount(overrides.postLaunchCount, DEFAULT_POST_LAUNCH_OBJECTIVES.length), DEFAULT_POST_LAUNCH_OBJECTIVES),
    platforms: platformList(overrides.platforms),
    montageTool: overrides.montageTool === 'generic' ? 'generic' : 'capcut',
    coloringTool: overrides.coloringTool === 'generic' ? 'generic' : 'davinci-resolve',
  }
}

export function normalizeCampaignConfig(input: unknown): CampaignConfig {
  const source = input && typeof input === 'object' ? input as Partial<CampaignConfig> : {}
  return createDefaultCampaignConfig({
    preLaunchCount: source.preLaunchCount,
    postLaunchCount: source.postLaunchCount,
    preLaunchObjectives: source.preLaunchObjectives,
    postLaunchObjectives: source.postLaunchObjectives,
    platforms: source.platforms,
    montageTool: source.montageTool,
    coloringTool: source.coloringTool,
  })
}

export function objectiveLabel(objective: ShortObjective): string {
  return objective.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function campaignPhaseLabel(phase: CampaignPhase): string {
  if (phase === 'pre-launch') return 'Before the main video'
  if (phase === 'post-launch') return 'After the main video'
  return 'Main video'
}

export function shortSlotDescription(index: number, config: CampaignConfig = createDefaultCampaignConfig()): { phase: Exclude<CampaignPhase, 'main'>; objective: ShortObjective; label: string } {
  const position = Math.max(1, Math.round(index))
  const isPreLaunch = position <= config.preLaunchCount
  const objectives = isPreLaunch ? config.preLaunchObjectives : config.postLaunchObjectives
  const objective = objectives[(isPreLaunch ? position : position - config.preLaunchCount) - 1] || (isPreLaunch ? 'curiosity' : 'insight')
  const phase = isPreLaunch ? 'pre-launch' : 'post-launch'
  return { phase, objective, label: `${isPreLaunch ? 'Pre-launch' : 'Post-launch'} · ${objective}` }
}
