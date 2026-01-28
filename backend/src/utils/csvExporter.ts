import type { TransactionRow } from "./calculations";

function escapeCsv(value: unknown) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function transactionsToCsv(rows: TransactionRow[]) {
  const headers = [
    "id",
    "date",
    "type",
    "currency",
    "amount",
    "name",
    "description",
    "category_id",
    "category_name",
  ];

  const lines = [headers.join(",")];

  for (const r of rows) {
    const line = [
      r.id,
      r.date,
      r.type,
      r.currency,
      r.amount,
      r.name,
      r.description ?? "",
      r.category_id,
      r.category_name ?? "",
    ]
      .map(escapeCsv)
      .join(",");
    lines.push(line);
  }

  return lines.join("\n");
}
