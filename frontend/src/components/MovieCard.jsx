export default function MovieCard({ title, category, posterUrl, rating }) {
  return (
    <div className="bg-cinema-card rounded-xl overflow-hidden shadow-lg border border-gray-800 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-cinema-primary cursor-pointer flex flex-col h-full">
      
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800">
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