// src/context/DogContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getDogs } from "../db/db";

const DogContext = createContext(null);

export function DogProvider({ children }) {
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);

  function refreshDogs() {
    const all = getDogs();
    setDogs(all);
    // If active dog was deleted or none set, pick the first
    setActiveDogId(prev => {
      if (prev && all.find(d => d.id === prev)) return prev;
      return all[0]?.id || null;
    });
  }

  useEffect(() => {
    refreshDogs();
  }, []);

  const activeDog = dogs.find(d => d.id === activeDogId) || null;

  return (
    <DogContext.Provider value={{ dogs, activeDog, activeDogId, setActiveDogId, refreshDogs }}>
      {children}
    </DogContext.Provider>
  );
}

export function useDog() {
  return useContext(DogContext);
}
