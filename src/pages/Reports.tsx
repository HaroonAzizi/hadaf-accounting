import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, FileDown } from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";

import { useCategories } from "../hooks/useCategories";
import { exportAPI, type TransactionType } from "../services/api";
import { downloadBlob } from "../utils/download";
import { flattenCategories } from "../utils/flattenCategories";
import { CURRENCIES } from "../utils/constants";

export default function ReportsPage() {
  const { categories } = useCategories();
  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const [type, setType] = useState<TransactionType | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [currency, setCurrency] = useState<string | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [exporting, setExporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const params = useMemo(
    () => ({
      type: type || undefined,
      categoryId: categoryId === "" ? undefined : Number(categoryId),
      currency: currency || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [type, categoryId, currency, startDate, endDate],
  );

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportAPI.csv(params);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `hadaf-transactions-${today}.csv`);
      toast.success("CSV exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const blob = await exportAPI.backup();
      const today = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `hadaf-backup-${today}.db`);
      toast.success("Backup downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download backup",
      );
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Reports
            </h1>
            <p className="text-slate-600 mt-1">
              Export transactions and download database backups.
            </p>
          </div>
        </header>

        <Card className="p-6">
          <h2 className="text-xl font-bold font-display">Export CSV</h2>
          <p className="text-sm text-slate-600 mt-1">
            Download a CSV of transactions with optional filters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5">
            <Select
              label="Type"
              value={type}
              onChange={(e) =>
                setType((e.target.value as TransactionType) || "")
              }
            >
              <option value="">All</option>
              <option value="in">Income</option>
              <option value="out">Expense</option>
            </Select>

            <Select
              label="Category"
              value={categoryId.toString()}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">All</option>
              {flat.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${"— ".repeat(c.depth)}${c.name}`}
                </option>
              ))}
            </Select>

            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value || "")}
            >
              <option value="">All</option>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            <Input
              label="Start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              icon={FileDown}
              onClick={() => void handleExportCsv()}
              loading={exporting}
              type="button"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setType("");
                setCategoryId("");
                setCurrency("");
                setStartDate("");
                setEndDate("");
              }}
              type="button"
            >
              Reset Filters
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold font-display">Database Backup</h2>
          <p className="text-sm text-slate-600 mt-1">
            Download a backup of the SQLite database file.
          </p>

          <div className="mt-6">
            <Button
              icon={Download}
              onClick={() => void handleBackup()}
              loading={backingUp}
              type="button"
            >
              Download Backup
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
