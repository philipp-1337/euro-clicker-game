const ANTI_CHEAT_SECRET = "€UROCL1CK€R_S€CR€T_CH€CK_V1.0.3"; // Ein geheimer Schlüssel

/**
 * Erzeugt einen einfachen Hash aus einem String.
 * @param {string} str - Der Eingabe-String.
 * @returns {string} Der generierte Hash als Hex-String.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // In 32bit Integer umwandeln
  }
  return hash.toString(16);
}

/**
 * Saves game state to localStorage
 * @param {string} key - The key to save the data under
 * @param {Object} dataFromHook - The data to save from the game state hook
 */
export const saveGameState = (key, dataFromHook) => {
    try {
      // Stelle sicher, dass lastSaved für diese Speicheroperation aktuell ist
      const dataToStore = {
        ...dataFromHook,
        lastSaved: new Date().getTime(),
      };

      const stringifiedForChecksum = JSON.stringify(dataToStore);
      const checksum = simpleHash(stringifiedForChecksum + ANTI_CHEAT_SECRET);

      const finalStorageObject = {
        payload: dataToStore,
        chk: checksum,
      };

      localStorage.setItem(key, JSON.stringify(finalStorageObject));
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  };
  
  /**
   * Loads game state from localStorage
   * @param {string} key - The key to load data from
   * @param {Object} defaultState - Default state to return if no saved state exists
   * @returns {Object} The loaded game state or default state
   */
  export const loadGameState = (key, defaultState = {}) => {
    try {
      const rawData = localStorage.getItem(key);
      if (!rawData) return defaultState;

      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
      } catch (e) {
        console.error('Error parsing saved data from localStorage:', e);
        localStorage.removeItem(key); // Beschädigte Daten entfernen
        return null; // Signalisiert einen Fehler/Korruption
      }

      // Prüfen, ob es das neue Format mit Payload und Checksum ist
      const isNewFormat = parsedData && typeof parsedData.payload !== 'undefined' && typeof parsedData.chk !== 'undefined';

      if (isNewFormat) {
        const { payload, chk } = parsedData;

        // Auf localhost die Prüfung überspringen dann folgendes auskommentieren
        if (window.location.hostname === 'localhost') {
          console.log('[AntiCheat] Skipping checksum validation on localhost (temporarily disabled for testing).');
          return payload;
        }

        const calculatedChecksum = simpleHash(JSON.stringify(payload) + ANTI_CHEAT_SECRET);

        if (calculatedChecksum !== chk) {
          console.warn('[AntiCheat] Save data checksum mismatch. Data may be tampered or corrupted for key:', key);
          return null; // Signalisiert Manipulation/Korruption
        }
        return payload; // Daten sind valide
      } else {
        // Altes Format ohne Prüfsumme
        if (window.location.hostname === 'localhost') {
          console.log('[AntiCheat] Loading old format data on localhost.');
          return parsedData; // parsedData ist hier der gameState direkt
        }
        console.warn('[AntiCheat] Old save format without checksum detected on non-localhost. Treating as potentially tampered for key:', key);
        // Für bestehende Nutzer auf Produktion: Daten einmalig laden. Der nächste Speicherversuch wird das neue Format verwenden.
        // Alternativ könnte man hier `null` zurückgeben, um einen Reset zu erzwingen.
        // Wir wählen den sanfteren Weg und laden die alten Daten einmalig.
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading game state:', error);
      return defaultState;
    }
  };
  
  /**
   * Calculates the time elapsed since last save
   * @param {Object} savedState - The saved game state
   * @returns {number} Time elapsed in seconds
   */
  export const getInactivePlayTime = (savedState) => {
    if (!savedState || !savedState.lastSaved) return 0;
    
    const now = new Date().getTime();
    const lastSaved = savedState.lastSaved;
    return Math.floor((now - lastSaved) / 1000); // Convert to seconds
  };
  
  /**
   * Clears saved game data
   * @param {string} key - The key to clear data for
   */
  export const clearSavedGame = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing saved game:', error);
      return false;
    }
  };
  
  /**
   * Checks if there is a saved game state
   * @param {string} key - The key to check for saved data
   * @returns {boolean} Whether a saved game exists
   */
  export const hasSavedGame = (key) => {
    return !!localStorage.getItem(key);
  };
  
  /**
   * Creates a backup of the current game state
   * @param {string} key - The key of the game state
   * @param {string} backupSuffix - Suffix to add for the backup key
   */
  export const backupGameState = (key, backupSuffix = '_backup') => {
    try {
      const gameState = localStorage.getItem(key);
      if (!gameState) return false;
      
      localStorage.setItem(`${key}${backupSuffix}`, gameState);
      return true;
    } catch (error) {
      console.error('Error creating game backup:', error);
      return false;
    }
  };
  
  /**
   * Restores a game from backup
   * @param {string} key - The key of the game state
   * @param {string} backupSuffix - Suffix used for the backup key
   */
  export const restoreFromBackup = (key, backupSuffix = '_backup') => {
    try {
      const backupState = localStorage.getItem(`${key}${backupSuffix}`);
      if (!backupState) return false;
      
      localStorage.setItem(key, backupState);
      return true;
    } catch (error) {
      console.error('Error restoring game from backup:', error);
      return false;
    }
  };