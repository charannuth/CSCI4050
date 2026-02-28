import { useEffect, useState } from "react";
import { getMoviesHome, getMovies, getMoviesMeta } from "./api";

function MovieCard({ movie, onSelectMovie, onViewTrailer }) {
  return (
    <div className="movie-card">
      <div
        className="movie-poster-wrapper"
        onClick={() => onViewTrailer?.(movie)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onViewTrailer?.(movie)}
      >
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