import Footer from "../components/Footer";
// src/pages/Vaccines.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVaccines, saveVaccine, deleteVaccine, getDog, isDuplicateVaccine } from "../db/db";
import { validateVaccineForm } from "../utils/validate";
import FieldError from "../components/FieldError";

const EMPTY = { name: "", dateGiven: "", nextDueDate: "" };

function getStatus(nextDueDate) {
  if (!nextDueDate) return "ok";
  const diff = (new Date(nextDueDate) - new Date()) / 86400000;
  if (diff < 0)   return "overdue";
  if (diff <= 30) return "upcoming";
  return "ok";
}

const BADGE = {
  overdue:  { label: "Overdue",    cls: "badge badge--red"    },
  upcoming: { label: "Due Soon",   cls: "badge badge--yellow" },
  ok:       { label: "Up to date", cls: "badge badge--green"  },
};

export default function Vaccines() {
  const { id: dogId } = useParams();
  const navigate = useNavigate();
  const dog = getDog(dogId);
  const [vaccines, setVaccines] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { setVaccines(getVaccines(dogId)); }, [dogId]);

  const today = new Date().toISOString().split("T")[0];

  function handleAdd()    { setForm(EMPTY); setErrors({}); setEditingId("new"); }
  function handleEdit(v)  { setForm({ name:v.name, dateGiven:v.dateGiven, nextDueDate:v.nextDueDate }); setErrors({}); setEditingId(v.id); }
  function handleCancel() { setEditingId(null); setErrors({}); setForm(EMPTY); }

  function handleSave() {
    const { valid, errors: errs } = validateVaccineForm(form);
    if (!valid) { setErrors(errs); return; }

    const excludeId = editingId === "new" ? null : editingId;
    if (isDuplicateVaccine(dogId, form.name, form.dateGiven, excludeId)) {
      setErrors({ name: `${dog?.name || "This dog"} already has "${form.name}" recorded on ${form.dateGiven}.` });
      return;
    }

    saveVaccine({ ...form, dogId, ...(editingId !== "new" ? { id: editingId } : {}) });
    setVaccines(getVaccines(dogId));
    setEditingId(null); setForm(EMPTY); setErrors({});
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this vaccine record?")) return;
    deleteVaccine(id);
    setVaccines(getVaccines(dogId));
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(`/dog/${dogId}`)}>← {dog?.name || "Back"}</button>
      <header className="page__header">
        <h1 className="page__title">💉 Vaccines</h1>
        {!editingId && <button className="btn btn--primary btn--sm" onClick={handleAdd}>+ Add</button>}
      </header>

      {editingId && (
        <div className="card">
          <h2 className="card__title">{editingId === "new" ? "New Vaccine" : "Edit Vaccine"}</h2>
          <div className="form">
            <label className="form__label">Vaccine Name *</label>
            <input className={`form__input ${errors.name ? "form__input--error" : ""}`} value={form.name} maxLength={100} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Rabies" />
            <FieldError msg={errors.name} />

            <label className="form__label">Date Given</label>
            <input className={`form__input ${errors.dateGiven ? "form__input--error" : ""}`} type="date" value={form.dateGiven} max={today} onChange={e => setForm({...form, dateGiven: e.target.value})} />
            <FieldError msg={errors.dateGiven} />

            <label className="form__label">Next Due Date</label>
            <input className={`form__input ${errors.nextDueDate ? "form__input--error" : ""}`} type="date" value={form.nextDueDate} min={form.dateGiven || today} onChange={e => setForm({...form, nextDueDate: e.target.value})} />
            <FieldError msg={errors.nextDueDate} />

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>{editingId === "new" ? "Save" : "Update"}</button>
            </div>
          </div>
        </div>
      )}

      {vaccines.length === 0 && !editingId && (
        <div className="empty-state"><div className="empty-state__icon">💉</div><p className="empty-state__text">No vaccines recorded yet.</p></div>
      )}

      <div className="list">
        {vaccines.map(v => {
          const badge = BADGE[getStatus(v.nextDueDate)];
          return (
            <div key={v.id} className="list-item">
              <div className="list-item__header">
                <span className="list-item__title">{v.name}</span>
                <span className={badge.cls}>{badge.label}</span>
              </div>
              <p className="list-item__sub">Given: {v.dateGiven || "—"} · Due: {v.nextDueDate || "—"}</p>
              <div className="list-item__actions">
                <button className="btn btn--secondary btn--xs" onClick={() => handleEdit(v)}>Edit</button>
                <button className="btn btn--danger btn--xs" onClick={() => handleDelete(v.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
          <Footer />
    </div>
  );
}
