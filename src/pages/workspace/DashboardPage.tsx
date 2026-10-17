import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpRight, Bot, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, FileClock, FileText, MessageSquareText, Search, Send, ShieldCheck, Sparkles, Users, Upload } from 'lucide-react'
import Badge from '@tremor/react/dist/components/icon-elements/Badge/Badge.js'
import TremorCard from '@tremor/react/dist/components/layout-elements/Card/Card.js'
import Table from '@tremor/react/dist/components/list-elements/Table/Table.js'
import TableBody from '@tremor/react/dist/components/list-elements/Table/TableBody.js'
import TableCell from '@tremor/react/dist/components/list-elements/Table/TableCell.js'
import TableHead from '@tremor/react/dist/components/list-elements/Table/TableHead.js'
import TableHeaderCell from '@tremor/react/dist/components/list-elements/Table/TableHeaderCell.js'
import TableRow from '@tremor/react/dist/components/list-elements/Table/TableRow.js'
import Metric from '@tremor/react/dist/components/text-elements/Metric/Metric.js'
import Text from '@tremor/react/dist/components/text-elements/Text/Text.js'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Input } from '../../components/ui'
import { useToast } from '../../components/useToast'
import { useInvoices } from '../../context/useInvoices'
import type { Invoice } from '../../types'
import { invoicesToCsv, mockQueryInvoices } from '../../api/mockApi'

const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const quickQueries = [
  { id: 'total_paid_to_vendor', label: 'Total to a vendor', query: 'How much have I recorded for a vendor?' },
  { id: 'list_overdue', label: 'Overdue invoices', query: 'Show my overdue invoices' },
  { id: 'invoices_between_dates', label: 'Invoices by date range', query: 'Show invoices between dates' },
  { id: 'top_vendors', label: 'Top vendors', query: 'Show my top vendors' },
] as const
type QueryId = typeof quickQueries[number]['id']
type ChatMessage = { role: 'user' | 'assistant'; text: string; rows?: Invoice[]; totals?: Array<{ vendor: string; total: number }> }

