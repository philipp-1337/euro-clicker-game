import { useState, useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useGameState(easyMode = false) {
  // Hauptzustände
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);
  
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

  const [activePlayTime, setActivePlayTime] = useState(gameConfig.initialState.activePlayTime ?? 0);
  const [inactivePlayTime, setInactivePlayTime] = useState(gameConfig.initialState.inactivePlayTime ?? 0);

  // State to store the calculated offline duration on initial load
  const [initialOfflineDuration, setInitialOfflineDuration] = useState(0);

  // State für Offline-Einnahmen
  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(gameConfig.initialState.offlineEarningsLevel);

  // State for Critical Click Chance
  const [criticalClickChanceLevel, setCriticalClickChanceLevel] = useState(gameConfig.initialState.criticalClickChanceLevel);

  // State für Floating Click Value Premium Upgrade
  const [floatingClickValueLevel, setFloatingClickValueLevel] = useState(gameConfig.initialState.floatingClickValueLevel ?? 0);
  const [floatingClickValueMultiplier, setFloatingClickValueMultiplier] = useState(gameConfig.initialState.floatingClickValueMultiplier ?? 1);

  // State für Crafting Tab freigeschaltet
  const [isCraftingUnlocked, setIsCraftingUnlocked] = useState(gameConfig.initialState.isCraftingUnlocked ?? false);
  // State for crafting items
  const [craftingItems, setCraftingItems] = useState(gameConfig.initialState.craftingItems ?? gameConfig.craftingRecipes.map(() => 0));

  // State for raw materials and purchase counts
  const [rawMaterials, setRawMaterials] = useState(gameConfig.initialState.rawMaterials ?? { metal: 0, parts: 0, tech: 0 });
  const [resourcePurchaseCounts, setResourcePurchaseCounts] = useState(gameConfig.initialState.resourcePurchaseCounts ?? { metal: 0, parts: 0, tech: 0 });

  // State for boosted investments
  const [boostedInvestmentsData, setBoostedInvestmentsData] = useState(() => {
    return gameConfig.investments.map((_, index) => {
      const storedValue = typeof window !== 'undefined' ? localStorage.getItem(`boosted-${index}`) : null;
      return storedValue ? JSON.parse(storedValue) : false;
    });
  });

  // State for Prestige Shares
  const [prestigeShares, setPrestigeShares] = useState(gameConfig.initialState.prestigeShares);
  // State for Prestige Count (wie oft Prestige ausgelöst wurde)
  const [prestigeCount, setPrestigeCount] = useState(gameConfig.initialState.prestigeCount ?? 0);

  // State for click history (for calculating clicks per second)
  const [clickHistory, setClickHistory] = useState([]);


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
    activePlayTime,
    inactivePlayTime,
    offlineEarningsLevel, // Add to game state
    criticalClickChanceLevel, // Add to game state
    floatingClickValueLevel, // Add to game state
    floatingClickValueMultiplier, // Add to game state
    isCraftingUnlocked, // Crafting Tab freigeschaltet
    craftingItems, // Add crafting items to game state
    rawMaterials,
    resourcePurchaseCounts,
    boostedInvestments: boostedInvestmentsData, // Add to game state
    prestigeShares, // Add prestige shares to game state
    prestigeCount, // Add prestige count to game state
    clickHistory, // Add click history to game state
    lastSaved: new Date().getTime(), // Automatically include current timestamp
  };

  // Funktion zum Setzen des kompletten Spielzustands (für Load-Funktionalität)
  const loadGameState = (savedState) => {
    if (!savedState) return;
    // Ensure money is a valid number, default to initial state if not
    const loadedMoney = savedState.money;
    setMoney(typeof loadedMoney === 'number' && !isNaN(loadedMoney)
      ? loadedMoney
      : gameConfig.initialState.money);
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
    setActivePlayTime(savedState.activePlayTime ?? gameConfig.initialState.activePlayTime ?? 0);

    // Load offlineEarningsLevel, with migration for old isOfflineEarningsUnlocked
    if (savedState.offlineEarningsLevel !== undefined) {
      setOfflineEarningsLevel(savedState.offlineEarningsLevel);
    } else if (savedState.isOfflineEarningsUnlocked === true) {
      setOfflineEarningsLevel(1); // Migrate old save: if it was unlocked, set to level 1
    } else {
      setOfflineEarningsLevel(gameConfig.initialState.offlineEarningsLevel);
    }
    const loadedPrestigeShares = savedState.prestigeShares;
    setPrestigeShares(typeof loadedPrestigeShares === 'number' && !isNaN(loadedPrestigeShares)
      ? loadedPrestigeShares : gameConfig.initialState.prestigeShares);
    // Prestige Count laden
    setPrestigeCount(typeof savedState.prestigeCount === 'number' && !isNaN(savedState.prestigeCount)
      ? savedState.prestigeCount : (gameConfig.initialState.prestigeCount ?? 0));
    setCriticalClickChanceLevel(savedState.criticalClickChanceLevel ?? gameConfig.initialState.criticalClickChanceLevel);
    setInactivePlayTime(savedState.inactivePlayTime ?? gameConfig.initialState.inactivePlayTime ?? 0); // Lädt die gespeicherte Inaktivitätszeit
    setFloatingClickValueLevel(savedState.floatingClickValueLevel ?? (gameConfig.initialState.floatingClickValueLevel ?? 0));
    setFloatingClickValueMultiplier(savedState.floatingClickValueMultiplier ?? (gameConfig.initialState.floatingClickValueMultiplier ?? 1));
    setClickHistory(savedState.clickHistory ?? []);
    setIsCraftingUnlocked(savedState.isCraftingUnlocked ?? false);
    setCraftingItems(savedState.craftingItems ?? gameConfig.craftingRecipes.map(() => 0));
    setRawMaterials(savedState.rawMaterials ?? { metal: 0, parts: 0, tech: 0 });
    setResourcePurchaseCounts(savedState.resourcePurchaseCounts ?? { metal: 0, parts: 0, tech: 0 });

    // Schreibe Crafting-Unlock-Status auch in LocalStorage für Cross-Device
    try {
      const save = JSON.parse(localStorage.getItem('clickerSave') || '{}');
      save.isCraftingUnlocked = savedState.isCraftingUnlocked ?? false;
      localStorage.setItem('clickerSave', JSON.stringify(save));
    } catch {}

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
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    offlineEarningsLevel, setOfflineEarningsLevel,
    criticalClickChanceLevel, setCriticalClickChanceLevel,
    floatingClickValueLevel, setFloatingClickValueLevel,
    floatingClickValueMultiplier, setFloatingClickValueMultiplier,
    boostedInvestments: boostedInvestmentsData,
    setBoostedInvestments,
    prestigeShares, setPrestigeShares,
    prestigeCount, setPrestigeCount,
    clickHistory, setClickHistory,
    initialOfflineDuration,
  isCraftingUnlocked, setIsCraftingUnlocked,
  craftingItems, setCraftingItems,
    rawMaterials, setRawMaterials,
    resourcePurchaseCounts, setResourcePurchaseCounts,

    // Save/Load
    gameState,
    loadGameState
  };
}
