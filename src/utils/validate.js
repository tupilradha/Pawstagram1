// src/utils/validate.js

// ─── Helpers ─────────────────────────────────────────────

// Only letters (including accented), spaces, hyphens, apostrophes — no symbols/numbers
export function isValidName(val) {
  return /^[a-zA-ZÀ-ÿ\s'\-]{1,50}$/.test(val.trim());
}

// Letters, spaces, hyphens, apostrophes, dots — for breed names like "St. Bernard"
export function isValidBreed(val) {
  if (!val.trim()) return true; // optional
  return /^[a-zA-ZÀ-ÿ\s'.\-]{1,60}$/.test(val.trim());
}

// Age: integer 0–30 (oldest dog ever was 29)
export function isValidAge(val) {
  if (val === "" || val === null || val === undefined) return true; // optional
  const n = Number(val);
  return Number.isInteger(n) && n >= 0 && n <= 30;
}

// Date: required, not in the future (for events that already happened)
export function isValidPastDate(val) {
  if (!val) return false;
  const d = new Date(val);
  if (isNaN(d)) return false;
  return d <= new Date();
}

// Date: required, any valid date
export function isValidDate(val) {
  if (!val) return false;
  return !isNaN(new Date(val));
}

// Date: optional, any valid date
export function isValidOptionalDate(val) {
  if (!val) return true;
  return !isNaN(new Date(val));
}

// End date must be after start date
export function isEndAfterStart(start, end) {
  if (!end) return true; // end is optional
  if (!start) return true;
  return new Date(end) >= new Date(start);
}

// Free text: required, max length
export function isValidText(val, maxLen = 200) {
  return val.trim().length > 0 && val.trim().length <= maxLen;
}

// Optional text: just max length
export function isValidOptionalText(val, maxLen = 500) {
  return val.trim().length <= maxLen;
}

// Dosage: letters, numbers, spaces, common symbols (mg, ml, %)
export function isValidDosage(val) {
  if (!val.trim()) return true; // optional
  return /^[a-zA-Z0-9\s./\-_%,]{1,50}$/.test(val.trim());
}

// Image file size: max 1MB to protect localStorage
export function isValidImageSize(file) {
  return file.size <= 1 * 1024 * 1024; // 1MB
}

// ─── Form validators (return { valid, errors }) ───────────

export function validateDogForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  } else if (!isValidName(form.name)) {
    errors.name = "Name can only contain letters, spaces, hyphens or apostrophes (max 50 chars).";
  }

  if (form.breed && !isValidBreed(form.breed)) {
    errors.breed = "Breed can only contain letters, spaces, hyphens, dots (max 60 chars).";
  }

  if (form.age !== "" && !isValidAge(form.age)) {
    errors.age = "Age must be a whole number between 0 and 30.";
  }

  if (form.bio && !isValidOptionalText(form.bio, 300)) {
    errors.bio = "Bio must be under 300 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateVetVisitForm(form) {
  const errors = {};

  if (!form.date) {
    errors.date = "Date is required.";
  } else if (!isValidPastDate(form.date)) {
    errors.date = "Date cannot be in the future.";
  }

  if (!form.reason.trim()) {
    errors.reason = "Reason for visit is required.";
  } else if (!isValidText(form.reason, 100)) {
    errors.reason = "Reason must be under 100 characters.";
  }

  if (form.clinic && !isValidText(form.clinic, 100)) {
    errors.clinic = "Clinic name must be under 100 characters.";
  }

  if (form.vet && !isValidText(form.vet, 100)) {
    errors.vet = "Vet name must be under 100 characters.";
  }

  if (form.notes && !isValidOptionalText(form.notes, 500)) {
    errors.notes = "Notes must be under 500 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateVaccineForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Vaccine name is required.";
  } else if (!isValidText(form.name, 100)) {
    errors.name = "Vaccine name must be under 100 characters.";
  }

  if (form.dateGiven && !isValidPastDate(form.dateGiven)) {
    errors.dateGiven = "Date given cannot be in the future.";
  }

  if (form.nextDueDate && !isValidDate(form.nextDueDate)) {
    errors.nextDueDate = "Invalid due date.";
  }

  if (form.dateGiven && form.nextDueDate &&
      !isEndAfterStart(form.dateGiven, form.nextDueDate)) {
    errors.nextDueDate = "Due date must be after the date given.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateMedicationForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Medication name is required.";
  } else if (!isValidText(form.name, 100)) {
    errors.name = "Medication name must be under 100 characters.";
  }

  if (form.dosage && !isValidDosage(form.dosage)) {
    errors.dosage = "Dosage can only contain letters, numbers and units like mg, ml (max 50 chars).";
  }

  if (!form.startDate) {
    errors.startDate = "Start date is required.";
  } else if (!isValidPastDate(form.startDate)) {
    errors.startDate = "Start date cannot be in the future.";
  }

  if (form.endDate && !isEndAfterStart(form.startDate, form.endDate)) {
    errors.endDate = "End date must be after the start date.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSymptomForm(form) {
  const errors = {};

  if (!form.date) {
    errors.date = "Date is required.";
  } else if (!isValidPastDate(form.date)) {
    errors.date = "Date cannot be in the future.";
  }

  if (!form.description.trim()) {
    errors.description = "Please describe the symptom.";
  } else if (!isValidText(form.description, 300)) {
    errors.description = "Description must be under 300 characters.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
