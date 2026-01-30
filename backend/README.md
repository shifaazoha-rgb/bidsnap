# BidSnap Backend

Node.js + Express + TypeScript API for BidSnap (quote generation, estimates, proposals).

## Setup

```bash
cd backend
npm install
```

## Environment

Copy `.env.example` to `.env` and set:

- **ANTHROPIC_API_KEY** – Optional. If set, quotes are generated via Claude. If not set, a mock quote is returned.
- **PORT** – Optional. Default: 3001.

## Run

```bash
# Development (with watch)
npm run dev

# Production
npm run build
npm start
```

API base: **http://localhost:3001**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/estimates/generate | Generate new estimate (body: EstimateInput) |
| GET | /api/estimates/:id | Get estimate by id |
| PUT | /api/estimates/:id | Update estimate |
| POST | /api/estimates/:id/duplicate | Clone estimate |
| POST | /api/proposals/generate | Generate PDF (placeholder; body: `{ estimateId }`) |

## Frontend

Set `VITE_API_URL=http://localhost:3001` (or your backend URL) so the frontend calls this API. Default in dev is `http://localhost:3001`.
