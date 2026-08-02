import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Header } from "@/components/layout/Header"
import { ExpenseForm } from "@/components/expense/ExpenseForm"
import { useExpenses } from "@/hooks/useExpenses"
import { formatDate, parseExpenseDateParam, toDateInputValue } from "@/lib/format"

const CATEGORY_PRESETS: Record<string, string> = {
  salary: "Salary",
  cc: "Credit Card Bill Payment",
  saving: "Normal Saving (In Account)",
}

export function AddExpensePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addExpense, uploadReceipt, isSupabaseConfigured } = useExpenses()

  const defaultDate = useMemo(
    () => parseExpenseDateParam(searchParams.get("date")),
    [searchParams]
  )

  const defaultCategory = useMemo(() => {
    const preset = searchParams.get("type")
    return preset ? CATEGORY_PRESETS[preset] : undefined
  }, [searchParams])

  const subtitle = defaultDate
    ? `Adding for ${formatDate(toDateInputValue(defaultDate))}`
    : defaultCategory
      ? defaultCategory
      : "Track where your money goes"

  return (
    <>
      <Header title="Add Transaction" subtitle={subtitle} />
      <main className="px-4 py-4 pb-nav">
        <ExpenseForm
          key={`${defaultDate?.toISOString() ?? "today"}-${defaultCategory ?? "default"}`}
          defaultDate={defaultDate}
          defaultCategory={defaultCategory}
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
