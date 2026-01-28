import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Calendar, DollarSign, FileText, User } from "lucide-react";

import type {
  Category,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../services/api";
import { CURRENCIES } from "../../utils/constants";
import { flattenCategories } from "../../utils/flattenCategories";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const schema = z.object({
  type: z.enum(["in", "out"]),
  status: z.enum(["pending", "done", "cancelled"]),
  category_id: z.coerce
    .number()
    .int()
    .positive({ message: "Category is required" }),
  amount: z.coerce.number().positive({ message: "Amount is required" }),
  currency: z.string().min(1),
  date: z.string().min(1, { message: "Date is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

type TransactionFormInput = z.input<typeof schema>;
export type TransactionFormValues = z.infer<typeof schema>;

export function TransactionForm({
  categories,
  initialData,
  onSubmit,
}: {
  categories: Category[];
  initialData?: Transaction | null;
  onSubmit: (data: TransactionFormValues) => Promise<void> | void;
}) {
  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const defaultValues: TransactionFormInput = {
    type: (initialData?.type ?? "in") as TransactionType,
    status: (initialData?.status ?? "done") as TransactionStatus,
    category_id: initialData?.category_id ?? "",
    amount: initialData?.amount ?? "",
    currency: initialData?.currency ?? "AFN",
    date: initialData?.date ?? new Date().toISOString().slice(0, 10),
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        const parsed = schema.parse(v);
        return onSubmit(parsed);
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="relative">
              <input
                type="radio"
                value="in"
                {...register("type")}
                className="peer sr-only"
              />
              <div className="p-3 border-2 rounded-lg cursor-pointer text-center transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-600 font-medium">
                Income
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                value="out"
                {...register("type")}
                className="peer sr-only"
              />
              <div className="p-3 border-2 rounded-lg cursor-pointer text-center transition-all peer-checked:border-red-600 peer-checked:bg-red-600/10 peer-checked:text-red-600 font-medium">
                Expense
              </div>
            </label>
          </div>
          {errors.type ? (
            <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
          ) : null}
        </div>

        <Select
          label="Status"
          error={errors.status?.message}
          {...register("status")}
        >
          <option value="done">Done</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        <Select
          label="Category"
          error={errors.category_id?.message}
          {...register("category_id")}
        >
          <option value="">Select Category</option>
          {flat.map((c) => (
            <option key={c.id} value={c.id}>
              {`${"— ".repeat(c.depth)}${c.name}`}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Amount"
          icon={DollarSign}
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Select
          label="Currency"
          error={errors.currency?.message}
          {...register("currency")}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr.value} value={curr.value}>
              {curr.label}
            </option>
          ))}
        </Select>
      </div>

      <Input
        type="date"
        label="Date"
        icon={Calendar}
        error={errors.date?.message}
        {...register("date")}
      />

      <Input
        type="text"
        label="Name/Reference"
        placeholder="e.g., Ghulaam, Facebook Ads"
        icon={User}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Description (Optional)
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400">
            <FileText size={20} />
          </div>
          <textarea
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border-2 transition-all border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 pl-11 resize-none"
            placeholder="Additional notes..."
            {...register("description")}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        {initialData ? "Update Transaction" : "Create Transaction"}
      </Button>
    </form>
  );
}
