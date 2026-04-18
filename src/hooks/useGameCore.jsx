import { useCallback, useState } from 'react';
import { gameConfig } from '@constants/gameConfig';
import useGameState from './useGameState';
import useGameCalculations from './useGameCalculations';
import useUpgrades from './useUpgrades';
import useManagers from './useManagers';
import useCooldowns from './useCooldowns';
import usePlaytime from './usePlaytime';
import useLocalStorage from './useLocalStorage';
import useInvestments from './useInvestments';
import useCrafting from './useCrafting';

// Import our new specialized hooks
import useGameEconomy from './useGameEconomy';
import useAutoBuyers from './useAutoBuyers';
import useOfflineEarnings from './useOfflineEarnings';
import useFloatingClick from './useFloatingClick';
import usePremiumUpgrades from './usePremiumUpgrades';
import useInvestmentBoosts from './useInvestmentBoosts';

/**
 * Main game orchestrator hook that coordinates all game systems.
 * This replaces the original useClickerGame hook with a cleaner, more modular structure.
 */
export default function useGameCore(easyMode = false, soundEffectsEnabled, buyQuantity = 1) {
  
  // Playtime management
  const { playTime, ensureStartTime, isGameStarted } = usePlaytime();
  
  // Base game state management
  const gameStateHook = useGameState(easyMode);
  const {
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
    gameState, loadGameState,
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    offlineEarningsLevel, setOfflineEarningsLevel,
    criticalClickChanceLevel, setCriticalClickChanceLevel,
    initialOfflineDuration,
    investmentBoostStates, setInvestmentBoostStates, boostedInvestments,
    prestigeShares, setPrestigeShares,
    prestigeCount, setPrestigeCount,
    setClickHistory,
    craftingItems, setCraftingItems,
    rawMaterials, setRawMaterials,
    resourcePurchaseCounts, setResourcePurchaseCounts,
    isCraftingUnlocked, setIsCraftingUnlocked,
    autoBuyerInterval, setAutoBuyerInterval,
    autoBuyerBuffer, setAutoBuyerBuffer,
    autoBuyerUnlocked, setAutoBuyerUnlocked,
    cooldownAutoBuyerUnlocked, setCooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled, setAutoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled, setAutoBuyCooldownUpgradeEnabled,
    floatingClickValueLevel, setFloatingClickValueLevel,
    floatingClickValueMultiplier, setFloatingClickValueMultiplier,
    autoBuyGlobalMultiplierEnabled, setAutoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled, setAutoBuyGlobalPriceDecreaseEnabled,
    globalMultiplierAutoBuyerUnlocked, setGlobalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked, setGlobalPriceDecreaseAutoBuyerUnlocked,
    craftingProductionState, setCraftingProductionState,
  } = gameStateHook;

  // UI states
  const [isAutoBuyerModalOpen, setIsAutoBuyerModalOpen] = useState(false);

  // Game calculations for derived states
  const {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    buttons
  } = useGameCalculations(
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueMultipliers,
    cooldownReductions,
    globalMultiplier,
    globalMultiplierLevel,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    easyMode
  );

  // Basic upgrade functions
  const { buyValueUpgrade, buyCooldownUpgrade } = useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    gameConfig,
    ensureStartTime,
    easyMode,
    globalPriceDecrease
  );

  // Manager system
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);
  const { buyManager } = useManagers(money, setMoney, managers, setManagers, ensureStartTime, soundEffectsEnabled);
  const managerCosts = gameConfig.getBaseManagerCosts().map(cost => cost * costMultiplier);

  // Investment system
  const { buyInvestment, totalIncomePerSecond: investmentIncomePerSecond, costMultiplier: investmentCostMultiplier } = useInvestments(
    money, setMoney, investments, setInvestments, ensureStartTime, easyMode, investmentBoostStates
  );

  const investmentBoostsHook = useInvestmentBoosts(
    investmentBoostStates,
    setInvestmentBoostStates,
    {
      getEffectiveInvestmentCost: (investment) => investment.cost * investmentCostMultiplier,
    }
  );

  // Crafting system
  const {
    buyCraftingItem,
    buyMaterial,
    startCraftingProduction,
    claimCraftingProduction,
    getSelectedProductionMode,
    setSelectedProductionMode,
    resolveCraftOutcome,
  } = useCrafting(
    money, setMoney, craftingItems, setCraftingItems, rawMaterials, setRawMaterials,
    resourcePurchaseCounts, setResourcePurchaseCounts, ensureStartTime, easyMode,
    craftingProductionState, setCraftingProductionState
  );

  // Core economy management
  const economyHook = useGameEconomy({
    money, setMoney, buttons, managers, investments,
    totalMoneyPerSecond: investmentIncomePerSecond,
    prestigeShares, setPrestigeShares,
    prestigeCount, setPrestigeCount,
    gameState, loadGameState, saveGame: () => {}, // Will be set below
    ensureStartTime
  });

  // Premium upgrades system
  const premiumUpgradesHook = usePremiumUpgrades({
    money, setMoney, easyMode, ensureStartTime,
    globalMultiplier, setGlobalMultiplier, globalMultiplierLevel, setGlobalMultiplierLevel,
    globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel, setGlobalPriceDecrease,
    offlineEarningsLevel, setOfflineEarningsLevel,
    criticalClickChanceLevel, setCriticalClickChanceLevel,
    floatingClickValueLevel, setFloatingClickValueLevel, setFloatingClickValueMultiplier
  });

  // Auto-buyers system
  const autoBuyersHook = useAutoBuyers({
    money, setMoney, easyMode, globalPriceDecrease, buyQuantity, ensureStartTime,
    autoBuyerUnlocked, setAutoBuyerUnlocked,
    cooldownAutoBuyerUnlocked, setCooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled, autoBuyCooldownUpgradeEnabled,
    autoBuyerInterval, autoBuyerBuffer,
    valueUpgradeLevels, setValueUpgradeLevels, setValueMultipliers,
    cooldownUpgradeLevels, setCooldownUpgradeLevels, setCooldownReductions,
    autoBuyGlobalMultiplierEnabled, 
    autoBuyGlobalPriceDecreaseEnabled, 
    globalMultiplierAutoBuyerUnlocked, setGlobalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked, setGlobalPriceDecreaseAutoBuyerUnlocked,
    buyGlobalMultiplier: premiumUpgradesHook.buyGlobalMultiplier,
    buyGlobalPriceDecrease: premiumUpgradesHook.buyGlobalPriceDecrease,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel,
    setGlobalMultiplier,
    setGlobalPriceDecrease,
  });

  // Offline earnings system
  const offlineEarningsHook = useOfflineEarnings({
    isGameStarted, totalMoneyPerSecond: economyHook.totalMoneyPerSecond,
    offlineEarningsLevel, initialOfflineDuration,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    setMoney
  });

  // Floating click system
  const floatingClickHook = useFloatingClick({
    money, setMoney, setClickHistory,
    totalMoneyPerSecond: economyHook.totalMoneyPerSecond,
    criticalClickChanceLevel,
    floatingClickValueMultiplier,
    criticalHitMultiplier: premiumUpgradesHook.criticalHitMultiplier,
    ensureStartTime
  });

  // Click handling and cooldowns
  const { handleClick } = useCooldowns(
    cooldowns, setCooldowns, managers, buttons, money, setMoney, soundEffectsEnabled
  );

  // Wrapped click handler to ensure start time
  const wrappedHandleClick = useCallback((index) => {
    ensureStartTime();
    handleClick(index);
  }, [ensureStartTime, handleClick]);

  const propagateInvestmentBoostEvent = useCallback((eventContext, options = {}) => {
    const includedInvestmentId = options.includeInvestmentId ?? null;

    gameConfig.investments.forEach((investment, index) => {
      const isOwned = investments[index] > 0;
      const isIncludedForEvent = investment.id === includedInvestmentId;

      if (!isOwned && !isIncludedForEvent) {
        return;
      }

      investmentBoostsHook.advanceBoost(investment.id, eventContext);
    });
  }, [investmentBoostsHook, investments]);

  const wrappedBuyInvestment = useCallback((index) => {
    const investment = gameConfig.investments[index];
    const investmentCost = investment.cost * investmentCostMultiplier;

    if (money >= investmentCost && investments[index] === 0) {
      buyInvestment(index);
      propagateInvestmentBoostEvent(
        {
          trigger: 'investment_purchase',
          amount: 1,
          availableMoney: money,
        },
        { includeInvestmentId: investment.id }
      );
    }
  }, [buyInvestment, investmentCostMultiplier, investments, money, propagateInvestmentBoostEvent]);

  const wrappedBuyManager = useCallback((index, cost) => {
    if (money >= cost && !managers[index]) {
      buyManager(index, cost);
      propagateInvestmentBoostEvent({
        trigger: 'manager_purchase',
        amount: 1,
        availableMoney: money,
      });
    }
  }, [buyManager, managers, money, propagateInvestmentBoostEvent]);

  const getMaterialPurchaseCost = useCallback((materialId, quantity) => {
    const material = gameConfig.rawMaterials.find((entry) => entry.id === materialId);

    if (!material || quantity <= 0) {
      return 0;
    }

    const costIncreaseFactor = material.costIncreaseFactor || 1.07;
    const costMultiplier = gameConfig.getCostMultiplier(easyMode);
    let purchaseCount = resourcePurchaseCounts[materialId] || 0;
    let totalCost = 0;

    for (let step = 0; step < quantity; step += 1) {
      totalCost += Math.ceil(material.baseCost * Math.pow(costIncreaseFactor, purchaseCount) * costMultiplier);
      purchaseCount += 1;
    }

    return totalCost;
  }, [easyMode, resourcePurchaseCounts]);

  const wrappedBuyMaterial = useCallback((materialId, quantity = 1) => {
    if (quantity <= 0) {
      buyMaterial(materialId, quantity);
      return;
    }

    const totalCost = getMaterialPurchaseCost(materialId, quantity);

    if (money >= totalCost) {
      buyMaterial(materialId, quantity);
      propagateInvestmentBoostEvent({
        trigger: 'material_purchase',
        amount: 1,
        availableMoney: money,
      });
    }
  }, [buyMaterial, getMaterialPurchaseCost, money, propagateInvestmentBoostEvent]);

  // Investment unlock logic
  const unlockInvestments = useCallback(() => {
    const unlockCost = gameConfig.unlockInvestmentCost * costMultiplier;
    if (money >= unlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - unlockCost);
      setIsInvestmentUnlocked(true);
    }
  }, [money, setMoney, setIsInvestmentUnlocked, costMultiplier, ensureStartTime]);

  const unlockInvestmentCost = gameConfig.unlockInvestmentCost * costMultiplier;

  // Save game functionality
  const { saveGame } = useLocalStorage(gameState, loadGameState);
  
  // Update economy hook's saveGame reference
  economyHook.saveGame = saveGame;

  return {
    // Basic game state
    money,
    buttons,
    cooldowns,
    managers,
    investments,
    isInvestmentUnlocked,
    playTime,
    activePlayTime,
    inactivePlayTime,
    gameState,
    valueMultipliers,
    cooldownReductions,

    // Economy data
    totalMoneyPerSecond: economyHook.totalMoneyPerSecond,
    manualMoneyPerSecond: floatingClickHook.manualMoneyPerSecond,

    // Prestige system
    prestigeShares,
    prestigeCount,
    currentRunShares: economyHook.currentRunShares,
    prestigeBonusMultiplier: economyHook.prestigeBonusMultiplier,
    canPrestige: economyHook.canPrestige,
    prestigeGame: economyHook.prestigeGame,

    // Core functions
    handleClick: wrappedHandleClick,
    buyManager: wrappedBuyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    unlockInvestments,
    buyInvestment: wrappedBuyInvestment,
    saveGame,
    addQuickMoney: floatingClickHook.addQuickMoney,

    // Premium upgrades
    ...premiumUpgradesHook,

    // Auto-buyers
    ...autoBuyersHook,
    autoBuyerUnlocked,
    cooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled,
    setAutoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled,
    setAutoBuyCooldownUpgradeEnabled,
    autoBuyerInterval,
    setAutoBuyerInterval,
    autoBuyerBuffer,
    setAutoBuyerBuffer,
    isAutoBuyerModalOpen,
    setIsAutoBuyerModalOpen,
    autoBuyGlobalMultiplierEnabled, setAutoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled, setAutoBuyGlobalPriceDecreaseEnabled,
    globalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked,

    // Offline earnings
    ...offlineEarningsHook,
    offlineEarningsLevel,

    // Floating click
    ...floatingClickHook,
    floatingClickValueLevel,
    floatingClickValueMultiplier,

    // Upgrade info
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplier,
    globalMultiplierLevel,
    globalMultiplierCost,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    managerCosts,
    unlockInvestmentCost,
    investmentCostMultiplier,

    // Critical clicks
    criticalClickChanceLevel,

    // Boosted investments
    investmentBoostStates,
    getInvestmentBoostState: investmentBoostsHook.getBoostState,
    advanceInvestmentBoost: investmentBoostsHook.advanceBoost,
    isInvestmentBoostCompleted: investmentBoostsHook.isBoostCompleted,
    getInvestmentBoostProgressLabel: investmentBoostsHook.getBoostProgressLabel,
    boostedInvestments,

    // Crafting system
    craftingItems,
    craftingProductionState,
    buyCraftingItem,
    startCraftingProduction,
    claimCraftingProduction,
    buyMaterial: wrappedBuyMaterial,
    getSelectedProductionMode,
    setSelectedProductionMode,
    resolveCraftOutcome,
    rawMaterials,
    resourcePurchaseCounts,
    setMoney,
    setCraftingItems,
    setRawMaterials,
    setResourcePurchaseCounts,
    isCraftingUnlocked,
    setIsCraftingUnlocked,
  };
}
