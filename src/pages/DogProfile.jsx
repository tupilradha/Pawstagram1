// src/pages/DogProfile.jsx
import { useState, useEffect } from "react";
import { getDogs, saveDog } from "../db/db";

export default function DogProfile() {
  const [dogs, setDogs] = useState([]);
  const [form, setForm] = useState({ name: "", breed: "", age: "", bio: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDogs(getDogs());
  }, []);

  const dog = dogs[0] || null;

  function handleSave() {
    saveDog(dog ? { ...form, id: dog.id } : form);
    setDogs(getDogs());
    setEditing(false);
  }

  function handleEdit() {
    if (dog) setForm({ name: dog.name, breed: dog.breed, age: dog.age, bio: dog.bio || "" });
    setEditing(true);
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">🐶 Dog Profile</h1>
      </header>

      {!editing && dog && (
        <div className="card">
          <div className="profile-avatar">{dog.name?.[0] || "🐾"}</div>
          <h2 className="profile-name">{dog.name}</h2>
          <p className="profile-meta">{dog.breed} · {dog.age} yrs old</p>
          {dog.bio && <p className="profile-bio">{dog.bio}</p>}
          <button className="btn btn--primary" onClick={handleEdit}>Edit Profile</button>
        </div>
      )}

      {!editing && !dog && (
        <div className="empty-state">
          <div className="empty-state__icon">🐾</div>
          <p className="empty-state__text">No dog profile yet.</p>
          <button className="btn btn--primary" onClick={() => setEditing(true)}>
            Add Your Dog
          </button>
        </div>
      )}

      {editing && (
        <div className="card">
          <h2 className="card__title">{dog ? "Edit Profile" : "Add Your Dog"}</h2>
          <div className="form">
            <label className="form__label">Name</label>
            <input className="form__input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Buddy" />

            <label className="form__label">Breed</label>
            <input className="form__input" value={form.breed}
              onChange={e => setForm({ ...form, breed: e.target.value })}
              placeholder="e.g. Labrador Retriever" />

            <label className="form__label">Age (years)</label>
            <input className="form__input" type="number" value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              placeholder="e.g. 3" />

            <label className="form__label">Bio / Notes</label>
            <textarea className="form__textarea" value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Anything special about your dog..." rows={3} />

            <div className="form__actions">
              <button className="btn btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
