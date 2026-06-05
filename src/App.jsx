// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DogProvider, useDog } from "./context/DogContext";
import Onboarding  from "./pages/Onboarding";
import Home        from "./pages/Home";
import DogProfile  from "./pages/DogProfile";
import DogDetail   from "./pages/DogDetail";
import VetVisits   from "./pages/VetVisits";
import Vaccines    from "./pages/Vaccines";
import Timeline    from "./pages/Timeline";

function AppShell() {
  const { dogs } = useDog();  // reactive — re-renders when dogs change

  if (dogs.length === 0) {
    return (
      <Routes>
        <Route path="*"            element={<Onboarding />} />
        <Route path="/profile/new" element={<DogProfile />} />
      </Routes>
    );
  }

  return (
    <div className="m3-app">
      <main className="m3-app__main">
        <Routes>
          <Route path="/"                    element={<Home />}       />
          <Route path="/dog/:id"             element={<DogDetail />}  />
          <Route path="/dog/:id/vet-visits"  element={<VetVisits />}  />
          <Route path="/dog/:id/vaccines"    element={<Vaccines />}   />
          <Route path="/dog/:id/timeline"    element={<Timeline />}   />
          <Route path="/profile/:id"         element={<DogProfile />} />
          <Route path="*"                    element={<Home />}       />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DogProvider>
        <AppShell />
      </DogProvider>
    </BrowserRouter>
  );
}
