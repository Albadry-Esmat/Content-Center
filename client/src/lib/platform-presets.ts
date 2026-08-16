import type { PlatformId } from './campaign-config'

export type PlatformPreset = {
  id: PlatformId
  label: string
  role: string
  aspectRatio: string
  titleGuidance: string
  captionGuidance: string
  ctaGuidance: string
  safeZoneGuidance: string
  exportGuidance: string
  version: string
}

const PRESETS: Record<PlatformId, PlatformPreset> = {
  youtube: {
    id: 'youtube', label: 'YouTube', role: 'Main long-form authority video', aspectRatio: '16:9',
    titleGuidance: 'Make the topic and viewer outcome clear without overpromising.', captionGuidance: 'Use a short summary, useful timestamps when available, and references.', ctaGuidance: 'Invite a focused comment and bridge to the next related video.', safeZoneGuidance: 'Keep important titles and demonstrations away from the extreme edges.', exportGuidance: 'Match the source frame rate and keep the technical demo readable.', version: 'v1',
  },
  'youtube-shorts': {
    id: 'youtube-shorts', label: 'YouTube Shorts', role: 'Discovery short linked to the main video', aspectRatio: '9:16',
    titleGuidance: 'Lead with the one idea or result the viewer will get.', captionGuidance: 'Keep captions concise and readable in the vertical safe zone.', ctaGuidance: 'Point viewers to the full video when the short is post-launch.', safeZoneGuidance: 'Keep captions and key graphics away from the top and bottom interface areas.', exportGuidance: 'Open on a strong visual and finish with a brief, readable CTA frame.', version: 'v1',
  },
  'instagram-reels': {
    id: 'instagram-reels', label: 'Instagram Reels', role: 'Visual-first discovery and relationship short', aspectRatio: '9:16',
    titleGuidance: 'Use a clear, conversational idea rather than a long technical title.', captionGuidance: 'Add a short context line and a small number of relevant keywords.', ctaGuidance: 'Prefer a follow, save, or share action that matches the short objective.', safeZoneGuidance: 'Keep text centered enough to avoid profile and action controls.', exportGuidance: 'Start with movement, a face, or a clear screen result before explanation.', version: 'v1',
  },
  tiktok: {
    id: 'tiktok', label: 'TikTok', role: 'Fast discovery and comment-driven short', aspectRatio: '9:16',
    titleGuidance: 'Frame the hook as a direct observation, mistake, question, or result.', captionGuidance: 'Use conversational context that can stand alone in the feed.', ctaGuidance: 'Invite a comment, example, or disagreement when appropriate.', safeZoneGuidance: 'Keep essential text away from the interface and caption overlay areas.', exportGuidance: 'Cut quickly only when it improves clarity; do not sacrifice comprehension for speed.', version: 'v1',
  },
  linkedin: {
    id: 'linkedin', label: 'LinkedIn', role: 'Professional insight and discussion', aspectRatio: '1:1 or 16:9',
    titleGuidance: 'State the practical lesson and professional context early.', captionGuidance: 'Explain why the insight matters in a real project or team setting.', ctaGuidance: 'Ask for professional examples or invite discussion.', safeZoneGuidance: 'Use restrained on-screen text with generous margins for desktop and mobile.', exportGuidance: 'Keep technical evidence visible long enough to be understood without frantic cuts.', version: 'v1',
  },
  x: {
    id: 'x', label: 'X', role: 'Compact statement, reaction, or discussion clip', aspectRatio: '16:9 or 1:1',
    titleGuidance: 'Lead with the clearest statement or question.', captionGuidance: 'Keep the accompanying text concise and reply-friendly.', ctaGuidance: 'Invite a reply or counter-example rather than a generic follow request.', safeZoneGuidance: 'Keep essential text within a generous central margin.', exportGuidance: 'Make the first frame understandable when viewed without sound.', version: 'v1',
  },
}

export function getPlatformPreset(platform: PlatformId): PlatformPreset {
  return PRESETS[platform]
}

export function getPlatformPresets(platforms: PlatformId[]): PlatformPreset[] {
  return platforms.map(getPlatformPreset)
}
