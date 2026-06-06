// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { getVaccines, getMedications } from "../db/db";

function getDogAlerts(dogId) {
  const today = new Date();
  const overdue  = getVaccines(dogId).filter(v => v.nextDueDate && new Date(v.nextDueDate) < today);
  const upcoming = getVaccines(dogId).filter(v => {
    if (!v.nextDueDate) return false;
    const d = (new Date(v.nextDueDate) - today) / 86400000;
    return d >= 0 && d <= 30;
  });
  const activeMeds = getMedications(dogId).filter(m => !m.endDate || new Date(m.endDate) >= today);
  const alerts = [];
  if (overdue.length)    alerts.push({ type: "red",   label: `${overdue.length} vaccine${overdue.length > 1 ? "s" : ""} overdue` });
  if (upcoming.length)   alerts.push({ type: "amber", label: `${upcoming.length} due soon` });
  if (activeMeds.length) alerts.push({ type: "amber", label: `${activeMeds.length} active med${activeMeds.length > 1 ? "s" : ""}` });
  if (!alerts.length)    alerts.push({ type: "green", label: "All clear" });
  return alerts;
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const AVATAR_COLORS = [
  { bg: "#26215C", color: "#AFA9EC" },
  { bg: "#04342C", color: "#5DCAA5" },
  { bg: "#4A1B0C", color: "#F0997B" },
  { bg: "#042C53", color: "#85B7EB" },
  { bg: "#412402", color: "#FAC775" },
  { bg: "#173404", color: "#97C459" },
];

export default function Home() {
  const { dogs } = useDog();
  const navigate = useNavigate();
  const [dogAlerts, setDogAlerts] = useState({});

  useEffect(() => {
    const map = {};
    dogs.forEach(d => { map[d.id] = getDogAlerts(d.id); });
    setDogAlerts(map);
  }, [dogs]);

  return (
    <div className="home-dark">
      {/* Header */}
      <div className="home-dark__header">
        <div>
          <h1 className="home-dark__title">PawLog 🐾</h1>
          <p className="home-dark__date">{formatDate()}</p>
          <p className="home-dark__tagline">Every wag, every visit, every moment matters. Because they can't tell you when something's wrong. PawLog keeps track, so you never miss a thing.</p>
        </div>
        <button className="home-dark__add-btn" onClick={() => navigate("/profile/new")} aria-label="Add dog">+</button>
      </div>

      {/* Dog count */}
      <div className="home-dark__section-label">
        {dogs.length} dog{dogs.length > 1 ? "s" : ""}
      </div>

      {/* Dog grid */}
      <div className="home-dark__grid">
        {dogs.map((dog, i) => {
          const alerts = dogAlerts[dog.id] || [];
          const av     = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div
              key={dog.id}
              className="home-dark__card"
              onClick={() => navigate(`/dog/${dog.id}`)}
            >
              <div className="home-dark__avatar" style={{ background: av.bg, color: av.color }}>
                {dog.photoUrl
                  ? <img src={dog.photoUrl} alt={dog.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : (dog.name?.[0]?.toUpperCase() || "?")}
              </div>
              <div className="home-dark__dog-name">{dog.name}</div>
              <div className="home-dark__dog-meta">
                {[dog.breed, dog.age ? `${dog.age} yrs` : ""].filter(Boolean).join(" · ") || "No details"}
              </div>
              <div className="home-dark__badges">
                {alerts.map((a, j) => (
                  <span key={j} className={`home-dark__badge home-dark__badge--${a.type}`}>{a.label}</span>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add dog card */}
        <div className="home-dark__add-card" onClick={() => navigate("/profile/new")}>
          <div className="home-dark__add-icon">+</div>
          <div className="home-dark__add-label">Add dog</div>
        </div>
      </div>
    </div>
  );
}
