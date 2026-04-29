import { useEffect, useState } from "react";
import { getOrderHistory } from "../api";

export default function OrderHistory({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrderHistory();
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err?.body?.error || err.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="page-message">Loading order history...</div>;
  }

  if (error) {
    return <div className="page-message error">{error}</div>;
  }

  return (
    <div className="home-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <button className="movie-button" onClick={onBack}>Back to Home</button>
      </div>
      <h1 style={{ marginBottom: 12 }}>Order History</h1>

      {orders.length === 0 ? (
        <div className="page-message">No orders found yet. Complete a booking to see it here.</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                <th style={{ padding: 12 }}>Movie</th>
                <th style={{ padding: 12 }}>Showtime</th>
                <th style={{ padding: 12 }}>Seats</th>
                <th style={{ padding: 12 }}>Tickets</th>
                <th style={{ padding: 12 }}>Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 12 }}>{order.movieTitle}</td>
                  <td style={{ padding: 12 }}>
                    {order.showtime ? new Date(order.showtime).toLocaleString() : "N/A"}
                  </td>
                  <td style={{ padding: 12 }}>{order.seats?.join(", ") || "N/A"}</td>
                  <td style={{ padding: 12 }}>
                    {Object.entries(order.ticketCounts || {})
                      .map(([type, count]) => `${type}: ${count}`)
                      .join(" | ") || "N/A"}
                  </td>
                  <td style={{ padding: 12 }}>${Number(order.totalPaid || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