export function DashboardPage() {
  const { invoices } = useInvoices()
  const [question, setQuestion] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'I can help you explore the invoice records on this device. Choose a supported query below, or ask in your own words.' }])
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const reviewCount = invoices.filter((invoice) => invoice.status === 'Needs review').length
  const vendorCount = new Set(invoices.map((invoice) => invoice.vendor)).size
  const incompletePaymentCount = invoices.filter((invoice) => invoice.amountPaid === undefined || !invoice.paymentStatus).length
  const outstanding = invoices.reduce((sum, invoice) => sum + Math.max(0, invoice.total - (invoice.amountPaid ?? 0)), 0)
  const filteredInvoices = useMemo(() => invoices
    .filter((invoice) => statusFilter === 'all' || invoice.status === statusFilter)
    .filter((invoice) => `${invoice.vendor} ${invoice.invoiceNumber} ${invoice.sourceFile ?? ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [invoices, searchTerm, statusFilter])
  const pageSize = 6
  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / pageSize))
  const pageInvoices = filteredInvoices.slice(page * pageSize, (page + 1) * pageSize)
  const pageIds = pageInvoices.map((invoice) => invoice.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  function exportCsv() {
    const exportRows = selectedIds.length ? filteredInvoices.filter((invoice) => selectedIds.includes(invoice.id)) : filteredInvoices
    const url = URL.createObjectURL(new Blob([invoicesToCsv(exportRows)], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ledgerly-invoices.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToast({ title: 'CSV exported', description: `${exportRows.length} ${exportRows.length === 1 ? 'invoice' : 'invoices'} downloaded.` })
  }

  async function runQuery(rawQuestion: string, requestedId?: QueryId) {
    const text = rawQuestion.trim()
    if (!text || busy) return
    setQuestion('')
    setBusy(true)
    const normalized = text.toLowerCase()
    const supportedPaidQuery = ['paid', 'spend', 'spent', 'total', 'amount', 'how much'].some((term) => normalized.includes(term))
    const supportedQuery = requestedId || normalized.includes('overdue') || normalized.includes('past due') || normalized.includes('between') || normalized.includes('date range') || normalized.includes('from ') || normalized.includes('top vendor') || normalized.includes('largest vendor') || supportedPaidQuery
    if (!supportedQuery) {
      setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: 'I can answer invoice totals paid to a vendor, overdue invoices, invoices in a date range, and top vendors. Try one of those supported questions.' }])
      setBusy(false)
      return
    }
    const queryId: QueryId = requestedId ?? (normalized.includes('overdue') || normalized.includes('past due') ? 'list_overdue' : normalized.includes('between') || normalized.includes('date range') || normalized.includes('from ') ? 'invoices_between_dates' : normalized.includes('top vendor') || normalized.includes('largest vendor') ? 'top_vendors' : 'total_paid_to_vendor')
    try {
      const response = await mockQueryInvoices(queryId, text, invoices)
      setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', ...response }])
      window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50)
    } catch (error) {
      setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: error instanceof Error ? error.message : 'The query could not be completed.' }])
    } finally { setBusy(false) }
  }

  return <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 md:px-8 md:pb-10">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-primary">Books overview</p><h1 className="text-2xl font-semibold tracking-tight">Invoice register</h1><p className="mt-1 text-sm text-muted-foreground">Search, review, and export invoices saved in this browser preview.</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><ArrowDownToLine size={15} />{selectedIds.length ? `Export ${selectedIds.length} selected` : 'Export CSV'}</Button><Button asChild><Link to="/capture"><Upload size={15} />Upload invoice</Link></Button></div></div>

    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Invoice metrics">
      <MetricCard label="Invoice records" value={String(invoices.length).padStart(2, '0')} icon={<FileText size={15} />} detail="In this local register" />
      <MetricCard label="Recorded invoice total" value={formatMoney(total)} icon={<ArrowUpRight size={15} />} detail="Total amounts on invoices" />
      <MetricCard label="Needs review" value={String(reviewCount).padStart(2, '0')} icon={<FileClock size={15} />} detail="Human approval pending" />
      <MetricCard label="Outstanding" value={incompletePaymentCount ? '—' : formatMoney(outstanding)} icon={<Users size={15} />} detail={incompletePaymentCount ? `Payment info missing for ${incompletePaymentCount} records` : `${vendorCount} vendors · payment data in preview`} />
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(345px,.9fr)]">
      <Card className="min-w-0 overflow-hidden"><CardHeader className="border-b py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-sm">All invoices</CardTitle><CardDescription className="mt-1">{filteredInvoices.length} records · Sorted by invoice date</CardDescription></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-800"><CheckCircle2 size={12} />Local preview data</span></div></CardHeader><CardContent className="p-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row"><label className="relative min-w-0 flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(0); setSelectedIds([]) }} placeholder="Search vendor, invoice number, or file…" aria-label="Search invoices" className="h-9 pl-9 text-xs" /></label><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof statusFilter); setPage(0); setSelectedIds([]) }} aria-label="Filter by invoice status" className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"><option value="all">All statuses</option><option value="Saved">Approved</option><option value="Needs review">Review required</option><option value="Duplicate">Possible duplicate</option></select></div>
        <div className="overflow-x-auto"><Table className="min-w-[880px]"><TableHead><TableRow><TableHeaderCell><input aria-label="Select all visible invoices" type="checkbox" checked={allPageSelected} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...pageIds])] : selectedIds.filter((id) => !pageIds.includes(id)))} className="size-4 accent-primary" /></TableHeaderCell><TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Invoice no.</TableHeaderCell><TableHeaderCell>Vendor</TableHeaderCell><TableHeaderCell className="text-right">Subtotal</TableHeaderCell><TableHeaderCell className="text-right">Tax</TableHeaderCell><TableHeaderCell className="text-right">Total</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHead><TableBody>{pageInvoices.map((invoice) => <TableRow key={invoice.id}><TableCell><input aria-label={`Select invoice ${invoice.invoiceNumber}`} type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, invoice.id] : current.filter((id) => id !== invoice.id))} className="size-4 accent-primary" /></TableCell><TableCell><span className="whitespace-nowrap text-xs">{new Date(`${invoice.date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>{invoice.dueDate && <span className="mt-1 block whitespace-nowrap text-[9px] text-muted-foreground">Due {new Date(`${invoice.dueDate}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}</TableCell><TableCell><span className="font-mono text-[11px]">{invoice.invoiceNumber}</span></TableCell><TableCell><div className="flex min-w-[145px] items-center gap-2"><span className="grid size-8 shrink-0 place-items-center rounded border bg-muted/30 text-muted-foreground"><FileText size={14} /></span><span className="min-w-0"><span className="block truncate font-medium text-foreground">{invoice.vendor}</span><span className="block max-w-36 truncate text-[10px] text-muted-foreground">{invoice.sourceFile ?? 'Invoice record'}</span></span></div></TableCell><TableCell className="text-right tabular-nums">{formatMoney(invoice.subtotal)}</TableCell><TableCell className="text-right tabular-nums">{formatMoney(invoice.tax)}</TableCell><TableCell className="text-right font-medium tabular-nums">{formatMoney(invoice.total)}</TableCell><TableCell><Badge color={invoice.status === 'Saved' ? 'emerald' : invoice.status === 'Duplicate' ? 'red' : 'yellow'}>{invoice.status === 'Saved' ? 'Approved' : invoice.status === 'Duplicate' ? 'Possible duplicate' : 'Review required'}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
        {filteredInvoices.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted-foreground">{invoices.length === 0 ? 'No invoice records yet. Upload and confirm an invoice to add it here.' : 'No invoices match this search and filter.'}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-[10px] text-muted-foreground"><span>Showing {filteredInvoices.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filteredInvoices.length)} of {filteredInvoices.length} invoices · INR</span><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="size-7" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={14} /></Button><span>Page {page + 1} of {pageCount}</span><Button variant="outline" size="icon" className="size-7" onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={page >= pageCount - 1} aria-label="Next page"><ChevronRight size={14} /></Button></div></div>
      </CardContent></Card>

      <Card className="overflow-hidden"><CardHeader className="border-b py-4"><div className="flex items-start justify-between gap-2"><div><CardTitle className="flex items-center gap-2 text-sm"><MessageSquareText size={15} className="text-primary" />Invoice AI assistant</CardTitle><CardDescription className="mt-1">Read-only questions about saved invoice data.</CardDescription></div><Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="About supported queries"><CircleHelp size={15} /></Button></DialogTrigger><DialogContent><DialogTitle>Supported query tools</DialogTitle><DialogDescription>Natural-language questions map to a fixed read-only query menu. This frontend preview computes supported summaries locally.</DialogDescription><div className="mt-4 grid gap-3 text-xs">{quickQueries.map((queryItem) => <div key={queryItem.id} className="rounded-md border p-3"><code className="font-mono text-primary">{queryItem.id}</code><p className="mt-1 text-muted-foreground">{queryItem.query}</p></div>)}</div><p className="mt-4 text-xs text-muted-foreground">Overdue and paid queries use the due-date and payment fields. Records missing those fields are called out in the result.</p></DialogContent></Dialog></div></CardHeader>
        <CardContent className="flex h-[440px] flex-col p-0"><div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full ${message.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>{message.role === 'assistant' ? <Bot size={14} /> : <span className="text-[10px] font-semibold">A</span>}</span><div className={`max-w-[88%] rounded-lg px-3 py-2.5 text-xs leading-5 ${message.role === 'assistant' ? 'bg-muted/60 text-foreground' : 'bg-primary text-primary-foreground'}`}><p>{message.text}</p>{message.rows && message.rows.length > 0 && <div className="mt-2 grid gap-1.5 border-t border-border/70 pt-2">{message.rows.map((row) => <div key={row.id} className="flex justify-between gap-5 text-[10px]"><span className="truncate">{row.vendor} · {row.invoiceNumber}</span><span className="shrink-0 font-medium">{formatMoney(row.total)}</span></div>)}</div>}{message.totals && message.totals.length > 0 && <div className="mt-2 grid gap-1.5 border-t border-border/70 pt-2">{message.totals.map((row) => <div key={row.vendor} className="flex justify-between gap-5 text-[10px]"><span className="truncate">{row.vendor}</span><span className="shrink-0 font-medium">{formatMoney(row.total)}</span></div>)}</div>}</div></div>)}{busy && <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Sparkles size={13} className="text-primary" />Checking local invoice records…</div>}<div ref={bottomRef} /></div>
          <div className="border-t bg-muted/20 p-3"><p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Quick queries</p><div className="mb-3 flex flex-wrap gap-1.5">{quickQueries.map((item) => <Button key={item.id} variant="outline" size="sm" className="h-7 px-2 text-[9px]" disabled={busy} onClick={() => runQuery(item.query, item.id)}>{item.label}</Button>)}</div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); runQuery(question) }}><Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about a vendor or date range…" aria-label="Ask a question about invoices" className="h-9 bg-background text-xs" /><Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!question.trim() || busy} aria-label="Send question"><Send size={14} /></Button></form><p className="mt-2 flex items-center gap-1 text-[9px] leading-4 text-muted-foreground"><ShieldCheck size={10} />Read-only prototype · totals are calculated from invoice amounts, not settlement records.</p></div>
        </CardContent></Card>
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3.5"><div className="flex items-start gap-2.5"><CalendarDays size={15} className="mt-0.5 text-primary" /><div><p className="text-xs font-medium">Payment and duplicate checks</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">New records can track due dates and payments; matching vendor and invoice numbers are flagged for review.</p></div></div><Button variant="outline" size="sm" onClick={exportCsv}><ArrowDownToLine size={13} />Download register</Button></div>
  </main>
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <TremorCard className="p-4"><div className="flex items-center justify-between"><Text>{label}</Text><span className="grid size-7 place-items-center rounded-md bg-muted/70 text-muted-foreground">{icon}</span></div><Metric className="mt-2 text-2xl font-semibold tracking-tight">{value}</Metric><Text className="mt-1 text-[10px]">{detail}</Text></TremorCard>
}

