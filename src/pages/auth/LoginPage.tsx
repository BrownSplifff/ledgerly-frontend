import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button, Input } from '../../components/ui'
import { useToast } from '../../components/useToast'
import { signIn } from '../../api/client'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const values = new FormData(event.currentTarget)
    try {
      await signIn(String(values.get('email') ?? ''), String(values.get('password') ?? ''), String(values.get('businessName') ?? ''))
    } catch (error) { showToast({ title: 'Could not sign in', description: error instanceof Error ? error.message : 'Try again.' }) }
    finally { setSubmitting(false) }
  }

  return <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,.95fr)]">
    <section className="relative hidden overflow-hidden bg-[#111b4f] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
      <div className="pointer-events-none absolute -right-44 -top-52 size-[560px] rounded-full border border-white/10" /><div className="pointer-events-none absolute -right-20 -top-28 size-[320px] rounded-full border border-white/10" /><div className="pointer-events-none absolute -bottom-52 -left-36 size-[470px] rounded-full border border-white/10" />
      <Link to="/login" className="relative z-10 flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-white/10"><FileCheck2 size={18} /></span>ledgerly<span className="text-violet-300">.</span></Link>
      <div className="relative z-10 max-w-xl pb-10"><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Invoice automation for independent businesses</p><h1 className="text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">Your paperwork,<br />back in order.</h1><p className="mt-5 max-w-md text-sm leading-6 text-white/65">Capture an invoice, enter its details, and review every field before saving.</p><div className="mt-9 grid gap-3 text-xs text-white/75"><div className="flex items-center gap-2.5"><span className="grid size-6 place-items-center rounded-full bg-white/10"><ShieldCheck size={13} /></span>Human review before any record is saved</div><div className="flex items-center gap-2.5"><span className="grid size-6 place-items-center rounded-full bg-white/10"><LockKeyhole size={13} /></span>Designed around local data ownership</div></div></div>
      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-[10px] text-white/45"><span>Invoice workspace</span><span>Sign in · Continue · Upload</span></div>
    </section>

    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
      <div className="flex items-center justify-between lg:justify-end"><Link to="/login" className="flex items-center gap-2 text-sm font-semibold tracking-tight lg:hidden"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><FileCheck2 size={15} /></span>ledgerly<span className="-ml-2 text-primary">.</span></Link><p className="text-xs text-muted-foreground">{mode === 'login' ? 'New to Ledgerly?' : 'Already have an account?'} <button className="ml-1 font-medium text-primary hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p></div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <div className="mb-7"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-primary">{mode === 'login' ? 'Welcome back' : 'Get started'}</p><h2 className="text-2xl font-semibold tracking-tight">{mode === 'login' ? 'Sign in to Ledgerly' : 'Create your workspace'}</h2><p className="mt-2 text-sm text-muted-foreground">{mode === 'login' ? 'Account sign-in becomes available when authentication is connected.' : 'Create a business workspace when account authentication is connected.'}</p></div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === 'signup' && <label className="grid gap-1.5 text-xs font-medium">Business name<Input name="businessName" required placeholder="Your business name" autoComplete="organization" /></label>}
          <label className="grid gap-1.5 text-xs font-medium">Work email<Input name="email" required type="email" placeholder="you@company.com" autoComplete="email" /></label>
          <label className="grid gap-1.5 text-xs font-medium">Password<div className="relative"><Input name="password" required type={showPassword ? 'text' : 'password'} minLength={8} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="pr-10" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
          {mode === 'login' && <div className="-mt-1 flex items-center justify-between text-[11px]"><label className="flex items-center gap-2 font-normal text-muted-foreground"><input type="checkbox" className="size-3.5 accent-[#392d91]" />Remember this device</label><button type="button" className="font-medium text-primary hover:underline" onClick={() => showToast({ title: 'Password reset', description: 'Password recovery will be available when account authentication is connected.' })}>Forgot password?</button></div>}
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>{submitting ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={15} /></Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-[10px] text-muted-foreground"><span className="h-px flex-1 bg-border" />EXPLORE LEDGERLY<span className="h-px flex-1 bg-border" /></div>
        <div className="rounded-md border bg-muted/30 p-3.5 text-[11px] leading-5 text-muted-foreground"><div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground"><ShieldCheck size={13} className="text-primary" />Account access unavailable</div>Authentication is not connected yet. You can explore the product pages without signing in.</div>
      </div>
      <div className="pb-2 text-center text-[10px] text-muted-foreground"><Link className="font-medium text-primary hover:underline" to="/landing">Explore Ledgerly without signing in</Link><p className="mt-2">Account authentication is not connected yet.</p></div>
    </section>
  </main>
}
