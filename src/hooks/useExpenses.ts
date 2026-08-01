import { useCallback, useEffect, useState } from "react"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Expense, ExpenseFilters, ExpenseInsert } from "@/types/expense"

const STORAGE_KEY = "expense_tracker_expenses"

function loadLocal(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Expense[]) : []
  } catch {
    return []
  }
}

function saveLocal(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function getLocalExpenseCount(): number {
  return loadLocal().length
}

export function clearLocalExpenses() {
  localStorage.removeItem(STORAGE_KEY)
}

function applyFilters(expenses: Expense[], filters?: ExpenseFilters): Expense[] {
  if (!filters) return expenses

  return expenses.filter((e) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = `${e.description} ${e.merchant ?? ""} ${e.notes ?? ""}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.category && e.category !== filters.category) return false
    if (filters.payment_mode && e.payment_mode !== filters.payment_mode) return false
    if (filters.expense_type && e.expense_type !== filters.expense_type) return false
    if (filters.date_from && e.transaction_date < filters.date_from) return false
    if (filters.date_to && e.transaction_date > filters.date_to) return false
    return true
  })
}

export function useExpenses(filters?: ExpenseFilters) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isSupabaseConfigured && supabase) {
        let query = supabase
          .from("expenses")
          .select("*")
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })

        if (filters?.category) query = query.eq("category", filters.category)
        if (filters?.payment_mode) query = query.eq("payment_mode", filters.payment_mode)
        if (filters?.expense_type) query = query.eq("expense_type", filters.expense_type)
        if (filters?.date_from) query = query.gte("transaction_date", filters.date_from)
        if (filters?.date_to) query = query.lte("transaction_date", filters.date_to)

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        let result = (data ?? []) as Expense[]
        if (filters?.search) {
          result = applyFilters(result, { search: filters.search })
        }
        setExpenses(result)
      } else {
        const local = loadLocal()
        setExpenses(applyFilters(local, filters))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.payment_mode, filters?.expense_type, filters?.date_from, filters?.date_to, filters?.search])

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (input: ExpenseInsert): Promise<Expense | null> => {
    const now = new Date().toISOString()

    if (isSupabaseConfigured && supabase) {
      const { data, error: insertError } = await supabase
        .from("expenses")
        .insert(input)
        .select()
        .single()

      if (insertError) throw insertError
      await fetchExpenses()
      return data as Expense
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      ...input,
      merchant: input.merchant ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? null,
      receipt_url: input.receipt_url ?? null,
      created_at: now,
      updated_at: now,
    }
    const updated = [expense, ...loadLocal()]
    saveLocal(updated)
    setExpenses(applyFilters(updated, filters))
    return expense
  }

  const updateExpense = async (
    id: string,
    input: Partial<ExpenseInsert>
  ): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error: updateError } = await supabase
        .from("expenses")
        .update(input)
        .eq("id", id)

      if (updateError) throw updateError
      await fetchExpenses()
      return
    }

    const updated = loadLocal().map((e) =>
      e.id === id ? { ...e, ...input, updated_at: new Date().toISOString() } : e
    )
    saveLocal(updated)
    setExpenses(applyFilters(updated, filters))
  }

  const deleteExpense = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)

      if (deleteError) throw deleteError
      await fetchExpenses()
      return
    }

    const updated = loadLocal().filter((e) => e.id !== id)
    saveLocal(updated)
    setExpenses(applyFilters(updated, filters))
  }

  const uploadReceipt = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("receipts").getPublicUrl(path)
    return data.publicUrl
  }

  const syncLocalToSupabase = async (): Promise<number> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured")
    }

    const local = loadLocal()
    if (local.length === 0) return 0

    const rows = local.map(({ id: _id, created_at: _c, updated_at: _u, ...row }) => ({
      ...row,
      tags: row.tags ?? [],
    }))

    const { error: insertError } = await supabase.from("expenses").insert(rows)
    if (insertError) throw insertError

    clearLocalExpenses()
    await fetchExpenses()
    return local.length
  }

  return {
    expenses,
    loading,
    error,
    isSupabaseConfigured,
    refetch: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt,
    syncLocalToSupabase,
  }
}

export function filterExpensesByMonth(expenses: Expense[], month: Date): Expense[] {
  const year = month.getFullYear()
  const m = month.getMonth()
  return expenses.filter((e) => {
    const d = new Date(e.transaction_date)
    return d.getFullYear() === year && d.getMonth() === m
  })
}
