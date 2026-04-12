import { useState } from 'react';
import { addMovie } from '../api'; // <-- Import your new API helper!

export default function AddMovieForm({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Gather all form data
    const formData = new FormData(e.target);
    const movieData = Object.fromEntries(formData.entries());

    try {
      // Look how clean this is now! 
      await addMovie(movieData);
      
      setMessage({ type: 'success', text: 'Movie successfully added to the database!' });
      e.target.reset(); // Clear the form
    } catch (err) {
      // Use the error format from your api.js
      setMessage({ type: 'error', text: err.body?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Add New Movie</h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded font-bold ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Movie Title *</label>
            <input required name="title" type="text" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Genre *</label>
            <input required name="genre" type="text" placeholder="e.g., Action, Sci-Fi" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">MPAA Rating *</label>
            <select required name="rating" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700">
              <option value="">Select Rating...</option>
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Director *</label>
            <input required name="director" type="text" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Producer *</label>
            <input required name="producer" type="text" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cast (Comma separated) *</label>
            <input required name="cast" type="text" placeholder="Actor 1, Actor 2..." className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Synopsis/Description *</label>
          <textarea required name="description" rows="3" className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Poster Image URL *</label>
            <input required name="posterUrl" type="url" placeholder="https://..." className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Trailer Video URL *</label>
            <input required name="trailerUrl" type="url" placeholder="https://youtube.com/..." className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-4 bg-cinema-primary hover:bg-red-700 text-white font-bold rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving to Database...' : 'Add Movie'}
        </button>
      </form>
    </div>
  );
}