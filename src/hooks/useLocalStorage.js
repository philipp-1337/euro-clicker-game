import { useEffect, useRef } from 'react';
import { saveGameState, loadGameState as loadGameStateUtil, hasSavedGame } from '@utils/localStorage';
import { gameConfig } from '@constants/gameConfig'; // Benötigt für den Reset zum Initialzustand

const STORAGE_KEY = 'clickerSave';

export default function useLocalStorage(gameState, loadGameStateHook) {
  const hasLoaded = useRef(false);
  const latestGameState = useRef(gameState);

  // Ref aktualisieren bei jeder Änderung
  useEffect(() => {
    latestGameState.current = gameState;
  }, [gameState]);

  // 🎮 Spielstand beim ersten Laden laden
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    if (hasSavedGame(STORAGE_KEY)) {
      const savedGameData = loadGameStateUtil(STORAGE_KEY); // Umbenannt, um Konflikt mit loadGameStateHook zu vermeiden
      if (savedGameData) {
        loadGameStateHook(savedGameData); // Pass the entire loaded object, including lastSaved
      } else {
        // Manipulation erkannt oder Daten sind null/korrupt
        console.warn("[useLocalStorage] Failed to load saved game due to tampering or corruption. Resetting to initial state.");
        localStorage.removeItem(STORAGE_KEY); // Beschädigte/manipulierte Daten entfernen
        loadGameStateHook(gameConfig.initialState); // Initialzustand laden
        // Optional: Benutzer über UI benachrichtigen
        window.dispatchEvent(new CustomEvent('gamestateTampered'));
      }
    } else {
      // Kein gespeichertes Spiel vorhanden, `useGameState` kümmert sich um den Initialzustand.
    }
  }, [loadGameStateHook]);

   // Alle 30 Sekunden speichern (aber verwende Ref, nicht Dependency)
   useEffect(() => {
    const saveInterval = setInterval(() => {
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);

  const saveGame = () => {
    saveGameState(STORAGE_KEY, latestGameState.current);
    window.dispatchEvent(new Event('game:autosaved')); // Eigenes Event für manuelle Speicherung
  };

  return { saveGame };
}