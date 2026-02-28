# CES Frontend

React + Vite frontend for the Cinema E-Booking System.

## Connecting to the Backend

1. Start the backend first: `cd ../backend && npm run dev` (runs on port 3002)
2. Start the frontend: `npm run dev` (runs on port 5173)
3. Vite proxies `/api` to the backend, so use the API client in `src/api.js`:

```js
import { getMoviesHome, getMovie, getMovies, getMoviesMeta } from './api'

// Home page (currently running + coming soon)
const { currentlyRunning, comingSoon } = await getMoviesHome()

// Movie details
const { movie } = await getMovie(movieId)

// Search / filter
const { movies } = await getMovies({ q: 'Dune', genre: 'Sci-Fi', date: '2026-02-27' })

// Filter options (genres, show dates)
const { genres, showDates } = await getMoviesMeta()
```

For production, set `VITE_API_BASE` in `.env` to your backend URL.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
