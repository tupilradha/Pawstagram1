// src/components/BottomNav.jsx — M3 Navigation Bar
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/",           label: "Home",     activeIcon: "🏠",  inactiveIcon: "🏠"  },
  { to: "/vet-visits", label: "Vet",      activeIcon: "🏥",  inactiveIcon: "🏥"  },
  { to: "/vaccines",   label: "Vaccines", activeIcon: "💉",  inactiveIcon: "💉"  },
  { to: "/timeline",   label: "Timeline", activeIcon: "📊",  inactiveIcon: "📊"  },
];

export default function BottomNav() {
  return (
    <nav className="m3-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ to, label, activeIcon, inactiveIcon }) => (
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
                <span className="m3-nav__icon">
                  {isActive ? activeIcon : inactiveIcon}
                </span>
              </span>
              <span className="m3-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
