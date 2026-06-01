// src/pages/Symptoms.jsx
import { useState, useEffect } from "react";
import { getSymptoms, saveSymptom, deleteSymptom, getDogs } from "../db/db";

const EMPTY_FORM = { date: "", description: "", severity: "mild" };

const SEVERITY = {
  mild:     { label: "Mild",     cls: "badge badge--green"  },
  moderate: { label: "Moderate", cls: "badge badge--yellow" },
  severe:   { label: "Severe",   cls: "badge badge--red"    },
};

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [dogId, setDogId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const dogs = getDogs();
    if (dogs[0]) {
      setDogId(dogs[0].id);
      setSymptoms(getSymptoms(dogs[0].id));
    }
  }, []);

  function handleSave() {
    if (!dogId) return;
    saveSymptom({ ...form, dogId });
    setSymptoms(getSymptoms(dogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleDelete(id) {
    deleteSymptom(id);
    setSymptoms(getSymptoms(dogId));
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">📝 Symptoms</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>
      </header>

      {adding && (
        <div className="card">
          <h2 className="card__title">Log Symptom</h2>
          <div className="form">
            <label className="form__label">Date</label>
            <input className="form__input" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />

            <label className="form__label">Description</label>
            <textarea className="form__textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the symptom or observation..."
              rows={3} />

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
              <button className="btn btn--secondary" onClick={() => setAdding(false)}>Cancel</button>
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
