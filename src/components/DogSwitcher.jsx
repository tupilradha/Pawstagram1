// src/components/DogSwitcher.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { deleteDog } from "../db/db";

export default function DogSwitcher() {
  const { dogs, activeDog, activeDogId, setActiveDogId, refreshDogs } = useDog();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSelect(id) {
    setActiveDogId(id);
    setOpen(false);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this dog and all their records?")) return;
    deleteDog(id);
    refreshDogs();
    setOpen(false);
  }

  function handleAddNew() {
    setOpen(false);
    navigate("/profile/new");
  }

  if (dogs.length === 0) return null;

  return (
    <div className="dog-switcher">
      <button className="dog-switcher__trigger" onClick={() => setOpen(o => !o)}>
        <span className="dog-switcher__avatar">
          {activeDog?.photoUrl
            ? <img src={activeDog.photoUrl} alt={activeDog.name} />
            : <span>{activeDog?.name?.[0] || "🐾"}</span>
          }
        </span>
        <span className="dog-switcher__name">{activeDog?.name || "Select dog"}</span>
        <span className="dog-switcher__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="dog-switcher__backdrop" onClick={() => setOpen(false)} />
          <div className="dog-switcher__menu">
            {dogs.map(dog => (
              <div
                key={dog.id}
                className={`dog-switcher__option ${dog.id === activeDogId ? "dog-switcher__option--active" : ""}`}
                onClick={() => handleSelect(dog.id)}
              >
                <span className="dog-switcher__option-avatar">
                  {dog.photoUrl
                    ? <img src={dog.photoUrl} alt={dog.name} />
                    : <span>{dog.name?.[0] || "🐾"}</span>
                  }
                </span>
                <span className="dog-switcher__option-info">
                  <span className="dog-switcher__option-name">{dog.name}</span>
                  <span className="dog-switcher__option-meta">{dog.breed}{dog.age ? ` · ${dog.age} yrs` : ""}</span>
                </span>
                {dog.id === activeDogId && <span className="dog-switcher__check">✓</span>}
                {dogs.length > 1 && (
                  <button
                    className="dog-switcher__delete"
                    onClick={e => handleDelete(e, dog.id)}
                    title="Delete dog"
                  >✕</button>
                )}
              </div>
            ))}
            <div className="dog-switcher__divider" />
            <button className="dog-switcher__add" onClick={handleAddNew}>
              + Add new dog
            </button>
          </div>
        </>
      )}
    </div>
  );
}
