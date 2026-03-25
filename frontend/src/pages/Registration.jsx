import { useState } from "react";

export default function Registration() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // 1. Frontend Validation
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (formData.password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setIsLoading(true);

    // 2. API Call to your new backend route
    try {
      const response = await fetch("http://localhost:3002/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // 3. Success! (Dr. Saleh requires the user to be INACTIVE initially)
      setStatus({
        type: "success",
        message: "Registration successful! Please check your email to activate your account.",
      });
      
      // Clear the form
      setFormData({
        firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
      });

    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1f2937", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        
        <h2 style={{ color: "white", fontSize: "28px", marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
          Create an Account
        </h2>
        
        {/* Status Messages (Error or Success) */}
        {status.message && (
          <div style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: status.type === "error" ? "#fee2e2" : "#dcfce3",
            color: status.type === "error" ? "#991b1b" : "#166534",
            textAlign: "center",
            fontWeight: "500"
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="movie-button"
            style={{ marginTop: "10px", padding: "12px", width: "100%", fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
          
        </form>
      </div>
    </div>
  );
}