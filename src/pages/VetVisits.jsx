// src/pages/VetVisits.jsx
import { useState, useEffect } from "react";
import { getVetVisits, saveVetVisit, deleteVetVisit } from "../db/db";
import { useDog } from "../context/DogContext";
import { validateVetVisitForm } from "../utils/validate";
import FieldError from "../components/FieldError";

const EMPTY_FORM = { date: "", clinic: "", vet: "", reason: "", notes: "" };

export default function VetVisits() {
  const { activeDogId, activeDog } = useDog();
  const [visits, setVisits]   = useState([]);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    if (activeDogId) setVisits(getVetVisits(activeDogId));
  }, [activeDogId]);

  function handleSave() {
    const { valid, errors: errs } = validateVetVisitForm(form);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    saveVetVisit({ ...form, dogId: activeDogId });
    setVisits(getVetVisits(activeDogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleCancel() {
    setAdding(false);
    setErrors({});
    setForm(EMPTY_FORM);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this vet visit?")) return;
    deleteVetVisit(id);
    setVisits(getVetVisits(activeDogId));
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">🏥 Vet Visits</h1>
        {!adding && <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>}
      </header>
      {activeDog && <p className="page__dog-label">for {activeDog.name}</p>}

      {adding && (
        <div className="card">
          <h2 className="card__title">New Vet Visit</h2>
          <div className="form">
            <label className="form__label">Date *</label>
            <input className={`form__input ${errors.date ? "form__input--error" : ""}`}
              type="date" value={form.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setForm({ ...form, date: e.target.value })} />
            <FieldError msg={errors.date} />

            <label className="form__label">Reason for Visit *</label>
            <input className={`form__input ${errors.reason ? "form__input--error" : ""}`}
              value={form.reason} maxLength={100}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Annual check-up" />
            <FieldError msg={errors.reason} />

            <label className="form__label">Clinic</label>
            <input className={`form__input ${errors.clinic ? "form__input--error" : ""}`}
              value={form.clinic} maxLength={100}
              onChange={e => setForm({ ...form, clinic: e.target.value })}
              placeholder="e.g. Paws & Care Clinic" />
            <FieldError msg={errors.clinic} />

            <label className="form__label">Vet Name</label>
            <input className={`form__input ${errors.vet ? "form__input--error" : ""}`}
              value={form.vet} maxLength={100}
              onChange={e => setForm({ ...form, vet: e.target.value })}
              placeholder="e.g. Dr. Sharma" />
            <FieldError msg={errors.vet} />

            <label className="form__label">Notes</label>
            <textarea className="form__textarea" value={form.notes} maxLength={500}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Diagnosis, prescriptions, follow-ups..." rows={3} />
            <div className="form__char-count">{form.notes.length}/500</div>
            <FieldError msg={errors.notes} />

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={handleCancel}>Cancel</button>
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
