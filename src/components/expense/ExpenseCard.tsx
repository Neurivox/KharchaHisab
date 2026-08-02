import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  EXPENSE_TYPE_COLORS,
  TRANSACTION_KIND_COLORS,
} from "@/lib/constants"
import { formatINR } from "@/lib/format"
import { resolveTransactionKind } from "@/lib/transactions"
import type { Expense } from "@/types/expense"
import { cn } from "@/lib/utils"

interface ExpenseCardProps {
  expense: Expense
  onClick?: () => void
  compact?: boolean
}

export function ExpenseCard({ expense, onClick, compact = true }: ExpenseCardProps) {
  const kind = resolveTransactionKind(expense)
  const isIncome = kind === "income"
  const isCredit = expense.payment_mode === "Credit Card"

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border bg-card px-3 transition-colors",
        compact ? "py-2" : "py-3",
        onClick && "cursor-pointer hover:bg-muted/50 active:scale-[0.99]"
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick()
            }
          : undefined
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium leading-tight">
            {expense.description}
          </p>
          <p
            className={cn(
              "shrink-0 text-sm font-semibold tabular-nums",
              isIncome && "text-green-600 dark:text-green-400"
            )}
          >
            {isIncome ? "+" : ""}
            {formatINR(Number(expense.amount))}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 overflow-hidden">
          <span className="truncate text-xs text-muted-foreground">
            {expense.category}
            {expense.merchant ? ` · ${expense.merchant}` : ""}
          </span>
        </div>
        {!compact ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge className={cn("h-5 px-1.5 text-[10px]", EXPENSE_TYPE_COLORS[expense.expense_type])}>
              {expense.expense_type}
            </Badge>
            {kind !== "expense" ? (
              <Badge className={cn("h-5 px-1.5 text-[10px]", TRANSACTION_KIND_COLORS[kind])}>
                {kind}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {isCredit ? (
          <CreditCard className="size-3.5 text-destructive" aria-label="Credit card" />
        ) : (
          <Badge
            variant="outline"
            className={cn(
              "h-5 px-1.5 text-[10px] font-normal",
              EXPENSE_TYPE_COLORS[expense.expense_type]
            )}
          >
            {expense.expense_type}
          </Badge>
        )}
      </div>
    </div>
  )
}
