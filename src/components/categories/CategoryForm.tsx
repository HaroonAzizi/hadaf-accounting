import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import type { Category } from "../../services/api";
import { flattenCategories } from "../../utils/flattenCategories";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  parentId: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v))),
  type: z.string().optional(),
});

export type CategoryFormValues = z.input<typeof schema>;

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
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      parentId: initial?.parent_id ?? "",
      type: initial?.type ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        const parsed = schema.parse(v);
        return onSubmit({
          name: parsed.name,
          parentId: parsed.parentId,
          type: parsed.type || undefined,
        });
      })}
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
