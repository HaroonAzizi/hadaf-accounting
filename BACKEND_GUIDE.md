# Backend Development Prompt: Hadaf Accounting System

## Project Overview

Build a Node.js + Express + SQLite backend API for an accounting system that tracks income, expenses, and profit margins across multiple categories with multi-currency support.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite3
- **ORM/Query Builder**: better-sqlite3 (synchronous, faster)
- **Validation**: express-validator
- **Additional**: cors, dotenv, morgan (logging)

---

## Step-by-Step Implementation Plan

### **STEP 1: Project Setup & Dependencies**

1. Initialize the project:

```bash
npm init -y
```

2. Install dependencies:

```bash
npm install express sqlite3 better-sqlite3 express-validator cors dotenv morgan
npm install --save-dev nodemon
```

3. Create project structure:

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── transactionController.js
│   │   ├── dashboardController.js
│   │   ├── recurringController.js
│   │   └── exportController.js
│   ├── models/
│   │   ├── categoryModel.js
│   │   ├── transactionModel.js
│   │   └── recurringModel.js
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── recurringRoutes.js
│   │   └── exportRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── utils/
│   │   ├── csvExporter.js
│   │   └── calculations.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

4. Update `package.json` scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

5. Create `.env` file:

```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./hadaf.db
```

---

### **STEP 2: Database Setup & Schema**

**File: `src/config/database.js`**

1. Initialize SQLite connection using better-sqlite3
2. Create database initialization function
3. Define schema with these tables:

**Table: `categories`**

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  type TEXT DEFAULT 'custom',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**Table: `transactions`**

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AFN',
  type TEXT NOT NULL CHECK(type IN ('in', 'out')),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**Table: `recurring_transactions`**

```sql
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AFN',
  type TEXT NOT NULL CHECK(type IN ('in', 'out')),
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date DATE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

4. Create function to seed default categories:

```javascript
const defaultCategories = [
  "Turkish Class",
  "German Class",
  "English Class",
  "Marketing/Ads",
  "General Costs",
  "Other Income",
];
```

5. Export database connection and initialization function

---

### **STEP 3: Models Layer**

**File: `src/models/categoryModel.js`**

Create functions:

- `getAllCategories()` - Get all categories with parent-child relationships
- `getCategoryById(id)` - Get single category
- `createCategory(name, parentId, type)` - Create new category
- `updateCategory(id, name, parentId)` - Update category
- `deleteCategory(id)` - Delete category (cascade transactions)
- `getCategoryWithStats(id)` - Get category with total income/expense

**File: `src/models/transactionModel.js`**

Create functions:

- `getAllTransactions(filters)` - Get all with filters (categoryId, type, dateRange, currency)
- `getTransactionById(id)` - Get single transaction
- `createTransaction(data)` - Create new transaction
  - data: { category_id, amount, currency, type, date, name, description }
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction
- `getTransactionsByCategory(categoryId)` - Get all transactions for a category
- `getTransactionsByDateRange(startDate, endDate)` - Date-filtered transactions

**File: `src/models/recurringModel.js`**

Create functions:

- `getAllRecurring()` - Get all recurring transactions
- `getRecurringById(id)` - Get single recurring
- `createRecurring(data)` - Create recurring transaction
- `updateRecurring(id, data)` - Update recurring
- `deleteRecurring(id)` - Delete recurring
- `getDueRecurring()` - Get all due recurring transactions (next_due_date <= today)
- `updateNextDueDate(id, nextDate)` - Update next due date after execution

---

### **STEP 4: Controllers Layer**

**File: `src/controllers/categoryController.js`**

Implement handlers:

- `getCategories(req, res)` - GET all categories
- `getCategoryById(req, res)` - GET category by ID
- `createCategory(req, res)` - POST create category
  - Validate: name required, parentId optional
- `updateCategory(req, res)` - PUT update category
- `deleteCategory(req, res)` - DELETE category

**File: `src/controllers/transactionController.js`**

Implement handlers:

- `getTransactions(req, res)` - GET all with query filters
  - Query params: categoryId, type, startDate, endDate, currency
- `getTransactionById(req, res)` - GET transaction by ID
- `createTransaction(req, res)` - POST create transaction
  - Validate: all required fields
- `updateTransaction(req, res)` - PUT update transaction
- `deleteTransaction(req, res)` - DELETE transaction

**File: `src/controllers/recurringController.js`**

Implement handlers:

- `getRecurring(req, res)` - GET all recurring
- `createRecurring(req, res)` - POST create recurring
- `updateRecurring(req, res)` - PUT update recurring
- `deleteRecurring(req, res)` - DELETE recurring
- `getDueRecurring(req, res)` - GET due recurring transactions
- `executeRecurring(req, res)` - POST execute a recurring transaction
  - Creates actual transaction
  - Updates next_due_date based on frequency

**File: `src/controllers/dashboardController.js`**

Implement handlers:

- `getSummary(req, res)` - GET dashboard summary
  - Query params: startDate, endDate (optional)
  - Returns:
    ```json
    {
      "totalIncome": { "AFN": 150000, "USD": 500, "TRY": 2000 },
      "totalExpenses": { "AFN": 80000, "USD": 200, "TRY": 1000 },
      "netProfit": { "AFN": 70000, "USD": 300, "TRY": 1000 },
      "profitByCategory": [
        { "categoryId": 1, "categoryName": "German Class", "income": {...}, "expenses": {...}, "profit": {...} }
      ],
      "monthlyBreakdown": [
        { "month": "2026-01", "income": {...}, "expenses": {...}, "profit": {...} }
      ]
    }
    ```

**File: `src/controllers/exportController.js`**

Implement handlers:

- `exportCSV(req, res)` - GET export to CSV
  - Query params: same as getTransactions filters
  - Returns CSV file download
- `exportExcel(req, res)` - GET export to Excel (optional, can use CSV for now)
- `backupDatabase(req, res)` - GET download SQLite database file

---

### **STEP 5: Routes Layer**

**File: `src/routes/categoryRoutes.js`**

```javascript
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

