// src/components/BottomNav.jsx — M3 Navigation Bar
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/",           label: "Home",     icon: "🏠" },
  { to: "/vet-visits", label: "Vet",      icon: "🏥" },
  { to: "/vaccines",   label: "Vaccines", icon: "💉" },
  { to: "/timeline",   label: "Timeline", icon: "📊" },
];

export default function BottomNav() {
  return (
    <nav className="m3-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `m3-nav__item ${isActive ? "m3-nav__item--active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="m3-nav__indicator" aria-hidden="true">
                <span className="m3-nav__icon">{icon}</span>
              </span>
              <span className="m3-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
