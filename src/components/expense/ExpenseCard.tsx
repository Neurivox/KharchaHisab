import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EXPENSE_TYPE_COLORS } from "@/lib/constants"
import { formatDate, formatINR } from "@/lib/format"
import type { Expense } from "@/types/expense"
import { cn } from "@/lib/utils"

interface ExpenseCardProps {
  expense: Expense
  onClick?: () => void
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const isCredit = expense.payment_mode === "Credit Card"

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/40",
        onClick && "active:scale-[0.99]"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-start gap-3 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{expense.description}</p>
              {expense.merchant ? (
                <p className="truncate text-sm text-muted-foreground">
                  {expense.merchant}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 font-semibold tabular-nums">
              {formatINR(Number(expense.amount))}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {expense.category}
            </Badge>
            <Badge className={cn("text-xs", EXPENSE_TYPE_COLORS[expense.expense_type])}>
              {expense.expense_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {expense.payment_mode}
            </Badge>
            {isCredit ? (
              <Badge variant="destructive" className="gap-1 text-xs">
                <CreditCard className="size-3" />
                Credit
              </Badge>
            ) : null}
            {expense.is_recurring ? (
              <Badge variant="outline" className="text-xs">
                Recurring
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        {formatDate(expense.transaction_date)}
      </div>
    </Card>
  )
}
