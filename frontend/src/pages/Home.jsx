import MovieCard from '../components/MovieCard';

export default function Home() {
  // Mock data for Gabriel to replace later
  const currentlyRunning = [
    { id: 1, title: "Inception", category: "Sci-Fi", rating: "PG-13", posterUrl: "https://via.placeholder.com/300x450?text=Inception" },
    { id: 2, title: "The Dark Knight", category: "Action", rating: "PG-13", posterUrl: "https://via.placeholder.com/300x450?text=Dark+Knight" },
    { id: 3, title: "Dune: Part Two", category: "Sci-Fi", rating: "PG-13", posterUrl: "https://via.placeholder.com/300x450?text=Dune+Part+Two" },
    { id: 4, title: "Oppenheimer", category: "Drama", rating: "R", posterUrl: "https://via.placeholder.com/300x450?text=Oppenheimer" },
  ];

  const comingSoon = [
    { id: 5, title: "Avatar 3", category: "Sci-Fi", rating: "PG-13", posterUrl: "https://via.placeholder.com/300x450?text=Avatar+3" },
    { id: 6, title: "The Batman - Part II", category: "Action", rating: "PG-13", posterUrl: "https://via.placeholder.com/300x450?text=Batman+II" },
    { id: 7, title: "Shrek 5", category: "Animation", rating: "PG", posterUrl: "https://via.placeholder.com/300x450?text=Shrek+5" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* Currently Running Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-cinema-primary mb-6 border-b border-gray-700 pb-2">
          Currently Running
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {currentlyRunning.map((movie) => (
            <MovieCard 
              key={movie.id}
              title={movie.title}
              category={movie.category}
              rating={movie.rating}
              posterUrl={movie.posterUrl}
            />
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section>
        <h2 className="text-3xl font-bold text-cinema-primary mb-6 border-b border-gray-700 pb-2">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {comingSoon.map((movie) => (
            <MovieCard 
              key={movie.id}
              title={movie.title}
              category={movie.category}
              rating={movie.rating}
              posterUrl={movie.posterUrl}
            />
          ))}
        </div>
      </section>

    </div>
  );
}