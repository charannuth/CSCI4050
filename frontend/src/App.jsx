import './App.css'

function App() {
  return (
    // The main wrapper with our dark cinema background and text colors
    <div className="min-h-screen bg-cinema-bg text-cinema-text font-sans">
      
      {/* Navigation Bar Placeholder */}
      <header className="bg-cinema-card shadow-md py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cinema-primary">
          Cinema E-Booking
        </h1>
        <div className="text-cinema-muted text-sm">
          {/* Asritha's Search & Filter components will go here later */}
          [ Search Bar Placeholder ]
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
          Currently Running
        </h2>
        
        {/* Gabriel's Movie Grid will go inside here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          {/* A quick mock movie card just to test your styling */}
          <div className="bg-cinema-card rounded-lg overflow-hidden shadow-lg border border-gray-800 p-4">
            <div className="h-64 bg-gray-700 rounded mb-4 flex items-center justify-center text-gray-500">
              Poster Image
            </div>
            <h3 className="text-xl font-bold mb-1">Movie Title</h3>
            <p className="text-sm text-cinema-muted mb-4">PG-13 • Action</p>
            <button className="w-full bg-cinema-primary hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors">
              Book Now
            </button>
          </div>

        </div>
      </main>

    </div>
  )
}

export default App