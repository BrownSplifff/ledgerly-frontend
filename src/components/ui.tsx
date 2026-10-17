import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef, useCallback, useMemo, useState } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { ToastContext } from './toast-context'
import type { ToastMessage } from './toast-context'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'; size?: 'default' | 'sm' | 'lg' | 'icon'; asChild?: boolean }
const buttonStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const variants = { default: 'bg-gradient-to-r from-[#101b61] to-[#593b91] text-white hover:brightness-105', secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80', outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground', ghost: 'hover:bg-accent hover:text-accent-foreground', destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' }
const sizes = { default: 'h-9 px-4 py-2', sm: 'h-8 rounded-md px-3 text-xs', lg: 'h-11 rounded-md px-8', icon: 'h-9 w-9' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button'
  return <Component ref={ref} className={cn(buttonStyles, variants[variant], sizes[size], className)} {...props} />
})
Button.displayName = 'Button'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
))
Input.displayName = 'Input'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} /> }
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} /> }
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn('font-semibold leading-none tracking-tight', className)} {...props} /> }
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('text-sm text-muted-foreground', className)} {...props} /> }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('p-6 pt-0', className)} {...props} /> }

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out" /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg focus:outline-none', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 hover:opacity-100" aria-label="Close">×</DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>
}
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null)
  const [open, setOpen] = useState(false)
  const showToast = useCallback((nextMessage: ToastMessage) => { setMessage(nextMessage); setOpen(false); requestAnimationFrame(() => setOpen(true)) }, [])
  const value = useMemo(() => ({ showToast }), [showToast])
  return <ToastContext.Provider value={value}><ToastPrimitive.Provider swipeDirection="right"><ToastPrimitive.Root open={open} onOpenChange={setOpen} duration={5000} className="grid gap-1 rounded-lg border bg-background p-4 text-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out"><ToastPrimitive.Title className="text-sm font-semibold">{message?.title}</ToastPrimitive.Title><ToastPrimitive.Description className="text-sm text-muted-foreground">{message?.description}</ToastPrimitive.Description><ToastPrimitive.Close aria-label="Dismiss" className="absolute right-3 top-3">×</ToastPrimitive.Close></ToastPrimitive.Root><ToastPrimitive.Viewport className="fixed right-0 top-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4" /></ToastPrimitive.Provider>{children}</ToastContext.Provider>
}
