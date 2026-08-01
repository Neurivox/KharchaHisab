import { useMemo, useState } from "react"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { DashboardCharts } from "@/components/dashboard/Charts"
import { ExpenseList } from "@/components/expense/ExpenseList"
import { filterExpensesByMonth, useExpenses } from "@/hooks/useExpenses"
import { getMonthLabel } from "@/lib/format"

export function DashboardPage() {
  const [month, setMonth] = useState(() => new Date())
  const { expenses, loading, error } = useExpenses()

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, month),
    [expenses, month]
  )

  const recent = monthExpenses.slice(0, 5)

  const shiftMonth = (delta: number) => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <>
      <Header
        title="KharchaHisab"
        subtitle={getMonthLabel(month)}
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => shiftMonth(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <main className="space-y-6 px-4 py-4 pb-nav">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <SummaryCards expenses={monthExpenses} />
            <DashboardCharts expenses={monthExpenses} />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Recent transactions</h2>
                <Link
                  to="/expenses"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <ExpenseList
                expenses={recent}
                emptyMessage="No expenses this month yet."
              />
            </section>
          </>
        )}
      </main>
    </>
  )
}
