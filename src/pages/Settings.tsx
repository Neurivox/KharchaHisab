import { Download, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/Header"
import { useExpenses } from "@/hooks/useExpenses"
import { isSupabaseConfigured } from "@/lib/supabase"
import { formatDate, getFinancialYear } from "@/lib/format"

export function SettingsPage() {
  const { expenses } = useExpenses()
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  const exportCsv = () => {
    if (expenses.length === 0) {
      toast.error("No expenses to export")
      return
    }

    const headers = [
      "Date",
      "Description",
      "Merchant",
      "Amount (INR)",
      "Category",
      "Type",
      "Payment Mode",
      "Recurring",
      "Notes",
      "Tags",
      "Financial Year",
    ]

    const rows = expenses.map((e) => [
      e.transaction_date,
      e.description,
      e.merchant ?? "",
      Number(e.amount).toFixed(2),
      e.category,
      e.expense_type,
      e.payment_mode,
      e.is_recurring ? "Yes" : "No",
      e.notes ?? "",
      e.tags?.join("; ") ?? "",
      getFinancialYear(new Date(e.transaction_date)),
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `expenses-${formatDate(new Date().toISOString().slice(0, 10))}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  return (
    <>
      <Header title="Settings" subtitle="Preferences & data" />

      <main className="space-y-4 px-4 py-4 pb-nav">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span className="text-sm">Dark mode</span>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {isSupabaseConfigured
                ? "Connected to Supabase"
                : "Using local storage (add .env.local for Supabase sync)"}
            </div>
            <Separator />
            <Button variant="outline" className="w-full gap-2" onClick={exportCsv}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              Includes Financial Year (Apr–Mar) column for Indian tax prep.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Install on iPhone</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open in Safari → Share → Add to Home Screen. Works offline after first load.
          </CardContent>
        </Card>
      </main>
    </>
  )
}
