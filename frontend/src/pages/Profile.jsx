import { useEffect, useState } from "react";

import {
  addPaymentCard,
  changePassword,
  getMe,
  removePaymentCard,
  updateProfile
} from "../api";

export default function Profile({ onBack, onUserRefreshed }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  });
  const [cards, setCards] = useState([]);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [cardForm, setCardForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expiresMonth: "",
    expiresYear: "",
    cvv: "",
    brand: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getMe();
        setUser(data.user);
        setCards(data.paymentCards ?? []);
        setProfileForm({
          firstName: data.user.firstName ?? "",
          lastName: data.user.lastName ?? "",
          phone: data.user.phone ?? ""
        });
        if (data.address) {
          setAddress({
            line1: data.address.line1 ?? "",
            line2: data.address.line2 ?? "",
            city: data.address.city ?? "",
            state: data.address.state ?? "",
            postalCode: data.address.postalCode ?? "",
            country: data.address.country ?? "US"
          });
        }
        if (onUserRefreshed) {
          onUserRefreshed(data.user, data.favoriteMovies ?? []);
        }
      } catch (error) {
        setStatus({ type: "error", message: error?.body?.error || error.message });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onUserRefreshed]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    try {
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || null,
        address
      });
      const fresh = await getMe();
      setUser(fresh.user);
      setCards(fresh.paymentCards ?? []);
      setStatus({ type: "success", message: "Profile updated successfully." });
      if (onUserRefreshed) {
        onUserRefreshed(fresh.user, fresh.favoriteMovies ?? []);
      }
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    }
  };

  const addCard = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    try {
      await addPaymentCard({
        ...cardForm,
        expiresMonth: Number(cardForm.expiresMonth),
        expiresYear: Number(cardForm.expiresYear),
      });
      const fresh = await getMe();
      setCards(fresh.paymentCards ?? []);
      setCardForm({
        cardholderName: "",
        cardNumber: "",
        expiresMonth: "",
        expiresYear: "",
        cvv: "",
        brand: ""
      });
      setStatus({ type: "success", message: "Payment card added." });
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    }
  };

  const deleteCard = async (cardId) => {
    setStatus({ type: "", message: "" });
    try {
      await removePaymentCard(cardId);
      const fresh = await getMe();
      setCards(fresh.paymentCards ?? []);
      setStatus({ type: "success", message: "Payment card removed." });
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    try {
      const data = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setStatus({ type: "success", message: data.message });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ type: "error", message: error?.body?.error || error.message });
    }
  };

  if (loading) {
    return <div className="page-message">Loading profile...</div>;
  }

  if (!user) {
    return <div className="page-message error">Could not load profile.</div>;
  }

  return (
    <div className="home-page" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <button className="movie-button" onClick={onBack}>Back to Home</button>
      </div>
      <h1>Edit Profile</h1>
      {status.message && (
        <div className={`page-message ${status.type === "error" ? "error" : ""}`} style={{ padding: 12 }}>
          {status.message}
        </div>
      )}

      <form onSubmit={saveProfile} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3>Personal Information</h3>
        <label>Email (locked)</label>
        <input value={user.email} disabled style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <label>First Name *</label>
        <input value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <label>Last Name *</label>
        <input value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <label>Phone</label>
        <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} style={{ width: "100%", marginBottom: 12, padding: 8 }} />

        <h3>Address (one maximum)</h3>
        <label>Line 1 *</label>
        <input value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Line 2</label>
        <input value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>City *</label>
        <input value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>State *</label>
        <input value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Postal Code *</label>
        <input value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Country *</label>
        <input value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <button className="movie-button" type="submit">Save Profile</button>
      </form>

      <form onSubmit={addCard} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3>Payment Cards (max 3)</h3>
        <p style={{ marginTop: 0, color: "#666" }}>Saved cards: {cards.length}/3</p>
        {cards.map((card) => (
          <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e5e5", borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <span>{card.brand || "Card"} ending in {card.last4} (exp {card.expiresMonth}/{card.expiresYear})</span>
            <button type="button" className="movie-button" onClick={() => deleteCard(card.id)}>Remove</button>
          </div>
        ))}
        <label>Cardholder Name *</label>
        <input value={cardForm.cardholderName} onChange={(e) => setCardForm((c) => ({ ...c, cardholderName: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Card Number *</label>
        <input value={cardForm.cardNumber} onChange={(e) => setCardForm((c) => ({ ...c, cardNumber: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Brand</label>
        <input value={cardForm.brand} onChange={(e) => setCardForm((c) => ({ ...c, brand: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Expires Month *</label>
        <input type="number" value={cardForm.expiresMonth} onChange={(e) => setCardForm((c) => ({ ...c, expiresMonth: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Expires Year *</label>
        <input type="number" value={cardForm.expiresYear} onChange={(e) => setCardForm((c) => ({ ...c, expiresYear: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>CVV *</label>
        <input value={cardForm.cvv} onChange={(e) => setCardForm((c) => ({ ...c, cvv: e.target.value }))} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <button className="movie-button" type="submit" disabled={cards.length >= 3}>Add Card</button>
      </form>

      <form onSubmit={submitPassword} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3>Change Password</h3>
        <label>Current Password *</label>
        <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>New Password *</label>
        <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required style={{ width: "100%", marginBottom: 8, padding: 8 }} />
        <label>Confirm New Password *</label>
        <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <button className="movie-button" type="submit">Change Password</button>
      </form>
    </div>
  );
}
