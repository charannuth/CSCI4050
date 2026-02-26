import './App.css'
import BookingPrototype from './components/BookingPrototype'

function App() {
  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-text font-sans pb-12">
      
      {/* Navigation Bar Placeholder */}
      <header className="bg-cinema-card shadow-md py-4 px-8 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-cinema-primary cursor-pointer hover:text-red-500 transition-colors">
          Cinema E-Booking
        </h1>
        <div className="text-cinema-muted text-sm">
          [ Search Bar Placeholder ]
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Rendering your new component right here */}
        <BookingPrototype />
      </main>

    </div>
  )
}

export default App