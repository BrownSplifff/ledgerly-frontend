import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Invoice, InvoiceDraft } from '../types'
import { mockGetInvoices, mockStoreInvoices } from '../api/mockApi'
import { InvoiceContext } from './invoice-context'

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { let active = true; void mockGetInvoices().then((records) => { if (active) { setInvoices(records); setLoaded(true) } }); return () => { active = false } }, [])
  useEffect(() => { if (loaded) void mockStoreInvoices(invoices) }, [invoices, loaded])

  const saveInvoice = useCallback((draft: InvoiceDraft) => {
    const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    const duplicate = invoices.some((invoice) => normalize(invoice.vendor) === normalize(draft.vendor) && normalize(invoice.invoiceNumber) === normalize(draft.invoiceNumber))
    const record: Invoice = { ...draft, id: globalThis.crypto?.randomUUID?.() ?? `inv-${Date.now()}`, status: duplicate ? 'Duplicate' : 'Saved' }
    setInvoices((current) => [record, ...current])
    return record
  }, [invoices])
  const value = useMemo(() => ({ invoices, saveInvoice }), [invoices, saveInvoice])

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
}
