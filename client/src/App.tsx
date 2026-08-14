// Design philosophy: Editorial Control Room — route semantics replace tab-driven DOM mutation.
import { Redirect, Route, Switch } from 'wouter'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import Saved from './pages/Saved'
import Settings from './pages/Settings'
import SystemPage from './pages/SystemPage'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return <ThemeProvider defaultTheme="dark" switchable><AppShell><Switch>
    <Route path="/"><Dashboard /></Route>
    <Route path="/generator"><Generator /></Route>
    <Route path="/system/long"><SystemPage kind="long" /></Route>
    <Route path="/system/short"><SystemPage kind="short" /></Route>
    <Route path="/saved"><Saved /></Route>
    <Route path="/settings"><Settings /></Route>
    <Route><Redirect to="/" /></Route>
  </Switch></AppShell></ThemeProvider>
}
