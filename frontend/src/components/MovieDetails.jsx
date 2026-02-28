import TrailerEmbed from './TrailerEmbed';

export default function MovieDetails({ movie, onBack, onBookShowtime }) {
  if (!movie) return <div className="text-white p-8">Loading...</div>;

  const posterLink = movie.posterUrl || movie.poster_url || "https://via.placeholder.com/400x600?text=No+Poster";
  // We check a few common names Charan might have used in the database
  const trailerLink = movie.trailerUrl || movie.trailer_url || movie.trailer || movie.trailerLink || "";
  const showtimes = ["2:00 PM", "5:00 PM", "8:00 PM", "10:30 PM"];

  return (
    <div className="max-w-6xl mx-auto p-8 text-cinema-text">
      
      {/* Top Section */}
      <div className="mb-8 border-b border-gray-700 pb-6">
        <button onClick={onBack} className="text-cinema-muted hover:text-white mb-4 flex items-center gap-2">
          ← Back to Movies
        </button>
        <h1 className="text-4xl md:text-5xl font-bold text-cinema-primary mb-2">
          {movie.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-cinema-muted text-sm md:text-base font-semibold">
          <span className="bg-gray-800 px-3 py-1 rounded text-white">{movie.rating || "PG-13"}</span>
          <span className="flex items-center">{movie.genre || movie.category || "Action"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Poster & Showtimes */}
        <div className="md:col-span-1 space-y-8">
          <img src={posterLink} alt={`${movie.title} Poster`} className="w-full rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-gray-800" />
          
          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Select Showtime</h3>
            <div className="grid grid-cols-2 gap-3">
              {showtimes.map((time, index) => (
                <button key={index} onClick={onBookShowtime} className="bg-gray-700 hover:bg-cinema-primary text-white py-2 rounded font-semibold transition-colors shadow">
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Synopsis & Trailer */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-cinema-primary">Synopsis</h3>
            <p className="text-lg leading-relaxed text-gray-300">
              {movie.description || "No description available for this movie."}
            </p>
          </div>

          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-cinema-primary">Trailer</h3>
            {/* RENDERING YOUR NEW COMPONENT HERE */}
            <TrailerEmbed url={trailerLink} title={movie.title} />
          </div>
        </div>

      </div>
    </div>
  );
}