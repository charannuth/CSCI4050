import { useState } from 'react';
import AddMovieForm from '../components/AddMovieForm';
import ScheduleMovieForm from '../components/ScheduleMovieForm';
import PromotionsForm from '../components/PromotionsForm'; // 1. ADDED IMPORT

export default function AdminDashboard({ currentUser }) {
  // We use this state to know which page to show ("dashboard", "addMovie", "schedule", etc.)
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-bold text-cinema-primary mb-2">Admin Control Panel</h1>
      <p className="text-gray-400 mb-8">
        Welcome back, Admin {currentUser?.firstName}. You have full system access.
      </p>

      {/* 1.1 Admin Home Page - Grid Menu */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Movies */}
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-3 text-white">Manage Movies</h3>
            <p className="text-sm text-gray-400 mb-4">Add new releases, edit showtimes, or remove movies from the database.</p>
            <button 
              onClick={() => setActiveView('addMovie')} 
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors font-bold"
            >
              Open Movie Editor
            </button>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-3 text-white">Manage Users</h3>
            <p className="text-sm text-gray-400 mb-4">Suspend accounts, promote users to Admin, or trigger password resets.</p>
            <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors font-bold">
              View User Directory
            </button>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-3 text-white">Promotions</h3>
            <p className="text-sm text-gray-400 mb-4">Create global discount codes and send promotional email blasts.</p>
            <button 
              onClick={() => setActiveView('promotions')} // 2. ADDED ONCLICK HANDLER
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors font-bold"
            >
              Manage Promos
            </button>
          </div>

          {/* 1.3 Schedule a Movie */}
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-3 text-white">Showtimes</h3>
            <p className="text-sm text-gray-400 mb-4">Update screening schedules and maintain auditorium availability windows.</p>
            <button 
              onClick={() => setActiveView('schedule')} 
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors font-bold"
            >
              Manage Showtimes
            </button>
          </div>
        </div>
      )}

      {/* 1.2 Add Movie View */}
      {activeView === 'addMovie' && (
        <AddMovieForm onBack={() => setActiveView('dashboard')} />
      )}

      {/* 1.3 Schedule Movie View */}
      {activeView === 'schedule' && (
        <ScheduleMovieForm onBack={() => setActiveView('dashboard')} />
      )}

      {/* 1.4 Promotions View (3. ADDED RENDER BLOCK) */}
      {activeView === 'promotions' && (
        <PromotionsForm onBack={() => setActiveView('dashboard')} />
      )}
    </div>
  );
}