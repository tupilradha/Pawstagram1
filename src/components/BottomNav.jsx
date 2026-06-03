// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/",            icon: "🏠", label: "Home"     },
  { to: "/vet-visits",  icon: "🏥", label: "Vet"      },
  { to: "/vaccines",    icon: "💉", label: "Vaccines"  },
  { to: "/medications", icon: "💊", label: "Meds"      },
  { to: "/my-dogs",     icon: "🐾", label: "My Dogs"   },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `bottom-nav__tab ${isActive ? "bottom-nav__tab--active" : ""}`
          }
        >
          <span className="bottom-nav__icon">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
