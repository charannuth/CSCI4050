export default function MovieTrailerPage({ movie, goBack }) {
  return (
    <div className="trailer-page">
      <div className="trailer-header">
        <button className="back-button" onClick={goBack}>
          ← Back
        </button>
      </div>

      <div className="trailer-layout">
        {/* Left half: Title, rating, genre, synopsis */}
        <div className="trailer-left">
          <h1 className="trailer-title">{movie.title}</h1>
          <div className="trailer-meta">
            <span className="trailer-rating">{movie.rating}</span>
            <span className="trailer-genre">{movie.genre}</span>
          </div>
          <div className="trailer-synopsis">
            <h3>Synopsis</h3>
            <p>{movie.description}</p>
          </div>
        </div>

        {/* Right half: Embedded trailer */}
        <div className="trailer-right">
          <div className="trailer-embed-wrapper">
            {movie.trailerUrl ? (
              <iframe
                src={movie.trailerUrl}
                title={`${movie.title} Trailer`}
                className="trailer-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="trailer-no-url">
                <p>No trailer available for this movie.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
