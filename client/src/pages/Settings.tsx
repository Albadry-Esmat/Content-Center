// Design philosophy: settings make creator preferences explicit, portable, and reversible without exposing secrets.

import { useState } from 'react'
import { AlignLeft, AlignRight, Check, CircleAlert, CircleCheck, Languages, Loader2, Quote, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import StageSequence from '../components/StageSequence'
import { DEFAULT_AI_CONFIG, loadAiConfig, saveAiConfig } from '../lib/ai-config'
import { testAiConnection, type ConnectionTestResult } from '../lib/connection-test'
import { trpc } from '@/lib/trpc'
import { discoverKnownProviderModels, getProviderDescriptor, PROVIDER_CATALOG } from '../lib/provider-registry'

const languageSuggestions = ['English', 'Arabic', 'Arabic (Egyptian)', 'French', 'Spanish', 'Portuguese', 'German']

export default function Settings() {
  const [config, setConfig] = useState(() => typeof window === 'undefined' ? DEFAULT_AI_CONFIG : loadAiConfig())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null)
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [discoveringModels, setDiscoveringModels] = useState(false)
  const [modelDiscoveryMessage, setModelDiscoveryMessage] = useState('')
  const provider = getProviderDescriptor(config.providerId)
  const hostedStatus = trpc.ai.providerStatus.useQuery(undefined, { enabled: config.providerMode === 'known-provider', retry: false })
  const currentHostedStatus = hostedStatus.data?.find((item) => item.providerId === config.providerId)
  const modelOptions = Array.from(new Set([...provider.suggestedModels, ...discoveredModels]))
  function update<K extends keyof typeof config>(key: K, value: (typeof config)[K]) { setConfig((current) => ({ ...current, [key]: value })) }
  function persist() {
    saveAiConfig(config)
    setSaved(true)
    toast.success('Workspace preferences saved', { description: 'They stay in this browser and shape future generation.' })
    window.setTimeout(() => setSaved(false), 1800)
  }
  async function testConnection() {
    setTesting(true); setConnectionResult(null)
    const result = await testAiConnection(config)
    setConnectionResult(result); setDiscoveredModels(result.models || []); setModelDiscoveryMessage(result.models?.length ? `${result.models.length} local models discovered.` : ''); setTesting(false)
    if (result.ok) toast.success(result.message, { description: result.warning || result.detail })
    else toast.error(result.message, { description: result.detail })
  }
  async function discoverModels() {
    setDiscoveringModels(true); setModelDiscoveryMessage('')
    try {
      if (config.providerMode === 'known-provider') {
        const result = await discoverKnownProviderModels(config.providerId)
        setDiscoveredModels(result.models); setModelDiscoveryMessage(result.detail)
      } else {
        const result = await testAiConnection(config)
        setDiscoveredModels(result.models || []); setModelDiscoveryMessage(result.models?.length ? `${result.models.length} local models discovered.` : result.detail || 'No models were returned.')
      }
    } catch (error) {
      setModelDiscoveryMessage(error instanceof Error ? error.message : 'Model discovery failed.')
    } finally { setDiscoveringModels(false) }
  }

  return <div className="page page-settings">
    <div className="source-strip"><span className="source-tape">WORKSPACE PREFERENCES / TRUST BOUNDARY</span><span>LOCAL-FIRST · BROWSER CREDENTIALS / NOT STORED · CREATOR PROFILE / READY</span></div>
    <StageSequence active="fields" />
    <div className="page-heading"><div><span className="section-index">06 / SETTINGS & PREFERENCES</span><h1>Set the working style.</h1><p>Shape how every future brief and script reads without keeping provider credentials in this browser.</p></div><div className="settings-shield"><ShieldCheck size={18} /><span>Preference scope<br /><b>This browser</b></span></div></div>
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
        <p className="field-hint">Separate phrases with commas or new lines. They are optional cues—not compulsory copy—and remain independent from provider credentials.</p>
        <div className="profile-summary"><Quote size={16} /><span><b>{config.scriptLanguage || 'Language not selected'} · {config.textDirection.toUpperCase()}</b><small>{config.brandPhrases.trim() ? 'Brand phrases will be available to the model.' : 'No brand phrases configured.'}</small></span></div>
        <div className="connection-actions"><button className="button button-primary" onClick={persist}><Check size={15} /> {saved ? 'Preferences saved' : 'Save preferences'}</button></div>
      </section>
      <section className="settings-card">
        <div className="card-header"><span className="section-index">AI CONNECTION</span><ShieldCheck size={16} /></div>
        <div className="profile-summary"><ShieldCheck size={16} /><span><b>{config.providerMode === 'local' ? 'LOCAL AI / PRIVACY-FIRST' : 'KNOWN PROVIDER / SECURE ROUTING REQUIRED'}</b><small>{provider.label} · {provider.endpointStyle}</small></span></div>
        <div className="security-note"><ShieldCheck size={16} /><span><b>{provider.requiresServerProxy ? 'Server proxy required' : 'Browser-safe local endpoint'}</b> {provider.privacyNote}</span></div>
        {provider.requiresServerProxy && <div className={`provider-status-card ${currentHostedStatus?.configured ? 'configured' : 'not-configured'}`} role="status"><span className="status-dot" /><span><b>{hostedStatus.isLoading ? 'Checking hosted-provider status…' : currentHostedStatus?.configured ? 'Server credential configured' : 'Server credential not configured'}</b><small>{currentHostedStatus?.detail || (hostedStatus.isError ? 'Sign in to inspect the protected server status.' : 'Status is available only through the protected server route.')}</small></span></div>}
        <p className="settings-intro">Use an unauthenticated browser-local OpenAI-compatible endpoint today. Known providers require a future server-side credential boundary, so credentials are never stored or sent from this browser.</p>
        <label htmlFor="provider">Provider</label><select id="provider" value={config.providerId} onChange={(event) => { const selected = getProviderDescriptor(event.target.value); setConfig((current) => ({ ...current, providerId: selected.id, providerMode: selected.mode })) }}>{PROVIDER_CATALOG.map((item) => <option key={item.id} value={item.id}>{item.label}{item.requiresServerProxy ? ' · server proxy' : ' · local'}</option>)}</select>
        <label htmlFor="base-url">OpenAI-compatible base URL</label><input id="base-url" value={config.baseUrl} onChange={(event) => update('baseUrl', event.target.value)} />
        <label htmlFor="model">Model</label><input id="model" list="model-options" value={config.model} onChange={(event) => update('model', event.target.value)} /><datalist id="model-options">{modelOptions.map((model) => <option key={model} value={model} />)}</datalist>
        <div className="connection-actions"><button className="button button-quiet" onClick={testConnection} disabled={testing}>{testing ? <><Loader2 className="spin" size={15} /> Testing connection…</> : <><CircleCheck size={15} /> Test connection</>}</button><button className="button button-quiet" onClick={discoverModels} disabled={discoveringModels}>{discoveringModels ? <><Loader2 className="spin" size={15} /> Discovering models…</> : <><SlidersHorizontal size={15} /> Discover models</>}</button><button className="button button-quiet" onClick={persist}><Check size={15} /> Save all settings</button></div>
        {modelDiscoveryMessage && <p className="field-hint" role="status">{modelDiscoveryMessage}</p>}
        {connectionResult && <div className={`connection-result ${connectionResult.ok ? 'success' : 'error'}`} role={connectionResult.ok ? 'status' : 'alert'} aria-live="polite">{connectionResult.ok ? <CircleCheck size={16} /> : <CircleAlert size={16} />}<span><b>{connectionResult.message}</b><small>{connectionResult.warning || connectionResult.detail}</small><small><strong>Next:</strong> {connectionResult.nextAction}</small></span></div>}
        <div className="security-note"><ShieldCheck size={16} /><span><b>Trust boundary</b> Your notes, drafts, and profile stay in this browser unless you actively use a cloud project. This local connection supports endpoints that do not require browser-held credentials.</span></div>
      </section>
    </div>
  </div>
}
