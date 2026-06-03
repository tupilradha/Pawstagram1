// src/pages/MyDogs.jsx
import { useNavigate } from "react-router-dom";
import { useDog } from "../context/DogContext";
import { deleteDog } from "../db/db";

export default function MyDogs() {
  const { dogs, activeDogId, setActiveDogId, refreshDogs } = useDog();
  const navigate = useNavigate();

  function handleSelect(id) {
    setActiveDogId(id);
    navigate("/");
  }

  function handleEdit(e, id) {
    e.stopPropagation();
    navigate(`/profile/${id}`);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this dog and all their records? This cannot be undone.")) return;
    deleteDog(id);
    refreshDogs();
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">🐾 My Dogs</h1>
        <button className="btn btn--primary btn--sm" onClick={() => navigate("/profile/new")}>
          + Add
        </button>
      </header>

      {dogs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🐾</div>
          <p className="empty-state__text">No dogs yet. Add your first dog!</p>
          <button className="btn btn--primary" style={{ marginTop: 12 }}
            onClick={() => navigate("/profile/new")}>
            + Add Dog
          </button>
        </div>
      )}

      <div className="list">
        {dogs.map(dog => (
          <div
            key={dog.id}
            className={`dog-card ${dog.id === activeDogId ? "dog-card--active" : ""}`}
            onClick={() => handleSelect(dog.id)}
          >
            <div className="dog-card__avatar">
              {dog.photoUrl
                ? <img src={dog.photoUrl} alt={dog.name} />
                : <span>{dog.name?.[0] || "🐾"}</span>
              }
            </div>

            <div className="dog-card__info">
              <div className="dog-card__header">
                <span className="dog-card__name">{dog.name}</span>
                {dog.id === activeDogId && (
                  <span className="badge badge--green">Active</span>
                )}
              </div>
              {(dog.breed || dog.age) && (
                <p className="dog-card__meta">
                  {dog.breed}{dog.breed && dog.age ? " · " : ""}{dog.age ? `${dog.age} yrs` : ""}
                </p>
              )}
              {dog.bio && <p className="dog-card__bio">{dog.bio}</p>}
            </div>

            <div className="dog-card__actions">
              <button className="btn btn--secondary btn--xs"
                onClick={e => handleEdit(e, dog.id)}>
                Edit
              </button>
              {dogs.length > 1 && (
                <button className="btn btn--danger btn--xs"
                  onClick={e => handleDelete(e, dog.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="add-dog-hint">
        Tap a dog to make them active across all tabs.
      </div>
    </div>
  );
}
