import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Confronta" },
  { to: "/video", label: "Video" },
  { to: "/trasparenza", label: "Trasparenza" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="hamburger" aria-label="menu">☰</button>
        <div className="brand">
          {/* sostituire con /public/logo-wisipremi.png quando disponibile */}
          <span className="brand-name">WisiPremi</span>
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
