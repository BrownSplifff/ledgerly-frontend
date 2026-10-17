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
