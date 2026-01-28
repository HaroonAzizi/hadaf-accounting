import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../common/Card";

export type MonthlyChartRow = {
  month: string;
  income: number;
  expense: number;
  profit: number;
};

export function MonthlyChart({ data }: { data: MonthlyChartRow[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold font-display mb-6">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ fill: "#dc2626", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ fill: "#0ea5e9", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
