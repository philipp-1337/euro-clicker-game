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
        const { lastSaved, ...actualGameState } = savedGameData; // lastSaved wird hier nicht mehr benötigt für offlineTime
        loadGameStateHook(actualGameState);
      }
    }
  }, [loadGameStateHook]);

  // Alle 30 Sekunden speichern (aber verwende Ref, nicht Dependency)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame(); // ✅ nutzt die Funktion, die das Event sendet
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);

  const saveGame = () => {
    console.log('[AutoSave] Triggered');
    saveGameState(STORAGE_KEY, latestGameState.current);
    window.dispatchEvent(new Event('game:autosaved')); 
  };

  return { saveGame };
}