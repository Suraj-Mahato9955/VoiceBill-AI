
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [shopId, setShopId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!shopId.trim() || !password) {
      alert("Please enter your Shop ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopId: shopId.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("voicebillToken", data.token);
      localStorage.setItem(
        "voicebillShop",
        JSON.stringify(data.shop)
      );

      alert(`Welcome, ${data.shop.ownerName}! Login successful!`);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    alert("Password recovery will be implemented in a later step.");
  };

  return (
    <main className="login-page">
      {/* LEFT PANEL */}
      <section className="brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="13" rx="3" />
                <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                <path d="M12 19v3" />
                <path d="M8 22h8" />
              </svg>
            </div>

            <div>
              <h1>
                VoiceBill <span>AI</span>
              </h1>
              <p>Speak. Calculate. Bill. Pay.</p>
            </div>
          </div>

          <div className="hero-text">
            <h2>
              Smart Billing for
              <br />
              <span>Modern Shops</span>
            </h2>

            <p>
              Use your voice, create bills, manage your shop
              <br className="desktop-break" /> and get paid — all in one place.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon voice-icon">🎙</div>
              <div>
                <h3>Voice Based Billing</h3>
                <p>Just speak, we'll handle the rest.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon ai-icon">▤</div>
              <div>
                <h3>AI Powered Processing</h3>
                <p>
                  Understands your commands,
                  <br /> extracts products &amp; prices.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon edit-icon">✎</div>
              <div>
                <h3>Editable Invoices</h3>
                <p>
                  Change quantity, price or discount
                  <br /> with ease.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon payment-icon">▦</div>
              <div>
                <h3>UPI QR Payments</h3>
                <p>Let your customers pay instantly.</p>
              </div>
            </div>
          </div>

          {/* BILLING PREVIEW */}
          <div className="billing-illustration">
            <div className="shop-awning">
              <div className="awning-top">GENERAL STORE</div>

              <div className="awning-stripes">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="shop-shelves">
                <div className="shelf">
                  <span>▰</span>
                  <span>▰</span>
                  <span>▰</span>
                </div>

                <div className="shelf">
                  <span>▰</span>
                  <span>▰</span>
                  <span>▰</span>
                </div>
              </div>
            </div>

            <div className="tablet">
              <div className="tablet-screen">
                <p className="voice-message">
                  Add 2 kg rice at 60 rupees per kg...
                </p>

                <div className="mic-circle">🎙</div>

                <div className="sound-wave">
                  ▁ ▃ ▆ ▂ ▇ ▄ ▂ ▅ ▃ ▁
                </div>
              </div>
            </div>

            <div className="mini-invoice">
              <h3>Bill</h3>

              <div className="invoice-line">
                <span>Rice</span>
                <span>2 kg</span>
                <span>₹120</span>
              </div>

              <div className="invoice-line">
                <span>Milk</span>
                <span>1 ltr</span>
                <span>₹30</span>
              </div>

              <div className="invoice-line">
                <span>Biscuits</span>
                <span>2 pkt</span>
                <span>₹20</span>
              </div>

              <hr />

              <div className="invoice-total">
                <span>Total</span>
                <strong>₹170.00</strong>
              </div>

              <div className="fake-qr">
                ▦ ▩ ▦
                <br />
                ▩ ▦ ▩
                <br />
                ▦ ▩ ▦
              </div>

              <small>Scan to Pay · UPI</small>
            </div>
          </div>

          <div className="brand-footer">
            Your Shop,
            <br />
            Smarter with <span>AI</span>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="login-panel">
        <div className="login-card">
          <header className="login-brand">
            <div className="login-logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="13" rx="3" />
                <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                <path d="M12 19v3" />
                <path d="M8 22h8" />
              </svg>
            </div>

            <div>
              <h2>
                VoiceBill <span>AI</span>
              </h2>
              <p>Shopkeeper Login</p>
            </div>
          </header>

          <div className="welcome-section">
            <h2>Welcome Back</h2>
            <p>Login to your shop account to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="shopId">Shop ID / Username</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 10h18" />
                    <path d="M5 10V20H19V10" />
                    <path d="M3 10l2-6h14l2 6" />
                    <path d="M9 20v-6h6v6" />
                  </svg>
                </span>

                <input
                  id="shopId"
                  type="text"
                  placeholder="Enter your Shop ID or username"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          <button
            className="register-button"
            type="button"
            onClick={handleRegister}
          >
            <span className="register-icon">▣</span>
            Create New Shop Account
          </button>

          <div className="security-note">
            <div className="security-icon">✓</div>

            <div>
              <h3>Your data is safe with us</h3>
              <p>
                We use security best practices to protect
                <br className="desktop-break" /> your shop data.
              </p>
            </div>
          </div>
        </div>

        <p className="copyright">
          © 2026 VoiceBill AI. All rights reserved.
        </p>
      </section>
    </main>
  );
}

function ProtectedDashboard() {
  const token = localStorage.getItem("voicebillToken");
  const shop = localStorage.getItem("voicebillShop");

  if (!token || !shop) {
    return <Navigate to="/" replace />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
