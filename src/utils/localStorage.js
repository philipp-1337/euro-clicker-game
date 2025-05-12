/**
 * Saves game state to localStorage
 * @param {string} key - The key to save the data under
 * @param {Object} data - The data to save
 */
export const saveGameState = (key, data) => {
    try {
      const serializedData = JSON.stringify({
        ...data,
        lastSaved: new Date().getTime()
      });
        console.log('[LocalStorageUtil] Saving. Timestamp being saved:', new Date(JSON.parse(serializedData).lastSaved).toISOString(), 'Full data:', JSON.parse(serializedData));
      localStorage.setItem(key, serializedData);
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
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return defaultState;
      
      return JSON.parse(serializedData);
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