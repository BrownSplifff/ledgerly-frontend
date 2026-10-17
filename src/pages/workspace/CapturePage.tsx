import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, FileImage, FileText, FileUp, RotateCcw, ShieldCheck, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '../../components/ui'
import { useToast } from '../../components/useToast'
import type { InvoiceConfidence, InvoiceDraft } from '../../types'
import { useInvoices } from '../../context/useInvoices'
import { mockExtractInvoice } from '../../api/mockApi'

const confidenceFields: Array<{ key: keyof InvoiceConfidence; label: string }> = [
  { key: 'vendor', label: 'Vendor' }, { key: 'invoiceNumber', label: 'Invoice number' }, { key: 'date', label: 'Invoice date' },
  { key: 'subtotal', label: 'Subtotal' }, { key: 'tax', label: 'Tax' }, { key: 'total', label: 'Total' },
]
const currency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount)

export function CapturePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const extractionRequest = useRef(0)
  const [draft, setDraft] = useState<InvoiceDraft | null>(null)
  const [confidence, setConfidence] = useState<InvoiceConfidence>({ vendor: 1, invoiceNumber: 1, date: 1, subtotal: 1, tax: 1, total: 1 })
  const [editable, setEditable] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const { saveInvoice, invoices } = useInvoices()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl) }, [imageUrl])

  async function loadFile(file?: File) {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      showToast({ title: 'File is too large', description: 'Choose a file smaller than 20 MB.' })
      return
    }
    if (!/^(application\/pdf|image\/)/.test(file.type) && !/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) {
      showToast({ title: 'Unsupported file type', description: 'Choose a PDF, JPG, PNG or WebP invoice.' })
      return
    }
    setSourceFile(file)
    setImageUrl(URL.createObjectURL(file))
    setEditable(false)
    setDraft(null)
    setExtracting(true)
    const requestId = ++extractionRequest.current
    try {
      const result = await mockExtractInvoice(file)
      if (requestId !== extractionRequest.current) return
      setDraft(result.draft)
      setConfidence(result.confidence)
      showToast({ title: 'Preview extraction ready', description: 'Sample values are shown for this file. Review every field before saving.' })
    } catch (error) {
      if (requestId !== extractionRequest.current) return
      setSourceFile(null)
      setImageUrl(null)
      showToast({ title: 'Could not process document', description: error instanceof Error ? error.message : 'Try another file.' })
    } finally { if (requestId === extractionRequest.current) setExtracting(false) }
  }

  async function useSample() {
    const requestId = ++extractionRequest.current
    setSourceFile(null)
    setImageUrl(null)
    setEditable(false)
    setDraft(null)
    setExtracting(true)
    try { const result = await mockExtractInvoice(); if (requestId === extractionRequest.current) { setDraft(result.draft); setConfidence(result.confidence) } }
    finally { if (requestId === extractionRequest.current) setExtracting(false) }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) { loadFile(event.target.files?.[0]); event.target.value = '' }
  function handleDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragOver(false); loadFile(event.dataTransfer.files?.[0]) }
  function updateDraft<K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) { setDraft((current) => current ? { ...current, [key]: value } : current) }
  function updateItem(index: number, key: 'description' | 'quantity' | 'unitPrice', value: string) {
    setDraft((current) => {
      if (!current) return current
      const items = current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        if (key === 'description') return { ...item, description: value }
        const nextValue = Number(value) || 0
        const next = { ...item, [key]: nextValue }
        next.amount = next.quantity * next.unitPrice
        return next
      })
      return { ...current, items, subtotal: items.reduce((sum, item) => sum + item.amount, 0), total: items.reduce((sum, item) => sum + item.amount, 0) + current.tax }
    })
  }

  function confirmSave() {
    if (!draft) return
    if (!draft.vendor.trim() || !draft.invoiceNumber.trim() || !draft.date) {
      showToast({ title: 'Complete the required fields', description: 'Vendor, invoice number, and invoice date are required to save.' })
      setEditable(true)
      return
    }
    const saved = saveInvoice(draft)
    showToast({ title: saved.status === 'Duplicate' ? 'Possible duplicate saved for review' : 'Invoice saved', description: saved.status === 'Duplicate' ? 'A matching vendor and invoice number already exists. The record is flagged in your register.' : `${draft.invoiceNumber} was added to your invoice register.` })
    setDraft(null)
    setSourceFile(null)
    setImageUrl(null)
    setEditable(false)
    navigate('/dashboard')
  }

  const reviewFields = confidenceFields.filter(({ key }) => confidence[key] < 0.7)
  const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const isDuplicate = Boolean(draft && invoices.some((invoice) => normalize(invoice.vendor) === normalize(draft.vendor) && normalize(invoice.invoiceNumber) === normalize(draft.invoiceNumber)))
  const lineItemsSubtotal = draft?.items.reduce((sum, item) => sum + item.amount, 0) ?? 0
  const lineItemsMismatch = Boolean(draft && Math.abs(lineItemsSubtotal - draft.subtotal) > 0.01)
  const totalMismatch = Boolean(draft && Math.abs(draft.subtotal + draft.tax - draft.total) > 0.01)
  return <main className="mx-auto max-w-7xl px-4 pb-24 pt-7 md:px-8 md:pb-10">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-primary">Invoice intake</p><h1 className="text-2xl font-semibold tracking-tight">Capture & review</h1><p className="mt-1 text-sm text-muted-foreground">Extract, verify, and approve invoice details before they enter your books.</p></div><div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-[11px] text-muted-foreground"><ShieldCheck size={14} className="text-primary" /> Human approval required</div></div>

    {!draft ? <Card className="mx-auto max-w-3xl"><CardHeader><CardTitle className="text-base">Add an invoice</CardTitle><CardDescription>Choose a document or capture a photo using your phone camera.</CardDescription></CardHeader><CardContent>
      {extracting && <div role="status" className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">Preparing a mock extraction preview… uploaded document contents are not sent to an OCR service.</div>}
      <input ref={inputRef} type="file" className="sr-only" accept="application/pdf,image/*,.pdf" onChange={handleChange} />
      <div className={`flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-5 py-9 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'bg-muted/20'}`} onDragEnter={(event) => { event.preventDefault(); setDragOver(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false) }} onDrop={handleDrop}>
        <div className="mb-3 grid size-11 place-items-center rounded-xl border bg-background text-primary"><FileUp size={20} /></div><h2 className="text-sm font-semibold">Drop an invoice to start</h2><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">PDF, JPG, PNG, or WebP. Files are staged in this browser preview while you review extracted values.</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Button onClick={() => inputRef.current?.click()}><Upload size={14} />Choose file</Button><label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"><FileImage size={14} />Use camera<input className="sr-only" type="file" accept="image/*" capture="environment" onChange={handleChange} /></label></div><p className="mt-4 text-[10px] text-muted-foreground">Max file size 20 MB · Images and PDFs</p>
      </div><div className="my-5 flex items-center gap-3 text-[10px] text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div><Button variant="outline" className="w-full" onClick={useSample}><Sparkles size={14} />Load sample invoice to preview the review flow</Button>
      <div className="mt-5 flex items-start gap-2.5 rounded-md bg-muted/60 p-3 text-[11px] leading-5 text-muted-foreground"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-medium text-foreground">Review first, save second.</strong> Low-confidence fields are highlighted. This UI preview uses sample extraction data; connect a trusted vision service to process real documents.</p></div>
    </CardContent></Card> : <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
      <Card className="overflow-hidden"><CardHeader className="border-b bg-muted/20 py-4"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2 text-sm"><FileText size={15} />Source document</CardTitle><CardDescription className="mt-1 max-w-[280px] truncate">{draft.sourceFile}</CardDescription></div><Button variant="ghost" size="icon" aria-label="Remove document" onClick={() => { setDraft(null); setSourceFile(null); setImageUrl(null) }}><X size={15} /></Button></div></CardHeader><CardContent className="p-4">
        <div className="flex min-h-[330px] items-center justify-center overflow-hidden rounded-md border bg-muted/30">{imageUrl && (sourceFile?.type === 'application/pdf' || sourceFile?.name.toLowerCase().endsWith('.pdf')) ? <iframe title="Uploaded invoice PDF preview" src={imageUrl} className="h-[520px] w-full bg-white" /> : imageUrl ? <img src={imageUrl} alt="Invoice uploaded for review" className="max-h-[520px] w-full object-contain" /> : <div className="max-w-xs px-6 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-lg border bg-background text-primary"><FileText size={22} /></div><p className="text-sm font-medium">Sample invoice preview</p><p className="mt-1 text-xs text-muted-foreground">This is example extraction data; upload a file to review its source beside the fields.</p><p className="mt-4 truncate rounded bg-background px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{draft.sourceFile}</p></div>}</div>
        <div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-muted-foreground">Original file retained for this session</span><Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}><RotateCcw size={12} />Replace file</Button><input ref={inputRef} type="file" className="sr-only" accept="application/pdf,image/*,.pdf" onChange={handleChange} /></div>
      </CardContent></Card>

      <Card><CardHeader className="border-b py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-sm">Extracted invoice fields</CardTitle><CardDescription className="mt-1">Check values against the source document before saving.</CardDescription></div><div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800"><AlertTriangle size={12} />{reviewFields.length ? `${reviewFields.length} fields need review` : 'Review before saving'}</div></div></CardHeader><CardContent className="space-y-5 p-4 sm:p-5">
        {reviewFields.length > 0 && <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><p>Low extraction confidence on <strong>{reviewFields.map((field) => field.label.toLowerCase()).join(' and ')}</strong>. Compare these fields with the source.</p></div>}
        {isDuplicate && <div role="alert" className="flex gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2.5 text-[11px] leading-5 text-rose-900"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><p><strong>Possible duplicate.</strong> This vendor and invoice number already exist. If you save this record, it will be flagged in the register for review.</p></div>}
        {(lineItemsMismatch || totalMismatch) && <div role="alert" className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><p>Invoice amounts do not reconcile{lineItemsMismatch ? ' with the line item subtotal' : ''}{totalMismatch ? ' with subtotal plus tax' : ''}. Check the calculations before saving.</p></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vendor" confidence={confidence.vendor}><Input value={draft.vendor} readOnly={!editable} className={confidence.vendor < .7 ? 'border-amber-400 bg-amber-50 focus-visible:ring-amber-300' : 'read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => updateDraft('vendor', event.target.value)} /></Field>
          <Field label="Invoice number" confidence={confidence.invoiceNumber}><Input value={draft.invoiceNumber} readOnly={!editable} className={confidence.invoiceNumber < .7 ? 'border-amber-400 bg-amber-50' : 'read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => updateDraft('invoiceNumber', event.target.value)} /></Field>
          <Field label="Invoice date" confidence={confidence.date}><Input type="date" value={draft.date} readOnly={!editable} className={confidence.date < .7 ? 'border-amber-400 bg-amber-50' : 'read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => updateDraft('date', event.target.value)} /></Field>
          <Field label="Currency" confidence={1}><Input value={draft.currency} readOnly={!editable} className="read-only:bg-muted/30 read-only:text-foreground" onChange={(event) => updateDraft('currency', event.target.value.toUpperCase())} /></Field>
          <Field label="Due date" confidence={1}><Input type="date" value={draft.dueDate ?? ''} readOnly={!editable} className="read-only:bg-muted/30 read-only:text-foreground" onChange={(event) => updateDraft('dueDate', event.target.value)} /></Field>
          <Field label="Payment status" confidence={1}><select value={draft.paymentStatus ?? 'Unpaid'} disabled={!editable} onChange={(event) => { const paymentStatus = event.target.value as NonNullable<InvoiceDraft['paymentStatus']>; setDraft((current) => current ? { ...current, paymentStatus, amountPaid: paymentStatus === 'Paid' ? current.total : paymentStatus === 'Unpaid' ? 0 : current.amountPaid } : current) }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:bg-muted/30"><option>Unpaid</option><option>Partially paid</option><option>Paid</option></select></Field>
          <Field label="Amount paid" confidence={1}><Input type="number" min="0" step=".01" value={draft.amountPaid ?? 0} readOnly={!editable} className="read-only:bg-muted/30 read-only:text-foreground" onChange={(event) => updateDraft('amountPaid', Number(event.target.value) || 0)} /></Field>
        </div>

        <div className="border-t pt-4"><div className="mb-2 flex items-center justify-between"><div><h3 className="text-xs font-semibold">Line items</h3><p className="mt-0.5 text-[10px] text-muted-foreground">Verify quantities, unit prices, and line totals.</p></div>{editable && <Button variant="outline" size="sm" onClick={() => updateDraft('items', [...draft.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }])}>+ Add line</Button>}</div><div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[490px] text-left text-xs"><thead className="bg-muted/50 text-[10px] text-muted-foreground"><tr><th className="px-3 py-2 font-medium">DESCRIPTION</th><th className="w-20 px-2 py-2 font-medium">QTY</th><th className="w-28 px-2 py-2 font-medium">UNIT PRICE</th><th className="w-28 px-3 py-2 text-right font-medium">AMOUNT</th><th className="w-8" /></tr></thead><tbody>{draft.items.map((item, index) => <tr key={`${index}-${item.description}`} className="border-t"><td className="px-2 py-2"><Input value={item.description} readOnly={!editable} className="h-8 border-transparent px-2 shadow-none read-only:text-foreground" onChange={(event) => updateItem(index, 'description', event.target.value)} /></td><td className="px-1 py-2"><Input type="number" min="0" value={item.quantity} readOnly={!editable} className="h-8 border-transparent px-2 shadow-none read-only:text-foreground" onChange={(event) => updateItem(index, 'quantity', event.target.value)} /></td><td className="px-1 py-2"><Input type="number" min="0" step=".01" value={item.unitPrice} readOnly={!editable} className="h-8 border-transparent px-2 shadow-none read-only:text-foreground" onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} /></td><td className="px-3 py-2 text-right font-medium tabular-nums">{currency(item.amount)}</td><td className="px-1">{editable && <button className="text-muted-foreground hover:text-destructive" aria-label="Remove line item" onClick={() => updateDraft('items', draft.items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={13} /></button>}</td></tr>)}</tbody></table></div></div>

        <div className="ml-auto grid max-w-sm grid-cols-[1fr_140px] items-center gap-x-4 gap-y-2.5 border-t pt-4 text-xs"><span className="text-muted-foreground">Subtotal <Confidence confidence={confidence.subtotal} /></span><Input type="number" step=".01" value={draft.subtotal} readOnly={!editable} className={confidence.subtotal < .7 ? 'h-8 border-amber-400 bg-amber-50 text-right' : 'h-8 text-right read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => { const subtotal = Number(event.target.value) || 0; setDraft((current) => current ? { ...current, subtotal, total: subtotal + current.tax } : current) }} /><span className="text-muted-foreground">Tax <Confidence confidence={confidence.tax} /></span><Input type="number" step=".01" value={draft.tax} readOnly={!editable} className={confidence.tax < .7 ? 'h-8 border-amber-400 bg-amber-50 text-right' : 'h-8 text-right read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => { const tax = Number(event.target.value) || 0; setDraft((current) => current ? { ...current, tax, total: current.subtotal + tax } : current) }} /><span className="font-semibold">Invoice total <Confidence confidence={confidence.total} /></span><Input type="number" step=".01" value={draft.total} readOnly={!editable} className={confidence.total < .7 ? 'h-9 border-amber-400 bg-amber-50 text-right font-semibold' : 'h-9 text-right font-semibold read-only:bg-muted/30 read-only:text-foreground'} onChange={(event) => updateDraft('total', Number(event.target.value) || 0)} /></div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4"><Button variant="ghost" size="sm" onClick={() => { setDraft(null); setSourceFile(null); setImageUrl(null) }}>Discard</Button><div className="flex gap-2">{editable ? <Button variant="outline" onClick={() => setEditable(false)}><Check size={14} />Done editing</Button> : <Button variant="outline" onClick={() => setEditable(true)}>Edit fields</Button>}<Button onClick={confirmSave} disabled={!draft}><Check size={14} />Confirm & save</Button></div></div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><ShieldCheck size={12} className="text-primary" />This action saves the reviewed record to the local invoice register.</div>
      </CardContent></Card>
    </div>}
  </main>
}

function Field({ label, confidence, children }: { label: string; confidence: number; children: ReactNode }) {
  const low = confidence < 0.7
  return <label className="grid gap-1.5"><span className="flex items-center justify-between text-[11px] font-medium">{label}<Confidence confidence={confidence} /></span>{children}{low && <span className="text-[10px] text-amber-800">Low confidence · verify source</span>}</label>
}

function Confidence({ confidence }: { confidence: number }) {
  const low = confidence < .7
  return <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`} title={`${Math.round(confidence * 100)}% extraction confidence`}>{low ? <AlertTriangle size={10} /> : <Check size={10} />}{Math.round(confidence * 100)}%</span>
}
