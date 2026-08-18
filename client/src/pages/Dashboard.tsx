// Design philosophy: Editorial Control Room — direct the creator toward the next production move.

import { Link } from 'wouter'
import { ArrowUpRight, Clock3, FileText, Sparkles } from 'lucide-react'
import StageSequence from '../components/StageSequence'
import heroImage from '../assets/content-center-hero.jpg'

const metrics = [
  { value: '01', label: 'Active brief', note: 'Ready to shape' },
  { value: '06', label: 'Deliverables', note: 'One focused content pack' },
  { value: '15m', label: 'Target cycle', note: 'Topic to hand-off' },
]

export default function Dashboard() {
  return <div className="page page-dashboard">
    <div className="source-strip"><span className="source-tape">CONTENT OPERATIONS / WORKSPACE STATUS</span><span>LOCAL-FIRST · CREATOR-READY · ARTIFACT STATE / READY TO BRIEF</span></div>
    <StageSequence />
    <section className="hero-grid">
      <div className="hero-copy">
        <span className="section-index">01 / CONTENT WORKSPACE</span>
        <h1>From spark<br />to <em>ready-to-make.</em></h1>
        <p>Turn any topic into a reviewable brief, script, visual plan, and hand-off—without losing your source material, voice, or decision trail.</p>
        <div className="hero-actions"><Link href="/generator" className="button button-primary"><Sparkles size={16} /> Create a content pack <ArrowUpRight size={15} /></Link><Link href="/generator?demo=1" className="button button-quiet">Try demo campaign</Link><Link href="/workspace" className="text-link">Open workspace <ArrowUpRight size={14} /></Link></div>
      </div>
      <div className="hero-art"><img src={heroImage} alt="A creative content planning workspace with a storyboard, camera, and production notes" /><div className="hero-art-label"><span className="signal-bar" /> CONTENT OPS / READY WHEN YOU ARE</div></div>
    </section>
    <section className="metric-strip" aria-label="Workspace metrics">{metrics.map((metric) => <div key={metric.label} className="metric"><strong>{metric.value}</strong><span><b>{metric.label}</b>{metric.note}</span></div>)}</section>
    <section className="dashboard-lower">
      <div className="brief-card"><div className="card-header"><span className="section-index">NEXT MOVE</span><Clock3 size={16} /></div><h2>Start with your point of view.</h2><p>Bring a topic, source notes, and intent. The workflow keeps your prompts, artifacts, and production decisions connected.</p><Link href="/generator" className="card-link">Create a new pack <ArrowUpRight size={15} /></Link><Link href="/generator?demo=1" className="card-link">Preview a demo campaign <ArrowUpRight size={15} /></Link></div>
      <div className="source-card"><div className="source-overlay"><span className="section-index">TRUSTED CONTEXT</span><h2>Your source remains part of the work.</h2><p>Ground the draft in what you know, set the language and voice, then review every claim before it moves forward.</p></div></div>
      <div className="mini-list"><div className="card-header"><span className="section-index">WORKFLOW</span><FileText size={16} /></div>{['Brief / shape the angle','Script / define the story','Visual plan / prepare the cut','Review / set the production notes'].map((item, index) => <div className="pipeline-row" key={item}><span>0{index + 1}</span><b>{item.split(' / ')[0]}</b><small>{item.split(' / ')[1]}</small><i>{index === 0 ? 'NEXT' : '—'}</i></div>)}</div>
    </section>
  </div>
}
