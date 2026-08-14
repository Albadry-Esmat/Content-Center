// Design philosophy: Editorial Control Room — direct the creator toward the next production move.

import { Link } from 'wouter'
import { ArrowUpRight, Clock3, FileText, Sparkles } from 'lucide-react'
import StageSequence from '../components/StageSequence'

const metrics = [
  { value: '01', label: 'Active pack', note: 'Ready to shape' },
  { value: '05', label: 'Short slots', note: 'Discovery sequence' },
  { value: '15m', label: 'Target cycle', note: 'Topic to hand-off' },
]

export default function Dashboard() {
  return <div className="page page-dashboard">
    <div className="source-strip"><span className="source-tape">SOURCE TAPE / DESK STATUS</span><span>LOCAL-FIRST · RULES V3.2 · ARTIFACT STATE / READY TO BRIEF</span></div>
    <StageSequence />
    <section className="hero-grid">
      <div className="hero-copy">
        <span className="section-index">01 / CONTROL ROOM</span>
        <h1>One idea.<br /><em>Complete pack.</em></h1>
        <p>Turn a technical topic into an editable, production-ready content system—without losing the source, the sequence, or your verdict.</p>
        <div className="hero-actions"><Link href="/generator" className="button button-primary"><Sparkles size={16} /> Open generator <ArrowUpRight size={15} /></Link><Link href="/system/long" className="text-link">Review the system <ArrowUpRight size={14} /></Link></div>
      </div>
      <div className="hero-art"><img src="/manus-storage/content-desk-hero_4ae3e66d.png" alt="Dark editorial production desk with amber status lights" /><div className="hero-art-label"><span className="signal-bar" /> STUDIO / LOCAL-FIRST</div></div>
    </section>
    <section className="metric-strip" aria-label="Workspace metrics">{metrics.map((metric) => <div key={metric.label} className="metric"><strong>{metric.value}</strong><span><b>{metric.label}</b>{metric.note}</span></div>)}</section>
    <section className="dashboard-lower">
      <div className="brief-card"><div className="card-header"><span className="section-index">NEXT MOVE</span><Clock3 size={16} /></div><h2>Start with the brief.</h2><p>The generator keeps your topic, source notes, model, and rules together before a single sentence is drafted.</p><Link href="/generator" className="card-link">Create a new pack <ArrowUpRight size={15} /></Link></div>
      <div className="source-card"><img src="/manus-storage/content-desk-source-tape_dd33d051.png" alt="Editorial source notes on a dark desk" /><div className="source-overlay"><span className="section-index">SOURCE TAPE</span><h2>Your notes stay in the room.</h2><p>Ground the model in what you already know, then mark what still needs proof.</p></div></div>
      <div className="mini-list"><div className="card-header"><span className="section-index">PIPELINE</span><FileText size={16} /></div>{['Fields / shape the brief','Script / find the story','Montage / plan the cut','Grade / set the look'].map((item, index) => <div className="pipeline-row" key={item}><span>0{index + 1}</span><b>{item.split(' / ')[0]}</b><small>{item.split(' / ')[1]}</small><i>{index === 0 ? 'NEXT' : '—'}</i></div>)}</div>
    </section>
  </div>
}
