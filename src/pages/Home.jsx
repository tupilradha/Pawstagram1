// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { getVetVisits, getVaccines, getMedications, getSymptoms } from "../db/db";

function getVaccineStatus(vaccines) {
  const today = new Date();
  const overdue = vaccines.filter(v => v.nextDueDate && new Date(v.nextDueDate) < today).length;
  const upcoming = vaccines.filter(v => {
    if (!v.nextDueDate) return false;
    const diff = (new Date(v.nextDueDate) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;
  return { overdue, upcoming };
}

function isActiveMed(med) {
  if (!med.endDate) return true;
  return new Date(med.endDate) >= new Date();
}

export default function Home() {
  const { activeDog, activeDogId, dogs } = useDog();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!activeDogId) return;
    const visits   = getVetVisits(activeDogId);
    const vaccines = getVaccines(activeDogId);
    const meds     = getMedications(activeDogId);
    const symptoms = getSymptoms(activeDogId);
    const { overdue, upcoming } = getVaccineStatus(vaccines);
    setStats({
      visits:   visits.length,
      vaccines: vaccines.length,
      overdueVaccines: overdue,
      upcomingVaccines: upcoming,
      activeMeds: meds.filter(isActiveMed).length,
      symptoms: symptoms.length,
      lastVisit: visits[0]?.date || null,
    });
  }, [activeDogId]);

  if (dogs.length === 0) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state__icon">🐾</div>
          <p className="empty-state__text">No dogs yet. Add your first dog!</p>
          <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={() => navigate("/profile/new")}>
            + Add Dog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">🐾 Health Journal</h1>
        <button className="btn btn--secondary btn--sm" onClick={() => navigate(`/profile/${activeDogId}`)}>
          Edit
        </button>
      </header>

      {activeDog && (
        <>
          {/* Dog card */}
          <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
            <div className="profile-avatar">
              {activeDog.photoUrl
                ? <img src={activeDog.photoUrl} alt={activeDog.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : <span>{activeDog.name?.[0] || "🐾"}</span>
              }
            </div>
            <h2 className="profile-name">{activeDog.name}</h2>
            {(activeDog.breed || activeDog.age) && (
              <p className="profile-meta">
                {activeDog.breed}{activeDog.breed && activeDog.age ? " · " : ""}{activeDog.age ? `${activeDog.age} yrs` : ""}
              </p>
            )}
            {activeDog.bio && <p className="profile-bio">{activeDog.bio}</p>}
          </div>

          {/* Stats grid */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card" onClick={() => navigate("/vet-visits")}>
                <span className="stat-card__icon">🏥</span>
                <span className="stat-card__value">{stats.visits}</span>
                <span className="stat-card__label">Vet Visits</span>
                {stats.lastVisit && <span className="stat-card__sub">Last: {stats.lastVisit}</span>}
              </div>

              <div className="stat-card" onClick={() => navigate("/vaccines")}>
                <span className="stat-card__icon">💉</span>
                <span className="stat-card__value">{stats.vaccines}</span>
                <span className="stat-card__label">Vaccines</span>
                {stats.overdueVaccines > 0
                  ? <span className="stat-card__sub stat-card__sub--red">{stats.overdueVaccines} overdue</span>
                  : stats.upcomingVaccines > 0
                  ? <span className="stat-card__sub stat-card__sub--yellow">{stats.upcomingVaccines} due soon</span>
                  : <span className="stat-card__sub stat-card__sub--green">All up to date</span>
                }
              </div>

              <div className="stat-card" onClick={() => navigate("/medications")}>
                <span className="stat-card__icon">💊</span>
                <span className="stat-card__value">{stats.activeMeds}</span>
                <span className="stat-card__label">Active Meds</span>
              </div>

              <div className="stat-card" onClick={() => navigate("/symptoms")}>
                <span className="stat-card__icon">📝</span>
                <span className="stat-card__value">{stats.symptoms}</span>
                <span className="stat-card__label">Symptoms</span>
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn btn--secondary" style={{ width: "100%", marginTop: 16 }}
        onClick={() => navigate("/profile/new")}>
        + Add Another Dog
      </button>
    </div>
  );
}
