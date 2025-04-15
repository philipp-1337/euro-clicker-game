import { useState, useEffect } from 'react';

const STORAGE_KEY = 'startTime';

export default function usePlaytime() {
  const [playTime, setPlayTime] = useState(0);

  // Setze Startzeit, falls sie noch nicht existiert
  const ensureStartTime = () => {
    const existingStart = localStorage.getItem(STORAGE_KEY);
    if (!existingStart) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  };

  // Hole Spielzeit
  useEffect(() => {
    const interval = setInterval(() => {
      const start = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      if (start) {
        const now = Date.now();
        setPlayTime(Math.floor((now - start) / 1000));
      }
    }, 1000); // Jede Sekunde aktualisieren

    return () => clearInterval(interval);
  }, []);

  return { playTime, ensureStartTime };
}