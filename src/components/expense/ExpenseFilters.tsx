import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  EXPENSE_TYPES,
  getCategoryLabels,
  PAYMENT_MODES,
} from "@/lib/constants"
import type { ExpenseFilters, ExpenseType, PaymentMode } from "@/types/expense"

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters
  onChange: (filters: ExpenseFilters) => void
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const update = (patch: Partial<ExpenseFilters>) => {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search description or merchant..."
        value={filters.search ?? ""}
        onChange={(e) => update({ search: e.target.value || undefined })}
      />

      <Tabs
        value={filters.expense_type ?? "all"}
        onValueChange={(v) =>
          update({ expense_type: v === "all" ? undefined : (v as ExpenseType) })
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          {EXPENSE_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} className="flex-1">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Filter className="size-4" />
            More filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-safe">
          <SheetHeader>
            <SheetTitle>Filter expenses</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category ?? "all"}
                onValueChange={(v) =>
                  update({ category: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {getCategoryLabels().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment mode</Label>
              <Select
                value={filters.payment_mode ?? "all"}
                onValueChange={(v) =>
                  update({
                    payment_mode: v === "all" ? undefined : (v as PaymentMode),
                  })
                }
              >
                <SelectTrigger className="w-full">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date-from">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.date_from ?? ""}
                  onChange={(e) =>
                    update({ date_from: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.date_to ?? ""}
                  onChange={(e) =>
                    update({ date_to: e.target.value || undefined })
                  }
                />
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onChange({})}
            >
              Clear all filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
