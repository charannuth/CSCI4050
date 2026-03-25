import { useEffect, useState } from "react";
import { getMoviesHome, getMovies, getMoviesMeta } from "./api";

function MovieCard({ movie, onSelectMovie, onViewTrailer }) {
  // NOTE: If your backend eventually sends down whether a movie is already a favorite, 
  // you can change this to: useState(movie.isFavorite || false)
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Stops the card from being clicked when they hit the heart

    const currentFavStatus = isFavorite;

    // 1. Optimistic UI Update: Instantly change the heart color for the user
    setIsFavorite(!currentFavStatus);

    // 2. The API Call to your Backend
    try {
      // TODO: Update this URL to match your team's actual backend route!
      const response = await fetch("http://localhost:8080/api/users/favorites", {
        method: currentFavStatus ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          // Uncomment the line below if your team is using authentication tokens!
          // "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ movieId: movie.id })
      });

      if (!response.ok) {
        throw new Error("Server failed to save favorite");
      }
      
    } catch (error) {
      console.error("Error updating favorites:", error);
      
      // 3. Error Handling: Revert the heart back to its original state if the server fails
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
        style={{ position: "relative" }} // Guarantees the absolute heart stays inside the poster
      >
        
        {/* --- ADDED: Favorites Heart Icon & API Logic (Requirement 4) --- */}
        <button
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"} // Required tooltip
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
            fill={isFavorite ? "#ef4444" : "none"} // Fills red if clicked
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
        {/* --------------------------------------------------- */}

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

function MovieSection({ title, movies, onSelectMovie, onViewTrailer }) {
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
          />
        ))}
      </div>
    </section>
  );
}

export default function Home({ onSelectMovie, onViewTrailer }) {
  const [currentlyRunning, setCurrentlyRunning] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // search filter consts
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
          />
          <MovieSection
            title="Coming Soon"
            movies={comingSoon}
            onSelectMovie={onSelectMovie}
            onViewTrailer={onViewTrailer}
          />
        </>
      )}
    </main>
    </div>
  );
}