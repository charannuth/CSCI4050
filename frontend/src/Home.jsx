import { useEffect, useState } from "react";
import { addFavorite, getMoviesHome, getMovies, getMoviesMeta, removeFavorite } from "./api";
import AIRecommendations from "./components/AIRecommendations";
import { getAuthToken } from "./api";

// 1. ADDED onUpdateFavorites to the props
function MovieCard({ movie, onSelectMovie, onViewTrailer, currentUser, onUpdateFavorites }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // 2. Sync heart from server when user or movie changes
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (currentUser && currentUser.favoriteMovies) {
        const alreadySaved = currentUser.favoriteMovies.some((favMovie) => favMovie.id === movie.id);
        setIsFavorite(alreadySaved);
      } else {
        setIsFavorite(false);
      }
    });
    return () => window.cancelAnimationFrame(id);
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
      const data = currentFavStatus ? await removeFavorite(movie.id) : await addFavorite(movie.id);
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
    <div className="movie-card transition-all duration-300 hover:bg-gray-900 rounded-xl pb-4">
      
      {/* --- THE FUTURISTIC FLOATING POSTER WRAPPER --- */}
      <div
        className="movie-poster-wrapper relative cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)] hover:shadow-cyan-500/30 rounded-xl"
        onClick={() => onViewTrailer?.(movie)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onViewTrailer?.(movie)}
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
            transition: "transform 0.2s ease-in-out",
          }}
          className="hover:scale-110"
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

        {/* Added rounded corners to the image so it fits the new wrapper */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster rounded-xl w-full object-cover"
        />
      </div>

      <div className="movie-info px-2">
        <h3 className="mt-4">{movie.title}</h3>
        <p className="movie-meta text-gray-400">
          {movie.rating} | {movie.genre}
        </p>
        <p className="movie-description text-sm mt-2">{movie.description}</p>

        {/* --- THE NEON GLOWING BUTTON --- */}
        <button
          className="movie-button w-full mt-4 bg-cinema-primary text-white font-semibold py-2 rounded transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
          onClick={() => onViewTrailer(movie)}
        >
          Book Tickets
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
      } catch {
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
    } catch {
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

          <button onClick={handleSearch} className="transition-all duration-300 hover:scale-105 hover:bg-blue-600">
            Search
          </button>
        </div>
      </header>

      <main>
        {/* --- NEW: AI Recommendations ONLY show if logged in --- */}
        {getAuthToken() && !isFiltering && (
          <AIRecommendations />
        )}

        {isFiltering ? (
          filteredMovies.length > 0 ? (
            <MovieSection
              title="Search Results"
              movies={filteredMovies}
              onSelectMovie={onSelectMovie}
              onViewTrailer={onViewTrailer}
              currentUser={currentUser} 
              onUpdateFavorites={onUpdateFavorites} 
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
            onUpdateFavorites={onUpdateFavorites} 
          />
          <MovieSection
            title="Coming Soon"
            movies={comingSoon}
            onSelectMovie={onSelectMovie}
            onViewTrailer={onViewTrailer}
            currentUser={currentUser} 
            onUpdateFavorites={onUpdateFavorites} 
          />
        </>
      )}
    </main>
    </div>
  );
}