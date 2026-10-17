import { createContext } from 'react'

export type ToastMessage = { title: string; description?: string }
export type ToastContextType = { showToast: (message: ToastMessage) => void }
export const ToastContext = createContext<ToastContextType | null>(null)
