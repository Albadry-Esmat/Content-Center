// Design philosophy: Editorial Control Room — reference content reads like a field guide, not a marketing wall.

import { ArrowUpRight, Check, ChevronRight } from 'lucide-react'
import { Link } from 'wouter'
import StageSequence from '../components/StageSequence'

const longSections = [
  ['01', 'Core philosophy', 'Move the viewer through click → stay → learn → engage → continue watching. The system optimizes for immediate value, story-driven progression, technical credibility, and a meaningful verdict.'],
  ['02', 'Master timeline', 'Hook at 0:00 · Promise at 0:30 · Story at 0:50 · Concept at 2:00 · Demo at 4:00 · Twist at 7:00 · Deep dive at 8:30 · Takeaways at 12:00.'],
  ['03', 'Golden rules', 'Explain → question → answer → new question → proof → new insight. Use the BUT mechanism. State the perspective early. Never hide all value.'],
]
const shortSections = [
  ['01', 'Short anatomy', 'Hook 0–3s → Problem → Context → Core insight → Proof → Payoff → platform-specific CTA. One short, one idea.'],
  ['02', 'Publishing cycle', 'Curiosity tease → long-form authority asset → insight → mistake → tip → advanced angle → question.'],
  ['03', 'Hook library', 'Contrarian · Mistake · Curiosity · Result · Question · Challenge · AI. Start with the tension, not the throat-clearing.'],
]

export default function SystemPage({ kind }: { kind: 'long' | 'short' }) {
  const isLong = kind === 'long'
  const sections = isLong ? longSections : shortSections
  return <div className="page page-system">
    <div className="source-strip"><span className="source-tape">SOURCE TAPE / {isLong ? 'AUTHORITY' : 'DISCOVERY'}</span><span>RULES V3.2 · REVIEW STATUS / REFERENCE LOADED · RTL READY</span></div>
    <StageSequence active={isLong ? 'script' : 'fields'} />
    <div className="page-heading"><div><span className="section-index">{isLong ? '02 / AUTHORITY ASSET' : '03 / DISCOVERY PACK'}</span><h1>{isLong ? 'Long-form system' : 'Short-form system'}</h1><p>{isLong ? 'The long video earns trust by making the technical story feel inevitable.' : 'Shorts open the door, deliver one clean insight, and point back to the bigger argument.'}</p></div><Link className="button button-quiet" href="/generator">Use in generator <ArrowUpRight size={15} /></Link></div>
    <div className="system-layout"><aside className="system-aside"><div className="system-aside-mark">{isLong ? 'L/F' : 'S/F'}</div><span className="section-index">SYSTEM NOTE</span><p>{isLong ? 'Authority is not a length. It is a chain of proof.' : 'Discovery is not a summary. It is a reason to continue.'}</p><div className="system-check"><Check size={14} /> Rules loaded</div><div className="system-check"><Check size={14} /> RTL-ready</div></aside><div className="system-sections">{sections.map(([index, title, copy]) => <article className="system-row" key={index}><span className="row-number">{index}</span><div><h2>{title}</h2><p>{copy}</p></div><ChevronRight size={17} /></article>)}<div className="system-footer"><span>RULES VERSION / V3.2</span><span>Editable in settings</span></div></div></div>
  </div>
}
