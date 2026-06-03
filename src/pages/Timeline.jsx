// src/pages/Timeline.jsx
import { useEffect, useState } from "react";
import { useDog } from "../context/DogContext";
import { getVetVisits, getVaccines, getMedications, getSymptoms } from "../db/db";

const SEVERITY_COLOR = { mild: "var(--green)", moderate: "var(--yellow)", severe: "var(--red)" };

function buildTimeline(dogId) {
  const events = [];

  getVetVisits(dogId).forEach(v => events.push({
    id: v.id, date: v.date, type: "vet",
    icon: "🏥", title: v.reason || "Vet Visit",
    sub: [v.clinic, v.vet].filter(Boolean).join(" · "),
    notes: v.notes, color: "#38bdf8",
  }));

  getVaccines(dogId).forEach(v => events.push({
    id: v.id, date: v.dateGiven, type: "vaccine",
    icon: "💉", title: v.name || "Vaccine",
    sub: v.nextDueDate ? `Next due: ${v.nextDueDate}` : "",
    color: "#a78bfa",
  }));

  getMedications(dogId).forEach(m => events.push({
    id: m.id, date: m.startDate, type: "medication",
    icon: "💊", title: m.name || "Medication",
    sub: [m.dosage, m.frequency].filter(Boolean).join(" · "),
    color: "#4ade80",
  }));

  getSymptoms(dogId).forEach(s => events.push({
    id: s.id, date: s.date, type: "symptom",
    icon: "📝", title: s.description || "Symptom",
    sub: s.severity ? `Severity: ${s.severity}` : "",
    color: SEVERITY_COLOR[s.severity] || "var(--text-muted)",
    severity: s.severity,
  }));

  return events
    .filter(e => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

const TYPE_FILTERS = [
  { key: "all",        label: "All"      },
  { key: "vet",        label: "🏥 Vet"   },
  { key: "vaccine",    label: "💉 Vacc"  },
  { key: "medication", label: "💊 Meds"  },
  { key: "symptom",    label: "📝 Symp"  },
];

export default function Timeline() {
  const { activeDogId, activeDog } = useDog();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (activeDogId) setEvents(buildTimeline(activeDogId));
  }, [activeDogId]);

  const filtered = events.filter(e => {
    const matchType  = filter === "all" || e.type === filter;
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) ||
                       (e.sub || "").toLowerCase().includes(query.toLowerCase()) ||
                       (e.notes || "").toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  // Group by year-month
  const grouped = filtered.reduce((acc, e) => {
    const key = e.date ? e.date.slice(0, 7) : "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">📊 Timeline</h1>
        {activeDog && (
          <button
            className="tl-export-btn"
            onClick={() => exportJSON(activeDog, events)}
            title="Export health records"
          >
            ⬇ Export
          </button>
        )}
      </header>

      {activeDog && <p className="page__dog-label">for {activeDog.name}</p>}

      {/* Search */}
      <input
        className="form__input"
        placeholder="🔍 Search records..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {/* Filter chips */}
      <div className="filter-chips">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? "filter-chip--active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <p className="empty-state__text">
            {query ? "No records match your search." : "No health records yet."}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="timeline">
        {Object.entries(grouped).map(([month, evts]) => (
          <div key={month} className="timeline__group">
            <div className="timeline__month-label">
              {formatMonth(month)}
            </div>
            {evts.map((e, i) => (
              <div key={e.id} className="timeline__item">
                <div className="timeline__line-wrap">
                  <div className="timeline__dot" style={{ background: e.color }} />
                  {i < evts.length - 1 && <div className="timeline__line" />}
                </div>
                <div className="timeline__content">
                  <div className="timeline__header">
                    <span className="timeline__icon">{e.icon}</span>
                    <span className="timeline__title">{e.title}</span>
                    <span className="timeline__date">{formatDate(e.date)}</span>
                  </div>
                  {e.sub && <p className="timeline__sub">{e.sub}</p>}
                  {e.notes && <p className="timeline__notes">{e.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMonth(str) {
  if (!str || str === "Unknown") return "Unknown";
  const [y, m] = str.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function formatDate(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function exportJSON(dog, events) {
  const data = {
    exportedAt: new Date().toISOString(),
    dog: { name: dog.name, breed: dog.breed, age: dog.age },
    totalRecords: events.length,
    records: events,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${dog.name || "dog"}-health-records.json`;
  a.click();
  URL.revokeObjectURL(url);
}
