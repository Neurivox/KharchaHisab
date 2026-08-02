import { isSupabaseConfigured, supabase } from "@/lib/supabase"

const STORAGE_KEY = "expense_tracker_opening_balances"

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function loadLocal(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function saveLocal(balances: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balances))
}

export function getOpeningBalanceLocal(month: Date): number | null {
  const value = loadLocal()[monthKey(month)]
  return value === undefined ? null : value
}

export function setOpeningBalanceLocal(month: Date, balance: number): void {
  const balances = loadLocal()
  balances[monthKey(month)] = balance
  saveLocal(balances)
}

export async function getOpeningBalance(month: Date): Promise<number | null> {
  const key = monthKey(month)

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("monthly_opening_balances")
      .select("opening_balance")
      .eq("month", key)
      .maybeSingle()

    if (!error && data) {
      return Number(data.opening_balance)
    }
  }

  return getOpeningBalanceLocal(month)
}

export async function setOpeningBalance(
  month: Date,
  balance: number
): Promise<void> {
  const key = monthKey(month)
  setOpeningBalanceLocal(month, balance)

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("monthly_opening_balances").upsert(
      { month: key, opening_balance: balance },
      { onConflict: "month" }
    )
    if (error) throw error
  }
}

export { monthKey as getMonthKey }
