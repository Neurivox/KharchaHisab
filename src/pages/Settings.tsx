import {
  Cloud,
  CloudOff,
  Download,
  Lock,
  Moon,
  Sun,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  disableLock,
  hasPinSet,
  isLockEnabled,
  setPin,
} from "@/lib/appLock"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/Header"
import {
  getCustomCategories,
  removeCustomCategory,
} from "@/lib/categories"
import { getLocalExpenseCount, useExpenses } from "@/hooks/useExpenses"
import { useOpeningBalance } from "@/hooks/useOpeningBalance"
import { isSupabaseConfigured } from "@/lib/supabase"
import { formatDate, getFinancialYear, getMonthLabel } from "@/lib/format"

export function SettingsPage() {
  const [month] = useState(() => new Date())
  const { expenses, syncLocalToSupabase, refetch } = useExpenses()
  const { openingBalance, save: saveOpeningBalance } = useOpeningBalance(month)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )
  const [localCount, setLocalCount] = useState(getLocalExpenseCount)
  const [syncing, setSyncing] = useState(false)
  const [balanceInput, setBalanceInput] = useState("")
  const [savingBalance, setSavingBalance] = useState(false)
  const [customCategories, setCustomCategories] = useState(getCustomCategories)
  const [pinInput, setPinInput] = useState("")
  const [pinConfirm, setPinConfirm] = useState("")
  const [lockOn, setLockOn] = useState(isLockEnabled)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    if (openingBalance !== null) {
      setBalanceInput(String(openingBalance))
    }
  }, [openingBalance])

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

  const handleSaveBalance = async () => {
    const value = Number(balanceInput)
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid balance")
      return
    }
    setSavingBalance(true)
    try {
      await saveOpeningBalance(value)
      toast.success(`Opening balance set for ${getMonthLabel(month)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save balance")
    } finally {
      setSavingBalance(false)
    }
  }

  const handleSetPin = async () => {
    if (pinInput !== pinConfirm) {
      toast.error("PINs do not match")
      return
    }
    try {
      await setPin(pinInput)
      setLockOn(true)
      setPinInput("")
      setPinConfirm("")
      toast.success("App lock enabled")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set PIN")
    }
  }

  const handleDisableLock = () => {
    disableLock()
    setLockOn(false)
    toast.success("App lock disabled")
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
      "Kind",
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
      e.transaction_kind ?? "expense",
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4" />
              Opening balance — {getMonthLabel(month)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Set your account balance at the start of the month. Dashboard shows
              closing balance after income and expenses.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 50000"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
              />
              <Button onClick={() => void handleSaveBalance()} disabled={savingBalance}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add custom categories from the Add Transaction form. They appear
                here for management.
              </p>
            ) : (
              <ul className="space-y-2">
                {customCategories.map((cat) => (
                  <li
                    key={cat.label}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat.group} · {cat.defaultType} · {cat.defaultKind}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        removeCustomCategory(cat.label)
                        setCustomCategories(getCustomCategories())
                        toast.success("Category removed")
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4" />
              App lock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Basic PIN lock for privacy on shared devices. PIN stays on this
              device only — not synced to cloud.
            </p>
            {lockOn && hasPinSet() ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  App lock is enabled
                </p>
                <Button variant="outline" onClick={handleDisableLock}>
                  Disable lock
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="New PIN (4–6 digits)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                />
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Confirm PIN"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                />
                <Button
                  className="w-full"
                  onClick={() => void handleSetPin()}
                  disabled={pinInput.length < 4 || pinConfirm.length < 4}
                >
                  Enable app lock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
              Run migration <code className="text-xs">002_transaction_kind_and_balances.sql</code>{" "}
              in Supabase for income/transfer support and opening balances.
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
