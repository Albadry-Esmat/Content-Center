'use client'

import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('../client/src/pages/Dashboard'), { ssr: false })
const Generator = dynamic(() => import('../client/src/pages/Generator'), { ssr: false })
const Saved = dynamic(() => import('../client/src/pages/Saved'), { ssr: false })
const Settings = dynamic(() => import('../client/src/pages/Settings'), { ssr: false })
const SystemPage = dynamic(() => import('../client/src/pages/SystemPage'), { ssr: false })

export function LegacyDashboard() { return <Dashboard /> }
export function LegacyGenerator() { return <Generator /> }
export function LegacySaved() { return <Saved /> }
export function LegacySettings() { return <Settings /> }
export function LegacySystem({ kind }: { kind: 'long' | 'short' }) { return <SystemPage kind={kind} /> }
