import { useState, useCallback } from 'react';
import {
  createDefaultCraftingProductionState,
  getInvestmentBoostStateKey,
  getBoostedInvestmentsProjection,
  gameConfig,
  normalizeInvestmentBoostState,
  normalizeCraftingProductionState,
  toPersistedCraftingProductionState,
  toPersistedInvestmentBoostState,
} from '@constants/gameConfig';

const hasBrowserStorage = () => typeof window !== 'undefined';

const readBooleanFromStorage = (key) => {
  if (!hasBrowserStorage()) {
    return null;
  }

  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return null;
  }
};

const readCraftingCooldownsFromStorage = () => {
  if (!hasBrowserStorage()) {
    return [];
  }

  try {
    const storedValue = localStorage.getItem('craftingCooldowns');
    const parsedValue = JSON.parse(storedValue || '[]');
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const hydrateInvestmentBoostStates = ({
  savedBoostStates,
  savedBoostedFlags,
  preferSavedStates = false,
} = {}) => {
  const hydratedStates = {};
  const savedStatesAreLegacyArray = Array.isArray(savedBoostStates);

  gameConfig.investments.forEach((investment, index) => {
    const investmentId = getInvestmentBoostStateKey(investment);
    const savedStateForInvestment = preferSavedStates
      ? (
        savedStatesAreLegacyArray
          ? savedBoostStates[index]
          : savedBoostStates?.[investmentId]
      )
      : null;

    if (preferSavedStates) {
      if (savedStateForInvestment) {
        hydratedStates[investmentId] = normalizeInvestmentBoostState(investment, savedStateForInvestment);
      } else {
        hydratedStates[investmentId] = normalizeInvestmentBoostState(investment);
      }
      return;
    }

    if (savedStateForInvestment) {
      hydratedStates[investmentId] = normalizeInvestmentBoostState(investment, savedStateForInvestment);
      return;
    }

    const legacyBoosted = Array.isArray(savedBoostedFlags) && typeof savedBoostedFlags[index] === 'boolean'
      ? savedBoostedFlags[index]
      : readBooleanFromStorage(`boosted-${index}`) === true;
    const legacyClicksRaw = hasBrowserStorage() ? localStorage.getItem(`boostClicks-${index}`) : null;
    const legacyClicks = Number.parseInt(legacyClicksRaw ?? '', 10);

    hydratedStates[investmentId] = normalizeInvestmentBoostState(investment, {
      currentProgress: legacyBoosted
        ? Math.max(
          Number.isFinite(legacyClicks) ? legacyClicks : 0,
          investment?.boostRule?.target ?? 0
        )
        : (Number.isFinite(legacyClicks) ? legacyClicks : 0),
      boosted: legacyBoosted,
      completedAt: null,
    });
  });

  return hydratedStates;
};

const hydrateCraftingProductionState = (savedCraftingProductionState) => {
  if (savedCraftingProductionState && typeof savedCraftingProductionState === 'object') {
    return normalizeCraftingProductionState(savedCraftingProductionState);
  }

  const legacyCooldowns = readCraftingCooldownsFromStorage();
  const defaultState = createDefaultCraftingProductionState();

  return gameConfig.craftingRecipes.reduce((accumulator, recipe, index) => {
    const legacyCompletionTime = legacyCooldowns[index];
    const recipeState = defaultState[recipe.id];

    if (Number.isFinite(legacyCompletionTime)) {
      accumulator[recipe.id] = {
        ...recipeState,
        lastCompletionAt: null,
        pendingOutcome: {
          recipeId: recipe.id,
          modeId: recipeState.selectedModeId,
          completionTime: legacyCompletionTime,
          qualityBonusApplied: null,
          rareBonusApplied: null,
          money: null,
        },
      };
      return accumulator;
    }

    accumulator[recipe.id] = recipeState;
    return accumulator;
  }, {});
};

export default function useGameState() {
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);

  const [valueMultipliers, setValueMultipliers] = useState([...gameConfig.initialState.valueMultipliers]);
  const [cooldownReductions, setCooldownReductions] = useState([...gameConfig.initialState.cooldownReductions]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([...gameConfig.initialState.valueUpgradeLevels]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([...gameConfig.initialState.cooldownUpgradeLevels]);

  const [globalMultiplier, setGlobalMultiplier] = useState(gameConfig.initialState.globalMultiplier);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(gameConfig.initialState.globalMultiplierLevel);
  const [globalPriceDecrease, setGlobalPriceDecrease] = useState(gameConfig.initialState.globalPriceDecrease);
  const [globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel] = useState(gameConfig.initialState.globalPriceDecreaseLevel);

  const [isInvestmentUnlocked, setIsInvestmentUnlocked] = useState(
    gameConfig.initialState.isInvestmentUnlocked ?? false
  );

  const [investments, setInvestments] = useState(
    gameConfig.initialState.investments ?? gameConfig.investments.map(() => 0)
  );

  const [activePlayTime, setActivePlayTime] = useState(gameConfig.initialState.activePlayTime ?? 0);
  const [inactivePlayTime, setInactivePlayTime] = useState(gameConfig.initialState.inactivePlayTime ?? 0);

  const [initialOfflineDuration, setInitialOfflineDuration] = useState(0);

  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(gameConfig.initialState.offlineEarningsLevel);

  const [criticalClickChanceLevel, setCriticalClickChanceLevel] = useState(gameConfig.initialState.criticalClickChanceLevel);

  const [floatingClickValueLevel, setFloatingClickValueLevel] = useState(gameConfig.initialState.floatingClickValueLevel ?? 0);
  const [floatingClickValueMultiplier, setFloatingClickValueMultiplier] = useState(gameConfig.initialState.floatingClickValueMultiplier ?? 1);

  const [isCraftingUnlocked, setIsCraftingUnlocked] = useState(gameConfig.initialState.isCraftingUnlocked ?? false);
  const [craftingItems, setCraftingItems] = useState(gameConfig.initialState.craftingItems ?? gameConfig.craftingRecipes.map(() => 0));

  const [rawMaterials, setRawMaterials] = useState(gameConfig.initialState.rawMaterials ?? { metal: 0, parts: 0, tech: 0 });
  const [resourcePurchaseCounts, setResourcePurchaseCounts] = useState(gameConfig.initialState.resourcePurchaseCounts ?? { metal: 0, parts: 0, tech: 0 });
  const [craftingProductionStateData, setCraftingProductionStateData] = useState(() => {
    return hydrateCraftingProductionState(gameConfig.initialState.craftingProductionState);
  });

  const [autoBuyerInterval, setAutoBuyerInterval] = useState(gameConfig.initialState.autoBuyerInterval);
  const [autoBuyerBuffer, setAutoBuyerBuffer] = useState(gameConfig.initialState.autoBuyerBuffer);
  const [autoBuyerUnlocked, setAutoBuyerUnlocked] = useState(gameConfig.initialState.autoBuyerUnlocked);
  const [cooldownAutoBuyerUnlocked, setCooldownAutoBuyerUnlocked] = useState(gameConfig.initialState.cooldownAutoBuyerUnlocked);
  const [autoBuyValueUpgradeEnabled, setAutoBuyValueUpgradeEnabled] = useState(gameConfig.initialState.autoBuyValueUpgradeEnabled ?? false);
  const [autoBuyCooldownUpgradeEnabled, setAutoBuyCooldownUpgradeEnabled] = useState(gameConfig.initialState.autoBuyCooldownUpgradeEnabled ?? false);
  const [globalMultiplierAutoBuyerUnlocked, setGlobalMultiplierAutoBuyerUnlocked] = useState(gameConfig.initialState.globalMultiplierAutoBuyerUnlocked);
  const [globalPriceDecreaseAutoBuyerUnlocked, setGlobalPriceDecreaseAutoBuyerUnlocked] = useState(gameConfig.initialState.globalPriceDecreaseAutoBuyerUnlocked);
  const [autoBuyGlobalMultiplierEnabled, setAutoBuyGlobalMultiplierEnabled] = useState(gameConfig.initialState.autoBuyGlobalMultiplierEnabled);
  const [autoBuyGlobalPriceDecreaseEnabled, setAutoBuyGlobalPriceDecreaseEnabled] = useState(gameConfig.initialState.autoBuyGlobalPriceDecreaseEnabled);

  const [floatingClickValueAutobuyerUnlocked, setFloatingClickValueAutobuyerUnlocked] = useState(gameConfig.initialState.floatingClickValueAutobuyerUnlocked);
  const [floatingClickValueAutobuyerEnabled, setFloatingClickValueAutobuyerEnabled] = useState(gameConfig.initialState.floatingClickValueAutobuyerEnabled);

  const [investmentBoostStatesData, setInvestmentBoostStatesData] = useState(() => {
    return hydrateInvestmentBoostStates();
  });

  const [prestigeShares, setPrestigeShares] = useState(gameConfig.initialState.prestigeShares);
  const [prestigeCount, setPrestigeCount] = useState(gameConfig.initialState.prestigeCount ?? 0);

  const [clickHistory, setClickHistory] = useState([]);

  const boostedInvestments = getBoostedInvestmentsProjection(investmentBoostStatesData, gameConfig.investments);

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
    offlineEarningsLevel,
    criticalClickChanceLevel,
    floatingClickValueLevel,
    floatingClickValueMultiplier,
    isCraftingUnlocked,
    craftingItems,
    rawMaterials,
    resourcePurchaseCounts,
    craftingProductionState: toPersistedCraftingProductionState(craftingProductionStateData),
    investmentBoostStates: Object.fromEntries(
      Object.entries(investmentBoostStatesData).map(([investmentId, state]) => [
        investmentId,
        toPersistedInvestmentBoostState(state),
      ])
    ),
    boostedInvestments,
    prestigeShares,
    prestigeCount,
    clickHistory,
    autoBuyerInterval,
    autoBuyerBuffer,
    autoBuyerUnlocked,
    cooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled,
    globalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked,
    autoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled,
    floatingClickValueAutobuyerUnlocked,
    floatingClickValueAutobuyerEnabled,
    lastSaved: new Date().getTime(),
  };

  const loadGameState = (savedState) => {
    if (!savedState) return;

    const loadedMoney = savedState.money;
    setMoney(typeof loadedMoney === 'number' && !Number.isNaN(loadedMoney)
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

    if (savedState.offlineEarningsLevel !== undefined) {
      setOfflineEarningsLevel(savedState.offlineEarningsLevel);
    } else if (savedState.isOfflineEarningsUnlocked === true) {
      setOfflineEarningsLevel(1);
    } else {
      setOfflineEarningsLevel(gameConfig.initialState.offlineEarningsLevel);
    }

    const loadedPrestigeShares = savedState.prestigeShares;
    setPrestigeShares(typeof loadedPrestigeShares === 'number' && !Number.isNaN(loadedPrestigeShares)
      ? loadedPrestigeShares
      : gameConfig.initialState.prestigeShares);
    setPrestigeCount(typeof savedState.prestigeCount === 'number' && !Number.isNaN(savedState.prestigeCount)
      ? savedState.prestigeCount
      : (gameConfig.initialState.prestigeCount ?? 0));
    setCriticalClickChanceLevel(savedState.criticalClickChanceLevel ?? gameConfig.initialState.criticalClickChanceLevel);
    setInactivePlayTime(savedState.inactivePlayTime ?? gameConfig.initialState.inactivePlayTime ?? 0);
    setFloatingClickValueLevel(savedState.floatingClickValueLevel ?? (gameConfig.initialState.floatingClickValueLevel ?? 0));
    setFloatingClickValueMultiplier(savedState.floatingClickValueMultiplier ?? (gameConfig.initialState.floatingClickValueMultiplier ?? 1));
    setClickHistory(savedState.clickHistory ?? []);
    setIsCraftingUnlocked(savedState.isCraftingUnlocked ?? false);
    setCraftingItems(savedState.craftingItems ?? gameConfig.craftingRecipes.map(() => 0));
    setRawMaterials(savedState.rawMaterials ?? { metal: 0, parts: 0, tech: 0 });
    setResourcePurchaseCounts(savedState.resourcePurchaseCounts ?? { metal: 0, parts: 0, tech: 0 });
    setCraftingProductionStateData(hydrateCraftingProductionState(savedState.craftingProductionState));
    setAutoBuyerInterval(savedState.autoBuyerInterval ?? gameConfig.initialState.autoBuyerInterval);
    setAutoBuyerBuffer(savedState.autoBuyerBuffer ?? gameConfig.initialState.autoBuyerBuffer);
    setAutoBuyerUnlocked(savedState.autoBuyerUnlocked ?? gameConfig.initialState.autoBuyerUnlocked);
    setCooldownAutoBuyerUnlocked(savedState.cooldownAutoBuyerUnlocked ?? gameConfig.initialState.cooldownAutoBuyerUnlocked);
    setAutoBuyValueUpgradeEnabled(savedState.autoBuyValueUpgradeEnabled ?? gameConfig.initialState.autoBuyValueUpgradeEnabled ?? false);
    setAutoBuyCooldownUpgradeEnabled(savedState.autoBuyCooldownUpgradeEnabled ?? gameConfig.initialState.autoBuyCooldownUpgradeEnabled ?? false);
    setGlobalMultiplierAutoBuyerUnlocked(savedState.globalMultiplierAutoBuyerUnlocked ?? false);
    setGlobalPriceDecreaseAutoBuyerUnlocked(savedState.globalPriceDecreaseAutoBuyerUnlocked ?? false);
    setAutoBuyGlobalMultiplierEnabled(savedState.autoBuyGlobalMultiplierEnabled ?? false);
    setAutoBuyGlobalPriceDecreaseEnabled(savedState.autoBuyGlobalPriceDecreaseEnabled ?? false);
    setFloatingClickValueAutobuyerUnlocked(savedState.floatingClickValueAutobuyerUnlocked ?? false);
    setFloatingClickValueAutobuyerEnabled(savedState.floatingClickValueAutobuyerEnabled ?? false);

    try {
      const clickerSaveRaw = localStorage.getItem('clickerSave');
      let save = {};
      if (clickerSaveRaw) {
        try {
          save = JSON.parse(clickerSaveRaw);
        } catch {
          save = {};
        }
      }
      save.isCraftingUnlocked = savedState.isCraftingUnlocked ?? false;
      localStorage.setItem('clickerSave', JSON.stringify(save));
    } catch (e) {
      console.error('Error updating localStorage for clickerSave:', e);
    }

    const loadedBoostStates = hydrateInvestmentBoostStates({
      savedBoostStates: savedState.investmentBoostStates,
      savedBoostedFlags: savedState.boostedInvestments,
      preferSavedStates: Object.prototype.hasOwnProperty.call(savedState, 'investmentBoostStates'),
    });
    setInvestmentBoostStatesData(loadedBoostStates);

    if (savedState.lastSaved) {
      const currentTime = Date.now();
      const offlineMs = currentTime - savedState.lastSaved;
      const offlineSeconds = Math.floor(offlineMs / 1000);
      setInitialOfflineDuration(offlineSeconds);
    }
  };

  const setInvestmentBoostStates = useCallback((updater) => {
    setInvestmentBoostStatesData((prevStates) => {
      const nextStatesInput = typeof updater === 'function' ? updater(prevStates) : updater;
      const normalizedStates = gameConfig.investments.reduce((accumulator, investment, index) => {
        const investmentId = getInvestmentBoostStateKey(investment);
        const candidateState = nextStatesInput?.[investmentId]
          ?? (Array.isArray(nextStatesInput) ? nextStatesInput[index] : null)
          ?? prevStates[investmentId];
        accumulator[investmentId] = normalizeInvestmentBoostState(investment, candidateState);
        return accumulator;
      }, {});
      return normalizedStates;
    });
  }, []);

  const setCraftingProductionState = useCallback((updater) => {
    setCraftingProductionStateData((previousState) => {
      const nextStateInput = typeof updater === 'function' ? updater(previousState) : updater;
      return normalizeCraftingProductionState(nextStateInput);
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
    autoBuyerInterval, setAutoBuyerInterval,
    autoBuyerBuffer, setAutoBuyerBuffer,
    autoBuyerUnlocked, setAutoBuyerUnlocked,
    cooldownAutoBuyerUnlocked, setCooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled, setAutoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled, setAutoBuyCooldownUpgradeEnabled,
    globalMultiplierAutoBuyerUnlocked, setGlobalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked, setGlobalPriceDecreaseAutoBuyerUnlocked,
    autoBuyGlobalMultiplierEnabled, setAutoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled, setAutoBuyGlobalPriceDecreaseEnabled,
    floatingClickValueAutobuyerUnlocked, setFloatingClickValueAutobuyerUnlocked,
    floatingClickValueAutobuyerEnabled, setFloatingClickValueAutobuyerEnabled,
    investmentBoostStates: investmentBoostStatesData,
    setInvestmentBoostStates,
    boostedInvestments,
    prestigeShares, setPrestigeShares,
    prestigeCount, setPrestigeCount,
    clickHistory, setClickHistory,
    initialOfflineDuration,
    isCraftingUnlocked, setIsCraftingUnlocked,
    craftingItems, setCraftingItems,
    rawMaterials, setRawMaterials,
    resourcePurchaseCounts, setResourcePurchaseCounts,
    craftingProductionState: craftingProductionStateData,
    setCraftingProductionState,
    gameState,
    loadGameState
  };
}
