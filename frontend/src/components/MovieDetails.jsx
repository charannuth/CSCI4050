export default function MovieDetails() {
  // Mock data representing what the database will eventually provide
  const movie = {
    title: "Inception",
    rating: "PG-13",
    genre: "Sci-Fi / Action",
    runtime: "2h 28m",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O. As he navigates multiple layers of dreams, he must confront his own past.",
    posterUrl: "https://via.placeholder.com/400x600?text=Inception",
    // Note: This needs to be the 'embed' version of a YouTube link
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0"
  };

  const showtimes = ["2:00 PM", "5:00 PM", "8:00 PM", "10:30 PM"];

  return (
    <div className="max-w-6xl mx-auto p-8 text-cinema-text">
      
      {/* Top Section: Title & Basic Info */}
      <div className="mb-8 border-b border-gray-700 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-cinema-primary mb-2">
          {movie.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-cinema-muted text-sm md:text-base font-semibold">
          <span className="bg-gray-800 px-3 py-1 rounded text-white">{movie.rating}</span>
          <span className="flex items-center">{movie.genre}</span>
          <span className="flex items-center">{movie.runtime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Poster & Showtimes */}
        <div className="md:col-span-1 space-y-8">
          <img 
            src={movie.posterUrl} 
            alt={`${movie.title} Poster`} 
            className="w-full rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-gray-800"
          />
          
          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Select Showtime</h3>
            <div className="grid grid-cols-2 gap-3">
              {showtimes.map((time, index) => (
                <button 
                  key={index}
                  className="bg-gray-700 hover:bg-cinema-primary text-white py-2 rounded font-semibold transition-colors shadow"
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-cinema-muted mt-4 text-center">
              Clicking a time will take you to checkout.
            </p>
          </div>
        </div>

        {/* Right Column: Synopsis & Trailer */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-cinema-primary">Synopsis</h3>
            <p className="text-lg leading-relaxed text-gray-300">
              {movie.description}
            </p>
          </div>

          <div className="bg-cinema-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-cinema-primary">Trailer</h3>
            {/* 16:9 Aspect Ratio Container for the YouTube Iframe */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-700">
              <iframe 
                src={movie.trailerUrl} 
                title={`${movie.title} Trailer`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}