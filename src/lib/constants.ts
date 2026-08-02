import type { ExpenseType, PaymentMode, TransactionKind } from "@/types/expense"

export const PAYMENT_MODES: PaymentMode[] = [
  "UPI",
  "Cash",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "Wallet",
]

export const EXPENSE_TYPES: ExpenseType[] = ["NEED", "WANT", "SAVING"]

export interface CategoryOption {
  label: string
  defaultType: ExpenseType
  defaultKind: TransactionKind
  group: string
}

export const CATEGORIES: CategoryOption[] = [
  { label: "Groceries", defaultType: "NEED", defaultKind: "expense", group: "Essentials" },
  { label: "Rent", defaultType: "NEED", defaultKind: "expense", group: "Essentials" },
  { label: "EMI / Home Loan", defaultType: "NEED", defaultKind: "expense", group: "Essentials" },
  { label: "Utilities (EB/Gas/Water)", defaultType: "NEED", defaultKind: "expense", group: "Essentials" },
  { label: "Mobile & Recharge", defaultType: "NEED", defaultKind: "expense", group: "Essentials" },
  { label: "Food & Dining", defaultType: "WANT", defaultKind: "expense", group: "Lifestyle" },
  { label: "Swiggy / Zomato", defaultType: "WANT", defaultKind: "expense", group: "Lifestyle" },
  { label: "Transport (Auto/Metro/Petrol)", defaultType: "WANT", defaultKind: "expense", group: "Lifestyle" },
  { label: "Shopping", defaultType: "WANT", defaultKind: "expense", group: "Lifestyle" },
  { label: "Entertainment & OTT", defaultType: "WANT", defaultKind: "expense", group: "Lifestyle" },
  { label: "Salary", defaultType: "NEED", defaultKind: "income", group: "Income" },
  { label: "Insurance", defaultType: "NEED", defaultKind: "expense", group: "Financial" },
  { label: "SIP / Mutual Fund", defaultType: "SAVING", defaultKind: "expense", group: "Financial" },
  { label: "FD / RD", defaultType: "SAVING", defaultKind: "expense", group: "Financial" },
  { label: "Normal Saving (In Account)", defaultType: "SAVING", defaultKind: "transfer", group: "Financial" },
  { label: "Credit Card Bill Payment", defaultType: "NEED", defaultKind: "transfer", group: "Financial" },
  { label: "Tax / TDS", defaultType: "NEED", defaultKind: "expense", group: "Financial" },
  { label: "Healthcare", defaultType: "NEED", defaultKind: "expense", group: "Other" },
  { label: "Education", defaultType: "NEED", defaultKind: "expense", group: "Other" },
  { label: "Festivals & Gifts", defaultType: "WANT", defaultKind: "expense", group: "Other" },
  { label: "Personal Care", defaultType: "WANT", defaultKind: "expense", group: "Other" },
  { label: "Subscriptions", defaultType: "WANT", defaultKind: "expense", group: "Other" },
  { label: "Miscellaneous", defaultType: "WANT", defaultKind: "expense", group: "Other" },
]

export const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  NEED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  WANT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  SAVING: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
}

export const TRANSACTION_KIND_COLORS: Record<TransactionKind, string> = {
  expense: "bg-muted text-muted-foreground",
  income: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  transfer: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
}

export const CHART_COLORS = {
  NEED: "hsl(142 76% 36%)",
  WANT: "hsl(38 92% 50%)",
  SAVING: "hsl(217 91% 60%)",
}

export function getDefaultExpenseType(category: string): ExpenseType {
  return findCategory(category)?.defaultType ?? "WANT"
}

export function getDefaultTransactionKind(category: string): TransactionKind {
  return findCategory(category)?.defaultKind ?? "expense"
}

function findCategory(category: string): CategoryOption | undefined {
  return CATEGORIES.find((c) => c.label === category)
}

export function getCategoryLabels(): string[] {
  return CATEGORIES.map((c) => c.label)
}
