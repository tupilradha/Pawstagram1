// src/pages/Medications.jsx
import { useState, useEffect } from "react";
import { getMedications, saveMedication, deleteMedication } from "../db/db";
import { useDog } from "../context/DogContext";

const EMPTY_FORM = { name: "", dosage: "", frequency: "", startDate: "", endDate: "" };

function isActive(med) {
  if (!med.endDate) return true;
  return new Date(med.endDate) >= new Date();
}

export default function Medications() {
  const { activeDogId, activeDog } = useDog();
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    if (activeDogId) setMeds(getMedications(activeDogId));
  }, [activeDogId]);

  function handleSave() {
    if (!activeDogId) return;
    saveMedication({ ...form, dogId: activeDogId });
    setMeds(getMedications(activeDogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleDelete(id) {
    deleteMedication(id);
    setMeds(getMedications(activeDogId));
  }

  const filtered = meds.filter(m => tab === "active" ? isActive(m) : !isActive(m));

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">💊 Medications</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>
      </header>

      {activeDog && <p className="page__dog-label">for {activeDog.name}</p>}

      <div className="tabs">
        <button className={`tab ${tab === "active" ? "tab--active" : ""}`} onClick={() => setTab("active")}>Active</button>
        <button className={`tab ${tab === "past"   ? "tab--active" : ""}`} onClick={() => setTab("past")}>Past</button>
      </div>

      {adding && (
        <div className="card">
          <h2 className="card__title">New Medication</h2>
          <div className="form">
            <label className="form__label">Medication Name</label>
            <input className="form__input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Amoxicillin" />
            <label className="form__label">Dosage</label>
            <input className="form__input" value={form.dosage}
              onChange={e => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g. 250mg" />
            <label className="form__label">Frequency</label>
            <input className="form__input" value={form.frequency}
              onChange={e => setForm({ ...form, frequency: e.target.value })}
              placeholder="e.g. Twice daily" />
            <label className="form__label">Start Date</label>
            <input className="form__input" type="date" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <label className="form__label">End Date (optional)</label>
            <input className="form__input" type="date" value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <div className="form__actions">
              <button className="btn btn--secondary" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && !adding && (
        <div className="empty-state">
          <div className="empty-state__icon">💊</div>
          <p className="empty-state__text">No {tab} medications.</p>
        </div>
      )}

      <div className="list">
        {filtered.map(m => (
          <div key={m.id} className="list-item">
            <div className="list-item__header">
              <span className="list-item__title">{m.name}</span>
              <span className={`badge ${isActive(m) ? "badge--green" : "badge--gray"}`}>
                {isActive(m) ? "Active" : "Ended"}
              </span>
            </div>
            <p className="list-item__sub">{m.dosage} · {m.frequency}</p>
            <p className="list-item__sub">{m.startDate} → {m.endDate || "ongoing"}</p>
            <button className="btn btn--danger btn--xs" onClick={() => handleDelete(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
