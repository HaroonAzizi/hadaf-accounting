# Integration Prompt: Connect Hadaf Backend & Frontend

## Overview

You have successfully built:

1. ✅ **Backend**: Node.js + Express + SQLite API (running on port 5000)
2. ✅ **Frontend**: React + Vite app with modern UI

Now it's time to **connect them together** and make the full-stack application work seamlessly.

---

## Pre-Integration Checklist

Before starting, verify:

- [ ] Backend server runs without errors: `cd backend && npm run dev`
- [ ] Backend is accessible at: `http://localhost:5000`
- [ ] Test backend endpoint: `curl http://localhost:5000/api/categories`
- [ ] Frontend runs without errors: `cd frontend && npm run dev`
- [ ] Frontend is accessible at: `http://localhost:5173` (or similar)

---

## Step-by-Step Integration Plan

### **STEP 1: Backend CORS Configuration**

**Problem**: Frontend (localhost:5173) cannot make requests to Backend (localhost:5000) due to CORS restrictions.

**Solution**: Update backend to allow frontend origin.

**File: `backend/src/app.js`** (or wherever you initialize Express)

```javascript
import cors from "cors";

// BEFORE mounting routes, add CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite default
      "http://localhost:5174", // Vite alternative port
      "http://localhost:3000", // In case you change Vite port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

**Verify**:

1. Restart backend server
2. Open browser console on frontend
3. Check for CORS errors (should be gone)

---

### **STEP 2: Frontend API Configuration**

**Problem**: Frontend needs to know the exact backend URL.

**Solution**: Create environment variables for API URL.

**File: `frontend/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

**File: `frontend/src/services/api.js`**

Update the baseURL to use environment variable:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Rest of your API code...
```

**Verify**:

1. Restart frontend server
2. Open browser DevTools → Network tab
3. Should see requests going to `http://localhost:5000/api/*`

---

### **STEP 3: Test End-to-End Flow**

Test each feature to ensure frontend ↔ backend communication works:

#### **3.1: Categories CRUD**

**Test Plan**:

1. Open frontend: `http://localhost:5173/categories`
2. Click "New Category" → Fill form → Submit
3. **Expected**:
   - POST request to `/api/categories` in Network tab
   - Toast notification "Category created"
   - New category appears in list
4. Click Edit → Update name → Submit
5. **Expected**: PUT request, category updates
6. Click Delete → Confirm
7. **Expected**: DELETE request, category removed

**Debug if fails**:

- Check browser console for errors
- Check Network tab for failed requests (red)
- Check backend terminal for error logs
- Verify API endpoint matches exactly: `/api/categories` not `/categories`

---

#### **3.2: Transactions CRUD**

**Test Plan**:

1. Go to: `http://localhost:5173/transactions`
2. Click "New Transaction"
3. Fill form:
   - Type: Income
   - Category: Select one
   - Amount: 3000
   - Currency: AFN
   - Date: Today
   - Name: "Test Student"
   - Description: "Test payment"
4. Submit
5. **Expected**:
   - POST request to `/api/transactions`
   - Transaction appears in list
   - Shows green (income) indicator
   - Amount formatted correctly with currency symbol

**Test Edit**:

1. Click Edit on a transaction
2. Change amount to 5000
3. Submit
4. **Expected**: Transaction updates instantly

**Test Delete**:

1. Click Delete → Confirm
2. **Expected**: Transaction removed from list

---

#### **3.3: Dashboard Data Loading**

**Test Plan**:

1. Go to: `http://localhost:5173/`
2. **Expected**:
   - Loading spinner appears briefly
   - Summary cards show:
     - Total Income (with currency breakdown)
     - Total Expenses
     - Net Profit
   - Monthly chart displays (if you have data)
   - Category breakdown shows

**Debug if empty**:

- Check if you have transactions in database
- Check Network tab for `/api/dashboard/summary` request
- Check response data structure matches what components expect

