import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CHART_COLORS } from "@/lib/constants"
import { formatINR } from "@/lib/format"
import { resolveTransactionKind } from "@/lib/transactions"
import type { Expense, ExpenseType, PaymentMode } from "@/types/expense"

interface DashboardChartsProps {
  expenses: Expense[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-muted-foreground">{formatINR(payload[0].value)}</p>
    </div>
  )
}

export function DashboardCharts({ expenses }: DashboardChartsProps) {
  const spending = expenses.filter((e) => resolveTransactionKind(e) === "expense")

  const byType = (["NEED", "WANT", "SAVING"] as ExpenseType[]).map((type) => ({
    name: type,
    value: spending
      .filter((e) => e.expense_type === type)
      .reduce((s, e) => s + Number(e.amount), 0),
  })).filter((d) => d.value > 0)

  const categoryMap = spending.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const byCategory = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const paymentMap = spending.reduce<Record<PaymentMode, number>>(
    (acc, e) => {
      acc[e.payment_mode] = (acc[e.payment_mode] ?? 0) + Number(e.amount)
      return acc
    },
    {} as Record<PaymentMode, number>
  )

  const byPayment = Object.entries(paymentMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (expenses.length === 0) return null

  return (
    <div className="space-y-4">
      {byType.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">NEED / WANT / SAVING</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {byType.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[entry.name as ExpenseType]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
              {byType.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      background: CHART_COLORS[d.name as ExpenseType],
                    }}
                  />
                  {d.name}: {formatINR(d.value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {byCategory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(142 76% 36%)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {byPayment.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment modes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byPayment}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(217 91% 60%)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
