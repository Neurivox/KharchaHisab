import { format, isToday, isYesterday, parseISO } from "date-fns"

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

export function formatINR(amount: number): string {
  return inrFormatter.format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy")
}

export function formatDateGroup(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "d MMM yyyy")
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function getMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy")
}

export function getFinancialYear(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 3) {
    return `FY ${year}-${String(year + 1).slice(-2)}`
  }
  return `FY ${year - 1}-${String(year).slice(-2)}`
}
