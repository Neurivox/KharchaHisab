import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Header } from "@/components/layout/Header"
import { ExpenseForm } from "@/components/expense/ExpenseForm"
import { useExpenses } from "@/hooks/useExpenses"
import { formatDate, parseExpenseDateParam, toDateInputValue } from "@/lib/format"

export function AddExpensePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addExpense, uploadReceipt, isSupabaseConfigured } = useExpenses()

  const defaultDate = useMemo(
    () => parseExpenseDateParam(searchParams.get("date")),
    [searchParams]
  )

  const subtitle = defaultDate
    ? `Adding for ${formatDate(toDateInputValue(defaultDate))}`
    : "Track where your money goes"

  return (
    <>
      <Header title="Add Expense" subtitle={subtitle} />
      <main className="px-4 py-4 pb-nav">
        <ExpenseForm
          key={defaultDate?.toISOString() ?? "today"}
          defaultDate={defaultDate}
          onSubmit={async (data) => {
            await addExpense(data)
            navigate("/")
          }}
          uploadReceipt={isSupabaseConfigured ? uploadReceipt : undefined}
        />
      </main>
    </>
  )
}
