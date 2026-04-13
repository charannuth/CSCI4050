import { useState } from 'react';

// Define the prices for each ticket type
const TICKET_PRICES = {
  adult: 15.00,
  child: 10.00,
  senior: 12.00
};

export default function BookingFlow({ showtimeId, goBack }) {
  const [step, setStep] = useState(1); // Step 1: Tickets, Step 2: Seats
  const [tickets, setTickets] = useState({ adult: 0, child: 0, senior: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const totalTickets = tickets.adult + tickets.child + tickets.senior;
  
  // Calculate the total price based on selected tickets
  const totalPrice = (tickets.adult * TICKET_PRICES.adult) + 
                     (tickets.child * TICKET_PRICES.child) + 
                     (tickets.senior * TICKET_PRICES.senior);

  // Mocking the theater rows/columns for the demo (Rubric 2.3)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const takenSeats = ['C4', 'C5', 'D5']; // Simulating taken seats (Rubric 2.4)

  const handleTicketChange = (type, increment) => {
    setTickets(prev => {
      const newVal = prev[type] + increment;
      if (newVal < 0) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  const handleSeatClick = (seatId) => {
    if (takenSeats.includes(seatId)) return; // Prevent double-booking
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= totalTickets) {
        alert(`You only selected ${totalTickets} tickets. You cannot select more seats than tickets!`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 text-white animate-fade-in">
      
      {/* RED BLOCK: Back to Movie Button */}
      <button 
        onClick={goBack} 
        className="bg-red-800 text-white font-bold py-2 px-6 rounded-md mb-6 inline-flex items-center transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
      >
        &larr; <span className="ml-2">Back to Movie</span>
      </button>

      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-800">
        
        {/* STEP 1: TICKET SELECTION */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-cinema-primary mb-6">Select Tickets</h2>
            <div className="space-y-6 max-w-md mx-auto">
              {['adult', 'child', 'senior'].map(type => (
                <div key={type} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cinema-primary transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xl capitalize font-bold">{type}</span>
                    <span className="text-gray-400 text-sm">${TICKET_PRICES[type].toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleTicketChange(type, -1)} className="bg-red-950 w-10 h-10 rounded-full font-bold text-xl hover:bg-red-800 hover:scale-110 active:scale-95 transition-all duration-200">-</button>
                    <span className="text-2xl font-bold w-6 text-center">{tickets[type]}</span>
                    <button onClick={() => handleTicketChange(type, 1)} className="bg-green-950 w-10 h-10 rounded-full font-bold text-xl hover:bg-green-800 hover:scale-110 active:scale-95 transition-all duration-200">+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col items-center">
              <div className="flex space-x-8 mb-6 text-xl">
                <p>Total Tickets: <span className="font-bold text-cinema-primary">{totalTickets}</span></p>
                <p>Subtotal: <span className="font-bold text-green-500">${totalPrice.toFixed(2)}</span></p>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={totalTickets === 0}
                className="bg-cinema-primary disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                Continue to Seat Selection
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SEAT SELECTION MAP */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-cinema-primary mb-2">Select Your Seats</h2>
            <div className="flex justify-between items-center text-gray-400 mb-8 border-b border-gray-800 pb-4">
              <p>
                Please pick <span className="font-bold text-white">{totalTickets}</span> seats. 
                Selected: <span className="font-bold text-white">{selectedSeats.length}</span>
              </p>
              <p className="text-xl">
                Total: <span className="font-bold text-green-500">${totalPrice.toFixed(2)}</span>
              </p>
            </div>

            <div className="mb-10 p-4 bg-black rounded-t-3xl border-b-4 border-blue-500 shadow-[0_10px_20px_rgba(59,130,246,0.2)]">
              <p className="text-center text-blue-400 font-bold uppercase tracking-widest">Screen</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {rows.map(row => (
                <div key={row} className="flex space-x-2 md:space-x-4">
                  <span className="w-6 text-center font-bold text-gray-500 self-center">{row}</span>
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const isTaken = takenSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    
                    let btnClass = "w-8 h-8 rounded-t-lg font-bold text-xs transition-all duration-200 hover:scale-110 active:scale-95 ";
                    if (isTaken) btnClass += "bg-gray-700 text-gray-500 cursor-not-allowed shadow-[0_4px_10px_rgba(0,0,0,0.5)]";
                    else if (isSelected) btnClass += "bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.7)]";
                    else btnClass += "bg-gray-400 hover:bg-gray-300 text-black shadow-[0_4px_10px_rgba(0,0,0,0.5)]";

                    return (
                      <button 
                        key={seatId} 
                        onClick={() => handleSeatClick(seatId)}
                        className={btnClass}
                        disabled={isTaken}
                      >
                        {col}
                      </button>
                    );
                  })}
                  <span className="w-6 text-center font-bold text-gray-500 self-center">{row}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-gray-800 pt-6">
              
              {/* RED BLOCK: Back to Tickets Button */}
              <button 
                onClick={() => setStep(1)} 
                className="bg-red-800 text-white font-bold py-2 px-6 rounded-md inline-flex items-center transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              >
                &larr; <span className="ml-2">Back to Tickets</span>
              </button>
              
              <button 
                disabled={selectedSeats.length !== totalTickets}
                onClick={() => alert("Checkout is NOT required for Sprint 3! Demo Complete! 🎉")}
                className="bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.5)]"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}