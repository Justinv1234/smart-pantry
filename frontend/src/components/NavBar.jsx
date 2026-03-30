import { useAuth } from "../context/AuthContext";

export default function NavBar({ current, onNavigate }) {
  const { user, logout } = useAuth();

  const tabs = [
    { id: "pantry", label: "Pantry", icon: "🏠" },
    { id: "grocery", label: "Grocery", icon: "🛒" },
    { id: "recipes", label: "Recipes", icon: "📖" },
  ];

  return (
    <>
      {/* Desktop: full top nav bar */}
      <nav className="navbar desktop-only">
        <div className="nav-brand">Smart Pantry</div>
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${current === tab.id ? "active" : ""}`}
              onClick={() => onNavigate(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <span className="nav-user">{user.email}</span>
          <button className="nav-logout" onClick={logout}>Log Out</button>
        </div>
      </nav>

      {/* Mobile: slim top bar + bottom tabs */}
      <header className="topbar mobile-only">
        <div className="nav-brand">Smart Pantry</div>
        <div className="nav-right">
          <button className="nav-logout" onClick={logout}>Log Out</button>
        </div>
      </header>
      <nav className="bottom-nav mobile-only">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-tab ${current === tab.id ? "active" : ""}`}
            onClick={() => onNavigate(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
