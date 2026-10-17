import { createContext } from 'react'
import type { Invoice, InvoiceDraft } from '../types'

export type InvoiceStore = { invoices: Invoice[]; saveInvoice: (draft: InvoiceDraft) => Invoice }
export const InvoiceContext = createContext<InvoiceStore | null>(null)
