import type { ExpenseType, PaymentMode } from "@/types/expense"

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
  group: string
}

export const CATEGORIES: CategoryOption[] = [
  { label: "Groceries", defaultType: "NEED", group: "Essentials" },
  { label: "Rent", defaultType: "NEED", group: "Essentials" },
  { label: "EMI / Home Loan", defaultType: "NEED", group: "Essentials" },
  { label: "Utilities (EB/Gas/Water)", defaultType: "NEED", group: "Essentials" },
  { label: "Mobile & Recharge", defaultType: "NEED", group: "Essentials" },
  { label: "Food & Dining", defaultType: "WANT", group: "Lifestyle" },
  { label: "Swiggy / Zomato", defaultType: "WANT", group: "Lifestyle" },
  { label: "Transport (Auto/Metro/Petrol)", defaultType: "WANT", group: "Lifestyle" },
  { label: "Shopping", defaultType: "WANT", group: "Lifestyle" },
  { label: "Entertainment & OTT", defaultType: "WANT", group: "Lifestyle" },
  { label: "Insurance", defaultType: "NEED", group: "Financial" },
  { label: "SIP / Mutual Fund", defaultType: "SAVING", group: "Financial" },
  { label: "FD / RD", defaultType: "SAVING", group: "Financial" },
  { label: "Tax / TDS", defaultType: "NEED", group: "Financial" },
  { label: "Healthcare", defaultType: "NEED", group: "Other" },
  { label: "Education", defaultType: "NEED", group: "Other" },
  { label: "Festivals & Gifts", defaultType: "WANT", group: "Other" },
  { label: "Personal Care", defaultType: "WANT", group: "Other" },
  { label: "Subscriptions", defaultType: "WANT", group: "Other" },
  { label: "Miscellaneous", defaultType: "WANT", group: "Other" },
]

export const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  NEED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  WANT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  SAVING: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
}

export const CHART_COLORS = {
  NEED: "hsl(142 76% 36%)",
  WANT: "hsl(38 92% 50%)",
  SAVING: "hsl(217 91% 60%)",
}

export function getDefaultExpenseType(category: string): ExpenseType {
  return CATEGORIES.find((c) => c.label === category)?.defaultType ?? "WANT"
}

export function getCategoryLabels(): string[] {
  return CATEGORIES.map((c) => c.label)
}
