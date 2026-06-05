// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { getVaccines, getMedications } from "../db/db";

function getDogAlerts(dogId) {
  const today = new Date();
  const vaccines = getVaccines(dogId);
  const meds = getMedications(dogId);
  const alerts = [];
  const overdue  = vaccines.filter(v => v.nextDueDate && new Date(v.nextDueDate) < today);
  const upcoming = vaccines.filter(v => { if (!v.nextDueDate) return false; const d = (new Date(v.nextDueDate)-today)/(86400000); return d>=0&&d<=30; });
  const activeMeds = meds.filter(m => !m.endDate || new Date(m.endDate) >= today);
  if (overdue.length)    alerts.push({ type:"red",   label:`${overdue.length} vaccine${overdue.length>1?"s":""} overdue` });
  if (upcoming.length)   alerts.push({ type:"amber", label:`${upcoming.length} vaccine${upcoming.length>1?"s":""} due soon` });
  if (activeMeds.length) alerts.push({ type:"amber", label:`${activeMeds.length} active med${activeMeds.length>1?"s":""}` });
  if (!alerts.length)    alerts.push({ type:"green", label:"All clear" });
  return alerts;
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

const AVATAR_COLORS = [
  { bg:"#26215C", color:"#AFA9EC" }, { bg:"#04342C", color:"#5DCAA5" },
  { bg:"#4A1B0C", color:"#F0997B" }, { bg:"#042C53", color:"#85B7EB" },
  { bg:"#412402", color:"#FAC775" }, { bg:"#173404", color:"#97C459" },
];

export default function Home() {
  const { dogs, activeDogId, setActiveDogId } = useDog();
  const navigate = useNavigate();
  const [dogAlerts, setDogAlerts] = useState({});

  useEffect(() => {
    const map = {};
    dogs.forEach(d => { map[d.id] = getDogAlerts(d.id); });
    setDogAlerts(map);
  }, [dogs]);

  const globalAlerts = dogs.flatMap(d =>
    (dogAlerts[d.id]||[]).filter(a=>a.type!=="green").map(a=>`${d.name}'s ${a.label}`)
  );

  if (dogs.length === 0) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state__icon">🐾</div>
          <p className="empty-state__text">No dogs yet. Add your first dog!</p>
          <button className="btn btn--primary" style={{ marginTop:12 }} onClick={() => navigate("/profile/new")}>+ Add Dog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-dark">
      <div className="home-dark__header">
        <div>
          <h1 className="home-dark__title">PawLog 🐾</h1>
          <p className="home-dark__date">{formatDate()}</p>
        </div>
        <button className="home-dark__add-btn" onClick={() => navigate("/profile/new")} aria-label="Add dog">+</button>
      </div>

      {globalAlerts.length > 0 && (
        <div className="home-dark__alert">
          <span className="home-dark__alert-icon">⚠️</span>
          <div>
            <div className="home-dark__alert-title">{globalAlerts.length} thing{globalAlerts.length>1?"s":""} need attention</div>
            <div className="home-dark__alert-sub">{globalAlerts.slice(0,3).join(" · ")}{globalAlerts.length>3?` · +${globalAlerts.length-3} more`:""}</div>
          </div>
        </div>
      )}

      <div className="home-dark__section-label">{dogs.length} dog{dogs.length>1?"s":""}</div>

      <div className="home-dark__grid">
        {dogs.map((dog, i) => {
          const isActive = dog.id === activeDogId;
          const alerts   = dogAlerts[dog.id] || [];
          const av       = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div key={dog.id} className={`home-dark__card ${isActive ? "home-dark__card--active" : ""}`}
              onClick={() => { setActiveDogId(dog.id); navigate(`/profile/${dog.id}`); }}>
              {isActive && <div className="home-dark__active-pill"><span className="home-dark__active-dot"/>Active</div>}
              <div className="home-dark__avatar" style={{ background: av.bg, color: av.color }}>
                {dog.photoUrl
                  ? <img src={dog.photoUrl} alt={dog.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                  : (dog.name?.[0]?.toUpperCase() || "?")}
              </div>
              <div className="home-dark__dog-name">{dog.name}</div>
              <div className="home-dark__dog-meta">{[dog.breed, dog.age?`${dog.age} yrs`:""].filter(Boolean).join(" · ") || "No details"}</div>
              <div className="home-dark__badges">
                {alerts.map((a,j) => <span key={j} className={`home-dark__badge home-dark__badge--${a.type}`}>{a.label}</span>)}
              </div>
            </div>
          );
        })}
        <div className="home-dark__add-card" onClick={() => navigate("/profile/new")}>
          <div className="home-dark__add-icon">+</div>
          <div className="home-dark__add-label">Add dog</div>
        </div>
      </div>
    </div>
  );
}
