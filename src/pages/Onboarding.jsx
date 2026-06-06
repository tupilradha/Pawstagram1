import Footer from "../components/Footer";
// src/pages/Onboarding.jsx
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "🏥", title: "Vet Visits",    desc: "Log every clinic visit with notes and diagnosis" },
  { icon: "💉", title: "Vaccines",      desc: "Track vaccines and get overdue alerts" },
  { icon: "💊", title: "Medications",   desc: "Manage active and past medications" },
  { icon: "📝", title: "Symptoms",      desc: "Keep a diary of symptoms with severity levels" },
  { icon: "📊", title: "Health Timeline", desc: "See your dog's full health history at a glance" },
];

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="onboarding">
      <div className="onboarding__hero">
        <div className="onboarding__paw">🐾</div>
        <h1 className="onboarding__title">Dog Health Journal</h1>
        <p className="onboarding__subtitle">
          Keep track of everything that matters for your dog's health — all in one place.
        </p>
      </div>

      <div className="onboarding__features">
        {features.map(f => (
          <div key={f.title} className="onboarding__feature">
            <span className="onboarding__feature-icon">{f.icon}</span>
            <div>
              <div className="onboarding__feature-title">{f.title}</div>
              <div className="onboarding__feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="onboarding__cta">
        <button className="btn btn--primary" style={{ width: "100%", padding: "14px", fontSize: "16px" }}
          onClick={() => navigate("/profile/new")}>
          Add Your First Dog 🐶
        </button>
        <p className="onboarding__note">No account needed · All data stays on your device</p>
      </div>
          <Footer />
    </div>
  );
}
