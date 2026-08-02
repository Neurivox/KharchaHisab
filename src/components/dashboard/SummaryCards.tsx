import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR } from "@/lib/format"
import { computeClosingBalance, summarizeExpenses } from "@/lib/transactions"
import type { Expense } from "@/types/expense"

interface SummaryCardsProps {
  expenses: Expense[]
  openingBalance?: number | null
}

export function SummaryCards({ expenses, openingBalance = null }: SummaryCardsProps) {
  const summary = summarizeExpenses(expenses)
  const closing =
    openingBalance !== null
      ? computeClosingBalance(openingBalance, expenses)
      : null

  return (
    <div className="space-y-2">
      {openingBalance !== null ? (
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardHeader className="px-3 pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Opening balance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <p className="text-lg font-bold tabular-nums">{formatINR(openingBalance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="px-3 pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Closing balance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <p className="text-lg font-bold tabular-nums">
                {closing !== null ? formatINR(closing) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spent this month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">{formatINR(summary.spent)}</p>
          {summary.income > 0 ? (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              + {formatINR(summary.income)} income
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {(["NEED", "WANT", "SAVING"] as const).map((type) => (
          <Card key={type} className="min-w-0">
            <CardHeader className="px-3 pb-1 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {type}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <p className="text-base font-semibold tabular-nums sm:text-lg">
                {formatINR(summary.byType[type])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
