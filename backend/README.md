# CES Backend

Backend API for the Cinema E-Booking System (CES).

## Requirements (local)

- Node.js (LTS recommended)

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

API will be available on `http://localhost:3002` by default.

## Frontend integration

The frontend Vite dev server proxies `/api` to this backend. Start both servers:

1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend && npm run dev`

The frontend uses `src/api.js` to call these endpoints. CORS is configured for `http://localhost:5173`.

## Endpoints

- `GET /api/health`
- `GET /api/movies`
  - Optional query params:
    - `q`: search by title (case-insensitive, substring)
    - `genre`: filter by genre
    - `status`: `CURRENTLY_RUNNING` or `COMING_SOON`
    - `date`: filter by show date (YYYY-MM-DD, UTC)
- `GET /api/movies/:id`
- `GET /api/movies/meta`
- `GET /api/movies/home`
- `POST /api/movies`
- `DELETE /api/movies/:id`

