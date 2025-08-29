import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'startTime';

export default function usePlaytime() {
  const [playTime, setPlayTime] = useState(0);
  // Dieser State zeigt an, ob das Spiel tatsächlich gestartet wurde (startTime im localStorage existiert)
  const [isGameActuallyStarted, setIsGameActuallyStarted] = useState(!!localStorage.getItem(STORAGE_KEY));

  // Setze Startzeit, falls sie noch nicht existiert
  const ensureStartTime = useCallback(() => {
    const existingStart = localStorage.getItem(STORAGE_KEY);
    if (!existingStart) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      if (!isGameActuallyStarted) setIsGameActuallyStarted(true); // Update, falls noch nicht true
    } else if (!isGameActuallyStarted) {
      setIsGameActuallyStarted(true); // Synchronisiere, falls im localStorage, aber State war false
    }
  }, [isGameActuallyStarted]);

  // Effekt, um sicherzustellen, dass isGameActuallyStarted true ist, wenn startTime beim Laden gefunden wird
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) && !isGameActuallyStarted) {
      setIsGameActuallyStarted(true);
    }
  }, [isGameActuallyStarted]);

  // Hole Spielzeit
  useEffect(() => {
    let intervalId;
    if (isGameActuallyStarted) { // Starte den Intervall nur, wenn das Spiel gestartet ist
      intervalId = setInterval(() => {
        const start = parseInt(localStorage.getItem(STORAGE_KEY), 10);
        if (start) { // Sollte immer true sein, wenn isGameActuallyStarted true ist
          const now = Date.now();
          setPlayTime(Math.floor((now - start) / 1000));
        }
      }, 1000);
    } else {
      setPlayTime(0); // Setze playTime zurück, wenn das Spiel nicht gestartet ist
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGameActuallyStarted]); // Abhängigkeit vom Spielstartstatus

  return { playTime, ensureStartTime, isGameStarted: isGameActuallyStarted };
}