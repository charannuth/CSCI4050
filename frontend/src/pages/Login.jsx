import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success! Pass the user data back up to App.tsx
      onLoginSuccess(data.user);

    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1f2937", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        
        <h2 style={{ color: "white", fontSize: "28px", marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
          Welcome Back
        </h2>
        
        {status.message && (
          <div style={{ padding: "12px", marginBottom: "20px", borderRadius: "6px", backgroundColor: status.type === "error" ? "#fee2e2" : "#dcfce3", color: status.type === "error" ? "#991b1b" : "#166534", textAlign: "center", fontWeight: "500" }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
          </div>

          <div>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
          </div>

          <button type="submit" disabled={isLoading} className="movie-button" style={{ marginTop: "10px", padding: "12px", width: "100%", fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}