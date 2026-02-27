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

