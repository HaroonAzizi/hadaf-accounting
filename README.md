# Hadaf Accounting System

Modern accounting system for tracking income, expenses, profit margins, and recurring transactions.

## Tech Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + SQLite (better-sqlite3)

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install

````bash
# root deps (frontend + tooling)
npm install

# backend deps
npm --prefix backend install


Backend env:

- Copy [backend/.env.example](backend/.env.example) to [backend/.env](backend/.env)
- If port 5000 is in use on your machine, change `PORT` (macOS may already occupy 5000)

Frontend env:

- [./.env](.env) sets `VITE_API_URL` (defaults to `http://localhost:5001/api` in this repo)

### Run (recommended)

Starts both servers in one command:

```bash
npm run dev
````

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api` (or whatever `PORT` you set)

### Run separately

```bash
# frontend only
npm run dev:frontend

# backend only
npm run dev:backend
```

## Build + Start (Production-like)

```bash
npm run build:all
npm run start
```

## Sample Data (Step 5)

The backend can seed sample transactions when the database has zero transactions:

- Set `SEED_SAMPLE_DATA=true` in [backend/.env](backend/.env)
- To re-seed from scratch: delete `backend/hadaf.db` and restart the backend

## API Endpoints

- Health: `GET /api/health`
- Categories: `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`
- Transactions: `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/:id`
- Dashboard: `GET /api/dashboard/summary`
- Recurring: `GET/POST /api/recurring`, `PUT/DELETE /api/recurring/:id`, `POST /api/recurring/:id/execute`, `GET /api/recurring/due`
- Export: `GET /api/export/csv`, `GET /api/export/backup`

## Full Application Test Script (Step 7)

Journey: “New Student Enrollment”

1. Open dashboard → summary loads
2. Create or verify a category (e.g. “German Class”)
3. Create an income transaction (e.g. 3000 AFN)
4. Create an expense transaction (e.g. 1500 AFN teacher payment)
5. Return to dashboard → totals and category breakdown reflect the changes
6. Create a recurring transaction → execute if due
7. Export CSV from Reports

## Verification Checklist (Step 10)

- No CORS errors in browser console
- CRUD works: Categories / Transactions / Recurring
- Dashboard loads and updates after changes
- Filters affect transactions listing
- Export CSV downloads successfully
