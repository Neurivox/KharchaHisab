import { useEffect, useState } from "react"
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
  CATEGORIES,
  EXPENSE_TYPES,
  EXPENSE_TYPE_COLORS,
  getDefaultExpenseType,
  PAYMENT_MODES,
} from "@/lib/constants"
import { toDateInputValue } from "@/lib/format"
import type { Expense, ExpenseInsert } from "@/types/expense"
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
  transaction_date: z.date(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  is_recurring: z.boolean(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  initial?: Expense
  defaultDate?: Date
  onSubmit: (data: ExpenseInsert) => Promise<void>
  onCancel?: () => void
  uploadReceipt?: (file: File) => Promise<string | null>
}

export function ExpenseForm({
  initial,
  defaultDate,
  onSubmit,
  onCancel,
  uploadReceipt,
}: ExpenseFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initial ? Number(initial.amount) : undefined,
      description: initial?.description ?? "",
      payment_mode: initial?.payment_mode ?? "UPI",
      category: initial?.category ?? "Groceries",
      expense_type: initial?.expense_type ?? "NEED",
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

  useEffect(() => {
    if (!initial && watchCategory) {
      form.setValue("expense_type", getDefaultExpenseType(watchCategory))
    }
  }, [watchCategory, initial, form])

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

  const addCustomCategory = () => {
    if (!customCategory.trim()) return
    form.setValue("category", customCategory.trim())
    form.setValue("expense_type", getDefaultExpenseType(customCategory.trim()))
    setShowCustomCategory(false)
    setCustomCategory("")
  }

  const groupedCategories = CATEGORIES.reduce<Record<string, typeof CATEGORIES>>(
    (acc, cat) => {
      if (!acc[cat.group]) acc[cat.group] = []
      acc[cat.group].push(cat)
      return acc
    },
    {}
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <Input placeholder="Blinkit, Amazon, landlord..." {...field} />
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
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={addCustomCategory}>
                    Add
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormLabel>Recurring expense</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Rent, EMI, SIP, subscriptions
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
              "Update Expense"
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
