import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR } from "@/lib/format"
import type { Expense, ExpenseType } from "@/types/expense"

interface SummaryCardsProps {
  expenses: Expense[]
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const byType = expenses.reduce<Record<ExpenseType, number>>(
    (acc, e) => {
      acc[e.expense_type] += Number(e.amount)
      return acc
    },
    { NEED: 0, WANT: 0, SAVING: 0 }
  )

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total this month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">{formatINR(total)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
      {(["NEED", "WANT", "SAVING"] as ExpenseType[]).map((type) => (
        <Card key={type} className="min-w-0">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {type}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <p className="text-base font-semibold tabular-nums sm:text-lg">
              {formatINR(byType[type])}
            </p>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  )
}
