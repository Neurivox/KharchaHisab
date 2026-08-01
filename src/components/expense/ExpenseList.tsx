import { useMemo } from "react"
import { formatDateGroup } from "@/lib/format"
import type { Expense } from "@/types/expense"
import { ExpenseCard } from "./ExpenseCard"

interface ExpenseListProps {
  expenses: Expense[]
  onSelect?: (expense: Expense) => void
  emptyMessage?: string
}

export function ExpenseList({
  expenses,
  onSelect,
  emptyMessage = "No expenses yet. Add your first one!",
}: ExpenseListProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, Expense[]>()

    for (const expense of expenses) {
      const key = formatDateGroup(expense.transaction_date)
      const list = groups.get(key) ?? []
      list.push(expense)
      groups.set(key, list)
    }

    return Array.from(groups.entries())
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateLabel, items]) => (
        <section key={dateLabel}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {dateLabel}
          </h3>
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
