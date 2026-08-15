// Design philosophy: settings make creator preferences explicit, portable, and reversible without exposing secrets.

import { useState } from 'react'
import { AlignLeft, AlignRight, Check, CircleAlert, CircleCheck, KeyRound, Languages, Loader2, Quote, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import StageSequence from '../components/StageSequence'
import { DEFAULT_AI_CONFIG, loadAiConfig, saveAiConfig } from '../lib/ai-config'
import { testAiConnection, type ConnectionTestResult } from '../lib/connection-test'

const languageSuggestions = ['English', 'Arabic', 'Arabic (Egyptian)', 'French', 'Spanish', 'Portuguese', 'German']

export default function Settings() {
  const [persistKey, setPersistKey] = useState(false)
  const [config, setConfig] = useState(() => typeof window === 'undefined' ? DEFAULT_AI_CONFIG : loadAiConfig())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null)
  function update<K extends keyof typeof config>(key: K, value: (typeof config)[K]) { setConfig((current) => ({ ...current, [key]: value })) }
  function persist() {
    saveAiConfig({ ...config, persistKey })
    setSaved(true)
    toast.success('Workspace preferences saved', { description: 'They stay in this browser and shape future generation.' })
    window.setTimeout(() => setSaved(false), 1800)
  }
  async function testConnection() {
    setTesting(true); setConnectionResult(null)
    const result = await testAiConnection(config)
    setConnectionResult(result); setTesting(false)
    if (result.ok) toast.success(result.message, { description: result.warning || result.detail })
    else toast.error(result.message, { description: result.detail })
  }

  return <div className="page page-settings">
    <div className="source-strip"><span className="source-tape">WORKSPACE PREFERENCES / TRUST BOUNDARY</span><span>LOCAL-FIRST · CREDENTIAL STATE / {persistKey ? 'PERSISTED BY CHOICE' : 'NOT PERSISTED'} · CREATOR PROFILE / READY</span></div>
    <StageSequence active="fields" />
    <div className="page-heading"><div><span className="section-index">06 / SETTINGS & PREFERENCES</span><h1>Set the working style.</h1><p>Shape how every future brief and script reads while keeping provider credentials under your control.</p></div><div className="settings-shield"><ShieldCheck size={18} /><span>Preference scope<br /><b>This browser</b></span></div></div>
    <div className="settings-grid">
      <section className="settings-card">
        <div className="card-header"><span className="section-index">GENERATION PROFILE</span><Languages size={16} /></div>
        <p className="settings-intro">The profile applies to new generation requests. You can still edit every artifact after it is created.</p>
        <label htmlFor="script-language">Script language</label>
        <input id="script-language" list="script-language-options" value={config.scriptLanguage} onChange={(event) => update('scriptLanguage', event.target.value)} placeholder="e.g. English, Arabic, French" />
        <datalist id="script-language-options">{languageSuggestions.map((language) => <option key={language} value={language} />)}</datalist>
        <p className="field-hint">Choose any language. Suggestions are provided only to speed up common creator workflows.</p>
        <fieldset className="direction-picker"><legend>Writing direction</legend><div role="radiogroup" aria-label="Writing direction" className="direction-options">
          {([{ value: 'auto', label: 'Auto', icon: SlidersHorizontal, detail: 'Match language' }, { value: 'ltr', label: 'LTR', icon: AlignLeft, detail: 'Left to right' }, { value: 'rtl', label: 'RTL', icon: AlignRight, detail: 'Right to left' }] as const).map(({ value, label, icon: Icon, detail }) => <button key={value} type="button" role="radio" aria-checked={config.textDirection === value} className={config.textDirection === value ? 'selected' : ''} onClick={() => update('textDirection', value)}><Icon size={15} /><span><b>{label}</b><small>{detail}</small></span></button>)}
        </div></fieldset>
        <label htmlFor="brand-phrases">Brand phrases <span className="field-hint">optional</span></label>
        <textarea id="brand-phrases" value={config.brandPhrases} onChange={(event) => update('brandPhrases', event.target.value)} rows={4} placeholder="e.g. Make every idea count; Practical clarity, not noise" />
        <p className="field-hint">Separate phrases with commas or new lines. They are optional cues—not compulsory copy—and are never stored with your API key.</p>
        <div className="profile-summary"><Quote size={16} /><span><b>{config.scriptLanguage || 'Language not selected'} · {config.textDirection.toUpperCase()}</b><small>{config.brandPhrases.trim() ? 'Brand phrases will be available to the model.' : 'No brand phrases configured.'}</small></span></div>
        <div className="connection-actions"><button className="button button-primary" onClick={persist}><Check size={15} /> {saved ? 'Preferences saved' : 'Save preferences'}</button></div>
      </section>
      <section className="settings-card">
        <div className="card-header"><span className="section-index">AI CONNECTION</span><KeyRound size={16} /></div>
        <p className="settings-intro">Use a browser-local OpenAI-compatible endpoint today. A hosted team proxy can be added later without changing your writing profile.</p>
        <label htmlFor="base-url">OpenAI-compatible base URL</label><input id="base-url" value={config.baseUrl} onChange={(event) => update('baseUrl', event.target.value)} />
        <label htmlFor="model">Model</label><input id="model" value={config.model} onChange={(event) => update('model', event.target.value)} />
        <label htmlFor="api-key">API key <span className="field-hint">optional for local endpoints</span></label><input id="api-key" type="password" value={config.apiKey} onChange={(event) => update('apiKey', event.target.value)} placeholder="Never commit this value" />
        <div className="setting-toggle"><button className={`toggle ${persistKey ? 'on' : ''}`} onClick={() => setPersistKey(!persistKey)} aria-pressed={persistKey}><span /></button><span><b>Persist API key locally</b><small>Off by default. Never commit or share this value.</small></span></div>
        <div className="connection-actions"><button className="button button-quiet" onClick={testConnection} disabled={testing}>{testing ? <><Loader2 className="spin" size={15} /> Testing connection…</> : <><CircleCheck size={15} /> Test connection</>}</button><button className="button button-quiet" onClick={persist}><Check size={15} /> Save all settings</button></div>
        {connectionResult && <div className={`connection-result ${connectionResult.ok ? 'success' : 'error'}`} role={connectionResult.ok ? 'status' : 'alert'} aria-live="polite">{connectionResult.ok ? <CircleCheck size={16} /> : <CircleAlert size={16} />}<span><b>{connectionResult.message}</b><small>{connectionResult.warning || connectionResult.detail}</small></span></div>}
        <div className="security-note"><ShieldCheck size={16} /><span><b>Trust boundary</b> Your notes, drafts, and profile stay in the browser unless you actively use a cloud project or configure a remote endpoint.</span></div>
      </section>
    </div>
  </div>
}
