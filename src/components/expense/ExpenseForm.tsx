import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  addCustomCategory,
  getAllCategories,
  resolveCategoryDefaults,
} from "@/lib/categories"
import {
  EXPENSE_TYPES,
  EXPENSE_TYPE_COLORS,
  PAYMENT_MODES,
} from "@/lib/constants"
import { toDateInputValue } from "@/lib/format"
import type { Expense, ExpenseInsert, ExpenseType, TransactionKind } from "@/types/expense"
import { cn } from "@/lib/utils"

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  payment_mode: z.enum([
    "UPI",
    "Cash",
    "Debit Card",
    "Credit Card",
    "Net Banking",
    "Wallet",
  ]),
  category: z.string().min(1, "Category is required"),
  expense_type: z.enum(["NEED", "WANT", "SAVING"]),
  transaction_kind: z.enum(["expense", "income", "transfer"]),
  transaction_date: z.date(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  is_recurring: z.boolean(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const QUICK_TEMPLATES: {
  label: string
  category: string
  description: string
  payment_mode: ExpenseInsert["payment_mode"]
}[] = [
  { label: "Salary", category: "Salary", description: "Monthly salary", payment_mode: "Net Banking" },
  {
    label: "CC Bill",
    category: "Credit Card Bill Payment",
    description: "Credit card bill payment",
    payment_mode: "Net Banking",
  },
  {
    label: "Save in A/C",
    category: "Normal Saving (In Account)",
    description: "Saved in account",
    payment_mode: "UPI",
  },
]

interface ExpenseFormProps {
  initial?: Expense
  defaultDate?: Date
  defaultCategory?: string
  onSubmit: (data: ExpenseInsert) => Promise<void>
  onCancel?: () => void
  uploadReceipt?: (file: File) => Promise<string | null>
}

export function ExpenseForm({
  initial,
  defaultDate,
  defaultCategory,
  onSubmit,
  onCancel,
  uploadReceipt,
}: ExpenseFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [customGroup, setCustomGroup] = useState("Other")
  const [customType, setCustomType] = useState<ExpenseType>("WANT")
  const [customKind, setCustomKind] = useState<TransactionKind>("expense")
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  const startCategory = defaultCategory ?? initial?.category ?? "Groceries"
  const startDefaults = resolveCategoryDefaults(startCategory)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initial ? Number(initial.amount) : undefined,
      description: initial?.description ?? "",
      payment_mode: initial?.payment_mode ?? "UPI",
      category: startCategory,
      expense_type: initial?.expense_type ?? startDefaults.defaultType,
      transaction_kind:
        initial?.transaction_kind ?? startDefaults.defaultKind,
      transaction_date: initial
        ? new Date(initial.transaction_date)
        : (defaultDate ?? new Date()),
      merchant: initial?.merchant ?? "",
      notes: initial?.notes ?? "",
      tags: initial?.tags?.join(", ") ?? "",
      is_recurring: initial?.is_recurring ?? false,
    },
  })

  const watchCategory = form.watch("category")
  const watchKind = form.watch("transaction_kind")

  useEffect(() => {
    if (!initial && watchCategory) {
      const defaults = resolveCategoryDefaults(watchCategory)
      form.setValue("expense_type", defaults.defaultType)
      form.setValue("transaction_kind", defaults.defaultKind)
    }
  }, [watchCategory, initial, form])

  const allCategories = useMemo(() => getAllCategories(), [showCustomCategory])

  const groupedCategories = useMemo(
    () =>
      allCategories.reduce<Record<string, typeof allCategories>>((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = []
        acc[cat.group].push(cat)
        return acc
      }, {}),
    [allCategories]
  )

  const handleSubmit = async (values: ExpenseFormValues) => {
    setSubmitting(true)
    try {
      let receipt_url = initial?.receipt_url ?? null
      const fileInput = document.getElementById(
        "receipt-upload"
      ) as HTMLInputElement | null
      const file = fileInput?.files?.[0]

      if (file && uploadReceipt) {
        receipt_url = await uploadReceipt(file)
      }

      const tags = values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : null

      await onSubmit({
        amount: values.amount,
        description: values.description,
        payment_mode: values.payment_mode,
        category: values.category,
        expense_type: values.expense_type,
        transaction_kind: values.transaction_kind,
        transaction_date: toDateInputValue(values.transaction_date),
        merchant: values.merchant || null,
        notes: values.notes || null,
        tags,
        is_recurring: values.is_recurring,
        receipt_url,
      })

      toast.success(initial ? "Expense updated" : "Expense added")
      if (!initial) form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const addCustomCategoryEntry = () => {
    if (!customCategory.trim()) return
    const label = customCategory.trim()
    addCustomCategory({
      label,
      defaultType: customType,
      defaultKind: customKind,
      group: customGroup,
    })
    form.setValue("category", label)
    form.setValue("expense_type", customType)
    form.setValue("transaction_kind", customKind)
    setShowCustomCategory(false)
    setCustomCategory("")
    toast.success(`Category "${label}" saved`)
  }

  const applyTemplate = (template: (typeof QUICK_TEMPLATES)[number]) => {
    const defaults = resolveCategoryDefaults(template.category)
    form.setValue("category", template.category)
    form.setValue("description", template.description)
    form.setValue("payment_mode", template.payment_mode)
    form.setValue("expense_type", defaults.defaultType)
    form.setValue("transaction_kind", defaults.defaultKind)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!initial ? (
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((template) => (
              <Button
                key={template.label}
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 rounded-full text-xs"
                onClick={() => applyTemplate(template)}
              >
                {template.label}
              </Button>
            ))}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Monthly rent, Swiggy dinner..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="merchant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Merchant (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Blinkit, Amazon, employer..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode of Payment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(groupedCategories).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {group}
                      </div>
                      {items.map((cat) => (
                        <SelectItem key={cat.label} value={cat.label}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {!showCustomCategory ? (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowCustomCategory(true)}
                >
                  + Add custom category
                </Button>
              ) : (
                <div className="space-y-2 rounded-lg border p-3">
                  <Input
                    placeholder="Category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={customGroup} onValueChange={setCustomGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Essentials", "Lifestyle", "Financial", "Income", "Other"].map(
                          (g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <Select
                      value={customKind}
                      onValueChange={(v) => setCustomKind(v as TransactionKind)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_TYPES.map((type) => (
                      <Badge
                        key={type}
                        className={cn(
                          "cursor-pointer text-xs",
                          customType === type
                            ? EXPENSE_TYPE_COLORS[type]
                            : "bg-muted text-muted-foreground"
                        )}
                        onClick={() => setCustomType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomCategory(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={addCustomCategoryEntry}>
                      Save category
                    </Button>
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {watchKind !== "income" ? (
          <FormField
            control={form.control}
            name="expense_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Expense</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_TYPES.map((type) => (
                      <Badge
                        key={type}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm",
                          field.value === type
                            ? EXPENSE_TYPE_COLORS[type]
                            : "bg-muted text-muted-foreground"
                        )}
                        onClick={() => field.onChange(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            Income entry — adds to your balance
          </div>
        )}

        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(field.value, "d MMM yyyy")
                        : "Pick a date"}
                      <CalendarIcon className="ml-auto size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Recurring</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Rent, EMI, SIP, salary, subscriptions
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input placeholder="trip, office (comma separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {uploadReceipt ? (
          <FormItem>
            <FormLabel>Receipt (optional)</FormLabel>
            <FormControl>
              <Input
                id="receipt-upload"
                type="file"
                accept="image/*"
                capture="environment"
              />
            </FormControl>
          </FormItem>
        ) : null}

        <div className="flex gap-2 pt-2">
          {onCancel ? (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update"
            ) : watchKind === "income" ? (
              "Add Income"
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
