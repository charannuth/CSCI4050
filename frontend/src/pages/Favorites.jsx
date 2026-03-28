import { useEffect, useState } from "react";

import { addFavorite, removeFavorite } from "../api";

function FavoriteMovieCard({ movie, currentUser, onSelectMovie, onViewTrailer, onUpdateFavorites }) {
  const [isFavorite, setIsFavorite] = useState(true);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (currentUser?.favoriteMovies) {
        setIsFavorite(currentUser.favoriteMovies.some((favMovie) => favMovie.id === movie.id));
      } else {
        setIsFavorite(false);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [currentUser, movie.id]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      return;
    }
    const previous = isFavorite;
    setIsFavorite(!previous);
    try {
      const data = previous ? await removeFavorite(movie.id) : await addFavorite(movie.id);
      if (onUpdateFavorites && data?.favorites) {
        onUpdateFavorites(data.favorites);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update favorites:", error);
      setIsFavorite(previous);
      alert("Unable to update favorites right now.");
    }
  };

  return (
    <div className="movie-card">
      <div
        className="movie-poster-wrapper"
        onClick={() => onViewTrailer?.(movie)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onViewTrailer?.(movie)}
        style={{ position: "relative" }}
      >
        <button
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.6)",
            border: "none",
            borderRadius: "50%",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? "#ef4444" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke={isFavorite ? "#ef4444" : "white"}
            style={{ width: "24px", height: "24px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
        />
      </div>

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

export default function Favorites({ currentUser, onBack, onSelectMovie, onViewTrailer, onUpdateFavorites }) {
  const favorites = currentUser?.favoriteMovies ?? [];

  return (
    <div className="home-page">
      <header className="home-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>My Favorites</h1>
          <p>Movies you saved with the heart icon.</p>
        </div>
        <button className="movie-button" onClick={onBack}>
          Back to Home
        </button>
      </header>

      <main>
        {favorites.length === 0 ? (
          <div className="page-message">No favorites yet. Tap a heart on any movie to save it.</div>
        ) : (
          <section className="movie-section">
            <h2>Favorite Movies</h2>
            <div className="movie-row">
              {favorites.map((movie) => (
                <FavoriteMovieCard
                  key={movie.id}
                  movie={movie}
                  currentUser={currentUser}
                  onSelectMovie={onSelectMovie}
                  onViewTrailer={onViewTrailer}
                  onUpdateFavorites={onUpdateFavorites}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
