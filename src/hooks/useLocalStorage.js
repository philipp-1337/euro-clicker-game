import { useEffect, useRef } from 'react';
import { saveGameState, loadGameState, hasSavedGame } from '@utils/localStorage';

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
      const savedGameData = loadGameState(STORAGE_KEY); // Utility function from @utils/localStorage
      if (savedGameData) {
        loadGameStateHook(savedGameData); // Pass the entire loaded object, including lastSaved
      }
    }
  }, [loadGameStateHook]);

  // Alle 30 Sekunden speichern (aber verwende Ref, nicht Dependency)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      console.log('[LocalStorage] Auto-saving game...');
      saveGameState(STORAGE_KEY, latestGameState.current); // Ruft die util-Funktion direkt auf
      window.dispatchEvent(new Event('game:autosaved'));
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);

  const saveGame = () => {
    console.log('[LocalStorage] Manual/Explicit saveGame function called. Saving state:', latestGameState.current);
    saveGameState(STORAGE_KEY, latestGameState.current);
    window.dispatchEvent(new Event('game:manualsaved')); // Eigenes Event für manuelle Speicherung
  };

  return { saveGame };
}