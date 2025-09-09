import { useEffect, useRef } from 'react';
import { saveGameState, loadGameState as loadGameStateUtil, hasSavedGame } from '@utils/localStorage';
import { isLocalhost } from '@utils/env';
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

    // gameConfig.initialState wird von useGameState verwendet, wenn nichts geladen wird.
    // Hier kümmern wir uns nur um das Laden *existierender* Daten.
    if (hasSavedGame(STORAGE_KEY)) {
      const loadResult = loadGameStateUtil(STORAGE_KEY, gameConfig.initialState);

      switch (loadResult.type) {
        case 'success':
        case 'success_old_format': // Altes Format als Erfolg für das Laden behandeln
          loadGameStateHook(loadResult.payload);
          if (loadResult.type === 'success_old_format' && !isLocalhost()) {
            console.log('[useLocalStorage] Old storage format loaded. It is updated with a checksum the next time it is saved.');
          }
          break;
        case 'error':
          console.warn(`[useLocalStorage] Fehler beim Laden des Spiels: ${loadResult.reason}. Nachricht: ${loadResult.message}. Wird auf den Initialzustand zurückgesetzt.`);
          localStorage.removeItem(STORAGE_KEY); // Korrupte/manipulierte Daten entfernen
          loadGameStateHook(gameConfig.initialState); // Explizit Initialzustand laden
          // Füge eine kleine Verzögerung hinzu, um sicherzustellen, dass der Event-Listener in App.js bereit ist
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gamestateTampered', { detail: { reason: loadResult.reason, message: loadResult.message } }));
          }, 50); // 50ms Verzögerung
          break;
        case 'no_data':
          // Dieser Fall bedeutet, dass hasSavedGame(STORAGE_KEY) true war, aber localStorage.getItem(key) in loadGameStateUtil null zurückgab.
          // Das ist unwahrscheinlich, aber möglich, wenn das Element zwischen den Prüfungen entfernt wurde.
          // In diesem Fall wird useGameState den Initialzustand setzen.
          console.warn('[useLocalStorage] hasSavedGame war true, aber loadGameStateUtil meldete no_data. Verlasse mich auf useGameState für den Initialzustand.');
          break;
        default:
          // Sollte nicht passieren
          console.error('[useLocalStorage] Unbekannter loadResult-Typ:', loadResult.type);
          loadGameStateHook(gameConfig.initialState); // Fallback
      }
    } else {
      // Kein gespeichertes Spiel vorhanden. Der useGameState Hook initialisiert mit gameConfig.initialState.
    }
  }, [loadGameStateHook]);

   // Alle 30 Sekunden speichern (aber verwende Ref, nicht Dependency)
   useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame();
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);

  const saveGame = () => {
    saveGameState(STORAGE_KEY, latestGameState.current);
    window.dispatchEvent(new Event('game:autosaved')); // Eigenes Event für manuelle Speicherung
  };

  return { saveGame };
}