import Footer from "../components/Footer";
// src/pages/DogDetail.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { getVetVisits, getVaccines, getMedications, getSymptoms } from "../db/db";

const AVATAR_COLORS = [
  { bg: "#26215C", color: "#AFA9EC" },
  { bg: "#04342C", color: "#5DCAA5" },
  { bg: "#4A1B0C", color: "#F0997B" },
  { bg: "#042C53", color: "#85B7EB" },
  { bg: "#412402", color: "#FAC775" },
  { bg: "#173404", color: "#97C459" },
];

function getStatus(vaccines) {
  const today = new Date();
  const overdue = vaccines.filter(v => v.nextDueDate && new Date(v.nextDueDate) < today);
  const upcoming = vaccines.filter(v => {
    if (!v.nextDueDate) return false;
    return (new Date(v.nextDueDate) - today) / 86400000 <= 30;
  });
  if (overdue.length)  return { label: `${overdue.length} overdue`, cls: "detail-tile__status--red" };
  if (upcoming.length) return { label: `${upcoming.length} due soon`, cls: "detail-tile__status--amber" };
  return { label: "All up to date", cls: "detail-tile__status--green" };
}

function isActive(med) {
  return !med.endDate || new Date(med.endDate) >= new Date();
}

export default function DogDetail() {
  const { id } = useParams();
  const { dogs } = useDog();
  const navigate = useNavigate();

  const dogIndex = dogs.findIndex(d => d.id === id);
  const dog = dogs[dogIndex] || null;

  if (!dog) {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="empty-state__text">Dog not found.</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>← Home</button>
        </div>
      </div>
    );
  }

  const av        = AVATAR_COLORS[dogIndex % AVATAR_COLORS.length];
  const visits    = getVetVisits(id);
  const vaccines  = getVaccines(id);
  const meds      = getMedications(id);
  const symptoms  = getSymptoms(id);
  const activeMeds = meds.filter(isActive);
  const vacStatus = getStatus(vaccines);

  const tiles = [
    {
      icon: "🏥",
      label: "Vet Visits",
      count: visits.length,
      sub: visits[0] ? `Last: ${visits[0].date}` : "No visits yet",
      path: `/dog/${id}/vet-visits`,
    },
    {
      icon: "💉",
      label: "Vaccines",
      count: vaccines.length,
      sub: vacStatus.label,
      subCls: vacStatus.cls,
      path: `/dog/${id}/vaccines`,
    },
    {
      icon: "💊",
      label: "Medications",
      count: activeMeds.length,
      sub: activeMeds.length > 0 ? "Active" : "None active",
      path: `/dog/${id}/timeline`,
    },
    {
      icon: "📊",
      label: "Full Timeline",
      count: visits.length + vaccines.length + meds.length + symptoms.length,
      sub: "All records",
      path: `/dog/${id}/timeline`,
    },
  ];

  return (
    <div className="page">
      {/* Back */}
      <button className="btn-back" onClick={() => navigate("/")}>← All Dogs</button>

      {/* Dog card */}
      <div className="detail-profile">
        <div className="detail-profile__avatar" style={{ background: av.bg, color: av.color }}>
          {dog.photoUrl
            ? <img src={dog.photoUrl} alt={dog.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            : dog.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="detail-profile__info">
          <h1 className="detail-profile__name">{dog.name}</h1>
          <p className="detail-profile__meta">
            {[dog.breed, dog.age ? `${dog.age} yrs` : ""].filter(Boolean).join(" · ") || "No details"}
          </p>
          {dog.bio && <p className="detail-profile__bio">{dog.bio}</p>}
        </div>
        <button className="detail-profile__edit" onClick={() => navigate(`/profile/${id}`)}>Edit</button>
      </div>

      {/* Health section tiles */}
      <div className="detail-tiles">
        {tiles.map(t => (
          <div key={t.label} className="detail-tile" onClick={() => navigate(t.path)}>
            <span className="detail-tile__icon">{t.icon}</span>
            <div className="detail-tile__body">
              <span className="detail-tile__label">{t.label}</span>
              <span className={`detail-tile__status ${t.subCls || ""}`}>{t.sub}</span>
            </div>
            <span className="detail-tile__count">{t.count}</span>
            <span className="detail-tile__arrow">›</span>
          </div>
        ))}
      </div>
          <Footer />
    </div>
  );
}
