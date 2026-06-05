# 🐾 PawLog — Dog Health Journal

A mobile-first web application for tracking your dog's health records.
Built as an individual capstone project in one week.

---

## Live App
🔗 https://pawstagram1.vercel.app/

---

## Features

- **Multi-dog support** — manage multiple dogs, switch between them
- **Dog profiles** — name, breed, age, photo
- **Vet visits** — log clinic visits with reason, vet name, and notes
- **Vaccine tracker** — track vaccines with overdue / due-soon alerts
- **Medications** — manage active and past medications
- **Symptoms diary** — log symptoms with mild / moderate / severe severity
- **Health timeline** — all records in one chronological view with search and filter
- **Export** — download full health records as JSON
- **Onboarding** — guided first-time setup
- **Form validation** — all inputs validated with helpful error messages
- **Offline-ready** — all data stored locally in the browser (no server needed)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite                     |
| Styling    | Material Design 3 (custom CSS)      |
| Storage    | LowDB pattern with localStorage     |
| Hosting    | Vercel                              |
| Font       | Roboto (Google Fonts)               |

---

## Design System

Built following **Material Design 3** (m3.material.io) guidelines:
- M3 color tokens (dark scheme)
- M3 typography scale (Roboto)
- M3 shape system (corner radius tokens)
- M3 navigation bar spec (80dp, active indicator pill)
- M3 component patterns (cards, chips, FAB, filled buttons)

---

## Data Architecture

All data is stored in `localStorage` under the key `dog-health-db` as a JSON object:

```json
{
  "dogs": [],
  "vetVisits": [],
  "vaccines": [],
  "medications": [],
  "symptoms": []
}
```

Every health record has a `dogId` field linking it to its dog. Deleting a dog cascades and removes all related records.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── BottomNav.jsx      # M3 navigation bar
│   └── FieldError.jsx     # Reusable form error
├── context/
│   └── DogContext.jsx     # Global active dog state
├── db/
│   └── db.js              # localStorage CRUD helpers
├── pages/
│   ├── Home.jsx           # Dashboard — dog card grid
│   ├── DogProfile.jsx     # Add / edit dog profile
│   ├── VetVisits.jsx      # Vet visits CRUD
│   ├── Vaccines.jsx       # Vaccine tracker
│   ├── Timeline.jsx       # Health timeline + Meds + Symptoms
│   └── Onboarding.jsx     # First-time welcome screen
└── utils/
    └── validate.js        # All form validation logic
```

---

## Validation

All forms are validated before saving:
- Dog name: letters only, max 50 chars
- Age: integer 0–30
- Dates: cannot be in the future for past events
- End dates: must be after start dates
- Photo: max 1MB
- Text fields: appropriate max lengths

---

*Built with React + Material Design 3 · Capstone Project*
