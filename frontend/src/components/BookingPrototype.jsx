import { useState } from 'react'

export default function BookingPrototype({ movie, goBack }) {
  const movieTitle = movie?.title || 'Movie Title'
  const showtime =
    movie?.showtime ||
    movie?.selectedShowtime ||
    'Showtime will be selected later'

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
          <p>{showtime}</p>
        </div>

        <div className="checkout-grid">
          <div className="ticket-panel">
            <h3>1. Select Tickets</h3>

            <div className="ticket-row">
              <div>
                <p className="ticket-title">Adult</p>
                <p className="ticket-price">$15.00</p>
              </div>
              <div className="ticket-controls">
                <button
                  onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))}
                  className="circle-button"
                >
                  -
                </button>
                <span className="ticket-count">{adultTickets}</span>
                <button
                  onClick={() => setAdultTickets(adultTickets + 1)}
                  className="circle-button"
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
                >
                  -
                </button>
                <span className="ticket-count">{childTickets}</span>
                <button
                  onClick={() => setChildTickets(childTickets + 1)}
                  className="circle-button"
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
                >
                  -
                </button>
                <span className="ticket-count">{seniorTickets}</span>
                <button
                  onClick={() => setSeniorTickets(seniorTickets + 1)}
                  className="circle-button"
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
            <h3>2. Select Seats</h3>

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

            <button className="payment-button">Proceed to Payment</button>
          </div>
        </div>
      </div>
    </div>
  )
}