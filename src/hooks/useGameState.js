import { useState, useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useGameState(easyMode = false) {
  // Hauptzustände
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);
  const [satisfaction, setSatisfaction] = useState(
    Number.isFinite(gameConfig.initialState.satisfaction) ? gameConfig.initialState.satisfaction : 0
  );
  const [dissatisfaction, setDissatisfaction] = useState(
    Number.isFinite(gameConfig.initialState.dissatisfaction) ? gameConfig.initialState.dissatisfaction : 0
  );
  const [stateBuildings, setStateBuildings] = useState([...gameConfig.initialState.stateBuildings]);
  
  // Upgrade-Zustände
  const [valueMultipliers, setValueMultipliers] = useState([...gameConfig.initialState.valueMultipliers]);
  const [cooldownReductions, setCooldownReductions] = useState([...gameConfig.initialState.cooldownReductions]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([...gameConfig.initialState.valueUpgradeLevels]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([...gameConfig.initialState.cooldownUpgradeLevels]);
  
  // Premium-Upgrade-Zustände
  const [globalMultiplier, setGlobalMultiplier] = useState(gameConfig.initialState.globalMultiplier);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(gameConfig.initialState.globalMultiplierLevel);
  const [globalPriceDecrease, setGlobalPriceDecrease] = useState(gameConfig.initialState.globalPriceDecrease);
  const [globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel] = useState(gameConfig.initialState.globalPriceDecreaseLevel);


  // Investment-Tab-Status
  const [isInvestmentUnlocked, setIsInvestmentUnlocked] = useState(
    gameConfig.initialState.isInvestmentUnlocked ?? false
  );

  // Investments
  const [investments, setInvestments] = useState(
    gameConfig.initialState.investments ?? gameConfig.investments.map(() => 0)
  );

  // StateInfrastructure-Tab-Status
  const [isStateUnlocked, setIsStateUnlocked] = useState(
    gameConfig.initialState.isStateUnlocked ?? false
  );
  const [activePlayTime, setActivePlayTime] = useState(gameConfig.initialState.activePlayTime ?? 0);
  const [inactivePlayTime, setInactivePlayTime] = useState(gameConfig.initialState.inactivePlayTime ?? 0);

  // State to store the calculated offline duration on initial load
  const [initialOfflineDuration, setInitialOfflineDuration] = useState(0);

  // Interventions-Tab-Status
  const [isInterventionsUnlocked, setIsInterventionsUnlocked] = useState(
    gameConfig.initialState.isInterventionsUnlocked ?? false
  );

  // State für Offline-Einnahmen
  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(gameConfig.initialState.offlineEarningsLevel);

  // State for Critical Click Chance
  const [criticalClickChanceLevel, setCriticalClickChanceLevel] = useState(gameConfig.initialState.criticalClickChanceLevel);

  // State for boosted investments
  const [boostedInvestmentsData, setBoostedInvestmentsData] = useState(() => {
    return gameConfig.investments.map((_, index) => {
      const storedValue = typeof window !== 'undefined' ? localStorage.getItem(`boosted-${index}`) : null;
      return storedValue ? JSON.parse(storedValue) : false;
    });
  });


  // Kompakter Spielzustand für Speichern/Laden
  const gameState = {
    money,
    cooldowns,
    managers,
    valueMultipliers,
    cooldownReductions,
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    globalMultiplier,
    globalMultiplierLevel,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    isInvestmentUnlocked,
    investments,
    satisfaction,
    dissatisfaction,
    stateBuildings,
    isStateUnlocked,
    isInterventionsUnlocked,
    activePlayTime,
    inactivePlayTime,
    offlineEarningsLevel, // Add to game state
    criticalClickChanceLevel, // Add to game state
    boostedInvestments: boostedInvestmentsData, // Add to game state
    lastSaved: new Date().getTime(), // Automatically include current timestamp
  };

  // Funktion zum Setzen des kompletten Spielzustands (für Load-Funktionalität)
  const loadGameState = (savedState) => {
    if (!savedState) return;
    
    setMoney(savedState.money ?? gameConfig.initialState.money);
    setCooldowns(savedState.cooldowns ?? [...gameConfig.initialState.cooldowns]);
    setManagers(savedState.managers ?? [...gameConfig.initialState.managers]);
    setValueMultipliers(savedState.valueMultipliers ?? [...gameConfig.initialState.valueMultipliers]);
    setCooldownReductions(savedState.cooldownReductions ?? [...gameConfig.initialState.cooldownReductions]);
    setValueUpgradeLevels(savedState.valueUpgradeLevels ?? [...gameConfig.initialState.valueUpgradeLevels]);
    setCooldownUpgradeLevels(savedState.cooldownUpgradeLevels ?? [...gameConfig.initialState.cooldownUpgradeLevels]);
    setGlobalMultiplier(savedState.globalMultiplier ?? gameConfig.initialState.globalMultiplier);
    setGlobalMultiplierLevel(savedState.globalMultiplierLevel ?? gameConfig.initialState.globalMultiplierLevel);
    setGlobalPriceDecrease(savedState.globalPriceDecrease ?? gameConfig.initialState.globalPriceDecrease);
    setGlobalPriceDecreaseLevel(savedState.globalPriceDecreaseLevel ?? gameConfig.initialState.globalPriceDecreaseLevel);
    setIsInvestmentUnlocked(savedState.isInvestmentUnlocked ?? false);
    setInvestments(savedState.investments ?? gameConfig.investments.map(() => 0));
    setSatisfaction(
      Number.isFinite(savedState.satisfaction) ? savedState.satisfaction : 0
    );
    setDissatisfaction(
      Number.isFinite(savedState.dissatisfaction) ? savedState.dissatisfaction : 0
    );
    setStateBuildings(savedState.stateBuildings ?? [...gameConfig.initialState.stateBuildings]);
    setIsStateUnlocked(savedState.isStateUnlocked ?? false);
    setIsInterventionsUnlocked(savedState.isInterventionsUnlocked ?? false);
    setActivePlayTime(savedState.activePlayTime ?? gameConfig.initialState.activePlayTime ?? 0);

    // Load offlineEarningsLevel, with migration for old isOfflineEarningsUnlocked
    if (savedState.offlineEarningsLevel !== undefined) {
      setOfflineEarningsLevel(savedState.offlineEarningsLevel);
    } else if (savedState.isOfflineEarningsUnlocked === true) {
      setOfflineEarningsLevel(1); // Migrate old save: if it was unlocked, set to level 1
    } else {
      setOfflineEarningsLevel(gameConfig.initialState.offlineEarningsLevel);
    }
    setCriticalClickChanceLevel(savedState.criticalClickChanceLevel ?? gameConfig.initialState.criticalClickChanceLevel);
    setInactivePlayTime(savedState.inactivePlayTime ?? gameConfig.initialState.inactivePlayTime ?? 0); // Lädt die gespeicherte Inaktivitätszeit

    // Load boostedInvestments state
    const loadedBoosted = gameConfig.investments.map((_, index) => {
      if (savedState.boostedInvestments && typeof savedState.boostedInvestments[index] === 'boolean') {
        // Wenn im Savegame vorhanden, diesen Wert nehmen und auch im localStorage aktualisieren
        localStorage.setItem(`boosted-${index}`, JSON.stringify(savedState.boostedInvestments[index]));
        return savedState.boostedInvestments[index];
      }
      // Fallback auf individuellen localStorage (für Kompatibilität oder direkte Manipulation)
      const storedValue = typeof window !== 'undefined' ? localStorage.getItem(`boosted-${index}`) : null;
      return storedValue ? JSON.parse(storedValue) : false;
    });
    setBoostedInvestmentsData(loadedBoosted);
    // Calculate initial offline duration if lastSaved timestamp exists in saved state
    if (savedState.lastSaved) {
      console.log('[useGameState] loadGameState: savedState.lastSaved exists.', { lastSavedTimestamp: savedState.lastSaved, lastSavedDate: new Date(savedState.lastSaved).toISOString() });
      const currentTime = Date.now();
      console.log('[useGameState] loadGameState: Current time for calculation:', new Date(currentTime).toISOString());
      const offlineMs = currentTime - savedState.lastSaved;
      const offlineSeconds = Math.floor(offlineMs / 1000);
      console.log(`[useGameState] loadGameState: Calculated initialOfflineDuration: ${offlineSeconds}s (offlineMs: ${offlineMs})`);
      setInitialOfflineDuration(offlineSeconds);
    }
  };

  // Setter for boostedInvestments that also persists to localStorage
  const setBoostedInvestments = useCallback((updater) => {
    setBoostedInvestmentsData(prevBoosted => {
      const newBoostedArray = typeof updater === 'function' ? updater(prevBoosted) : updater;
      // Persist each boosted state individually to localStorage
      newBoostedArray.forEach((isBoosted, index) => {
        localStorage.setItem(`boosted-${index}`, JSON.stringify(isBoosted));
      });
      return newBoostedArray;
    });
  }, []);

  return {
    // States
    money, setMoney,
    cooldowns, setCooldowns,
    managers, setManagers,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    globalPriceDecrease, setGlobalPriceDecrease,
    globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel,
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
    satisfaction, setSatisfaction,
    dissatisfaction, setDissatisfaction,
    stateBuildings, setStateBuildings,
    isStateUnlocked, setIsStateUnlocked,
    isInterventionsUnlocked, setIsInterventionsUnlocked,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    offlineEarningsLevel, setOfflineEarningsLevel, // Expose new state and setter
    criticalClickChanceLevel, setCriticalClickChanceLevel, // Expose new state and setter
    boostedInvestments: boostedInvestmentsData, // Expose the data
    setBoostedInvestments, // Expose the custom setter
    initialOfflineDuration, // Expose the initial offline duration
   
    // Save/Load
    gameState,
    loadGameState
  };
}