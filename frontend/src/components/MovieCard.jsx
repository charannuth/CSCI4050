import { useState } from "react";

export default function MovieCard({ title, category, posterUrl, rating }) {
  // Temporary state to handle the UI toggle for the demo
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Stops the card from being clicked when they hit the heart
    setIsFavorite(!isFavorite);
    // TODO: Connect to backend API to update CustomerProfile in Deliverable 5
  };

  return (
    <div className="bg-cinema-card rounded-xl overflow-hidden shadow-lg border border-gray-800 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-cinema-primary cursor-pointer flex flex-col h-full">
      
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800">
        
        {/* --- ADDED: Favorites Heart Icon (Requirement 4) --- */}
        <button
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"} // The required tooltip
          className="absolute top-3 left-3 z-10 bg-black/60 p-2 rounded-full hover:bg-black/90 transition-all shadow-md group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? "#ef4444" : "none"} // Fills with red-500 if clicked
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke={isFavorite ? "#ef4444" : "white"}
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
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
          src={posterUrl} 
          alt={`${title} Poster`} 
          className="w-full h-full object-cover"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
          {rating}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-cinema-text mb-1 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-cinema-muted mb-4">{category}</p>
        
        {/* Push button to the bottom if title wraps */}
        <div className="mt-auto">
          <button className="w-full bg-cinema-primary hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors shadow">
            Book Ticket
          </button>
        </div>
      </div>

    </div>
  );
}