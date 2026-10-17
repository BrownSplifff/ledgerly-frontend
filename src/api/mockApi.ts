import { sampleConfidence, sampleDraft, sampleInvoices } from '../types'
import type { Invoice, InvoiceConfidence, InvoiceDraft } from '../types'

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms))
const safeStorage = {
  get(key: string) { try { return localStorage.getItem(key) } catch { return null } },
  set(key: string, value: string) { try { localStorage.setItem(key, value) } catch { /* Storage is optional in preview mode. */ } },
}

export async function mockSignIn(email: string, password: string, businessName?: string) {
  await delay(200)
  if (!email.includes('@') || password.length < 8) throw new Error('Enter a valid work email and a password with at least 8 characters.')
  const emailName = email.split('@')[0].split(/[._-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  const existingWorkspace = safeStorage.get('ledgerly-workspace-name')
  const displayName = emailName || 'Preview user'
  const isSameUser = safeStorage.get('ledgerly-user-email')?.toLowerCase() === email.toLowerCase()
  const workspaceName = businessName?.trim() || (isSameUser && existingWorkspace) || `${displayName}’s workspace`
  safeStorage.set('ledgerly-demo-signed-in', 'true')
  safeStorage.set('ledgerly-workspace-name', workspaceName)
  safeStorage.set('ledgerly-display-name', displayName)
  safeStorage.set('ledgerly-user-email', email)
  return { workspaceName, displayName, email }
}

export function getMockProfile() {
  return {
    workspaceName: safeStorage.get('ledgerly-workspace-name') || 'My workspace',
    displayName: safeStorage.get('ledgerly-display-name') || 'Preview user',
    email: safeStorage.get('ledgerly-user-email') || '',
  }
}

export async function mockPairAgent(code: string): Promise<{ paired: boolean }> {
  await delay(700)
  if (!/^[A-Z0-9-]{6,8}$/i.test(code.trim())) throw new Error('Enter a valid 6–8 character pairing code.')
  safeStorage.set('ledgerly-agent-paired', 'true')
  return { paired: true }
}

export async function getMockPairingStatus() { await delay(0); return safeStorage.get('ledgerly-agent-paired') === 'true' }
export function isMockAgentPaired() { return safeStorage.get('ledgerly-agent-paired') === 'true' }

export async function mockExtractInvoice(file?: File): Promise<{ draft: InvoiceDraft; confidence: InvoiceConfidence }> {
  await delay(500)
  return { draft: { ...sampleDraft, items: sampleDraft.items.map((item) => ({ ...item })), sourceFile: file?.name ?? sampleDraft.sourceFile }, confidence: { ...sampleConfidence } }
}

export async function mockGetInvoices(): Promise<Invoice[]> {
  const saved = safeStorage.get('ledgerly-invoices-v2')
  if (!saved) return sampleInvoices
  try { const records = JSON.parse(saved); return Array.isArray(records) ? records as Invoice[] : [] } catch { return [] }
}

export async function mockStoreInvoices(invoices: Invoice[]) { safeStorage.set('ledgerly-invoices-v2', JSON.stringify(invoices)) }

export type QueryId = 'total_paid_to_vendor' | 'list_overdue' | 'invoices_between_dates' | 'top_vendors'
export type QueryResponse = { text: string; rows?: Invoice[]; totals?: Array<{ vendor: string; total: number }> }
const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export async function mockQueryInvoices(queryId: QueryId, prompt: string, invoices: Invoice[]): Promise<QueryResponse> {
  await delay(320)
  if (queryId === 'list_overdue') {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const rows = invoices.filter((invoice) => invoice.dueDate && invoice.dueDate < today && invoice.paymentStatus !== 'Paid')
    const missing = invoices.filter((invoice) => !invoice.dueDate || !invoice.paymentStatus).length
    return { text: `${rows.length} overdue invoice${rows.length === 1 ? '' : 's'} found.${missing ? ` ${missing} record${missing === 1 ? ' is' : 's are'} missing due-date or payment data and could not be checked.` : ''}`, rows }
  }
  if (queryId === 'invoices_between_dates') {
    const dates = prompt.match(/\d{4}-\d{2}-\d{2}/g)
    if (!dates || dates.length < 2) return { text: 'Include a start and end date in YYYY-MM-DD format (for example, 2026-10-01 to 2026-10-31).' }
    const [start, end] = dates
    const rows = invoices.filter((invoice) => invoice.date >= start && invoice.date <= end)
    return { text: `${rows.length} invoice${rows.length === 1 ? '' : 's'} dated ${start} through ${end}.`, rows }
  }
  if (queryId === 'top_vendors') {
    const grouped = invoices.reduce<Record<string, number>>((result, invoice) => { result[invoice.vendor] = (result[invoice.vendor] ?? 0) + invoice.total; return result }, {})
    return { text: 'Top vendors by recorded invoice total:', totals: Object.entries(grouped).map(([vendor, total]) => ({ vendor, total })).sort((a, b) => b.total - a.total).slice(0, 5) }
  }
  const vendor = invoices.find((invoice) => prompt.toLowerCase().includes(invoice.vendor.toLowerCase()))?.vendor
  const rows = (vendor ? invoices.filter((invoice) => invoice.vendor === vendor) : invoices).filter((invoice) => invoice.amountPaid !== undefined)
  const amountPaid = rows.reduce((sum, invoice) => sum + (invoice.amountPaid ?? 0), 0)
  const missing = invoices.filter((invoice) => invoice.amountPaid === undefined).length
  return { text: `${vendor ?? 'All vendors'}: ${money(amountPaid)} recorded as paid across ${rows.length} invoice${rows.length === 1 ? '' : 's'}.${missing ? ` Payment amounts are missing on ${missing} record${missing === 1 ? '' : 's'}.` : ''}`, rows }
}

export function invoicesToCsv(invoices: Invoice[]) {
  const fields: Array<keyof Invoice> = ['vendor', 'invoiceNumber', 'date', 'dueDate', 'subtotal', 'tax', 'total', 'currency', 'paymentStatus', 'amountPaid', 'status', 'sourceFile']
  return [fields.join(','), ...invoices.map((invoice) => fields.map((field) => `"${String(invoice[field] ?? '').replaceAll('"', '""')}"`).join(','))].join('\r\n')
}
