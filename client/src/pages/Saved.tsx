// Design philosophy: Editorial Control Room — the local library is calm, searchable, and honest about persistence.

import { useEffect, useState } from 'react'
import { ArrowUpRight, FileText, Search, Trash2 } from 'lucide-react'
import { deleteCombinedPack, loadCombinedPacks } from '../lib/content-storage'
import type { CombinedPack } from '../lib/pack-domain'
import StageSequence from '../components/StageSequence'

export default function Saved() {
  const [packs, setPacks] = useState<CombinedPack[]>([])
  const [query, setQuery] = useState('')
  useEffect(() => setPacks(loadCombinedPacks()), [])
  const filtered = packs.filter((pack) => pack.meta.topic.toLowerCase().includes(query.toLowerCase()))
  return <div className="page page-saved"><div className="source-strip"><span className="source-tape">SOURCE TAPE / LOCAL LIBRARY</span><span>LOCAL STORAGE V2 · RULES V3.2 · ARTIFACT STATE / {packs.length ? 'INDEXED' : 'EMPTY'}</span></div><StageSequence active="grade" /><div className="page-heading"><div><span className="section-index">05 / LOCAL LIBRARY</span><h1>Saved packs.</h1><p>Drafts, references, and production hand-offs stored in this browser.</p></div><div className="library-count"><strong>{String(packs.length).padStart(2, '0')}</strong><span>packs on desk</span></div></div><div className="saved-toolbar"><div className="search-wrap"><Search size={16} /><input aria-label="Search saved packs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by topic…" /></div><span className="source-tape">COMBINED PACKS / V2</span></div>{filtered.length ? <div className="saved-grid">{filtered.map((pack) => { const complete = pack.parts.filter((part) => part.stageStatus.grade === 'done').length; return <article className="saved-card" key={pack.meta.id}><div className="saved-card-top"><FileText size={18} /><span>COMBINED PACK / {complete}/6 GRADED</span></div><h2>{pack.meta.topic || 'Untitled pack'}</h2><p>{new Date(pack.meta.updatedAt).toLocaleDateString()} · {pack.meta.model}</p><div className="saved-card-footer"><button className="card-link">Open pack <ArrowUpRight size={15} /></button><button className="icon-button" aria-label={`Delete ${pack.meta.topic}`} onClick={() => setPacks(deleteCombinedPack(pack.meta.id))}><Trash2 size={15} /></button></div></article> })}</div> : <div className="library-empty"><FileText size={22} /><span className="empty-tape">LOCAL ARTIFACT / WAITING FOR FIRST SAVE</span><h2>No saved packs on the desk.</h2><p>Save a combined pack from the generator and it will be indexed here—nothing leaves this browser.</p></div>}</div>
}
