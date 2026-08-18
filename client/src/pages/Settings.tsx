// Design philosophy: settings make creator preferences explicit, portable, and reversible without exposing secrets.

import { useState } from 'react'
import { AlignLeft, AlignRight, Check, CircleAlert, CircleCheck, Info, Languages, Loader2, Quote, ShieldCheck, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import StageSequence from '../components/StageSequence'
import { DEFAULT_AI_CONFIG, loadAiConfig, saveAiConfig } from '../lib/ai-config'
import { discoverAiModels, testAiConnection, type ConnectionTestResult } from '../lib/connection-test'
import { trpc } from '@/lib/trpc'
import { discoverKnownProviderModels, getProviderDescriptor, PROVIDER_CATALOG } from '../lib/provider-registry'

const languageSuggestions = ['English', 'Arabic', 'Arabic (Egyptian)', 'French', 'Spanish', 'Portuguese', 'German']

type ModelDiscoveryNotice = {
  kind: 'loading' | 'success' | 'info' | 'warning' | 'error'
  title: string
  detail: string
  nextAction?: string
}

function buildDiscoveryNotice(models: string[], detail: string, warning?: string, emptyKind: 'info' | 'warning' = 'info'): ModelDiscoveryNotice {
  if (models.length) {
    return {
      kind: warning ? 'warning' : 'success',
      title: `${models.length} ${models.length === 1 ? 'model ID' : 'model IDs'} discovered.`,
      detail: warning || `Exact IDs returned by the provider are listed below. ${detail}`,
      nextAction: warning ? 'Choose one of the listed IDs or verify the configured model before generating.' : 'Choose a listed ID, or keep the current model if it matches one of the returned IDs.',
    }
  }
  return {
    kind: emptyKind,
    title: 'No model IDs were returned.',
    detail: detail || 'The endpoint responded without a usable model list.',
    nextAction: 'Check the provider setup, enter a model ID manually, then try discovery again.',
  }
}

export default function Settings() {
  const [config, setConfig] = useState(() => typeof window === 'undefined' ? DEFAULT_AI_CONFIG : loadAiConfig())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null)
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [discoveringModels, setDiscoveringModels] = useState(false)
  const [modelDiscoveryNotice, setModelDiscoveryNotice] = useState<ModelDiscoveryNotice | null>(null)
  const provider = getProviderDescriptor(config.providerId)
  const hostedStatus = trpc.ai.providerStatus.useQuery(undefined, { enabled: config.providerMode === 'known-provider', retry: false })
  const currentHostedStatus = hostedStatus.data?.find((item) => item.providerId === config.providerId)
  const modelOptions = Array.from(new Set([...provider.suggestedModels, ...discoveredModels]))
  function update<K extends keyof typeof config>(key: K, value: (typeof config)[K]) { setConfig((current) => ({ ...current, [key]: value })) }
  function persist() {
    saveAiConfig(config)
    window.dispatchEvent(new Event('content-center-settings'))
    setSaved(true)
    toast.success('Workspace preferences saved', { description: 'They stay in this browser and shape future generation.' })
    window.setTimeout(() => setSaved(false), 1800)
  }
  async function testConnection() {
    setTesting(true); setConnectionResult(null); setModelDiscoveryNotice(null)
    const result = await testAiConnection(config)
    const models = result.models || []
    setConnectionResult(result); setDiscoveredModels(models); setTesting(false)
    if (models.length || result.ok) setModelDiscoveryNotice(buildDiscoveryNotice(models, result.detail || 'The endpoint responded.', result.warning, 'warning'))
    if (result.ok) toast.success(result.message, { description: result.warning || `${result.detail} ${models.length ? `Found ${models.length} exact model ID${models.length === 1 ? '' : 's'}.` : 'No model IDs were returned.'}` })
    else toast.error(result.message, { description: result.retryable ? `${result.detail} Retry is available. ${result.nextAction}` : `${result.detail} ${result.nextAction}` })
    setTesting(false)
  }
  async function discoverModels() {
    setDiscoveringModels(true); setModelDiscoveryNotice({ kind: 'loading', title: 'Discovering model IDs…', detail: 'Reading the provider’s models endpoint. No prompt or credential is being sent from this browser.' })
    try {
      if (config.providerMode === 'known-provider') {
        const result = await discoverKnownProviderModels(config.providerId)
        setDiscoveredModels(result.models)
        setModelDiscoveryNotice(buildDiscoveryNotice(result.models, result.detail))
        if (result.models.length) toast.success('Model IDs discovered.', { description: `${result.models.length} exact provider ID${result.models.length === 1 ? '' : 's'} are available below.` })
        else toast.message('Model discovery returned no IDs.', { description: result.detail })
      } else {
        const result = await discoverAiModels(config)
        const models = result.models || []
        setDiscoveredModels(models)
        if (!result.ok) {
          setModelDiscoveryNotice({ kind: 'error', title: result.message, detail: result.detail || 'The local endpoint did not return a usable response.', nextAction: result.nextAction })
          toast.error(result.message, { description: `${result.detail || 'The local endpoint did not return a usable response.'} ${result.nextAction}` })
        } else {
          setModelDiscoveryNotice(buildDiscoveryNotice(models, result.detail || 'The local endpoint responded.', result.warning, 'warning'))
          if (models.length) toast.success('Local model IDs discovered.', { description: `${models.length} exact ID${models.length === 1 ? '' : 's'} are available below.` })
          else toast.warning('No local model IDs were returned.', { description: `${result.detail || 'The endpoint responded without model IDs.'} ${result.nextAction}` })
        }
      }
    } catch (error) {
      const detail = 'The provider did not return a usable discovery response.'
      setDiscoveredModels([])
      setModelDiscoveryNotice({ kind: 'error', title: 'Model discovery failed.', detail, nextAction: 'Check the provider status and retry discovery.' })
      toast.error('Model discovery failed.', { description: `${detail} Check the provider status and retry.` })
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
        {modelDiscoveryNotice && <div className={`model-discovery-notice ${modelDiscoveryNotice.kind}`} role={modelDiscoveryNotice.kind === 'error' ? 'alert' : 'status'} aria-live="polite">{modelDiscoveryNotice.kind === 'loading' ? <Loader2 className="spin" size={16} /> : modelDiscoveryNotice.kind === 'success' ? <CircleCheck size={16} /> : modelDiscoveryNotice.kind === 'warning' ? <TriangleAlert size={16} /> : <Info size={16} />}<span><b>{modelDiscoveryNotice.title}</b><small>{modelDiscoveryNotice.detail}</small>{modelDiscoveryNotice.nextAction && <small><strong>Next:</strong> {modelDiscoveryNotice.nextAction}</small>}</span></div>}
        {discoveredModels.length > 0 && <div className="discovered-models" aria-label="Discovered model IDs"><div className="discovered-models-heading"><span><b>Exact model IDs</b><small>Returned by the configured provider</small></span><span>{discoveredModels.length} available</span></div><ul>{discoveredModels.map((model) => <li key={model}><button type="button" className={config.model === model ? 'selected' : ''} onClick={() => update('model', model)} aria-label={`Use discovered model ${model}`}><span>{config.model === model ? 'Selected' : 'Use'}</span><code>{model}</code></button></li>)}</ul></div>}
        {connectionResult && <div className={`connection-result ${connectionResult.ok ? 'success' : 'error'}`} role={connectionResult.ok ? 'status' : 'alert'} aria-live="polite">{connectionResult.ok ? <CircleCheck size={16} /> : <CircleAlert size={16} />}<span><b>{connectionResult.message}</b><small>{connectionResult.warning || connectionResult.detail}</small><small><strong>Next:</strong> {connectionResult.nextAction}</small></span></div>}
        <div className="security-note"><ShieldCheck size={16} /><span><b>Trust boundary</b> Your notes, drafts, and profile stay in this browser unless you actively use a cloud project. This local connection supports endpoints that do not require browser-held credentials.</span></div>
      </section>
    </div>
  </div>
}
