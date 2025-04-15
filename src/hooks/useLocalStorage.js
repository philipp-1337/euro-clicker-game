import { useEffect } from 'react';
import { saveGameState, loadGameState, hasSavedGame } from '@utils/localStorage';

export default function useLocalStorage(gameState, loadGameStateHook) {
  // Beim ersten Laden versuchen, gespeicherten Spielstand zu laden
  useEffect(() => {
    // Prüfen, ob ein gespeicherter Spielstand existiert
    if (hasSavedGame()) {
      const savedGame = loadGameState();
      if (savedGame) {
        loadGameStateHook(savedGame);
      }
    }
  }, [loadGameStateHook]);

  // Spiel automatisch speichern, wenn sich der Zustand ändert
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameState(gameState);
    }, 30000); // Alle 30 Sekunden speichern
    
    return () => clearInterval(saveInterval);
  }, [gameState]);

  // Manuelles Speichern ermöglichen
  const saveGame = () => saveGameState(gameState);

  return { saveGame };
}