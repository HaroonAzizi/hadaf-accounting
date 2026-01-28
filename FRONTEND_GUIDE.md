# Frontend Development Prompt: Hadaf Accounting System

## Project Overview

Build a modern, visually stunning React-based frontend for an accounting system that tracks income, expenses, and profit margins. The design should be professional yet memorable, with bold aesthetic choices that make financial data engaging and easy to understand.

## Tech Stack

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS + CSS Modules for custom animations
- **Icons**: Lucide React
- **Charts**: Recharts (for data visualization)
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API + useState/useReducer
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

---

## Design Direction: Financial Dashboard Meets Modern Editorial

**Aesthetic Vision**:
Create a sophisticated, data-rich interface that feels like a premium financial magazine meets a modern SaaS dashboard. Think Bloomberg Terminal meets Stripe Dashboard meets Apple's design language.

**Key Characteristics**:

- **Typography**: Bold, confident headlines with a distinctive display font (e.g., "Space Mono", "JetBrains Mono", or "IBM Plex Mono" for numbers/data; "General Sans", "Cabinet Grotesk", or "Clash Display" for headings). Avoid Inter, Roboto, Arial.
- **Color Scheme**: Choose ONE of these directions:
  - **Option A - Dark Elegance**: Deep navy/charcoal backgrounds (#0a0e1a, #1a1f2e) with electric blue (#0ea5e9) and mint green (#10b981) accents
  - **Option B - Light Sophistication**: Warm off-whites (#fafaf9, #f5f5f4) with burnt orange (#ea580c) and forest green (#047857) accents
  - **Option C - Bold Contrast**: Pure black/white base with vibrant yellow (#eab308) for income and crimson (#dc2626) for expenses
- **Motion**: Smooth micro-interactions, staggered card reveals, number count-up animations, currency slide-ins
- **Layout**: Asymmetric grids, overlapping elements, generous spacing, sticky headers

**Income = Green | Expense = Red | Profit = Blue** (universal financial UX convention)

---

## Step-by-Step Implementation Plan

### **STEP 1: Project Setup & Configuration**

1. Create Vite React app:

```bash
npm create vite@latest hadaf-frontend -- --template react
cd hadaf-frontend
npm install
```

2. Install dependencies:

```bash
npm install react-router-dom axios lucide-react recharts date-fns react-hook-form zod @hookform/resolvers react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Configure Tailwind (`tailwind.config.js`):

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Choose based on design direction
        primary: "#0ea5e9",
        income: "#10b981",
        expense: "#dc2626",
        profit: "#0ea5e9",
      },
      fontFamily: {
        display: ["Space Mono", "monospace"],
        sans: ["General Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "slide-in-up": "slideInUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-in",
        "count-up": "countUp 1s ease-out",
      },
    },
  },
  plugins: [],
};
```

4. Project structure:

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Loading.jsx
│   │   └── EmptyState.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   ├── dashboard/
│   │   ├── SummaryCard.jsx
│   │   ├── MonthlyChart.jsx
│   │   ├── CategoryBreakdown.jsx
│   │   └── RecentTransactions.jsx
│   ├── categories/
│   │   ├── CategoryList.jsx
│   │   ├── CategoryCard.jsx
│   │   └── CategoryForm.jsx
│   ├── transactions/
│   │   ├── TransactionList.jsx
│   │   ├── TransactionRow.jsx
│   │   ├── TransactionForm.jsx
│   │   └── TransactionFilters.jsx
│   └── recurring/
│       ├── RecurringList.jsx
│       └── RecurringForm.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Categories.jsx
│   ├── Transactions.jsx
│   ├── Recurring.jsx
│   └── Reports.jsx
├── context/
│   └── AppContext.jsx
├── hooks/
│   ├── useCategories.js
│   ├── useTransactions.js
│   ├── useDashboard.js
│   └── useRecurring.js
├── services/
│   └── api.js
├── utils/
│   ├── formatters.js
│   ├── calculations.js
│   └── constants.js
├── App.jsx
└── main.jsx
```

---

### **STEP 2: API Service Layer**

**File: `src/services/api.js`**

Create Axios instance and API functions:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const transactionsAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: (params) => api.get("/dashboard/summary", { params }),
};

export const recurringAPI = {
  getAll: () => api.get("/recurring"),
  getDue: () => api.get("/recurring/due"),
  create: (data) => api.post("/recurring", data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`),
  execute: (id) => api.post(`/recurring/${id}/execute`),
};

export const exportAPI = {
  csv: (params) => api.get("/export/csv", { params, responseType: "blob" }),
  backup: () => api.get("/export/backup", { responseType: "blob" }),
};
```

---

### **STEP 3: Utilities & Constants**

**File: `src/utils/constants.js`**

```javascript
export const CURRENCIES = [
  { value: "AFN", label: "AFN - Afghan Afghani", symbol: "؋" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "TRY", label: "TRY - Turkish Lira", symbol: "₺" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
];

export const TRANSACTION_TYPES = {
  IN: "in",
  OUT: "out",
};

export const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const DEFAULT_CATEGORIES = [
  "Turkish Class",
  "German Class",
  "English Class",
  "Marketing/Ads",
  "General Costs",
  "Other Income",
];
```

**File: `src/utils/formatters.js`**

```javascript
import { format, parseISO } from "date-fns";

export const formatCurrency = (amount, currency = "AFN") => {
  const symbols = { AFN: "؋", USD: "$", TRY: "₺", EUR: "€" };
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbols[currency]} ${formatted}`;
};

export const formatDate = (date) => {
  return format(parseISO(date), "MMM dd, yyyy");
};

export const formatMonth = (dateString) => {
  return format(parseISO(dateString), "MMMM yyyy");
};
```

**File: `src/utils/calculations.js`**

```javascript
export const calculateTotal = (transactions, type, currency) => {
  return transactions
    .filter((t) => t.type === type && t.currency === currency)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
};

export const groupByCurrency = (transactions) => {
  const currencies = {};
  transactions.forEach((t) => {
    if (!currencies[t.currency]) {
      currencies[t.currency] = { income: 0, expense: 0 };
    }
    if (t.type === "in") {
      currencies[t.currency].income += parseFloat(t.amount);
    } else {
      currencies[t.currency].expense += parseFloat(t.amount);
    }
  });
  return currencies;
};
```

---

### **STEP 4: Context & Custom Hooks**

**File: `src/context/AppContext.jsx`**

```javascript
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
```

**File: `src/hooks/useCategories.js`**

```javascript
import { useState, useEffect } from "react";
import { categoriesAPI } from "../services/api";
import toast from "react-hot-toast";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data) => {
    try {
      await categoriesAPI.create(data);
      toast.success("Category created successfully");
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoriesAPI.delete(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};
```

**File: `src/hooks/useTransactions.js`** (similar pattern)
**File: `src/hooks/useDashboard.js`** (similar pattern)

---

### **STEP 5: Common Components with Bold Design**

**File: `src/components/common/Button.jsx`**

```jsx
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    income: "bg-income text-white hover:bg-income/90",
    expense: "bg-expense text-white hover:bg-expense/90",
    outline: "border-2 border-gray-300 hover:border-primary hover:text-primary",
    ghost: "hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3.5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};
```

**File: `src/components/common/Card.jsx`**

```jsx
export const Card = ({ children, className = "", hover = false, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden
        ${hover ? "hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer hover:-translate-y-1" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
```

**File: `src/components/common/Input.jsx`**

```jsx
export const Input = ({ label, error, icon: Icon, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg border-2 transition-all
            ${Icon ? "pl-11" : ""}
            ${error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-primary"}
            focus:outline-none focus:ring-4 focus:ring-primary/10
          `}
          {...props}
        />
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
```

**File: `src/components/common/Modal.jsx`**

```jsx
import { X } from "lucide-react";
import { useEffect } from "react";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-slide-in-up`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold font-display">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

---

### **STEP 6: Layout Components**

**File: `src/components/layout/Navbar.jsx`**

```jsx
import { DollarSign, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <DollarSign className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">
              Hadaf<span className="text-primary">.</span>
            </span>
          </Link>

          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
```

**File: `src/components/layout/Sidebar.jsx`**

```jsx
import {
  LayoutDashboard,
  FolderOpen,
  Receipt,
  Repeat,
  FileText,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "Categories", path: "/categories" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
  { icon: Repeat, label: "Recurring", path: "/recurring" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-xl
        transform transition-transform duration-300 ease-in-out
        lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden self-end mb-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Hadaf Accounting v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
```

**File: `src/components/layout/Layout.jsx`**

```jsx
import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
};
```

---

### **STEP 7: Dashboard Components (The Wow Factor)**

**File: `src/components/dashboard/SummaryCard.jsx`**

```jsx
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";
import { useEffect, useState } from "react";

export const SummaryCard = ({ title, amounts, type = "neutral" }) => {
  const [animatedAmounts, setAnimatedAmounts] = useState({});

  // Count-up animation
  useEffect(() => {
    Object.entries(amounts).forEach(([currency, amount]) => {
      let start = 0;
      const end = amount;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setAnimatedAmounts((prev) => ({ ...prev, [currency]: start }));
      }, 16);
    });
  }, [amounts]);

  const icons = {
    income: <TrendingUp className="text-income" size={32} />,
    expense: <TrendingDown className="text-expense" size={32} />,
    neutral: <DollarSign className="text-profit" size={32} />,
  };

  const colors = {
    income: "border-income/30 bg-income/5",
    expense: "border-expense/30 bg-expense/5",
    neutral: "border-profit/30 bg-profit/5",
  };

  return (
    <Card className={`p-6 border-2 ${colors[type]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white shadow-sm">{icons[type]}</div>
      </div>

      <div className="space-y-2">
        {Object.entries(animatedAmounts).map(([currency, amount]) => (
          <div key={currency} className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

**File: `src/components/dashboard/MonthlyChart.jsx`**

```jsx
import { Card } from "../common/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const MonthlyChart = ({ data }) => {
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
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ fill: "#dc2626", r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ fill: "#0ea5e9", r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
```

**File: `src/components/dashboard/CategoryBreakdown.jsx`**

```jsx
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";
import { ChevronRight } from "lucide-react";

export const CategoryBreakdown = ({ data }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold font-display mb-6">
        Profit by Category
      </h3>
      <div className="space-y-4">
        {data.map((category) => (
          <div
            key={category.categoryId}
            className="group p-4 rounded-xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">{category.categoryName}</h4>
              <ChevronRight className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Income</p>
                <p className="font-semibold text-income">
                  {formatCurrency(category.income.AFN || 0, "AFN")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Expense</p>
                <p className="font-semibold text-expense">
                  {formatCurrency(category.expenses.AFN || 0, "AFN")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Profit</p>
                <p className="font-semibold text-profit">
                  {formatCurrency(category.profit.AFN || 0, "AFN")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

---

### **STEP 8: Transaction Components**

**File: `src/components/transactions/TransactionForm.jsx`**

```jsx
import { useForm } from "react-hook-form";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { CURRENCIES, TRANSACTION_TYPES } from "../../utils/constants";
import { DollarSign, Calendar, User, FileText } from "lucide-react";

export const TransactionForm = ({
  onSubmit,
  categories,
  initialData = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      type: "in",
      currency: "AFN",
      date: new Date().toISOString().split("T")[0],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="relative">
              <input
                type="radio"
                value="in"
                {...register("type", { required: true })}
                className="peer sr-only"
              />
              <div className="p-3 border-2 rounded-lg cursor-pointer text-center transition-all peer-checked:border-income peer-checked:bg-income/10 peer-checked:text-income font-medium">
                Income
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                value="out"
                {...register("type", { required: true })}
                className="peer sr-only"
              />
              <div className="p-3 border-2 rounded-lg cursor-pointer text-center transition-all peer-checked:border-expense peer-checked:bg-expense/10 peer-checked:text-expense font-medium">
                Expense
              </div>
            </label>
          </div>
        </div>

        <select
          {...register("category_id", { required: "Category is required" })}
          className="px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Amount"
          icon={DollarSign}
          {...register("amount", { required: "Amount is required", min: 0.01 })}
          error={errors.amount?.message}
        />

        <select
          {...register("currency")}
          className="px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 mt-7"
        >
          {CURRENCIES.map((curr) => (
            <option key={curr.value} value={curr.value}>
              {curr.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        type="date"
        label="Date"
        icon={Calendar}
        {...register("date", { required: "Date is required" })}
        error={errors.date?.message}
      />

      <Input
        type="text"
        label="Name/Reference"
        placeholder="e.g., Ghulaam, Facebook Ads"
        icon={User}
        {...register("name", { required: "Name is required" })}
        error={errors.name?.message}
      />

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Description (Optional)
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none"
          placeholder="Additional notes..."
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" size="lg">
        {initialData ? "Update Transaction" : "Create Transaction"}
      </Button>
    </form>
  );
};
```

**File: `src/components/transactions/TransactionRow.jsx`**

```jsx
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const TransactionRow = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === "in";

  return (
    <div className="group p-4 rounded-xl border-2 border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${isIncome ? "bg-income/10" : "bg-expense/10"}`}
          >
            {isIncome ? (
              <ArrowUpCircle className="text-income" size={24} />
            ) : (
              <ArrowDownCircle className="text-expense" size={24} />
            )}
          </div>

          <div>
            <h4 className="font-semibold text-lg">{transaction.name}</h4>
            <p className="text-sm text-gray-500">
              {transaction.description || "No description"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p
              className={`text-2xl font-bold font-display ${isIncome ? "text-income" : "text-expense"}`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(transaction.date)}
            </p>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### **STEP 9: Main Pages**

**File: `src/pages/Dashboard.jsx`**

```jsx
import { useDashboard } from "../hooks/useDashboard";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { MonthlyChart } from "../components/dashboard/MonthlyChart";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { Loading } from "../components/common/Loading";

export const Dashboard = () => {
  const { summary, loading } = useDashboard();

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold font-display mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Income"
          amounts={summary.totalIncome}
          type="income"
        />
        <SummaryCard
          title="Total Expenses"
          amounts={summary.totalExpenses}
          type="expense"
        />
        <SummaryCard
          title="Net Profit"
          amounts={summary.netProfit}
          type="neutral"
        />
      </div>

      <MonthlyChart data={summary.monthlyBreakdown} />

      <CategoryBreakdown data={summary.profitByCategory} />
    </div>
  );
};
```

**File: `src/pages/Transactions.jsx`**

```jsx
import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { TransactionRow } from "../components/transactions/TransactionRow";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Plus, Filter } from "lucide-react";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";

export const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const { categories } = useCategories();

  const handleSubmit = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Transactions</h1>
          <p className="text-gray-600">Manage all your income and expenses</p>
        </div>
        <Button
          icon={Plus}
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          New Transaction
        </Button>
      </div>

      {/* Filters can go here */}

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <EmptyState
            message="No transactions yet"
            action={() => setIsModalOpen(true)}
          />
        ) : (
          transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onEdit={(t) => {
                setEditingTransaction(t);
                setIsModalOpen(true);
              }}
              onDelete={deleteTransaction}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? "Edit Transaction" : "New Transaction"}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          categories={categories}
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
};
```

**File: `src/pages/Categories.jsx`** (similar structure)
**File: `src/pages/Recurring.jsx`** (similar structure)
**File: `src/pages/Reports.jsx`** (export functionality)

---

### **STEP 10: App Setup & Routing**

**File: `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { Transactions } from "./pages/Transactions";
import { Recurring } from "./pages/Recurring";
import { Reports } from "./pages/Reports";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
```

**File: `src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**File: `src/index.css`**

```css
@import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}

@layer utilities {
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-slide-in-up {
    animation: slideInUp 0.4s ease-out;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in;
  }
}
```

---

## Design Enhancements Checklist

Add these for extra polish:

1. **Loading States**: Skeleton loaders for cards and lists
2. **Empty States**: Beautiful illustrations when no data
3. **Micro-interactions**:
   - Button ripple effects
   - Card hover lift
   - Number count-up animations
   - Smooth page transitions
4. **Responsive Design**: Mobile-first, works on all screens
5. **Dark Mode** (optional): Add theme toggle
6. **Keyboard Shortcuts**: Cmd+K for search, Cmd+N for new transaction
7. **Export Animations**: Download progress indicator
8. **Success/Error States**: Toast notifications with icons
9. **Charts Interactivity**: Hover tooltips, click to filter

---

## Testing Checklist

- ✅ All pages load without errors
- ✅ Forms validate correctly
- ✅ API calls work (create, read, update, delete)
- ✅ Calculations are accurate
- ✅ Filters work correctly
- ✅ Export functionality works
- ✅ Responsive on mobile, tablet, desktop
- ✅ Animations are smooth (no jank)
- ✅ Loading states appear correctly
- ✅ Error handling works gracefully

---

## Development Order

1. ✅ Setup & install dependencies (30 min)
2. ✅ API service + utils (30 min)
3. ✅ Common components (1 hour)
4. ✅ Layout (30 min)
5. ✅ Dashboard page + components (1.5 hours)
6. ✅ Transactions page (1 hour)
7. ✅ Categories page (45 min)
8. ✅ Recurring page (45 min)
9. ✅ Reports page (45 min)
10. ✅ Polish & animations (1 hour)

**Total: ~8 hours for complete frontend**

---

## Success Criteria

✅ Beautiful, modern interface that doesn't look like generic AI output
✅ Smooth animations and transitions
✅ Fast and responsive
✅ All CRUD operations work
✅ Dashboard shows accurate calculations
✅ Export works correctly
✅ Mobile-friendly
✅ Professional enough for formal use

---

**Start with STEP 1 and follow sequentially. Focus on making it visually stunning!**
