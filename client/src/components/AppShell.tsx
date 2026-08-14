// Design philosophy: Editorial Control Room — persistent navigation and a wide asymmetric workbench.

import { Link, useLocation } from 'wouter'
import { BarChart3, BookOpen, Clapperboard, FileText, Moon, Settings2, Sparkles, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const nav = [
  { href: '/generator', label: 'Generator', caption: 'Production desk', icon: Sparkles },
  { href: '/system/long', label: 'Long system', caption: 'Authority asset', icon: BookOpen },
  { href: '/system/short', label: 'Short system', caption: 'Discovery pack', icon: Clapperboard },
  { href: '/saved', label: 'Saved packs', caption: 'Local library', icon: FileText },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="app-shell">
      <aside className="side-rail">
        <Link href="/generator" className="brand-lockup" aria-label="Albadry Content Desk home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span><strong>ALBADRY</strong><small>CONTENT DESK</small></span>
        </Link>
        <div className="rail-rule" />
        <p className="rail-kicker">WORKSPACE</p>
        <nav className="rail-nav" aria-label="Primary navigation">
          {nav.map(({ href, label, caption, icon: Icon }) => {
            const active = location === href || (href !== '/generator' && location.startsWith(href))
            return <Link key={href} href={href} className={`rail-link ${active ? 'active' : ''}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span><strong>{label}</strong><small>{caption}</small></span>
            </Link>
          })}
        </nav>
        <div className="rail-spacer" />
        <Link href="/settings" className={`rail-link ${location === '/settings' ? 'active' : ''}`}>
          <Settings2 size={17} strokeWidth={1.8} />
          <span><strong>Settings</strong><small>Connection & rules</small></span>
        </Link>
        <div className="rail-status"><span className="status-dot" /> Local-first mode <span className="status-live">READY</span></div>
      </aside>
      <main className="main-stage">
        <header className="topbar">
          <div><span className="eyebrow">ALBADRY / VIDEO CONTENT SYSTEM</span><span className="topbar-title">Private production desk</span></div>
          <div className="topbar-meta"><span className="activity-chip"><i /> Desk live</span><span><BarChart3 size={14} /> Rules v3.2</span><span className="topbar-divider" /><span>14 AUG 2026</span><button className="theme-switch" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button></div>
        </header>
        {children}
      </main>
    </div>
  )
}
