import { Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/Dashboard";
import CategoriesPage from "./pages/Categories";
import TransactionsPage from "./pages/Transactions";
import ExpensesPage from "./pages/Expenses";
import ReportsPage from "./pages/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
