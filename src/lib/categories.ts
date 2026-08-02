import {
  CATEGORIES,
  type CategoryOption,
  getDefaultExpenseType,
  getDefaultTransactionKind,
} from "@/lib/constants"
import type { ExpenseType, TransactionKind } from "@/types/expense"

const STORAGE_KEY = "expense_tracker_custom_categories"

export interface CustomCategory {
  label: string
  defaultType: ExpenseType
  defaultKind: TransactionKind
  group: string
}

function loadCustom(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomCategory[]) : []
  } catch {
    return []
  }
}

function saveCustom(categories: CustomCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export function getCustomCategories(): CustomCategory[] {
  return loadCustom()
}

export function addCustomCategory(category: CustomCategory): void {
  const existing = loadCustom()
  const builtIn = CATEGORIES.some((c) => c.label === category.label)
  if (builtIn) return

  const filtered = existing.filter((c) => c.label !== category.label)
  saveCustom([...filtered, category])
}

export function removeCustomCategory(label: string): void {
  saveCustom(loadCustom().filter((c) => c.label !== label))
}

export function getAllCategories(): CategoryOption[] {
  const custom: CategoryOption[] = loadCustom().map((c) => ({
    label: c.label,
    defaultType: c.defaultType,
    defaultKind: c.defaultKind,
    group: c.group,
  }))
  const builtInLabels = new Set(CATEGORIES.map((c) => c.label))
  const uniqueCustom = custom.filter((c) => !builtInLabels.has(c.label))
  return [...CATEGORIES, ...uniqueCustom]
}

export function getAllCategoryLabels(): string[] {
  return getAllCategories().map((c) => c.label)
}

export function resolveCategoryDefaults(category: string): {
  defaultType: ExpenseType
  defaultKind: TransactionKind
} {
  const match = getAllCategories().find((c) => c.label === category)
  return {
    defaultType: match?.defaultType ?? getDefaultExpenseType(category),
    defaultKind: match?.defaultKind ?? getDefaultTransactionKind(category),
  }
}