---

#### **3.4: Recurring Transactions**

**Test Plan**:

1. Go to: `http://localhost:5173/recurring`
2. Create a recurring transaction:
   - Monthly teacher salary
   - Amount: 15000 AFN
   - Frequency: Monthly
3. **Expected**: Shows in recurring list
4. If "due", should have "Execute" button
5. Click Execute
6. **Expected**: Creates actual transaction, updates next due date

---

#### **3.5: Filters & Date Ranges**

**Test Plan**:

1. On Transactions page, test filters:
   - Filter by category
   - Filter by date range
   - Filter by currency
   - Filter by type (income/expense)
2. **Expected**:
   - Query params added to URL: `?categoryId=1&startDate=2026-01-01`
   - Backend receives filters
   - Results update in real-time

---

#### **3.6: Export Functionality**

**Test Plan**:

1. Go to Reports page
2. Click "Export CSV"
3. **Expected**:
   - GET request to `/api/export/csv`
   - File downloads automatically
   - CSV contains all transactions in readable format

**Test Database Backup**:

1. Click "Backup Database"
2. **Expected**: Downloads `hadaf.db` file

---

### **STEP 4: Handle Common Integration Issues**

#### **Issue 1: "Network Error" or "Failed to Fetch"**

**Causes**:

- Backend not running
- Wrong API URL in frontend
- CORS not configured

**Solutions**:

```bash
# Verify backend is running
curl http://localhost:5000/api/categories

# Check frontend .env file
cat frontend/.env

# Restart both servers
cd backend && npm run dev
cd frontend && npm run dev
```

---

#### **Issue 2: "404 Not Found"**

**Causes**:

- API endpoint mismatch
- Route not defined in backend

**Solutions**:

1. Check backend routes match frontend API calls exactly
2. Verify route is registered in `backend/src/app.js`:

```javascript
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/export", exportRoutes);
```

---

#### **Issue 3: Data Not Updating in UI**

**Causes**:

- Frontend not refetching after mutation
- State not updating

**Solutions**:

**In custom hooks** (e.g., `useTransactions.js`):

```javascript
const createTransaction = async (data) => {
  try {
    await transactionsAPI.create(data);
    toast.success("Transaction created");
    fetchTransactions(); // ← ADD THIS to refetch
  } catch (error) {
    toast.error(error.message);
  }
};
```

Do this for ALL create/update/delete functions in all hooks.

---

#### **Issue 4: Numbers Display as Strings**

**Causes**:

- Backend returning strings instead of numbers
- Frontend not parsing

**Solutions**:

**Backend** - ensure amount is stored as REAL/FLOAT:

```javascript
// In model
const amount = parseFloat(data.amount);
```

**Frontend** - parse when receiving:

```javascript
// In formatCurrency
const amount = parseFloat(value);
```

---

#### **Issue 5: Date Format Mismatches**

**Causes**:

- Backend expects YYYY-MM-DD
- Frontend sends different format

**Solutions**:

**Frontend form**:

```javascript
<input
  type="date"
  {...register("date")}
  defaultValue={new Date().toISOString().split("T")[0]}
/>
```

**Backend validation**:

```javascript
// Ensure date is in YYYY-MM-DD format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(date)) {
  throw new Error("Invalid date format");
}
```

---

### **STEP 5: Database Seeding (Optional but Recommended)**

Add sample data for testing and demo purposes.

**File: `backend/src/config/seedData.js`**

