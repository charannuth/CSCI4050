import { useEffect, useState } from "react";
import { getMoviesHome, getMovies, getMoviesMeta } from "./api";

// 1. ADDED onUpdateFavorites to the props
function MovieCard({ movie, onSelectMovie, onViewTrailer, currentUser, onUpdateFavorites }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // 2. THE MEMORY CURE: Check the database on load to see if it should be red
  useEffect(() => {
    if (currentUser && currentUser.favoriteMovies) {
      const alreadySaved = currentUser.favoriteMovies.some((favMovie) => favMovie.id === movie.id);
      setIsFavorite(alreadySaved);
    } else {
      setIsFavorite(false);
    }
  }, [currentUser, movie.id]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); 

    if (!currentUser) {
      alert("Please log in to save movies to your favorites!");
      return;
    }

    const currentFavStatus = isFavorite;

    // Optimistic UI Update
    setIsFavorite(!currentFavStatus);

    try {
      const response = await fetch("http://localhost:3002/api/users/favorites", {
        method: currentFavStatus ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          movieId: movie.id,
          userId: currentUser.id 
        })
      });

      if (!response.ok) {
        throw new Error("Server failed to save favorite");
      }

      // 3. THE SYNC CURE: Get the updated list from the backend and send it to App.tsx
      const data = await response.json();
      if (onUpdateFavorites && data.favorites) {
        onUpdateFavorites(data.favorites);
      }
      
    } catch (error) {
      console.error("Error updating favorites:", error);
      setIsFavorite(currentFavStatus);
      alert("Uh oh! We couldn't save that to your favorites. Please check your connection.");
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
        
        {/* Favorites Heart Icon */}
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

// 4. Pass the new prop down the chain
function MovieSection({ title, movies, onSelectMovie, onViewTrailer, currentUser, onUpdateFavorites }) {
  return (
    <section className="movie-section">
      <h2>{title}</h2>
      <div className="movie-row">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelectMovie={onSelectMovie}
            onViewTrailer={onViewTrailer}
            currentUser={currentUser} 
            onUpdateFavorites={onUpdateFavorites} // <-- Passed to Card
          />
        ))}
      </div>
    </section>
  );
}

// 5. Accept the new prop from App.tsx
export default function Home({ onSelectMovie, onViewTrailer, currentUser, onUpdateFavorites }) {
  const [currentlyRunning, setCurrentlyRunning] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await getMoviesHome();
        setCurrentlyRunning(data.currentlyRunning || []);
        setComingSoon(data.comingSoon || []);

        const meta = await getMoviesMeta();
        setGenres(meta.genres || []);
      } catch (err) {
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  async function handleSearch() {
    if (!searchText && !selectedGenre) {
      setIsFiltering(false);
      return;
    }
    try {
      const data = await getMovies({
        q: searchText,
        genre: selectedGenre
      });

      setFilteredMovies(data.movies || []);
      setIsFiltering(true);
    } catch (err) {
      setError("Search failed.");
    }
  }

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

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          ></input>

          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre, index) => (
              <option key={index} value={genre}>
                {genre}
                </option>
            ))}
          </select>

          <button onClick={handleSearch}>
            Search
          </button>
        </div>
      </header>

      <main>
        {isFiltering ? (
          filteredMovies.length > 0 ? (
            <MovieSection
              title="Search Results"
              movies={filteredMovies}
              onSelectMovie={onSelectMovie}
              onViewTrailer={onViewTrailer}
              currentUser={currentUser} 
              onUpdateFavorites={onUpdateFavorites} // <-- Passed to Section
            />
          ) : (
            <div className="page-message">No movies found.</div>
          )
        ) : (
        <>
          <MovieSection
            title="Currently Running"
            movies={currentlyRunning}
            onSelectMovie={onSelectMovie}
            onViewTrailer={onViewTrailer}
            currentUser={currentUser} 
            onUpdateFavorites={onUpdateFavorites} // <-- Passed to Section
          />
          <MovieSection
            title="Coming Soon"
            movies={comingSoon}
            onSelectMovie={onSelectMovie}
            onViewTrailer={onViewTrailer}
            currentUser={currentUser} 
            onUpdateFavorites={onUpdateFavorites} // <-- Passed to Section
          />
        </>
      )}
    </main>
    </div>
  );
}