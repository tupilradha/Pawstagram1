// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import DogProfile  from "./pages/DogProfile";
import VetVisits   from "./pages/VetVisits";
import Vaccines    from "./pages/Vaccines";
import Medications from "./pages/Medications";
import Symptoms    from "./pages/Symptoms";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="app__main">
          <Routes>
            <Route path="/"            element={<DogProfile />}  />
            <Route path="/vet-visits"  element={<VetVisits />}   />
            <Route path="/vaccines"    element={<Vaccines />}    />
            <Route path="/medications" element={<Medications />} />
            <Route path="/symptoms"    element={<Symptoms />}    />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
