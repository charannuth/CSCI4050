import { useState } from 'react'

export default function BookingPrototype() {
  // Mock data passed from the details page
  const movieTitle = "Inception"
  const showtime = "Friday, Oct 24 • 8:00 PM"

  // Ticket states
  const [adultTickets, setAdultTickets] = useState(0)
  const [childTickets, setChildTickets] = useState(0)
  const [seniorTickets, setSeniorTickets] = useState(0)

  // Seat states (generating an array of 30 seats)
  const [selectedSeats, setSelectedSeats] = useState([])
  const totalSeats = Array.from({ length: 30 }, (_, i) => i + 1)

  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  // Calculate mock total
  const total = (adultTickets * 15) + (childTickets * 10) + (seniorTickets * 12)

  return (
    <div className="max-w-5xl mx-auto p-8 bg-cinema-bg text-cinema-text">
      
      {/* Header Info */}
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-cinema-primary mb-2">Checkout: {movieTitle}</h2>
        <p className="text-xl text-cinema-muted">{showtime}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Ticket Selection */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">1. Select Tickets</h3>
          
          {/* Ticket Row: Adult */}
          <div className="flex justify-between items-center bg-cinema-card p-4 rounded-lg shadow-md">
            <div>
              <p className="font-bold text-lg">Adult</p>
              <p className="text-sm text-cinema-muted">$15.00</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">-</button>
              <span className="text-xl w-6 text-center">{adultTickets}</span>
              <button onClick={() => setAdultTickets(adultTickets + 1)} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">+</button>
            </div>
          </div>

          {/* Ticket Row: Child */}
          <div className="flex justify-between items-center bg-cinema-card p-4 rounded-lg shadow-md">
            <div>
              <p className="font-bold text-lg">Child (Under 12)</p>
              <p className="text-sm text-cinema-muted">$10.00</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setChildTickets(Math.max(0, childTickets - 1))} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">-</button>
              <span className="text-xl w-6 text-center">{childTickets}</span>
              <button onClick={() => setChildTickets(childTickets + 1)} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">+</button>
            </div>
          </div>

          {/* Ticket Row: Senior */}
          <div className="flex justify-between items-center bg-cinema-card p-4 rounded-lg shadow-md">
            <div>
              <p className="font-bold text-lg">Senior (65+)</p>
              <p className="text-sm text-cinema-muted">$12.00</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSeniorTickets(Math.max(0, seniorTickets - 1))} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">-</button>
              <span className="text-xl w-6 text-center">{seniorTickets}</span>
              <button onClick={() => setSeniorTickets(seniorTickets + 1)} className="bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full text-white font-bold">+</button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg text-right">
            <p className="text-lg text-cinema-muted">Subtotal:</p>
            <p className="text-3xl font-bold text-cinema-primary">${total.toFixed(2)}</p>
          </div>
        </div>

        {/* Right Column: Seating Layout */}
        <div className="lg:col-span-2 bg-cinema-card p-8 rounded-xl shadow-lg border border-gray-800">
          <h3 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">2. Select Seats</h3>
          
          {/* The Screen */}
          <div className="w-3/4 mx-auto h-12 bg-gray-300 rounded-t-[100px] mb-12 shadow-[0_15px_30px_rgba(255,255,255,0.1)] flex items-end justify-center pb-2">
            <p className="text-black text-xs font-bold tracking-widest uppercase">Screen</p>
          </div>
          
          {/* Seating Grid */}
          <div className="grid grid-cols-6 gap-4 mb-10 justify-items-center max-w-md mx-auto">
            {totalSeats.map(seat => {
              const isSelected = selectedSeats.includes(seat);
              return (
                <button 
                  key={seat} 
                  onClick={() => toggleSeat(seat)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl transition-colors duration-200 flex items-center justify-center text-xs font-bold
                    ${isSelected ? 'bg-cinema-primary text-white shadow-[0_0_15px_rgba(225,29,72,0.6)]' : 'bg-gray-600 hover:bg-gray-500 text-transparent hover:text-white'}`}
                  title={`Seat ${seat}`}
                >
                  {seat}
                </button>
              )
            })}
          </div>

          {/* Seat Legend */}
          <div className="flex justify-center gap-8 text-sm border-t border-gray-700 pt-6">
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-gray-600"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-cinema-primary shadow-[0_0_10px_rgba(225,29,72,0.6)]"></div> Selected</div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-gray-900 cursor-not-allowed"></div> Sold</div>
          </div>
          
          <button className="w-full mt-10 bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 rounded-lg transition-colors shadow-lg">
            Proceed to Payment
          </button>
        </div>

      </div>
    </div>
  )
}