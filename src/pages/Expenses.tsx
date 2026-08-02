import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from "@/components/layout/Header"
import { ExpenseFiltersBar } from "@/components/expense/ExpenseFilters"
import { FilterSummary } from "@/components/expense/FilterSummary"
import { ExpenseList } from "@/components/expense/ExpenseList"
import { ExpenseForm } from "@/components/expense/ExpenseForm"
import { useExpenses } from "@/hooks/useExpenses"
import type { Expense, ExpenseFilters } from "@/types/expense"

export function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [selected, setSelected] = useState<Expense | null>(null)
  const [toDelete, setToDelete] = useState<Expense | null>(null)

  const { expenses, loading, error, updateExpense, deleteExpense, uploadReceipt, isSupabaseConfigured } =
    useExpenses(filters)

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteExpense(toDelete.id)
      toast.success("Expense deleted")
      setToDelete(null)
      setSelected(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <>
      <Header title="All Expenses" subtitle={`${expenses.length} transactions`} />

      <main className="space-y-3 px-4 py-4 pb-nav">
        <ExpenseFiltersBar filters={filters} onChange={setFilters} />
        <FilterSummary expenses={expenses} filters={filters} />

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <ExpenseList expenses={expenses} onSelect={setSelected} />
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit expense</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <ExpenseForm
                initial={selected}
                onSubmit={async (data) => {
                  await updateExpense(selected.id, data)
                  setSelected(null)
                }}
                onCancel={() => setSelected(null)}
                uploadReceipt={isSupabaseConfigured ? uploadReceipt : undefined}
              />
              <button
                type="button"
                className="w-full text-sm text-destructive hover:underline"
                onClick={() => setToDelete(selected)}
              >
                Delete this expense
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{toDelete?.description}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
