import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const shop = JSON.parse(
    localStorage.getItem("voicebillShop") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("voicebillToken");
    localStorage.removeItem("voicebillShop");
    navigate("/", { replace: true });
  };

  if (!shop || !localStorage.getItem("voicebillToken")) {
    return null;
  }

  const openCreateBill = () => {
    navigate("/create-bill");
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          VoiceBill <span>AI</span>
        </div>

        <nav className="dashboard-nav">
          <button className="nav-item active">
            ▦ Dashboard
          </button>

          <button className="nav-item" onClick={openCreateBill}>
            ＋ Create New Bill
          </button>

          <button
            className="nav-item"
            onClick={() => alert("Billing history coming soon!")}
          >
            ◷ Billing History
          </button>

          <button
            className="nav-item"
            onClick={() => alert("Settings coming soon!")}
          >
            ⚙ Settings
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Manage your shop and billing activity.</p>
          </div>

          <div className="shop-profile">
            <div className="profile-avatar">
              {shop.ownerName?.charAt(0).toUpperCase() || "S"}
            </div>

            <div>
              <strong>{shop.ownerName}</strong>
              <p>{shop.shopName}</p>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <h2>Welcome back, {shop.ownerName}! 👋</h2>
            <p>Ready to manage your shop with VoiceBill AI?</p>
          </div>

          <button onClick={openCreateBill}>
            + Create New Bill
          </button>
        </section>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon blue">₹</div>
            <p>Total Sales</p>
            <h2>₹0.00</h2>
            <span>Overall earnings</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">₹</div>
            <p>Today's Sales</p>
            <h2>₹0.00</h2>
            <span>Today's earnings</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Bills</p>
            <h2>0</h2>
            <span>Bills generated</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">🎙</div>
            <p>Voice Bills</p>
            <h2>0</h2>
            <span>Voice generated bills</span>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="recent-bills">
            <div className="section-heading">
              <h2>Recent Bills</h2>
              <span>Latest transactions</span>
            </div>

            <div className="empty-bills">
              <div>▤</div>
              <h3>No bills yet</h3>
              <p>Your generated bills will appear here.</p>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>

            <button onClick={openCreateBill}>
              🎙 Start Voice Billing
            </button>

            <button onClick={openCreateBill}>
              ＋ Create Manual Bill
            </button>

            <button
              onClick={() => alert("Billing history coming soon!")}
            >
              ◷ View Billing History
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
