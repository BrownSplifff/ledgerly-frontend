import { useContext } from 'react'
import { InvoiceContext } from './invoice-context'

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (!context) throw new Error('useInvoices must be used inside InvoiceProvider')
  return context
}
