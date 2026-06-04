// src/pages/Vaccines.jsx
import { useState, useEffect } from "react";
import { getVaccines, saveVaccine, deleteVaccine } from "../db/db";
import { useDog } from "../context/DogContext";
import { validateVaccineForm } from "../utils/validate";
import FieldError from "../components/FieldError";

const EMPTY_FORM = { name: "", dateGiven: "", nextDueDate: "" };

function getStatus(nextDueDate) {
  if (!nextDueDate) return "ok";
  const today = new Date();
  const due = new Date(nextDueDate);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "upcoming";
  return "ok";
}

const STATUS_BADGE = {
  overdue:  { label: "Overdue",    cls: "badge badge--red"    },
  upcoming: { label: "Due Soon",   cls: "badge badge--yellow" },
  ok:       { label: "Up to date", cls: "badge badge--green"  },
};

export default function Vaccines() {
  const { activeDogId, activeDog } = useDog();
  const [vaccines, setVaccines] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [adding, setAdding]     = useState(false);

  useEffect(() => {
    if (activeDogId) setVaccines(getVaccines(activeDogId));
  }, [activeDogId]);

  function handleSave() {
    const { valid, errors: errs } = validateVaccineForm(form);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    saveVaccine({ ...form, dogId: activeDogId });
    setVaccines(getVaccines(activeDogId));
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function handleCancel() {
    setAdding(false);
    setErrors({});
    setForm(EMPTY_FORM);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this vaccine record?")) return;
    deleteVaccine(id);
    setVaccines(getVaccines(activeDogId));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">💉 Vaccines</h1>
        {!adding && <button className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>+ Add</button>}
      </header>
      {activeDog && <p className="page__dog-label">for {activeDog.name}</p>}

      {adding && (
        <div className="card">
          <h2 className="card__title">New Vaccine</h2>
          <div className="form">
            <label className="form__label">Vaccine Name *</label>
            <input className={`form__input ${errors.name ? "form__input--error" : ""}`}
              value={form.name} maxLength={100}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rabies, Parvovirus" />
            <FieldError msg={errors.name} />

            <label className="form__label">Date Given</label>
            <input className={`form__input ${errors.dateGiven ? "form__input--error" : ""}`}
              type="date" value={form.dateGiven} max={today}
              onChange={e => setForm({ ...form, dateGiven: e.target.value })} />
            <FieldError msg={errors.dateGiven} />

            <label className="form__label">Next Due Date</label>
            <input className={`form__input ${errors.nextDueDate ? "form__input--error" : ""}`}
              type="date" value={form.nextDueDate}
              min={form.dateGiven || today}
              onChange={e => setForm({ ...form, nextDueDate: e.target.value })} />
            <FieldError msg={errors.nextDueDate} />

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {vaccines.length === 0 && !adding && (
        <div className="empty-state">
          <div className="empty-state__icon">💉</div>
          <p className="empty-state__text">No vaccines recorded yet.</p>
        </div>
      )}

      <div className="list">
        {vaccines.map(v => {
          const status = getStatus(v.nextDueDate);
          const badge  = STATUS_BADGE[status];
          return (
            <div key={v.id} className="list-item">
              <div className="list-item__header">
                <span className="list-item__title">{v.name}</span>
                <span className={badge.cls}>{badge.label}</span>
              </div>
              <p className="list-item__sub">Given: {v.dateGiven || "—"} · Due: {v.nextDueDate || "—"}</p>
              <button className="btn btn--danger btn--xs" onClick={() => handleDelete(v.id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
