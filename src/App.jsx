// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DogProvider } from "./context/DogContext";
import BottomNav    from "./components/BottomNav";
import DogSwitcher  from "./components/DogSwitcher";
import Home         from "./pages/Home";
import DogProfile   from "./pages/DogProfile";
import VetVisits    from "./pages/VetVisits";
import Vaccines     from "./pages/Vaccines";
import Medications  from "./pages/Medications";
import Symptoms     from "./pages/Symptoms";

export default function App() {
  return (
    <BrowserRouter>
      <DogProvider>
        <div className="app">
          <DogSwitcher />
          <main className="app__main">
            <Routes>
              <Route path="/"                  element={<Home />}        />
              <Route path="/profile/:id"       element={<DogProfile />}  />
              <Route path="/vet-visits"        element={<VetVisits />}   />
              <Route path="/vaccines"          element={<Vaccines />}    />
              <Route path="/medications"       element={<Medications />} />
              <Route path="/symptoms"          element={<Symptoms />}    />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </DogProvider>
    </BrowserRouter>
  );
}
