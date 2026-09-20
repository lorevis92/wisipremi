import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Confronta" },
  { to: "/capisci", label: "Capisci" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="hamburger" aria-label="menu">☰</button>
        <div className="brand">
          {/* sostituire con /public/logo-wisihealth.png quando disponibile */}
          <span className="brand-name">WisiHealth</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => "tab-pill" + (isActive ? " active" : "")}
              end
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
