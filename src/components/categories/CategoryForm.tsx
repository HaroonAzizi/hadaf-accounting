import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import type { Category } from "../../services/api";
import { flattenCategories } from "../../utils/flattenCategories";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

function normalizeDefaultParentId(value: unknown): "" | number {
  if (value === "" || value === null || value === undefined) return "";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n;
}

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  parentId: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === "" || value === null || value === undefined) return null;
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    })
    .pipe(z.number().int().positive().nullable()),
  type: z.string().optional(),
});

export type CategoryFormInput = z.input<typeof schema>;
export type CategoryFormValues = z.output<typeof schema>;

export function CategoryForm({
  categories,
  initial,
  onSubmit,
}: {
  categories: Category[];
  initial?: Category | null;
  onSubmit: (values: {
    name: string;
    parentId: number | null;
    type?: string;
  }) => Promise<void> | void;
}) {
  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      parentId: normalizeDefaultParentId(initial?.parent_id),
      type: initial?.type ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          name: v.name,
          parentId: v.parentId,
          type: v.type || undefined,
        }),
      )}
      className="space-y-5"
    >
      <Input
        label="Name"
        placeholder="e.g., Marketing/Ads"
        error={errors.name?.message}
        {...register("name")}
      />

      <Select
        label="Parent (optional)"
        error={errors.parentId?.message}
        {...register("parentId")}
      >
        <option value="">No parent</option>
        {flat
          .filter((c) => c.id !== initial?.id)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {`${"— ".repeat(c.depth)}${c.name}`}
            </option>
          ))}
      </Select>

      <Input
        label="Type (optional)"
        placeholder="income / expense / general"
        {...register("type")}
      />

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        {initial ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
