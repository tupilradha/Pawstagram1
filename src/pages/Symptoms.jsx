// src/pages/Symptoms.jsx
import { useState, useEffect } from "react";
import { getSymptoms, saveSymptom, deleteSymptom } from "../db/db";
import { useDog } from "../context/DogContext";
import { validateSymptomForm } from "../utils/validate";
import FieldError from "../components/FieldError";

const EMPTY_FORM = { date: "", description: "", severity: "mild" };

const SEVERITY = {
  mild:     { label: "Mild",     cls: "badge badge--green"  },
  moderate: { label: "Moderate", cls: "badge badge--yellow" },
  severe:   { label: "Severe",   cls: "badge badge--red"    },
};

export default function Symptoms() {
  const { activeDogId, activeDog } = useDog();
  const [symptoms, setSymptoms] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [adding, setAdding]     = useState(false);

  useEffect(() => {
    if (activeDogId) setSymptoms(getSymptoms(activeDogId));
  }, [activeDogId]);

  function handleSave() {
    const { valid, errors: errs } = validateSymptomForm(form);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    saveSymptom({ ...form, dogId: activeDogId });
    setSymptoms(getSymptoms(activeDogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleCancel() {
    setAdding(false);
    setErrors({});
    setForm(EMPTY_FORM);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this symptom record?")) return;
    deleteSymptom(id);
    setSymptoms(getSymptoms(activeDogId));
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">📝 Symptoms</h1>
        {!adding && <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>}
      </header>
      {activeDog && <p className="page__dog-label">for {activeDog.name}</p>}

      {adding && (
        <div className="card">
          <h2 className="card__title">Log Symptom</h2>
          <div className="form">
            <label className="form__label">Date *</label>
            <input className={`form__input ${errors.date ? "form__input--error" : ""}`}
              type="date" value={form.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setForm({ ...form, date: e.target.value })} />
            <FieldError msg={errors.date} />

            <label className="form__label">Description *</label>
            <textarea className={`form__textarea ${errors.description ? "form__input--error" : ""}`}
              value={form.description} maxLength={300}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the symptom or observation..." rows={3} />
            <div className="form__char-count">{form.description.length}/300</div>
            <FieldError msg={errors.description} />

            <label className="form__label">Severity</label>
            <div className="radio-group">
              {["mild", "moderate", "severe"].map(s => (
                <label key={s} className={`radio-option ${form.severity === s ? "radio-option--active" : ""}`}>
                  <input type="radio" name="severity" value={s}
                    checked={form.severity === s}
                    onChange={() => setForm({ ...form, severity: s })} />
                  {SEVERITY[s].label}
                </label>
              ))}
            </div>

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {symptoms.length === 0 && !adding && (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <p className="empty-state__text">No symptoms logged yet.</p>
        </div>
      )}

      <div className="list">
        {symptoms.map(s => {
          const sev = SEVERITY[s.severity] || SEVERITY.mild;
          return (
            <div key={s.id} className="list-item">
              <div className="list-item__header">
                <span className="list-item__date">{s.date}</span>
                <span className={sev.cls}>{sev.label}</span>
              </div>
              <p className="list-item__notes">{s.description}</p>
              <button className="btn btn--danger btn--xs" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
