import { useState } from "react";
import { forgotPassword, login, resetPassword } from "../api";

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
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
      const data = await login(formData);
      onLoginSuccess(data);

    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsLoading(true);
    try {
      const data = await forgotPassword(forgotEmail);
      setStatus({ type: "success", message: data.message });
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    if (newPassword !== confirmNewPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    setIsLoading(true);
    try {
      const data = await resetPassword(resetToken, newPassword);
      setStatus({ type: "success", message: data.message });
      setMode("login");
      setResetToken("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1f2937", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        
        <h2 style={{ color: "white", fontSize: "28px", marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
          {mode === "login" ? "Welcome Back" : mode === "forgot" ? "Forgot Password" : "Reset Password"}
        </h2>
        
        {status.message && (
          <div style={{ padding: "12px", marginBottom: "20px", borderRadius: "6px", backgroundColor: status.type === "error" ? "#fee2e2" : "#dcfce3", color: status.type === "error" ? "#991b1b" : "#166534", textAlign: "center", fontWeight: "500" }}>
            {status.message}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>

            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>

            <button type="submit" disabled={isLoading} className="movie-button" style={{ marginTop: "10px", padding: "12px", width: "100%", fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <button type="button" onClick={() => setMode("forgot")} style={{ background: "transparent", border: "none", color: "#93c5fd", cursor: "pointer", textDecoration: "underline" }}>
              Forgot my password
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Email Address *</label>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>
            <button type="submit" disabled={isLoading} className="movie-button" style={{ marginTop: "10px", padding: "12px", width: "100%", fontSize: "16px" }}>
              {isLoading ? "Submitting..." : "Send Reset Token"}
            </button>
            <button type="button" onClick={() => setMode("reset")} style={{ background: "transparent", border: "none", color: "#93c5fd", cursor: "pointer", textDecoration: "underline" }}>
              Already have reset token?
            </button>
            <button type="button" onClick={() => setMode("login")} style={{ background: "transparent", border: "none", color: "#93c5fd", cursor: "pointer", textDecoration: "underline" }}>
              Back to login
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Reset Token *</label>
              <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>New Password *</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#9ca3af", marginBottom: "6px", fontSize: "14px" }}>Confirm New Password *</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #374151", background: "#111827", color: "white" }} />
            </div>
            <button type="submit" disabled={isLoading} className="movie-button" style={{ marginTop: "10px", padding: "12px", width: "100%", fontSize: "16px" }}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" onClick={() => setMode("login")} style={{ background: "transparent", border: "none", color: "#93c5fd", cursor: "pointer", textDecoration: "underline" }}>
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}