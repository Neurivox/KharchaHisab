import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR } from "@/lib/format"
import { summarizeExpenses } from "@/lib/transactions"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { cn } from "@/lib/utils"

interface FilterSummaryProps {
  expenses: Expense[]
  filters: ExpenseFilters
}

function hasDateFilter(filters: ExpenseFilters): boolean {
  return !!(filters.date_from || filters.date_to)
}

function hasActiveFilters(filters: ExpenseFilters): boolean {
  return !!(
    filters.search ||
    filters.category ||
    filters.payment_mode ||
    filters.expense_type ||
    filters.transaction_kind ||
    filters.date_from ||
    filters.date_to
  )
}

export function FilterSummary({ expenses, filters }: FilterSummaryProps) {
  if (!hasActiveFilters(filters)) return null

  const summary = summarizeExpenses(expenses)
  const dateLabel =
    filters.date_from && filters.date_to
      ? `${filters.date_from} → ${filters.date_to}`
      : filters.date_from
        ? `From ${filters.date_from}`
        : filters.date_to
          ? `Until ${filters.date_to}`
          : null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Filter summary
            </p>
            {dateLabel ? (
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.count} txn{summary.count === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="Spent"
            value={formatINR(summary.spent)}
            icon={<ArrowUpRight className="size-3.5" />}
            className="text-foreground"
          />
          <Stat
            label="Income"
            value={formatINR(summary.income)}
            icon={<ArrowDownLeft className="size-3.5" />}
            className="text-green-700 dark:text-green-400"
          />
          <Stat
            label="Saved"
            value={formatINR(summary.saved)}
            icon={<Wallet className="size-3.5" />}
            className="text-blue-700 dark:text-blue-400"
          />
          <Stat
            label="Net"
            value={formatINR(summary.net)}
            className={cn(
              summary.net >= 0
                ? "text-green-700 dark:text-green-400"
                : "text-destructive"
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
          {(["NEED", "WANT", "SAVING"] as const).map((type) => (
            <div key={type}>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {type}
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {formatINR(summary.byType[type])}
              </p>
            </div>
          ))}
        </div>

        {summary.transfers > 0 ? (
          <p className="text-xs text-muted-foreground">
            Transfers (CC bill, in-account saving): {formatINR(summary.transfers)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className="rounded-lg bg-background/80 px-2.5 py-2">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", className)}>
        {value}
      </p>
    </div>
  )
}

export { hasDateFilter, hasActiveFilters }
