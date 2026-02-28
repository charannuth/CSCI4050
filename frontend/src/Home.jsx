import { useEffect, useState } from "react";
import { getMoviesHome } from "./api";

function MovieCard({ movie, onSelectMovie }) {
  return (
    <div className="movie-card">
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="movie-poster"
      />

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="movie-meta">
          {movie.rating} | {movie.genre}
        </p>
        <p className="movie-description">{movie.description}</p>

        <button
          className="movie-button"
          onClick={() => onSelectMovie(movie)}
        >
          Go to Checkout
        </button>
      </div>
    </div>
  );
}

function MovieSection({ title, movies, onSelectMovie }) {
  return (
    <section className="movie-section">
      <h2>{title}</h2>
      <div className="movie-row">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelectMovie={onSelectMovie}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home({ onSelectMovie }) {
  const [currentlyRunning, setCurrentlyRunning] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await getMoviesHome();
        setCurrentlyRunning(data.currentlyRunning || []);
        setComingSoon(data.comingSoon || []);
      } catch (err) {
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  if (loading) {
    return <div className="page-message">Loading movies...</div>;
  }

  if (error) {
    return <div className="page-message error">{error}</div>;
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Cinema E-Booking System</h1>
        <p>Select a movie to start booking.</p>

        <div className="filters-placeholder">
          <div className="placeholder-box">Search bar goes here later</div>
          <div className="placeholder-box">Genre filter goes here later</div>
        </div>
      </header>

      <main>
        <MovieSection
          title="Currently Running"
          movies={currentlyRunning}
          onSelectMovie={onSelectMovie}
        />
        <MovieSection
          title="Coming Soon"
          movies={comingSoon}
          onSelectMovie={onSelectMovie}
        />
      </main>
    </div>
  );
}