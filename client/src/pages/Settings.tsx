// Design philosophy: Editorial Control Room — settings explain the trust boundary before asking for configuration.

import { useState } from 'react'
import { Check, CircleAlert, CircleCheck, KeyRound, Loader2, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import StageSequence from '../components/StageSequence'
import { DEFAULT_AI_CONFIG, loadAiConfig, saveAiConfig } from '../lib/ai-config'
import { testAiConnection, type ConnectionTestResult } from '../lib/connection-test'

export default function Settings() {
  const [persistKey, setPersistKey] = useState(false)
  const [config, setConfig] = useState(() => typeof window === 'undefined' ? DEFAULT_AI_CONFIG : loadAiConfig())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null)
  function update<K extends keyof typeof config>(key: K, value: (typeof config)[K]) { setConfig((current) => ({ ...current, [key]: value })) }
  function persist() { saveAiConfig({ ...config, persistKey }); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }
  async function testConnection() {
    setTesting(true); setConnectionResult(null)
    const result = await testAiConnection(config)
    setConnectionResult(result); setTesting(false)
    if (result.ok) toast.success(result.message, { description: result.warning || result.detail })
    else toast.error(result.message, { description: result.detail })
  }
  return <div className="page page-settings"><div className="source-strip"><span className="source-tape">SOURCE TAPE / TRUST BOUNDARY</span><span>LOCAL-FIRST · CREDENTIAL STATE / {persistKey ? 'PERSISTED BY CHOICE' : 'NOT PERSISTED'} · RULES V3.2</span></div><StageSequence active="fields" /><div className="page-heading"><div><span className="section-index">06 / CONNECTION & RULES</span><h1>Settings.</h1><p>Make the model fit the desk. The browser-local workflow stays the default.</p></div><div className="settings-shield"><ShieldCheck size={18} /><span>Privacy posture<br /><b>Local-first</b></span></div></div><div className="settings-grid"><section className="settings-card"><div className="card-header"><span className="section-index">AI CONNECTION</span><KeyRound size={16} /></div><label htmlFor="base-url">OpenAI-compatible base URL</label><input id="base-url" value={config.baseUrl} onChange={(event) => update('baseUrl', event.target.value)} /><p className="field-hint">Used only by the browser-local provider unless a hosted proxy is introduced later.</p><label htmlFor="model">Model</label><input id="model" value={config.model} onChange={(event) => update('model', event.target.value)} /><label htmlFor="api-key">API key <span className="field-hint">optional for local endpoints</span></label><input id="api-key" type="password" value={config.apiKey} onChange={(event) => update('apiKey', event.target.value)} placeholder="Never commit this value" /><div className="setting-toggle"><button className={`toggle ${persistKey ? 'on' : ''}`} onClick={() => setPersistKey(!persistKey)} aria-pressed={persistKey}><span /></button><span><b>Persist API key locally</b><small>Off by default. Never commit or share this value.</small></span></div><div className="connection-actions"><button className="button button-primary" onClick={testConnection} disabled={testing}>{testing ? <><Loader2 className="spin" size={15} /> Testing connection…</> : <><CircleCheck size={15} /> Test connection</>}</button><button className="button button-quiet" onClick={persist}><Check size={15} /> {saved ? 'Settings saved' : 'Save connection'}</button></div>{connectionResult && <div className={`connection-result ${connectionResult.ok ? 'success' : 'error'}`} role={connectionResult.ok ? 'status' : 'alert'} aria-live="polite">{connectionResult.ok ? <CircleCheck size={16} /> : <CircleAlert size={16} />}<span><b>{connectionResult.message}</b><small>{connectionResult.warning || connectionResult.detail}</small></span></div>}</section><section className="settings-card"><div className="card-header"><span className="section-index">GENERATION RULES</span><SlidersHorizontal size={16} /></div>{[['Language', 'Egyptian Arabic / technical terms'], ['Rules version', 'v3.2 / editable system'], ['Review pass', 'Human gate required'], ['Telemetry', 'Off / local counters only']].map(([label, value]) => <div className="setting-row" key={label}><span>{label}</span><b>{value}</b></div>)}<div className="security-note"><ShieldCheck size={16} /><span><b>Trust boundary</b> Your notes and drafts remain in the browser unless you explicitly configure a remote AI endpoint.</span></div></section></div></div>
}
