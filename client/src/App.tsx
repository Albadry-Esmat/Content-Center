// Design philosophy: Editorial Control Room — route semantics replace tab-driven DOM mutation.
import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'wouter'
import AppShell from './components/AppShell'
import { ThemeProvider } from './contexts/ThemeContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { Toaster } from './components/ui/sonner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Generator = lazy(() => import('./pages/Generator'))
const Saved = lazy(() => import('./pages/Saved'))
const Settings = lazy(() => import('./pages/Settings'))
const SystemPage = lazy(() => import('./pages/SystemPage'))
const Workspace = lazy(() => import('./pages/Workspace'))

function RouteLoading() {
  return <div className="page route-loading" role="status" aria-live="polite">Opening production desk…</div>
}

function RoutedView({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>
}

export default function App() {
  return <ThemeProvider defaultTheme="dark" switchable><WorkspaceProvider><Toaster /><AppShell><Switch>
    <Route path="/"><RoutedView><Dashboard /></RoutedView></Route>
    <Route path="/generator"><RoutedView><Generator /></RoutedView></Route>
    <Route path="/system/long"><RoutedView><SystemPage kind="long" /></RoutedView></Route>
    <Route path="/system/short"><RoutedView><SystemPage kind="short" /></RoutedView></Route>
    <Route path="/saved"><RoutedView><Saved /></RoutedView></Route>
    <Route path="/settings"><RoutedView><Settings /></RoutedView></Route>
    <Route path="/workspace"><RoutedView><Workspace /></RoutedView></Route>
    <Route><Redirect to="/" /></Route>
  </Switch></AppShell></WorkspaceProvider></ThemeProvider>
}
