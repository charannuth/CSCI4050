import "./App.css";
import { useState } from "react";
import Home from "./Home.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";
import MovieTrailerPage from "./components/MovieTrailerPage.jsx";
import Registration from "./pages/Registration.jsx"; 
import Login from "./pages/Login.jsx"; 

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowLogin(false); 
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // --- ADDED THIS FUNCTION ---
  // This allows the Home page to update the user's favorites without losing them!
  const handleUpdateUserFavorites = (newFavoritesList) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        favoriteMovies: newFavoritesList
      });
    }
  };
  // ---------------------------

  if (showRegistration) {
    return (
      <div style={{ background: "#111827", minHeight: "100vh", color: "white" }}>
        <div style={{ padding: "20px" }}>
          <button className="movie-button" onClick={() => setShowRegistration(false)} style={{ padding: "8px 16px", cursor: "pointer" }}>
            ← Back to Home
          </button>
        </div>
        <Registration />
      </div>
    );
  }

  if (showLogin) {
    return (
      <div style={{ background: "#111827", minHeight: "100vh", color: "white" }}>
        <div style={{ padding: "20px" }}>
          <button className="movie-button" onClick={() => setShowLogin(false)} style={{ padding: "8px 16px", cursor: "pointer" }}>
            ← Back to Home
          </button>
        </div>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (trailerMovie) {
    return <MovieTrailerPage movie={trailerMovie} goBack={() => setTrailerMovie(null)} />;
  }

  if (selectedMovie) {
    return <BookingPrototype movie={selectedMovie} goBack={() => setSelectedMovie(null)} />;
  }

  return (
    <div style={{ background: "#111827", minHeight: "100vh" }}>
      <div style={{ padding: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
        
        {currentUser ? (
          <>
            <span style={{ color: "white", marginRight: "10px" }}>
              Welcome, {currentUser.firstName}!
            </span>
            <button className="movie-button" onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold", background: "#4b5563" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="movie-button" onClick={() => setShowLogin(true)} style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold", background: "#2563eb" }}>
              Login
            </button>
            <button className="movie-button" onClick={() => setShowRegistration(true)} style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}>
              Create Account
            </button>
          </>
        )}

      </div>

      <Home 
        onSelectMovie={setSelectedMovie} 
        onViewTrailer={setTrailerMovie} 
        currentUser={currentUser} 
        onUpdateFavorites={handleUpdateUserFavorites} // <-- ADDED THIS PROP
      />
    </div>
  );
}

export default App;