// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DogProvider } from "./context/DogContext";
import { getDogs } from "./db/db";
import BottomNav   from "./components/BottomNav";
import Onboarding  from "./pages/Onboarding";
import Home        from "./pages/Home";
import DogProfile  from "./pages/DogProfile";
import VetVisits   from "./pages/VetVisits";
import Vaccines    from "./pages/Vaccines";
import Timeline    from "./pages/Timeline";

function AppShell() {
  const hasDogs = getDogs().length > 0;
  if (!hasDogs) {
    return (
      <Routes>
        <Route path="*"            element={<Onboarding />} />
        <Route path="/profile/:id" element={<DogProfile />} />
      </Routes>
    );
  }
  return (
    <div className="m3-app">
      <main className="m3-app__main">
        <Routes>
          <Route path="/"            element={<Home />}       />
          <Route path="/vet-visits"  element={<VetVisits />}  />
          <Route path="/vaccines"    element={<Vaccines />}   />
          <Route path="/timeline"    element={<Timeline />}   />
          <Route path="/profile/:id" element={<DogProfile />} />
        </Routes>
      </main>
      <BottomNav />
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
