import "./App.css";
import { useState } from "react";
import Home from "./pages/Home.jsx";
import MovieDetails from "./components/MovieDetails.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";

function App() {
  const [currentView, setCurrentView] = useState("home"); // 'home', 'details', 'booking'
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Navigation Handlers
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setCurrentView("details");
  };

  const handleBookShowtime = () => {
    setCurrentView("booking");
  };

  const handleBackToHome = () => {
    setSelectedMovie(null);
    setCurrentView("home");
  };

  return (
    // 1. The Global Dark Theme Wrapper
    <div className="min-h-screen bg-cinema-bg text-cinema-text font-sans pb-12">
      
      {/* 2. The Persistent Header */}
      <header className="bg-cinema-card shadow-md py-4 px-8 flex justify-between items-center mb-8">
        <h1 
          onClick={handleBackToHome} 
          className="text-2xl font-bold text-cinema-primary cursor-pointer hover:text-red-500 transition-colors"
        >
          Cinema E-Booking
        </h1>
        <div className="text-cinema-muted text-sm">
          [ Search Bar Placeholder ]
        </div>
      </header>

      {/* 3. The Dynamic Content Area */}
      <main>
        {currentView === "home" && (
          <Home onSelectMovie={handleSelectMovie} />
        )}
        
        {currentView === "details" && (
          <MovieDetails
            movie={selectedMovie}
            onBack={handleBackToHome}
            onBookShowtime={handleBookShowtime}
          />
        )}
        
        {currentView === "booking" && (
          <BookingPrototype
            movie={selectedMovie}
            goBack={() => setCurrentView("details")}
          />
        )}
      </main>

    </div>
  );
}

export default App;