import { useMemo, useState } from "react"
import {
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { CalendarIcon, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllCategoryLabels } from "@/lib/categories"
import { EXPENSE_TYPES, PAYMENT_MODES } from "@/lib/constants"
import { toDateInputValue } from "@/lib/format"
import type {
  ExpenseFilters,
  ExpenseType,
  PaymentMode,
  TransactionKind,
} from "@/types/expense"
import { cn } from "@/lib/utils"

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters
  onChange: (filters: ExpenseFilters) => void
}

const DATE_PRESETS = [
  {
    label: "This week",
    getRange: () =>
      rangeFromDates(
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 })
      ),
  },
  {
    label: "This month",
    getRange: () =>
      rangeFromDates(startOfMonth(new Date()), endOfMonth(new Date())),
  },
  {
    label: "Last month",
    getRange: () => {
      const prev = subMonths(new Date(), 1)
      return rangeFromDates(startOfMonth(prev), endOfMonth(prev))
    },
  },
] as const

const TRANSACTION_KINDS: { value: TransactionKind; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
]

function rangeFromDates(from: Date, to: Date) {
  return {
    date_from: toDateInputValue(from),
    date_to: toDateInputValue(to),
  }
}

function countActiveFilters(filters: ExpenseFilters): number {
  let count = 0
  if (filters.category) count++
  if (filters.payment_mode) count++
  if (filters.transaction_kind) count++
  if (filters.date_from || filters.date_to) count++
  return count
}

function parseFilterDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ExpenseFilters>(filters)

  const categoryLabels = useMemo(() => getAllCategoryLabels(), [open])
  const activeCount = countActiveFilters(filters)

  const update = (patch: Partial<ExpenseFilters>) => {
    onChange({ ...filters, ...patch })
  }

  const openSheet = () => {
    setDraft(filters)
    setOpen(true)
  }

  const applyDraft = () => {
    onChange(draft)
    setOpen(false)
  }

  const clearAll = () => {
    onChange({})
    setDraft({})
    setOpen(false)
  }

  const removeFilter = (key: keyof ExpenseFilters) => {
    const next = { ...filters }
    delete next[key]
    if (key === "date_from" || key === "date_to") {
      delete next.date_from
      delete next.date_to
    }
    onChange(next)
  }

  const activePreset = useMemo(() => {
    return DATE_PRESETS.find((preset) => {
      const range = preset.getRange()
      return (
        draft.date_from === range.date_from && draft.date_to === range.date_to
      )
    })?.label
  }, [draft.date_from, draft.date_to])

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search description or merchant..."
        value={filters.search ?? ""}
        onChange={(e) => update({ search: e.target.value || undefined })}
        className="h-10"
      />

      <Tabs
        value={filters.expense_type ?? "all"}
        onValueChange={(v) =>
          update({ expense_type: v === "all" ? undefined : (v as ExpenseType) })
        }
      >
        <TabsList className="grid h-9 w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          {EXPENSE_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} className="text-xs">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-1.5">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => update(preset.getRange())}
          >
            {preset.label}
          </Button>
        ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-full px-3 text-xs"
              onClick={openSheet}
            >
              <Filter className="size-3.5" />
              Filters
              {activeCount > 0 ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex h-auto max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-safe"
          >
            <SheetHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left">
              <SheetTitle className="text-base">Filter expenses</SheetTitle>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-6">
                <FilterSection title="Date range">
                  <div className="grid grid-cols-3 gap-2">
                    {DATE_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant={activePreset === preset.label ? "default" : "outline"}
                        size="sm"
                        className="h-9 w-full text-xs"
                        onClick={() =>
                          setDraft({ ...draft, ...preset.getRange() })
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <DatePickerField
                      label="From"
                      value={draft.date_from}
                      onChange={(date) =>
                        setDraft({
                          ...draft,
                          date_from: date ? toDateInputValue(date) : undefined,
                        })
                      }
                    />
                    <DatePickerField
                      label="To"
                      value={draft.date_to}
                      onChange={(date) =>
                        setDraft({
                          ...draft,
                          date_to: date ? toDateInputValue(date) : undefined,
                        })
                      }
                    />
                  </div>
                </FilterSection>

                <FilterSection title="Category">
                  <Select
                    value={draft.category ?? "all"}
                    onValueChange={(v) =>
                      setDraft({ ...draft, category: v === "all" ? undefined : v })
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categoryLabels.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterSection>

                <FilterSection title="Payment mode">
                  <Select
                    value={draft.payment_mode ?? "all"}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        payment_mode: v === "all" ? undefined : (v as PaymentMode),
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All modes</SelectItem>
                      {PAYMENT_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterSection>

                <FilterSection title="Transaction type">
                  <div className="grid grid-cols-2 gap-2">
                    <FilterChip
                      active={!draft.transaction_kind}
                      onClick={() =>
                        setDraft({ ...draft, transaction_kind: undefined })
                      }
                      className="col-span-2"
                    >
                      All types
                    </FilterChip>
                    {TRANSACTION_KINDS.map(({ value, label }) => (
                      <FilterChip
                        key={value}
                        active={draft.transaction_kind === value}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            transaction_kind:
                              draft.transaction_kind === value ? undefined : value,
                          })
                        }
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>

            <div className="shrink-0 border-t bg-popover px-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
                <Button type="button" className="h-11" onClick={applyDraft}>
                  Apply filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {(filters.category ||
        filters.payment_mode ||
        filters.transaction_kind ||
        filters.date_from ||
        filters.date_to) && (
        <div className="flex flex-wrap gap-1.5">
          {filters.date_from || filters.date_to ? (
            <ActiveChip
              label={
                filters.date_from && filters.date_to
                  ? `${format(parseISO(filters.date_from), "d MMM")} – ${format(parseISO(filters.date_to), "d MMM")}`
                  : filters.date_from
                    ? `From ${format(parseISO(filters.date_from), "d MMM")}`
                    : `Until ${format(parseISO(filters.date_to!), "d MMM")}`
              }
              onRemove={() => removeFilter("date_from")}
            />
          ) : null}
          {filters.category ? (
            <ActiveChip
              label={filters.category}
              onRemove={() => removeFilter("category")}
            />
          ) : null}
          {filters.payment_mode ? (
            <ActiveChip
              label={filters.payment_mode}
              onRemove={() => removeFilter("payment_mode")}
            />
          ) : null}
          {filters.transaction_kind ? (
            <ActiveChip
              label={filters.transaction_kind}
              onRemove={() => removeFilter("transaction_kind")}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (date: Date | undefined) => void
}) {
  const selected = parseFilterDate(value)

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start px-3 font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" />
            <span className="truncate">
              {selected ? format(selected, "d MMM yyyy") : "Pick date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} onSelect={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center rounded-lg border px-3 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted/60",
        className
      )}
    >
      {children}
    </button>
  )
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 font-normal">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-muted"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}
