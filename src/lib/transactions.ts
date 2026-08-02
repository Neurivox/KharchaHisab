import { getDefaultTransactionKind } from "@/lib/constants"
import type { Expense, ExpenseSummary, ExpenseType, TransactionKind } from "@/types/expense"

export function resolveTransactionKind(expense: Expense): TransactionKind {
  return expense.transaction_kind ?? getDefaultTransactionKind(expense.category)
}

export function summarizeExpenses(expenses: Expense[]): ExpenseSummary {
  const byType: Record<ExpenseType, number> = { NEED: 0, WANT: 0, SAVING: 0 }
  let income = 0
  let spent = 0
  let saved = 0
  let transfers = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    const kind = resolveTransactionKind(expense)

    if (kind === "income") {
      income += amount
      continue
    }

    if (kind === "transfer") {
      transfers += amount
      continue
    }

    byType[expense.expense_type] += amount
    if (expense.expense_type === "SAVING") {
      saved += amount
    } else {
      spent += amount
    }
  }

  const totalOutflow = spent + saved + transfers
  const totalInflow = income

  return {
    count: expenses.length,
    totalInflow,
    totalOutflow,
    net: totalInflow - totalOutflow,
    spent,
    saved,
    income,
    transfers,
    byType,
  }
}

export function computeClosingBalance(
  openingBalance: number,
  expenses: Expense[]
): number {
  const summary = summarizeExpenses(expenses)
  return openingBalance + summary.net
}
