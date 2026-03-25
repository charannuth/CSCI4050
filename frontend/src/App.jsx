import "./App.css";
import { useState } from "react";
import Home from "./Home.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";
import MovieTrailerPage from "./components/MovieTrailerPage.jsx";
// 1. Import your new Registration component
import Registration from "./pages/Registration.jsx"; 

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  
  // 2. Add state to track if the user is on the Registration page
  const [showRegistration, setShowRegistration] = useState(false);

  // 3. Render Registration if the state is true
  if (showRegistration) {
    return (
      <div style={{ background: "#111827", minHeight: "100vh", color: "white" }}>
        {/* A simple navigation bar to let them go back home */}
        <div style={{ padding: "20px" }}>
          <button 
            className="movie-button" 
            onClick={() => setShowRegistration(false)}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            ← Back to Home
          </button>
        </div>
        <Registration />
      </div>
    );
  }

  // Your existing logic for Trailers and Booking
  if (trailerMovie) {
    return (
      <MovieTrailerPage
        movie={trailerMovie}
        goBack={() => setTrailerMovie(null)}
      />
    );
  }

  if (selectedMovie) {
    return (
      <BookingPrototype
        movie={selectedMovie}
        goBack={() => setSelectedMovie(null)}
      />
    );
  }

  // 4. Update the Home view to include a "Register" button at the top
  return (
    <div style={{ background: "#111827", minHeight: "100vh" }}>
      {/* Temporary Navbar so you can actually click to the Registration page */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "flex-end" }}>
        <button 
          className="movie-button"
          onClick={() => setShowRegistration(true)}
          style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}
        >
          Create Account
        </button>
      </div>

      <Home
        onSelectMovie={setSelectedMovie}
        onViewTrailer={setTrailerMovie}
      />
    </div>
  );
}

export default App;