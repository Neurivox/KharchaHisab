import { useNavigate } from "react-router"
import { Header } from "@/components/layout/Header"
import { ExpenseForm } from "@/components/expense/ExpenseForm"
import { useExpenses } from "@/hooks/useExpenses"

export function AddExpensePage() {
  const navigate = useNavigate()
  const { addExpense, uploadReceipt, isSupabaseConfigured } = useExpenses()

  return (
    <>
      <Header title="Add Expense" subtitle="Track where your money goes" />
      <main className="px-4 py-4 pb-nav">
        <ExpenseForm
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
