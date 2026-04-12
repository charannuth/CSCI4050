import { useState, useEffect } from 'react';
import { getSchedulingData, addShowtime } from '../api';

export default function ScheduleMovieForm({ onBack }) {
  const [data, setData] = useState({ movies: [], auditoriums: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getSchedulingData();
        setData(result);
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to load scheduling data.' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData(e.target);
    const movieId = formData.get('movieId');
    const scheduleData = {
      auditoriumId: formData.get('auditoriumId'),
      startsAt: formData.get('startsAt'),
    };

    try {
      await addShowtime(movieId, scheduleData);
      setStatus({ type: 'success', message: 'Showtime scheduled successfully!' });
      e.target.reset();
    } catch (err) {
      setStatus({ type: 'error', message: err.body?.error || 'Failed to schedule showtime.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading Showrooms...</div>;

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Schedule a Movie</h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </button>
      </div>

      {status.message && (
        <div className={`p-4 mb-6 rounded font-bold ${status.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Movie *</label>
            <select required name="movieId" className="w-full p-3 bg-gray-800 rounded text-white border border-gray-700">
              <option value="">-- Choose a Movie --</option>
              {data.movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Showroom (Auditorium) *</label>
            <select required name="auditoriumId" className="w-full p-3 bg-gray-800 rounded text-white border border-gray-700">
              <option value="">-- Choose a Room --</option>
              {data.auditoriums.map(a => <option key={a.id} value={a.id}>{a.name} (Cap: {a.capacity})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Date and Time *</label>
            <input required name="startsAt" type="datetime-local" className="w-full p-3 bg-gray-800 rounded text-white border border-gray-700" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-3 bg-cinema-primary hover:bg-red-700 text-white font-bold rounded transition-colors disabled:opacity-50"
        >
          {submitting ? 'Checking for Conflicts...' : 'Confirm Schedule'}
        </button>
      </form>
    </div>
  );
}