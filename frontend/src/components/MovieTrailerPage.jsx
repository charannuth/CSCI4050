import { useState, useEffect } from 'react';

export default function MovieTrailerPage({ movie, goBack, onStartBooking }) {
  // Group showtimes by date for a cleaner display
  const [groupedShowtimes, setGroupedShowtimes] = useState({});

  useEffect(() => {
    if (movie?.showtimes) {
      const grouped = movie.showtimes.reduce((acc, st) => {
        const dateObj = new Date(st.startsAt);
        // Format date as "Mon, Apr 12"
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        // Format time as "7:00 PM"
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push({ id: st.id, time: timeStr });
        return acc;
      }, {});
      setGroupedShowtimes(grouped);
    }
  }, [movie]);

  return (
    <div className="trailer-page p-8 max-w-7xl mx-auto text-white animate-fade-in">
      <div className="trailer-header mb-6">
        
        <button 
          className="bg-red-800 text-white font-bold py-2 px-6 rounded-md inline-flex items-center transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
          onClick={goBack}
        >
          &larr; <span className="ml-2">Back</span>
        </button>

      </div>

      <div className="trailer-layout grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left column: Info & Showtimes */}
        <div className="trailer-left space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-cinema-primary mb-2">{movie.title}</h1>
            <div className="trailer-meta flex space-x-4 text-sm text-gray-400 font-bold mb-6">
              <span className="bg-gray-800 px-2 py-1 rounded">{movie.rating}</span>
              <span className="flex items-center">{movie.genre}</span>
            </div>
          </div>

          <div className="trailer-synopsis bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold text-cinema-primary mb-3">Synopsis</h3>
            <p className="text-gray-300 leading-relaxed mb-6">{movie.description}</p>
            
            <h3 className="text-xl font-bold text-cinema-primary mb-3">Cast & Crew</h3>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Director:</strong> {movie.director || 'N/A'}</li>
              <li><strong className="text-white">Producer:</strong> {movie.producer || 'N/A'}</li>
              <li><strong className="text-white">Cast:</strong> {movie.cast || 'N/A'}</li>
            </ul>
          </div>

          {/* Showtimes & Booking Section */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
             <h3 className="text-2xl font-bold text-white mb-4">Select a Showtime</h3>
             
             {Object.keys(groupedShowtimes).length === 0 ? (
               <p className="text-gray-400 italic">No upcoming showtimes scheduled.</p>
             ) : (
               <div className="space-y-6">
                 {Object.entries(groupedShowtimes).map(([date, times]) => (
                   <div key={date}>
                     <h4 className="font-bold text-gray-400 mb-2 border-b border-gray-700 pb-1">{date}</h4>
                     <div className="flex flex-wrap gap-3">
                       {times.map((st) => (
                         <button 
                           key={st.id}
                           onClick={() => onStartBooking(st.id)}
                           className="bg-cinema-primary text-white font-bold py-2 px-6 rounded-md transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                         >
                           {st.time}
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Right half: Embedded trailer & Poster */}
        <div className="trailer-right space-y-6">
          <div className="trailer-embed-wrapper rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-black aspect-video relative transition-all duration-500 hover:shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:-translate-y-2">
            {movie.trailerUrl ? (
              <iframe
                src={movie.trailerUrl}
                title={`${movie.title} Trailer`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                <p>No trailer available.</p>
              </div>
            )}
          </div>
          
          <img 
             src={movie.posterUrl} 
             alt={`${movie.title} Poster`} 
             className="w-48 mx-auto rounded-lg shadow-2xl border border-gray-800 hidden lg:block transition-all duration-500 hover:scale-105 hover:-translate-y-2"
          />
        </div>
      </div>
    </div>
  );
}