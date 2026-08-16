import type { ColoringTool, MontageTool } from './campaign-config'

export type ProductionGuidance = {
  toolLabel: string
  summary: string
  steps: string[]
  avoid: string
}

export function getMontageGuidance(tool: MontageTool): ProductionGuidance {
  if (tool === 'generic') {
    return {
      toolLabel: 'Simple editing',
      summary: 'Keep the cut readable: remove dead space, show the proof, and use captions only when they help comprehension.',
      steps: ['Start with the clearest hook.', 'Use hard cuts and remove long pauses.', 'Show the screen, demo, or proof when it is mentioned.', 'Keep captions readable and lower music under speech.'],
      avoid: 'Avoid effect chains, constant transitions, and cuts that make the explanation harder to follow.',
    }
  }
  return {
    toolLabel: 'CapCut · simple montage',
    summary: 'Use familiar CapCut actions that a creator or beginner editor can repeat without advanced timeline skills.',
    steps: ['Open on the strongest visual or spoken hook.', 'Use hard cuts to remove pauses and dead space.', 'Add a short punch-in, B-roll insert, or screen recording when the point needs emphasis.', 'Use auto-captions with one or two highlighted keywords.', 'Lower background music under speech and use only an occasional simple transition.'],
    avoid: 'Avoid complex masks, motion tracking, advanced keyframes, and decorative transitions that do not improve understanding.',
  }
}

export function getColoringGuidance(tool: ColoringTool): ProductionGuidance {
  if (tool === 'generic') {
    return {
      toolLabel: 'Simple color correction',
      summary: 'Make the image consistent and readable before adding any creative look.',
      steps: ['Correct exposure first.', 'Set a natural white balance.', 'Use moderate contrast and restrained saturation.', 'Check skin tones and keep screen recordings readable.', 'Apply the same basic look across the campaign.'],
      avoid: 'Avoid fixed values that ignore the camera, lighting, or display, and avoid heavy stylization of technical screens.',
    }
  }
  return {
    toolLabel: 'DaVinci Resolve · simple correction',
    summary: 'Use a short correction order in DaVinci Resolve instead of an advanced node tree or cinematic grade.',
    steps: ['Balance exposure before changing the look.', 'Correct white balance so skin and neutral surfaces look natural.', 'Add moderate contrast and restrained saturation.', 'Protect skin tones from excessive orange or saturation.', 'Keep screen recordings accurate and readable, then apply a consistent simple look.'],
    avoid: 'Avoid advanced node trees, LUT design, HDR finishing, and heavy color changes that reduce technical-screen readability.',
  }
}
