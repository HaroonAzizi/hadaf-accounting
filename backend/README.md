# Hadaf Accounting Backend

Node.js + Express + SQLite (better-sqlite3) backend API.

## Setup

```bash
npm --prefix backend install
```

## Run

Dev (ts-node + nodemon):

```bash
npm --prefix backend run dev
```

Build + start:

```bash
npm --prefix backend run build
npm --prefix backend run start
```

Environment:

- Copy `backend/.env.example` to `backend/.env`
- `DATABASE_PATH=./hadaf.db` creates `backend/hadaf.db`
- `SEED_SAMPLE_DATA=true` seeds sample transactions when the DB has none

From the repo root you can start both servers with:

```bash
npm run dev
```

## Useful endpoints

- `GET /api/health`
- `GET /api/categories`
- `POST /api/transactions`
- `GET /api/dashboard/summary`
- `GET /api/export/csv`
- `GET /api/export/backup`

Try requests in `backend/test.http`.
