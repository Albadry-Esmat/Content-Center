// Design philosophy: Editorial Control Room — the pipeline spine is a global identity cue, not a generator-only widget.

import { Check } from 'lucide-react'
import { STAGES, type GenerationStage } from '../lib/content-types'

export default function StageSequence({ active = 'fields', completed = [] as GenerationStage[] }: { active?: GenerationStage; completed?: GenerationStage[] }) {
  const activeIndex = STAGES.findIndex((stage) => stage.id === active)
  return <div className="global-stage-sequence" aria-label="Production sequence">
    {STAGES.map((stage, index) => <div className={`global-stage ${index <= activeIndex ? 'in-range' : ''} ${stage.id === active ? 'current' : ''}`} key={stage.id}>
      <span className="global-stage-node">{completed.includes(stage.id) ? <Check size={12} /> : `0${index + 1}`}</span>
      <span><b>{stage.label}</b><small>{stage.detail}</small></span>
      {index < STAGES.length - 1 && <i />}
    </div>)}
  </div>
}
