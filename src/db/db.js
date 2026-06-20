// src/db/db.js
// LowDB v7+ with localStorage adapter (browser-only, no server needed)

const DB_KEY = "dog-health-db";

function getDefaultData() {
  return {
    dogs: [],
    vetVisits: [],
    vaccines: [],
    medications: [],
    symptoms: [],
  };
}

function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return getDefaultData();
    return { ...getDefaultData(), ...JSON.parse(raw) };
  } catch {
    return getDefaultData();
  }
}

function writeDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Dogs ────────────────────────────────────────────────

export function getDogs() {
  return readDB().dogs;
}

export function getDog(id) {
  return readDB().dogs.find((d) => d.id === id) || null;
}

export function saveDog(dog) {
  const db = readDB();
  if (dog.id) {
    db.dogs = db.dogs.map((d) => (d.id === dog.id ? { ...d, ...dog } : d));
  } else {
    db.dogs.push({ ...dog, id: generateId(), createdAt: new Date().toISOString() });
  }
  writeDB(db);
}

// Returns counts of every record type linked to a dog —
// used to show a cascade-delete preview before the user confirms.
export function getDogRecordCounts(id) {
  const db = readDB();
  return {
    vetVisits:   db.vetVisits.filter((r) => r.dogId === id).length,
    vaccines:    db.vaccines.filter((r) => r.dogId === id).length,
    medications: db.medications.filter((r) => r.dogId === id).length,
    symptoms:    db.symptoms.filter((r) => r.dogId === id).length,
  };
}

export function deleteDog(id) {
  const db = readDB();
  db.dogs = db.dogs.filter((d) => d.id !== id);
  // Cascade delete all related records
  db.vetVisits   = db.vetVisits.filter((r) => r.dogId !== id);
  db.vaccines    = db.vaccines.filter((r) => r.dogId !== id);
  db.medications = db.medications.filter((r) => r.dogId !== id);
  db.symptoms    = db.symptoms.filter((r) => r.dogId !== id);
  writeDB(db);
}

// ─── Vet Visits ──────────────────────────────────────────

export function getVetVisits(dogId) {
  return readDB().vetVisits
    .filter((v) => v.dogId === dogId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function saveVetVisit(visit) {
  const db = readDB();
  if (visit.id) {
    db.vetVisits = db.vetVisits.map((v) => (v.id === visit.id ? { ...v, ...visit } : v));
  } else {
    db.vetVisits.push({ ...visit, id: generateId(), createdAt: new Date().toISOString() });
  }
  writeDB(db);
}

export function deleteVetVisit(id) {
  const db = readDB();
  db.vetVisits = db.vetVisits.filter((v) => v.id !== id);
  writeDB(db);
}

// ─── Vaccines ────────────────────────────────────────────

export function getVaccines(dogId) {
  return readDB().vaccines
    .filter((v) => v.dogId === dogId)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
}

// Returns true if a vaccine with the same name + dateGiven already
// exists for this dog (excluding the record currently being edited).
export function isDuplicateVaccine(dogId, name, dateGiven, excludeId = null) {
  const db = readDB();
  return db.vaccines.some((v) =>
    v.dogId === dogId &&
    v.id !== excludeId &&
    v.name.trim().toLowerCase() === name.trim().toLowerCase() &&
    v.dateGiven === dateGiven
  );
}

export function saveVaccine(vaccine) {
  const db = readDB();
  if (vaccine.id) {
    db.vaccines = db.vaccines.map((v) => (v.id === vaccine.id ? { ...v, ...vaccine } : v));
  } else {
    db.vaccines.push({ ...vaccine, id: generateId(), createdAt: new Date().toISOString() });
  }
  writeDB(db);
}

export function deleteVaccine(id) {
  const db = readDB();
  db.vaccines = db.vaccines.filter((v) => v.id !== id);
  writeDB(db);
}

// ─── Medications ─────────────────────────────────────────

export function getMedications(dogId) {
  return readDB().medications
    .filter((m) => m.dogId === dogId)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
}

export function saveMedication(med) {
  const db = readDB();
  if (med.id) {
    db.medications = db.medications.map((m) => (m.id === med.id ? { ...m, ...med } : m));
  } else {
    db.medications.push({ ...med, id: generateId(), createdAt: new Date().toISOString() });
  }
  writeDB(db);
}

export function deleteMedication(id) {
  const db = readDB();
  db.medications = db.medications.filter((m) => m.id !== id);
  writeDB(db);
}

// ─── Symptoms ────────────────────────────────────────────

export function getSymptoms(dogId) {
  return readDB().symptoms
    .filter((s) => s.dogId === dogId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function saveSymptom(symptom) {
  const db = readDB();
  if (symptom.id) {
    db.symptoms = db.symptoms.map((s) => (s.id === symptom.id ? { ...s, ...symptom } : s));
  } else {
    db.symptoms.push({ ...symptom, id: generateId(), createdAt: new Date().toISOString() });
  }
  writeDB(db);
}

export function deleteSymptom(id) {
  const db = readDB();
  db.symptoms = db.symptoms.filter((s) => s.id !== id);
  writeDB(db);
}

// ─── Dev helper (call from browser console) ──────────────
export function clearDB() {
  localStorage.removeItem(DB_KEY);
}
