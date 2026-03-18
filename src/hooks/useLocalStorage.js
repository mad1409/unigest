import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Erreur lecture localStorage:", e);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("Erreur écriture localStorage:", e);
    }
  }, [key, state]);

  return [state, setState];
}
