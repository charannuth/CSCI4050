import "./App.css";
import { useState } from "react";
import Home from "./Home.jsx";
import BookingPrototype from "./components/BookingPrototype.jsx";

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  if (selectedMovie) {
    return (
      <BookingPrototype
        movie={selectedMovie}
        goBack={() => setSelectedMovie(null)}
      />
    );
  }

  return <Home onSelectMovie={setSelectedMovie} />;
}

export default App;