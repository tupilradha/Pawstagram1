// src/pages/DogProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveDog, getDog } from "../db/db";
import { useDog } from "../context/DogContext";

export default function DogProfile() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { refreshDogs, setActiveDogId } = useDog();

  const [form, setForm] = useState({ name: "", breed: "", age: "", bio: "", photoUrl: "" });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isNew && id) {
      const dog = getDog(id);
      if (dog) {
        setForm({ name: dog.name || "", breed: dog.breed || "", age: dog.age || "", bio: dog.bio || "", photoUrl: dog.photoUrl || "" });
        setPreview(dog.photoUrl || null);
      }
    }
  }, [id, isNew]);

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPreview(ev.target.result);
      setForm(f => ({ ...f, photoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.name.trim()) return alert("Please enter a name for your dog.");
    const saved = { ...form, ...(isNew ? {} : { id }) };
    saveDog(saved);
    refreshDogs();
    if (isNew) {
      const dogs = JSON.parse(localStorage.getItem("dog-health-db") || "{}").dogs || [];
      const newest = dogs[dogs.length - 1];
      if (newest) setActiveDogId(newest.id);
    }
    navigate("/");
  }

  return (
    <div className="page">
      <header className="page__header">
        <button className="btn-back" onClick={() => navigate("/")}>← Back</button>
        <h1 className="page__title">{isNew ? "Add Dog" : "Edit Profile"}</h1>
        <div style={{ width: 60 }} />
      </header>

      <div className="card">
        {/* Photo upload */}
        <div className="photo-upload">
          <div className="photo-upload__preview">
            {preview
              ? <img src={preview} alt="Dog" />
              : <span className="photo-upload__placeholder">🐾</span>
            }
          </div>
          <label className="btn btn--secondary btn--sm" style={{ cursor: "pointer" }}>
            {preview ? "Change Photo" : "Upload Photo"}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
          </label>
        </div>

        <div className="form" style={{ marginTop: 20 }}>
          <label className="form__label">Name *</label>
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

          <button className="btn btn--primary" style={{ marginTop: 8 }} onClick={handleSave}>
            {isNew ? "Add Dog" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
