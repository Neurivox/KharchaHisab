import { Cloud, CloudOff, Download, Moon, Sun, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/Header"
import { getLocalExpenseCount, useExpenses } from "@/hooks/useExpenses"
import { isSupabaseConfigured } from "@/lib/supabase"
import { formatDate, getFinancialYear } from "@/lib/format"

export function SettingsPage() {
  const { expenses, syncLocalToSupabase, refetch } = useExpenses()
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )
  const [localCount, setLocalCount] = useState(getLocalExpenseCount)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const count = await syncLocalToSupabase()
      setLocalCount(0)
      toast.success(`Synced ${count} expense${count === 1 ? "" : "s"} to Supabase`)
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

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
            <CardTitle className="text-base">Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              {isSupabaseConfigured ? (
                <Cloud className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <CloudOff className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div>
                {isSupabaseConfigured ? (
                  <>
                    <p className="font-medium text-foreground">Supabase connected</p>
                    <p className="text-muted-foreground">
                      {expenses.length} expense{expenses.length === 1 ? "" : "s"} in
                      cloud database
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Local storage only</p>
                    <p className="text-muted-foreground">
                      Expenses stay in this browser. Add{" "}
                      <code className="text-xs">.env.local</code> (local) or GitHub
                      Secrets (deployed app) with Supabase keys.
                    </p>
                  </>
                )}
              </div>
            </div>

            {isSupabaseConfigured && localCount > 0 ? (
              <>
                <Separator />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {localCount} expense{localCount === 1 ? "" : "s"} saved only on
                  this device — not in Supabase yet.
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <Upload className="size-4" />
                  {syncing ? "Syncing…" : `Sync ${localCount} to Supabase`}
                </Button>
              </>
            ) : null}

            <Separator />
            <p className="text-xs text-muted-foreground">
              In Supabase dashboard: Table Editor →{" "}
              <strong>expenses</strong> (schema: public)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            Open in Safari → Share → Add to Home Screen. Works offline after first
            load.
          </CardContent>
        </Card>
      </main>
    </>
  )
}