**File: `src/routes/transactionRoutes.js`**

```javascript
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

**File: `src/routes/recurringRoutes.js`**

```javascript
GET    /api/recurring
GET    /api/recurring/due
POST   /api/recurring
PUT    /api/recurring/:id
DELETE /api/recurring/:id
POST   /api/recurring/:id/execute
```

**File: `src/routes/dashboardRoutes.js`**

```javascript
GET / api / dashboard / summary;
```

**File: `src/routes/exportRoutes.js`**

```javascript
GET    /api/export/csv
GET    /api/export/backup
```

---

### **STEP 6: Middleware**

**File: `src/middleware/errorHandler.js`**

Create global error handler:

- Catch all errors
- Format error response
- Log errors
- Return appropriate status codes

**File: `src/middleware/validateRequest.js`**

Create validation middleware using express-validator:

- Validate transaction creation
- Validate category creation
- Validate date formats
- Validate currency codes (AFN, USD, TRY, EUR)

---

### **STEP 7: Utility Functions**

**File: `src/utils/csvExporter.js`**

Create CSV export utility:

- Convert transaction array to CSV format
- Include headers
- Handle multi-currency display

**File: `src/utils/calculations.js`**

Create calculation helpers:

- `calculateTotalByCurrency(transactions)` - Sum by currency
- `calculateProfitByCategory(transactions)` - Group and calculate
- `calculateMonthlyBreakdown(transactions)` - Group by month
- `groupByCurrency(amounts)` - Helper for multi-currency aggregation

---

### **STEP 8: Main Application Setup**

**File: `src/app.js`**

1. Import dependencies (express, cors, morgan)
2. Initialize express app
3. Apply middleware:
   - `cors()`
   - `express.json()`
   - `express.urlencoded()`
   - `morgan('dev')`
4. Mount routes:
   - `/api/categories` → categoryRoutes
   - `/api/transactions` → transactionRoutes
   - `/api/recurring` → recurringRoutes
   - `/api/dashboard` → dashboardRoutes
   - `/api/export` → exportRoutes
5. Apply error handler middleware
6. Export app

**File: `server.js`**

1. Import app and database
2. Initialize database
3. Start server on PORT from .env
4. Log server startup message

---

### **STEP 9: Testing & Validation**

Create a `test.rest` or `test.http` file with sample requests:

```http
### Create Category
POST http://localhost:5000/api/categories
Content-Type: application/json

{
  "name": "German Class",
  "type": "default"
}

### Create Transaction
POST http://localhost:5000/api/transactions
Content-Type: application/json

{
  "category_id": 1,
  "amount": 3000,
  "currency": "AFN",
  "type": "in",
  "date": "2026-01-28",
  "name": "Ghulaam",
  "description": "German class fee"
}

### Get Dashboard Summary
GET http://localhost:5000/api/dashboard/summary?startDate=2026-01-01&endDate=2026-01-31

### Export CSV
GET http://localhost:5000/api/export/csv?categoryId=1
```

---

### **STEP 10: Final Touches**

1. Add `.gitignore`:

```
node_modules/
.env
*.db
*.log
```

2. Add error handling for:
   - Database connection failures
   - Invalid foreign keys
   - Duplicate category names
   - Invalid date formats
   - Invalid currency codes

3. Add input sanitization to prevent SQL injection (using parameterized queries)

4. Add response formatting consistency:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

5. Add logging for important operations (create, update, delete)

---

## API Response Standards

### Success Response:

```json
{
  "success": true,
  "data": {...},
  "message": "Resource created successfully"
}
```

### Error Response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be a positive number",
    "details": {...}
  }
}
```

---

## Development Order (Priority)

1. ✅ Setup project structure & dependencies
2. ✅ Database configuration & schema
3. ✅ Category model & routes (simplest CRUD)
4. ✅ Transaction model & routes (core feature)
5. ✅ Dashboard controller (calculations)
6. ✅ Recurring transactions
7. ✅ Export functionality
8. ✅ Error handling & validation
9. ✅ Testing all endpoints
10. ✅ Documentation & cleanup

---

## Key Implementation Notes

- Use **better-sqlite3** for synchronous queries (simpler code, faster)
- Use **prepared statements** for all queries (security)
- Store dates in **ISO format** (YYYY-MM-DD)
- Validate **currency codes** against allowed list
- Use **transactions** for operations that modify multiple tables
- Add **indexes** on frequently queried columns (category_id, date, type)
- Return **meaningful error messages** for validation failures
- Use **CASCADE DELETE** for foreign keys to maintain data integrity

---

## Expected Completion Time

- Steps 1-3: ~1 hour
- Steps 4-5: ~2 hours
- Steps 6-7: ~30 minutes
- Steps 8-10: ~30 minutes
- **Total: ~4 hours** for complete backend

---

## Success Criteria

✅ All CRUD operations work for categories and transactions
✅ Dashboard returns accurate calculations by currency
✅ Filters work correctly (date range, category, currency)
✅ CSV export generates valid file
✅ Recurring transactions can be created and executed
✅ Error handling provides clear feedback
✅ Database relationships maintain integrity
✅ API responses are consistent and well-formatted

---

## Next Steps After Backend Completion

1. Test all endpoints with Postman/REST client
2. Document API in README.md
3. Prepare for frontend integration
4. Consider adding API versioning (/api/v1/...)
5. Plan authentication layer for Phase 2

---

**Start with STEP 1 and proceed sequentially. Each step builds on the previous one.**
