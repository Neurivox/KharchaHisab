import { useMemo } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { formatDateGroup, toDateInputValue } from "@/lib/format"
import type { Expense } from "@/types/expense"
import { ExpenseCard } from "./ExpenseCard"

interface ExpenseListProps {
  expenses: Expense[]
  onSelect?: (expense: Expense) => void
  emptyMessage?: string
  /** When true, date headers link to add expense for that day */
  dateHeadersLinkToAdd?: boolean
}

export function ExpenseList({
  expenses,
  onSelect,
  emptyMessage = "No expenses yet. Add your first one!",
  dateHeadersLinkToAdd = true,
}: ExpenseListProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; items: Expense[] }>()

    for (const expense of expenses) {
      const dateKey = expense.transaction_date
      const existing = groups.get(dateKey)
      if (existing) {
        existing.items.push(expense)
      } else {
        groups.set(dateKey, {
          label: formatDateGroup(dateKey),
          items: [expense],
        })
      }
    }

    return Array.from(groups.entries()).map(([dateKey, group]) => ({
      dateKey,
      ...group,
    }))
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <Link
        to={`/add?date=${toDateInputValue(new Date())}`}
        className="block rounded-xl border border-dashed p-8 text-center text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
      >
        <p>{emptyMessage}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
          <Plus className="size-4" />
          Tap to add for today
        </p>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ dateKey, label, items }) => (
        <section key={dateKey}>
          {dateHeadersLinkToAdd ? (
            <Link
              to={`/add?date=${dateKey}`}
              className="mb-2 flex min-h-11 items-center justify-between rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
            >
              <span>{label}</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Plus className="size-3.5" />
                Add
              </span>
            </Link>
          ) : (
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {label}
            </h3>
          )}
          <div className="space-y-2">
            {items.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onClick={onSelect ? () => onSelect(expense) : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
