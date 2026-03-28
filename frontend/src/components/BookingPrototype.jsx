import { useState } from 'react'

export default function BookingPrototype({ movie, goBack }) {
  const movieTitle = movie?.title || 'Movie Title'
  
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  
  // THE FIX: Hardcode the strings for the prototype so React mathematically cannot crash
  const availableShowtimes = ["10:00 AM", "1:15 PM", "4:45 PM", "8:30 PM"];

  const [adultTickets, setAdultTickets] = useState(0)
  const [childTickets, setChildTickets] = useState(0)
  const [seniorTickets, setSeniorTickets] = useState(0)

  const [selectedSeats, setSelectedSeats] = useState([])
  const totalSeats = Array.from({ length: 30 }, (_, i) => i + 1)

  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const total = adultTickets * 15 + childTickets * 10 + seniorTickets * 12

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={goBack}>
        Back to Home
      </button>

      <div className="checkout-wrapper">
        <div className="checkout-header">
          <h2>Checkout: {movieTitle}</h2>
          <p>{selectedShowtime ? `Showtime: ${selectedShowtime}` : 'Please select a showtime'}</p>
        </div>

        <div className="checkout-grid">
          <div className="ticket-panel">
            
            <div style={{ marginBottom: '24px' }}>
              <h3>1. Select Showtime</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {availableShowtimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedShowtime(time)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #4CAF50',
                      backgroundColor: selectedShowtime === time ? '#4CAF50' : 'transparent',
                      color: selectedShowtime === time ? 'white' : '#4CAF50',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <h3>2. Select Tickets</h3>
            <div className="ticket-row">
              <div>
                <p className="ticket-title">Adult</p>
                <p className="ticket-price">$15.00</p>
              </div>
              <div className="ticket-controls">
                <button
                  onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  -
                </button>
                <span className="ticket-count">{adultTickets}</span>
                <button
                  onClick={() => setAdultTickets(adultTickets + 1)}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  +
                </button>
              </div>
            </div>

            <div className="ticket-row">
              <div>
                <p className="ticket-title">Child (Under 12)</p>
                <p className="ticket-price">$10.00</p>
              </div>
              <div className="ticket-controls">
                <button
                  onClick={() => setChildTickets(Math.max(0, childTickets - 1))}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  -
                </button>
                <span className="ticket-count">{childTickets}</span>
                <button
                  onClick={() => setChildTickets(childTickets + 1)}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  +
                </button>
              </div>
            </div>

            <div className="ticket-row">
              <div>
                <p className="ticket-title">Senior (65+)</p>
                <p className="ticket-price">$12.00</p>
              </div>
              <div className="ticket-controls">
                <button
                  onClick={() => setSeniorTickets(Math.max(0, seniorTickets - 1))}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  -
                </button>
                <span className="ticket-count">{seniorTickets}</span>
                <button
                  onClick={() => setSeniorTickets(seniorTickets + 1)}
                  className="circle-button"
                  disabled={!selectedShowtime}
                >
                  +
                </button>
              </div>
            </div>

            <div className="subtotal-box">
              <p>Subtotal:</p>
              <p className="subtotal-price">${total.toFixed(2)}</p>
            </div>
          </div>

          <div className="seating-panel">
            <h3>3. Select Seats</h3>

            {!selectedShowtime ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f5f5f5', borderRadius: '8px', marginTop: '16px' }}>
                <p>Please select a showtime to view available seats.</p>
              </div>
            ) : (
              <div className="seat-selection-container">
                <div className="screen">
                  <p>Screen</p>
                </div>

                <div className="seat-grid">
                  {totalSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat)

                    return (
                      <button
                        key={seat}
                        onClick={() => toggleSeat(seat)}
                        className={`seat-button ${isSelected ? 'selected-seat' : 'available-seat'}`}
                        title={`Seat ${seat}`}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>

                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="legend-seat available-seat"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-seat selected-seat"></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-seat sold-seat"></div>
                    <span>Sold</span>
                  </div>
                </div>

                <button 
                  className="payment-button" 
                  disabled={selectedSeats.length === 0 || total === 0}
                  style={{ opacity: (selectedSeats.length === 0 || total === 0) ? 0.5 : 1 }}
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}