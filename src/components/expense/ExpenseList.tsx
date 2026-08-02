import { useMemo } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { formatDateGroup, formatINR, toDateInputValue } from "@/lib/format"
import { resolveTransactionKind } from "@/lib/transactions"
import type { Expense } from "@/types/expense"
import { ExpenseCard } from "./ExpenseCard"

interface ExpenseListProps {
  expenses: Expense[]
  onSelect?: (expense: Expense) => void
  emptyMessage?: string
  dateHeadersLinkToAdd?: boolean
  compact?: boolean
}

export function ExpenseList({
  expenses,
  onSelect,
  emptyMessage = "No expenses yet. Add your first one!",
  dateHeadersLinkToAdd = true,
  compact = true,
}: ExpenseListProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; items: Expense[]; total: number }>()

    for (const expense of expenses) {
      const dateKey = expense.transaction_date
      const kind = resolveTransactionKind(expense)
      const signed =
        kind === "income"
          ? Number(expense.amount)
          : -Number(expense.amount)

      const existing = groups.get(dateKey)
      if (existing) {
        existing.items.push(expense)
        existing.total += signed
      } else {
        groups.set(dateKey, {
          label: formatDateGroup(dateKey),
          items: [expense],
          total: signed,
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
        className="block rounded-xl border border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
      >
        <p className="text-sm">{emptyMessage}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
          <Plus className="size-4" />
          Tap to add for today
        </p>
      </Link>
    )
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {grouped.map(({ dateKey, label, items, total }) => (
        <section key={dateKey}>
          {dateHeadersLinkToAdd ? (
            <Link
              to={`/add?date=${dateKey}`}
              className="mb-1.5 flex min-h-8 items-center justify-between rounded-md px-0.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <span>{label}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span
                  className={
                    total >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground"
                  }
                >
                  {total >= 0 ? "+" : ""}
                  {formatINR(Math.abs(total))}
                </span>
                <span className="inline-flex items-center gap-0.5 text-primary">
                  <Plus className="size-3" />
                  Add
                </span>
              </span>
            </Link>
          ) : (
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{label}</span>
              <span className="tabular-nums">{formatINR(Math.abs(total))}</span>
            </div>
          )}
          <div className="space-y-1.5">
            {items.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                compact={compact}
                onClick={onSelect ? () => onSelect(expense) : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
