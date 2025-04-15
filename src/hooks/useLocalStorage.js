import { useEffect, useRef } from 'react';
import { saveGameState, loadGameState, hasSavedGame } from '@utils/localStorage';

const STORAGE_KEY = 'clickerSave';

export default function useLocalStorage(gameState, loadGameStateHook) {
  const hasLoaded = useRef(false);

  // Beim ersten Laden versuchen, gespeicherten Spielstand zu laden
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    if (hasSavedGame(STORAGE_KEY)) {
      const savedGame = loadGameState(STORAGE_KEY);
      if (savedGame) {
        loadGameStateHook(savedGame);
      }
    }
  }, [loadGameStateHook]);

  // Spiel automatisch speichern, wenn sich der Zustand ändert
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameState(STORAGE_KEY, gameState);
    }, 30000); // Alle 30 Sekunden speichern
    
    return () => clearInterval(saveInterval);
  }, [gameState]);

  const saveGame = () => saveGameState(STORAGE_KEY, gameState);

  return { saveGame };
}