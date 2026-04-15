import { useState } from 'react';

// Define the prices for each ticket type
const TICKET_PRICES = {
  adult: 15.00,
  child: 10.00,
  senior: 12.00
};

export default function BookingFlow({ showtimeId, goBack, currentUser }) {
  // Step 1: Tickets, Step 2: Seats, Step 3: Checkout / Order Summary
  const [step, setStep] = useState(1); 
  const [tickets, setTickets] = useState({ adult: 0, child: 0, senior: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Checkout States
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("new");

  const totalTickets = tickets.adult + tickets.child + tickets.senior;
  
  // Calculations
  const subtotal = (tickets.adult * TICKET_PRICES.adult) + 
                   (tickets.child * TICKET_PRICES.child) + 
                   (tickets.senior * TICKET_PRICES.senior);
  
  const discountAmount = subtotal * discountPercent;
  const totalAfterDiscount = subtotal - discountAmount;
  const taxes = totalAfterDiscount * 0.08; // 8% Tax rate
  const finalTotal = totalAfterDiscount + taxes;

  // Mocking the theater rows/columns for the demo
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const takenSeats = ['C4', 'C5', 'D5']; 

  const handleTicketChange = (type, increment) => {
    setTickets(prev => {
      const newVal = prev[type] + increment;
      if (newVal < 0) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  const handleSeatClick = (seatId) => {
    if (takenSeats.includes(seatId)) return; 
    
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

  const handleApplyPromo = () => {
    // Mock promotion validation based on the Prisma schema requirement
    if (promoCode.toUpperCase() === "10OFF") {
      setDiscountPercent(0.10); // 10% off
      alert("Promo code applied!");
    } else {
      alert("Invalid promo code.");
      setDiscountPercent(0);
    }
  };

  const handleFinalCheckout = () => {
    if (!currentUser) {
      alert("Please log in to complete your purchase.");
      return;
    }
    // This is where we would normally send the payload to the backend
    alert(`Payment processing is not required for this demo! \n\nOrder simulated for ${currentUser.firstName}.\nTotal Billed: $${finalTotal.toFixed(2)}\n\nDemo Complete! 🎉`);
    goBack(); // Return to home/movie after "checkout"
  };

  return (
    <div className="max-w-4xl mx-auto p-8 text-white animate-fade-in">
      
      {/* RED BLOCK: Back to Movie Button */}
      {step === 1 && (
        <button 
          onClick={goBack} 
          className="bg-red-800 text-white font-bold py-2 px-6 rounded-md mb-6 inline-flex items-center transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          &larr; <span className="ml-2">Cancel Booking</span>
        </button>
      )}

      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-800">
        
        {/* ========================================== */}
        {/* STEP 1: TICKET SELECTION */}
        {/* ========================================== */}
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
                <p>Subtotal: <span className="font-bold text-green-500">${subtotal.toFixed(2)}</span></p>
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

        {/* ========================================== */}
        {/* STEP 2: SEAT SELECTION MAP */}
        {/* ========================================== */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-cinema-primary mb-2">Select Your Seats</h2>
            <div className="flex justify-between items-center text-gray-400 mb-8 border-b border-gray-800 pb-4">
              <p>
                Please pick <span className="font-bold text-white">{totalTickets}</span> seats. 
                Selected: <span className="font-bold text-white">{selectedSeats.length}</span>
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
              <button 
                onClick={() => setStep(1)} 
                className="bg-gray-700 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-600 transition-colors"
              >
                &larr; Back to Tickets
              </button>
              
              <button 
                disabled={selectedSeats.length !== totalTickets}
                onClick={() => setStep(3)}
                className="bg-cinema-primary disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 3: ORDER SUMMARY & CHECKOUT */}
        {/* ========================================== */}
        {step === 3 && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Checkout Details */}
            <div>
              <h2 className="text-3xl font-bold text-cinema-primary mb-6">Checkout</h2>
              
              {/* Fake Payment Method Selection */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                <select 
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:outline-none focus:border-cinema-primary"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="new">Add New Card...</option>
                  <option value="saved_1">Visa ending in 4242</option>
                  <option value="saved_2">Mastercard ending in 1234</option>
                </select>

                {paymentMethod === "new" && (
                  <div className="mt-4 space-y-4">
                    <input type="text" placeholder="Cardholder Name" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:border-cinema-primary outline-none" />
                    <input type="text" placeholder="Card Number" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:border-cinema-primary outline-none" />
                    <div className="flex space-x-4">
                      <input type="text" placeholder="MM/YY" className="w-1/2 bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:border-cinema-primary outline-none" />
                      <input type="text" placeholder="CVC" className="w-1/2 bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:border-cinema-primary outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code Entry */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Promo Code</h3>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Enter code (Try 10OFF)" 
                    className="flex-1 bg-gray-900 border border-gray-700 text-white p-3 rounded-md focus:border-cinema-primary outline-none uppercase"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-gray-700 hover:bg-gray-600 font-bold px-4 py-2 rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
              <h3 className="text-2xl font-bold mb-6 text-cinema-primary border-b border-gray-700 pb-2">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-gray-300">
                <div className="flex justify-between">
                  <span>Adult Tickets (x{tickets.adult})</span>
                  <span>${(tickets.adult * TICKET_PRICES.adult).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Child Tickets (x{tickets.child})</span>
                  <span>${(tickets.child * TICKET_PRICES.child).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Senior Tickets (x{tickets.senior})</span>
                  <span>${(tickets.senior * TICKET_PRICES.senior).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-gray-700">
                  <span>Seats</span>
                  <span>{selectedSeats.join(", ")}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({(discountPercent * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-700 pt-6 mb-8">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-green-500">${finalTotal.toFixed(2)}</span>
              </div>

              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleFinalCheckout}
                  className="w-full bg-green-700 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 hover:bg-green-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                >
                  Confirm Purchase
                </button>
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full text-gray-400 hover:text-white transition-colors"
                >
                  Edit Seats
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}