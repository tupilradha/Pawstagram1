// src/pages/VetVisits.jsx
import { useState, useEffect } from "react";
import { getVetVisits, saveVetVisit, deleteVetVisit, getDogs } from "../db/db";

const EMPTY_FORM = { date: "", clinic: "", vet: "", reason: "", notes: "" };

export default function VetVisits() {
  const [visits, setVisits] = useState([]);
  const [dogId, setDogId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const dogs = getDogs();
    if (dogs[0]) {
      setDogId(dogs[0].id);
      setVisits(getVetVisits(dogs[0].id));
    }
  }, []);

  function handleSave() {
    if (!dogId) return;
    saveVetVisit({ ...form, dogId });
    setVisits(getVetVisits(dogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleDelete(id) {
    deleteVetVisit(id);
    setVisits(getVetVisits(dogId));
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">🏥 Vet Visits</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>
      </header>

      {adding && (
        <div className="card">
          <h2 className="card__title">New Vet Visit</h2>
          <div className="form">
            <label className="form__label">Date</label>
            <input className="form__input" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />

            <label className="form__label">Clinic</label>
            <input className="form__input" value={form.clinic}
              onChange={e => setForm({ ...form, clinic: e.target.value })}
              placeholder="e.g. Paws & Care Clinic" />

            <label className="form__label">Vet Name</label>
            <input className="form__input" value={form.vet}
              onChange={e => setForm({ ...form, vet: e.target.value })}
              placeholder="e.g. Dr. Sharma" />

            <label className="form__label">Reason for Visit</label>
            <input className="form__input" value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Annual check-up" />

            <label className="form__label">Notes</label>
            <textarea className="form__textarea" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Diagnosis, prescriptions, follow-ups..." rows={3} />

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {visits.length === 0 && !adding && (
        <div className="empty-state">
          <div className="empty-state__icon">🏥</div>
          <p className="empty-state__text">No vet visits logged yet.</p>
        </div>
      )}

      <div className="list">
        {visits.map(v => (
          <div key={v.id} className="list-item">
            <div className="list-item__header">
              <span className="list-item__title">{v.reason || "Visit"}</span>
              <span className="list-item__date">{v.date}</span>
            </div>
            <p className="list-item__sub">{v.clinic}{v.vet ? ` · ${v.vet}` : ""}</p>
            {v.notes && <p className="list-item__notes">{v.notes}</p>}
            <button className="btn btn--danger btn--xs" onClick={() => handleDelete(v.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
