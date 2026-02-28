import "./App.css";
import { useState } from "react";
import Home from "./Home.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";
import MovieTrailerPage from "./components/MovieTrailerPage.jsx";

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);

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

  return (
    <Home
      onSelectMovie={setSelectedMovie}
      onViewTrailer={setTrailerMovie}
    />
  );
}

export default App;