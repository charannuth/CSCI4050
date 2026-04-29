import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../api';

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Tracks if the component is still visible

    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        if (isMounted) {
          setRecommendations(data);
        }
      } catch (err) {
        // Only trigger the error screen if the component is actually still mounted
        if (isMounted) {
          console.error("AI Fetch Error:", err);
          setError("Could not load recommendations at this time.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    // Cleanup function for React Strict Mode
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p className="animate-pulse">✨ AI is analyzing your cinematic tastes...</p>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="my-10 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>✨</span> AI Top Picks For You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((movie, index) => (
          <div key={index} className="p-5 bg-black rounded-lg border border-gray-800 hover:border-red-600 transition-colors">
            <h3 className="text-xl font-bold text-white mb-1">{movie.title}</h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-3 block">
              {movie.genre}
            </span>
            <p className="text-sm text-gray-400 italic">"{movie.reason}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}