```javascript
import db from "./database.js";

export const seedDatabase = () => {
  // Check if already seeded
  const categories = db
    .prepare("SELECT COUNT(*) as count FROM categories")
    .get();
  if (categories.count > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  // Insert categories
  const categoryStmt = db.prepare(
    "INSERT INTO categories (name, type) VALUES (?, ?)",
  );
  const categories = [
    "German Class",
    "Turkish Class",
    "English Class",
    "Marketing/Ads",
    "General Costs",
    "Other Income",
  ];

  const categoryIds = categories.map((name) => {
    const result = categoryStmt.run(name, "default");
    return result.lastInsertRowid;
  });

  // Insert sample transactions
  const transactionStmt = db.prepare(`
    INSERT INTO transactions (category_id, amount, currency, type, date, name, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transactions = [
    [
      categoryIds[0],
      3000,
      "AFN",
      "in",
      "2026-01-15",
      "Ghulaam",
      "German class fee",
    ],
    [
      categoryIds[0],
      1500,
      "AFN",
      "out",
      "2026-01-15",
      "Teacher Payment",
      "Ghulaam teacher cost 50%",
    ],
    [
      categoryIds[1],
      2500,
      "AFN",
      "in",
      "2026-01-20",
      "Aisha",
      "Turkish class fee",
    ],
    [
      categoryIds[1],
      1250,
      "AFN",
      "out",
      "2026-01-20",
      "Teacher Payment",
      "Aisha teacher cost",
    ],
    [
      categoryIds[3],
      500,
      "USD",
      "out",
      "2026-01-10",
      "Facebook Ads",
      "January marketing campaign",
    ],
    [
      categoryIds[4],
      200,
      "USD",
      "out",
      "2026-01-05",
      "Office Rent",
      "Monthly office expense",
    ],
  ];

  transactions.forEach((t) => transactionStmt.run(...t));

  console.log("✅ Database seeded successfully!");
};
```

**File: `backend/src/config/database.js`**

Add at the end:

```javascript
import { seedDatabase } from "./seedData.js";

