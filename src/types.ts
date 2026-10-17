export type LineItem = {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export type Invoice = {
  id: string
  vendor: string
  invoiceNumber: string
  date: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  currency: string
  status: 'Saved' | 'Needs review' | 'Duplicate'
  dueDate?: string
  paymentStatus?: 'Unpaid' | 'Partially paid' | 'Paid'
  amountPaid?: number
  sourceFile?: string
}

export type InvoiceDraft = Omit<Invoice, 'id' | 'status'>

export type InvoiceConfidence = {
  vendor: number
  invoiceNumber: number
  date: number
  subtotal: number
  tax: number
  total: number
}

export const sampleInvoices: Invoice[] = [
  { id: 'inv-1048', vendor: 'Sharma Traders', invoiceNumber: 'INV-1048', date: '2026-10-17', dueDate: '2026-10-24', paymentStatus: 'Paid', amountPaid: 18450, items: [{ description: 'Packaging materials', quantity: 10, unitPrice: 1250, amount: 12500 }, { description: 'Delivery', quantity: 1, unitPrice: 1000, amount: 1000 }], subtotal: 13500, tax: 4950, total: 18450, currency: 'INR', status: 'Saved', sourceFile: 'INV-1048_October.pdf' },
  { id: 'inv-2091', vendor: 'Gupte Wholesale', invoiceNumber: 'GST-2091', date: '2026-10-16', dueDate: '2026-10-16', paymentStatus: 'Unpaid', amountPaid: 0, items: [{ description: 'Grocery stock', quantity: 8, unitPrice: 875, amount: 7000 }], subtotal: 7000, tax: 1260, total: 8260, currency: 'INR', status: 'Needs review', sourceFile: 'GST_Invoice_2091.jpg' },
  { id: 'inv-019', vendor: 'Singh Daily Supplies', invoiceNumber: 'BILL-019', date: '2026-10-15', dueDate: '2026-10-30', paymentStatus: 'Partially paid', amountPaid: 1500, items: [{ description: 'Daily provisions', quantity: 5, unitPrice: 555, amount: 2775 }], subtotal: 2775, tax: 500, total: 3275, currency: 'INR', status: 'Saved', sourceFile: 'bill_019_oct.pdf' },
  { id: 'inv-772', vendor: 'Reading Foods', invoiceNumber: 'RF-772', date: '2026-10-14', dueDate: '2026-10-21', paymentStatus: 'Unpaid', amountPaid: 0, items: [{ description: 'Restaurant supplies', quantity: 4, unitPrice: 2500, amount: 10000 }], subtotal: 10000, tax: 2400, total: 12400, currency: 'INR', status: 'Saved', sourceFile: 'receipt_warehouse.png' },
]

export const sampleDraft: InvoiceDraft = {
  vendor: 'Northstar Office Supplies', invoiceNumber: 'NS-2026-0471', date: '2026-10-17',
  items: [
    { description: 'Thermal paper rolls', quantity: 12, unitPrice: 180, amount: 2160 },
    { description: 'Shipping and handling', quantity: 1, unitPrice: 240, amount: 240 },
  ], subtotal: 2400, tax: 432, total: 2832, currency: 'INR', sourceFile: 'northstar-invoice-0471.pdf', dueDate: '2026-11-16', paymentStatus: 'Unpaid', amountPaid: 0,
}

export const sampleConfidence: InvoiceConfidence = { vendor: 0.98, invoiceNumber: 0.93, date: 0.61, subtotal: 0.96, tax: 0.58, total: 0.99 }
