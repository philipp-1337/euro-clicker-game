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
    boostedInvestments, setBoostedInvestments,
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
    floatingClickValueMultiplier, setFloatingClickValueMultiplier
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
  const { buyValueUpgrade, buyCooldownUpgrade, buyGlobalMultiplier } = useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
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
    money, setMoney, investments, setInvestments, ensureStartTime, easyMode, boostedInvestments
  );

  // Crafting system
  const { buyCraftingItem, buyMaterial } = useCrafting(
    money, setMoney, craftingItems, setCraftingItems, rawMaterials, setRawMaterials,
    resourcePurchaseCounts, setResourcePurchaseCounts, ensureStartTime, easyMode
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

  // Auto-buyers system
  const autoBuyersHook = useAutoBuyers({
    money, setMoney, easyMode, globalPriceDecrease, buyQuantity, ensureStartTime,
    autoBuyerUnlocked, setAutoBuyerUnlocked,
    cooldownAutoBuyerUnlocked, setCooldownAutoBuyerUnlocked,
    autoBuyValueUpgradeEnabled, autoBuyCooldownUpgradeEnabled,
    autoBuyerInterval, autoBuyerBuffer,
    valueUpgradeLevels, setValueUpgradeLevels, setValueMultipliers,
    cooldownUpgradeLevels, setCooldownUpgradeLevels, setCooldownReductions
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
    criticalClickChanceLevel, floatingClickValueMultiplier,
    ensureStartTime
  });

  // Premium upgrades system
  const premiumUpgradesHook = usePremiumUpgrades({
    money, setMoney, easyMode, ensureStartTime,
    globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel, setGlobalPriceDecrease,
    offlineEarningsLevel, setOfflineEarningsLevel,
    criticalClickChanceLevel, setCriticalClickChanceLevel,
    floatingClickValueLevel, setFloatingClickValueLevel, setFloatingClickValueMultiplier
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

  // Investment boost handler
  const handleInvestmentBoost = useCallback((investmentIndex, isBoosted) => {
    setBoostedInvestments(prevBoosted => {
      const newBoosted = [...(prevBoosted || Array(gameConfig.investments.length).fill(false))];
      newBoosted[investmentIndex] = isBoosted;
      return newBoosted;
    });
  }, [setBoostedInvestments]);

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
    gameState, // <- Das fehlte!
    
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
    buyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    unlockInvestments,
    buyInvestment,
    saveGame,
    addQuickMoney: floatingClickHook.addQuickMoney,
    handleInvestmentBoost,
    
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
    boostedInvestments,
    
    // Crafting system
    craftingItems,
    buyCraftingItem,
    buyMaterial,
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