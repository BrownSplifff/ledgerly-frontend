import { lazy, Suspense } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Files, LayoutDashboard, Link2, ScanLine, Settings2 } from 'lucide-react'
import { useInvoices } from './context/useInvoices'
import { getMockProfile, isMockAgentPaired } from './api/mockApi'
import './App.css'

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const LandingPage = lazy(() => import('./pages/marketing/LandingPage').then((module) => ({ default: module.LandingPage })))
const PairingPage = lazy(() => import('./pages/workspace/PairingPage').then((module) => ({ default: module.PairingPage })))
const CapturePage = lazy(() => import('./pages/workspace/CapturePage').then((module) => ({ default: module.CapturePage })))
const DashboardPage = lazy(() => import('./pages/workspace/DashboardPage').then((module) => ({ default: module.DashboardPage })))

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/capture', label: 'Capture & review', icon: ScanLine },
  { to: '/pairing', label: 'Pair local agent', icon: Link2 },
]

function WorkspaceLayout() {
  const location = useLocation()
  const { invoices } = useInvoices()
  const isPaired = isMockAgentPaired()
  const profile = getMockProfile()
  const isPairing = location.pathname === '/pairing'
  const pageName = location.pathname === '/capture' ? 'Capture & review' : isPairing ? 'Pair device' : 'Invoice register'

  return <div className="ledgerly-scroll-region min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b bg-white px-4 md:px-7">
      <NavLink to="/dashboard" className="flex items-center gap-2.5 text-base font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Files size={18} /></span><span>Invoice Automation<span className="text-primary">.</span></span></NavLink>
      <div className="flex items-center gap-3 md:gap-6"><span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-800 sm:inline-flex"><i className={`size-2 rounded-full ${isPaired ? 'bg-emerald-600' : 'bg-slate-400'}`} />{isPaired ? 'Preview agent connected' : 'PC agent not connected'}</span><span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{profile.displayName.charAt(0).toUpperCase()}</span><span className="hidden text-xs font-medium sm:block">{profile.displayName}</span></div>
    </header>
    <div className={`min-h-[calc(100vh-68px)] ${isPairing ? '' : 'md:grid md:grid-cols-[220px_minmax(0,1fr)]'}`}>
      {!isPairing && <aside className="hidden border-r bg-white md:flex md:flex-col">
        <div className="px-3 pt-7"><p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Workspace</p><nav className="grid gap-1">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex h-10 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={16} strokeWidth={1.8} />{label}{to === '/capture' && invoices.some((invoice) => invoice.status === 'Needs review') && <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{invoices.filter((invoice) => invoice.status === 'Needs review').length}</span>}</NavLink>)}</nav></div>
        <div className="mt-auto border-t p-3"><div className="mb-3 flex items-center gap-2.5 rounded-md border bg-slate-50 p-3"><span className={`size-2 shrink-0 rounded-full ${isPaired ? 'bg-emerald-500' : 'bg-slate-400'}`} /><div><p className="text-[10px] font-semibold uppercase tracking-wide">PC agent: {isPaired ? 'Preview connected' : 'Not connected'}</p><p className="mt-1 text-[10px] text-muted-foreground">Browser storage preview</p></div></div><button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-xs text-muted-foreground hover:bg-muted"><span className="grid size-7 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground">{profile.displayName.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-foreground">{profile.workspaceName}</span><span className="text-[10px]">{profile.displayName}</span></span><Settings2 size={14} /></button></div>
      </aside>}
      <div className="min-w-0"><div className="hidden h-11 items-center gap-2 px-7 text-xs text-muted-foreground md:flex"><span>Workspace</span><span className="text-border">/</span><span className="font-medium text-foreground">{pageName}</span></div><Suspense fallback={<main className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted-foreground">Loading workspace…</main>}><Outlet /></Suspense></div>
    </div>
    {!isPairing && <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-white p-1.5 md:hidden">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded py-1.5 text-[9px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}><Icon size={17} />{label}</NavLink>)}</nav>}
  </div>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Suspense fallback={<PageLoading />}><LoginPage /></Suspense>} />
    <Route path="/landing" element={<Suspense fallback={<PageLoading />}><LandingPage /></Suspense>} />
    <Route element={<WorkspaceLayout />}>
      <Route path="/pairing" element={<PairingPage />} />
      <Route path="/capture" element={<CapturePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
}

function PageLoading() {
  return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading Ledgerly…</main>
}
