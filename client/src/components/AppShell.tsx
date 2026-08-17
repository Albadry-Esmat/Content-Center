// Design philosophy: Editorial Control Room — persistent navigation and a wide asymmetric workbench.

import { useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { BarChart3, BookOpen, Clapperboard, Cloud, FileText, Moon, Settings2, Sparkles, Sun } from 'lucide-react'
import { useAuth } from '@/_core/hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { loadAiConfig } from '../lib/ai-config'

const nav = [
  { href: '/workspace', label: 'Workspace', caption: 'Cloud projects', icon: Cloud },
  { href: '/generator', label: 'Create', caption: 'Content builder', icon: Sparkles },
  { href: '/system/long', label: 'Long-form', caption: 'Authority story', icon: BookOpen },
  { href: '/system/short', label: 'Short-form', caption: 'Social series', icon: Clapperboard },
  { href: '/saved', label: 'Library', caption: 'Saved packs', icon: FileText },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  useEffect(() => {
    const applyDirection = () => { document.documentElement.dir = loadAiConfig().textDirection }
    applyDirection()
    window.addEventListener('content-center-settings', applyDirection)
    return () => window.removeEventListener('content-center-settings', applyDirection)
  }, [])
  return (
    <div className="app-shell"><a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="side-rail">
        <Link href="/" className="brand-lockup" aria-label="Content Center home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span><strong>CONTENT CENTER</strong><small>CREATOR OPERATIONS</small></span>
        </Link>
        <div className="rail-rule" />
        <p className="rail-kicker">WORKSPACE</p>
        <nav className="rail-nav" aria-label="Primary navigation">
          {nav.map(({ href, label, caption, icon: Icon }) => {
            const active = location === href || (href !== '/generator' && location.startsWith(href))
            return <Link key={href} href={href} className={`rail-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon size={17} strokeWidth={1.8} />
              <span><strong>{label}</strong><small>{caption}</small></span>
            </Link>
          })}
        </nav>
        <div className="rail-spacer" />
        <Link href="/settings" className={`rail-link ${location === '/settings' ? 'active' : ''}`}>
          <Settings2 size={17} strokeWidth={1.8} />
          <span><strong>Settings</strong><small>Voice & connection</small></span>
        </Link>
        <div className="rail-account"><span className="section-index">ACCOUNT</span><strong>{isAuthenticated ? user?.name || 'Signed in' : 'Local mode'}</strong><small>{isAuthenticated ? 'Cloud workspace available' : 'Sign in to sync projects'}</small></div><div className="rail-status"><span className="status-dot" /> {isAuthenticated ? 'Cloud sync ready' : 'Local-first mode'} <span className="status-live">READY</span></div>
      </aside>
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header className="topbar">
          <div><span className="eyebrow">CONTENT CENTER / CREATOR OPERATIONS</span><span className="topbar-title">A shared space for content decisions</span></div>
          <div className="topbar-meta"><span className="activity-chip"><i /> Workspace live</span><span><BarChart3 size={14} /> Content flow</span><span className="topbar-divider" /><span>{isAuthenticated ? 'Cloud ready' : 'Local-first'}</span><button className="theme-switch" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button></div>
        </header>
        {children}
      </main>
    </div>
  )
}
