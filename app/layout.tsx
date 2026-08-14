import type { Metadata } from 'next'
import './next.css'

export const metadata: Metadata = { title: 'Albadry Content Desk', description: 'Local-first technical video production desk.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
