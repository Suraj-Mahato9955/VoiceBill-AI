import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    ownerName: "",
    shopName: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    upiId: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    alert(
      "Registration form validated! Backend account creation will be added next."
    );
  };

  return (
    <main className="register-page">
      <section className="register-brand-panel">
        <Link to="/" className="register-brand-logo">
          <div className="register-logo-icon">🎙</div>

          <div>
            <h1>
              VoiceBill <span>AI</span>
            </h1>
            <p>Speak. Calculate. Bill. Pay.</p>
          </div>
        </Link>

        <div className="register-hero">
          <span className="register-badge">WELCOME TO VOICEBILL AI</span>

          <h2>
            Grow Your Business.
            <br />
            <span>Bill Smarter.</span>
          </h2>

          <p>
            Create your shop account and experience
            smarter billing powered by voice and AI.
          </p>

          <div className="register-benefits">
            <div>
              <span>✓</span>
              Voice-based billing
            </div>

            <div>
              <span>✓</span>
              Easy invoice management
            </div>

            <div>
              <span>✓</span>
              Convenient UPI payments
            </div>

            <div>
              <span>✓</span>
              Your own shop dashboard
            </div>
          </div>
        </div>

        <div className="register-brand-footer">
          Your Shop, Smarter with AI.
        </div>
      </section>

      <section className="register-form-panel">
        <div className="register-card">
          <div className="register-heading">
            <h2>Create Your Shop Account</h2>
            <p>
              Fill in your details to get started with VoiceBill AI.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="register-section-title">
              <span>01</span>
              Owner Information
            </div>

            <div className="register-fields-grid">
              <div className="register-field">
                <label htmlFor="ownerName">Owner Name *</label>

                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  placeholder="Enter owner name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="shopName">Shop Name *</label>

                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  placeholder="Enter shop name"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="mobile">Mobile Number *</label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com (optional)"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="register-section-title">
              <span>02</span>
              Login Credentials
            </div>

            <div className="register-fields-grid">
              <div className="register-field full-width">
                <label htmlFor="username">Username *</label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">Password *</label>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">
                  Confirm Password *
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <label className="register-show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show passwords
            </label>

            <div className="register-section-title">
              <span>03</span>
              Shop Details
            </div>

            <div className="register-fields-grid">
              <div className="register-field full-width">
                <label htmlFor="address">Shop Address *</label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your complete shop address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="register-field full-width">
                <label htmlFor="upiId">UPI ID</label>

                <input
                  id="upiId"
                  name="upiId"
                  type="text"
                  placeholder="yourname@bank (optional)"
                  value={formData.upiId}
                  onChange={handleChange}
                />

                <small>
                  You can add or update your payment details later.
                </small>
              </div>
            </div>

            <div className="register-privacy-note">
              <span>🔒</span>
              <p>
                Your information will be protected using secure
                authentication when backend registration is implemented.
              </p>
            </div>

            <button className="register-submit-button" type="submit">
              Create Shop Account <span>→</span>
            </button>

            <p className="register-login-link">
              Already have an account? <Link to="/">Login here</Link>
            </p>
          </form>
        </div>

        <p className="register-copyright">
          © 2026 VoiceBill AI. All rights reserved.
        </p>
      </section>
    </main>
  );
}

export default Register;