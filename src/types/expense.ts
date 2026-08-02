export type PaymentMode =
  | "UPI"
  | "Cash"
  | "Debit Card"
  | "Credit Card"
  | "Net Banking"
  | "Wallet"

export type ExpenseType = "NEED" | "WANT" | "SAVING"

export type TransactionKind = "expense" | "income" | "transfer"

export interface Expense {
  id: string
  amount: number
  description: string
  payment_mode: PaymentMode
  category: string
  expense_type: ExpenseType
  transaction_kind: TransactionKind
  transaction_date: string
  merchant: string | null
  notes: string | null
  tags: string[] | null
  is_recurring: boolean
  receipt_url: string | null
  created_at: string
  updated_at: string
}

export type ExpenseInsert = Omit<
  Expense,
  "id" | "created_at" | "updated_at"
> & {
  id?: string
}

export interface ExpenseFilters {
  search?: string
  category?: string
  payment_mode?: PaymentMode
  expense_type?: ExpenseType
  transaction_kind?: TransactionKind
  date_from?: string
  date_to?: string
}

export interface ExpenseSummary {
  count: number
  totalInflow: number
  totalOutflow: number
  net: number
  spent: number
  saved: number
  income: number
  transfers: number
  byType: Record<ExpenseType, number>
}