// After creating tables
initDatabase();
seedDatabase(); // ← Add this
```

**Verify**:

1. Delete `hadaf.db` file
2. Restart backend
3. Frontend should now show sample data

---

### **STEP 6: Production-Ready Checklist**

Before deploying or showing to others:

#### **6.1: Error Handling**

- [ ] All API calls wrapped in try-catch
- [ ] User-friendly error messages (not raw errors)
- [ ] Loading states for all async operations
- [ ] Empty states when no data

#### **6.2: Validation**

- [ ] Frontend form validation (required fields, number min/max)
- [ ] Backend validation (express-validator)
- [ ] Prevent duplicate submissions (disable button while loading)

#### **6.3: User Experience**

- [ ] Success toasts after create/update/delete
- [ ] Confirmation dialogs for delete actions
- [ ] Loading spinners during API calls
- [ ] Responsive design works on mobile

#### **6.4: Performance**

- [ ] Debounce search/filter inputs
- [ ] Lazy load charts (only render when visible)
- [ ] Pagination for large transaction lists (optional)

#### **6.5: Security**

- [ ] Input sanitization (prevent XSS)
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS properly configured
- [ ] No sensitive data in frontend code

---

### **STEP 7: Full Application Test Script**

Run through this complete user journey:

**Journey: "New Student Enrollment"**

1. ✅ Open app → Dashboard shows summary
2. ✅ Go to Categories → "German Class" exists
3. ✅ Go to Transactions → Click "New Transaction"
4. ✅ Fill form:
   - Type: Income
   - Category: German Class
   - Amount: 3000
   - Currency: AFN
   - Date: Today
   - Name: "Ahmed"
   - Description: "Monthly fee - January 2026"
5. ✅ Submit → Success toast appears
6. ✅ Transaction appears in list with green indicator
7. ✅ Create teacher expense:
   - Type: Expense
   - Category: German Class
   - Amount: 1500 (50% of 3000)
   - Name: "Teacher - Ahmed"
8. ✅ Go to Dashboard
9. ✅ Verify:
   - Total Income shows +3000 AFN
   - Total Expenses shows 1500 AFN
   - Net Profit shows 1500 AFN
   - German Class in category breakdown shows correct profit
10. ✅ Go to Recurring → Create monthly teacher salary
11. ✅ Go to Reports → Export CSV → Verify file downloads

**If ALL steps work → Integration is complete! 🎉**

---

### **STEP 8: Running Both Servers Simultaneously**

**Option A: Two Terminal Windows**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: Single Command (Recommended)**

Create a simple runner script.

**File: `package.json` (in root directory)**

```json
{
  "name": "hadaf-fullstack",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install and run:

```bash
npm install
npm run dev
```

Now both servers start with one command!

---

### **STEP 9: Environment Setup Documentation**

Create a setup guide for future reference.

**File: `README.md` (in root directory)**

````markdown
# Hadaf Accounting System

Modern accounting system for tracking income, expenses, and profit margins.

## Tech Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, Vite, Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```
````

3. Start development servers:

```bash
# From root directory
npm run dev
```

4. Access the app:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Features

- ✅ Multi-currency support (AFN, USD, TRY, EUR)
- ✅ Category management
- ✅ Transaction tracking
- ✅ Recurring transactions
- ✅ Dashboard with analytics
- ✅ CSV export
- ✅ Beautiful, modern UI

## Project Structure

```
hadaf/
├── backend/          # Express API
│   ├── src/
│   └── hadaf.db     # SQLite database
├── frontend/         # React app
│   └── src/
└── README.md
```

## API Endpoints

### Categories

- GET /api/categories
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

### Transactions

- GET /api/transactions
- POST /api/transactions
- PUT /api/transactions/:id
- DELETE /api/transactions/:id

### Dashboard

- GET /api/dashboard/summary

### Recurring

- GET /api/recurring
- POST /api/recurring
- POST /api/recurring/:id/execute

### Export

- GET /api/export/csv
- GET /api/export/backup

````

---

### **STEP 10: Final Verification**

**Complete Integration Checklist**:

- [ ] Backend runs without errors
- [ ] Frontend runs without errors
- [ ] CORS configured correctly
- [ ] All API endpoints respond correctly
- [ ] Categories CRUD works end-to-end
- [ ] Transactions CRUD works end-to-end
- [ ] Dashboard shows correct calculations
- [ ] Recurring transactions work
- [ ] Filters work (category, date, currency, type)
- [ ] Export CSV works
- [ ] Database backup works
- [ ] Animations are smooth
- [ ] Mobile responsive
- [ ] Error handling works gracefully
- [ ] Success/error toasts appear
- [ ] Loading states show
- [ ] Empty states show when no data
- [ ] Forms validate correctly
- [ ] Delete confirmations work
- [ ] Multi-currency displays correctly

**When ALL checkboxes are ticked → You have a fully integrated, working full-stack application!**

---

## Common Commands Reference

```bash
# Start everything
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Test backend API
curl http://localhost:5000/api/categories

# Database location
backend/hadaf.db

# View backend logs
# Check terminal running backend

# Clear database (start fresh)
rm backend/hadaf.db
# Then restart backend (will recreate with seed data)
````

---

## Troubleshooting Quick Reference

| Problem             | Solution                                        |
| ------------------- | ----------------------------------------------- |
| CORS errors         | Check backend CORS config includes frontend URL |
| 404 errors          | Verify API routes registered in app.js          |
| Data not updating   | Add refetch calls after mutations               |
| Network error       | Check both servers running, check .env file     |
| Database locked     | Close backend server, restart                   |
| Port already in use | Kill process: `lsof -ti:5000 \| xargs kill -9`  |

---

## Success Criteria

✅ Can create categories from UI
✅ Can create income transactions
✅ Can create expense transactions  
✅ Dashboard shows real-time calculations
✅ Filters change displayed data
✅ Can export data to CSV
✅ App works on mobile screens
✅ App looks professional and modern
✅ No console errors
✅ All CRUD operations work smoothly

**Congratulations! Your Hadaf Accounting System is fully integrated and production-ready! 🚀**
