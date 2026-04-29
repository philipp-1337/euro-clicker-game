import { useCallback, useState, useEffect } from 'react';
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
import useProductionHq from './useProductionHq';
import useProductionAutomation from './useProductionAutomation';
import useAtomicMoney from './useAtomicMoney';
import useProductionHqPhase from './useProductionHqPhase';
import { getGamePhaseRuntimeFlags } from './useGamePhase.helpers';
import useProductionHqLoop from './useProductionHqLoop';

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
    gamePhase, setGamePhase,
    hasEnteredProductionHq, setHasEnteredProductionHq,
    hqMaterials, setHqMaterials,
    hqComponents, setHqComponents,
    hqTier, setHqTier,
    hqProgress, setHqProgress,
    hqProductionState, setHqProductionState,
    hqUpgrades, setHqUpgrades,
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
    floatingClickValueAutobuyerUnlocked, setFloatingClickValueAutobuyerUnlocked,
    floatingClickValueAutobuyerEnabled, setFloatingClickValueAutobuyerEnabled,
    craftingProductionState, setCraftingProductionState,
    productionHqUpgrades, setProductionHqUpgrades,
    isProductionHqUnlocked, setIsProductionHqUnlocked,
    autoBuyMaterialsEnabled, setAutoBuyMaterialsEnabled,
    autoCraftEnabled, setAutoCraftEnabled,
  } = gameStateHook;

  // UI states
  const [isAutoBuyerModalOpen, setIsAutoBuyerModalOpen] = useState(false);
  const [isProductionHqTransitionOpen, setIsProductionHqTransitionOpen] = useState(false);
  const { spendMoney } = useAtomicMoney(money, setMoney);
  const phaseFlags = getGamePhaseRuntimeFlags(gamePhase);

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
    globalPriceDecrease,
    spendMoney
  );

  // Manager system
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);
  const { buyManager } = useManagers(money, setMoney, managers, setManagers, ensureStartTime, soundEffectsEnabled, spendMoney);
  const managerCosts = gameConfig.getBaseManagerCosts().map(cost => cost * costMultiplier);

  // Investment system
  const { buyInvestment, totalIncomePerSecond: investmentIncomePerSecond, costMultiplier: investmentCostMultiplier } = useInvestments(
    money, setMoney, investments, setInvestments, ensureStartTime, easyMode, investmentBoostStates, spendMoney
  );

  const investmentBoostsHook = useInvestmentBoosts(
    investmentBoostStates,
    setInvestmentBoostStates,
    {
      getEffectiveInvestmentCost: (investment) => investment.cost * investmentCostMultiplier,
    }
  );

  // Production HQ system
  const productionHqPhaseHook = useProductionHqPhase({
    craftingItems,
    gamePhase,
    setGamePhase,
    hasEnteredProductionHq,
    setHasEnteredProductionHq,
  });

  const productionHqHook = useProductionHq({
    craftingItems, setCraftingItems,
    productionHqUpgrades, setProductionHqUpgrades,
  });

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
    craftingProductionState, setCraftingProductionState,
    productionHqHook.productionHqValueMultiplier,
    productionHqHook.productionHqSpeedMultiplier,
    productionHqHook.productionHqMaterialCostMultiplier,
    productionHqHook.productionHqRareChanceBonus,
    spendMoney,
  );

  // Core economy management
  const economyHook = useGameEconomy({
    enabled: phaseFlags.runCapitalTimers,
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
    floatingClickValueLevel, setFloatingClickValueLevel, setFloatingClickValueMultiplier,
    spendMoney
  });

  // Auto-buyers system
  const autoBuyersHook = useAutoBuyers({
    enabled: phaseFlags.runCapitalTimers,
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

    floatingClickValueAutobuyerUnlocked,
    setFloatingClickValueAutobuyerUnlocked,
    floatingClickValueAutobuyerEnabled,
    floatingClickValueLevel,
    setFloatingClickValueLevel,
    setFloatingClickValueMultiplier,
    spendMoney,
  });

  // Offline earnings system
  const offlineEarningsHook = useOfflineEarnings({
    enabled: phaseFlags.runCapitalTimers,
    isGameStarted, totalMoneyPerSecond: economyHook.totalMoneyPerSecond,
    offlineEarningsLevel, initialOfflineDuration,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    setMoney
  });

  // Floating click system
  const floatingClickHook = useFloatingClick({
    enabled: phaseFlags.allowCapitalActions,
    money, setMoney, setClickHistory,
    totalMoneyPerSecond: economyHook.totalMoneyPerSecond,
    criticalClickChanceLevel,
    floatingClickValueMultiplier,
    criticalHitMultiplier: premiumUpgradesHook.criticalHitMultiplier,
    ensureStartTime
  });

  // Click handling and cooldowns
  const { handleClick } = useCooldowns(
    cooldowns, setCooldowns, managers, buttons, money, setMoney, soundEffectsEnabled, phaseFlags.runCapitalTimers
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

    if (investments[index] === 0 && buyInvestment(index)) {
      propagateInvestmentBoostEvent(
        {
          trigger: 'investment_purchase',
          amount: 1,
          availableMoney: money,
        },
        { includeInvestmentId: investment.id }
      );
    }
  }, [buyInvestment, investments, money, propagateInvestmentBoostEvent]);

  const wrappedBuyManager = useCallback((index, cost) => {
    if (!managers[index] && buyManager(index, cost)) {
      propagateInvestmentBoostEvent({
        trigger: 'manager_purchase',
        amount: 1,
        availableMoney: money,
      });
    }
  }, [buyManager, managers, money, propagateInvestmentBoostEvent]);

  const wrappedBuyValueUpgrade = useCallback((index, quantity = 1) => {
    const normalizedQuantity = Math.max(1, quantity);
    if (!buyValueUpgrade(index, normalizedQuantity)) {
      return;
    }
    propagateInvestmentBoostEvent({
      trigger: 'upgrade_purchase',
      amount: normalizedQuantity,
      availableMoney: money,
    });
  }, [buyValueUpgrade, money, propagateInvestmentBoostEvent]);

  const wrappedBuyCooldownUpgrade = useCallback((index, quantity = 1) => {
    const normalizedQuantity = Math.max(1, quantity);
    if (!buyCooldownUpgrade(index, normalizedQuantity)) {
      return;
    }
    propagateInvestmentBoostEvent({
      trigger: 'upgrade_purchase',
      amount: normalizedQuantity,
      availableMoney: money,
    });
  }, [buyCooldownUpgrade, money, propagateInvestmentBoostEvent]);

  const wrappedPremiumUpgradePurchase = useCallback((buyFn, quantity = 1) => {
    const normalizedQuantity = Math.max(1, quantity);

    const purchaseSucceeded = buyFn(normalizedQuantity);

    if (!purchaseSucceeded) {
      return;
    }
    propagateInvestmentBoostEvent({
      trigger: 'upgrade_purchase',
      amount: normalizedQuantity,
      availableMoney: money,
    });
  }, [money, propagateInvestmentBoostEvent]);

  const wrappedBuyMaterial = useCallback((materialId, quantity = 1) => {
    if (quantity <= 0) {
      buyMaterial(materialId, quantity);
      return;
    }

    const purchaseSucceeded = buyMaterial(materialId, quantity);

    if (!purchaseSucceeded) {
      return;
    }

    propagateInvestmentBoostEvent({
      trigger: 'material_purchase',
      amount: 1,
      availableMoney: money,
    });
  }, [buyMaterial, money, propagateInvestmentBoostEvent]);

  // Investment unlock logic
  const unlockInvestments = useCallback(() => {
    const unlockCost = gameConfig.unlockInvestmentCost * costMultiplier;
    if (!spendMoney(unlockCost)) {
      return false;
    }

    ensureStartTime?.();
    setIsInvestmentUnlocked(true);
    return true;
  }, [costMultiplier, ensureStartTime, setIsInvestmentUnlocked, spendMoney]);

  const unlockInvestmentCost = gameConfig.unlockInvestmentCost * costMultiplier;

  // Save game functionality
  const { saveGame } = useLocalStorage(gameState, loadGameState);
  
  // Update economy hook's saveGame reference
  economyHook.saveGame = saveGame;

  // Production Automation system
  useProductionAutomation({
    enabled: phaseFlags.runCapitalTimers,
    autoBuyMaterialsEnabled,
    autoCraftEnabled,
    rawMaterials,
    craftingItems,
    buyMaterial: wrappedBuyMaterial,
    craftingProductionState,
    startCraftingProduction,
    claimCraftingProduction,
    productionHqUpgrades,
  });

  useEffect(() => {
    if (!isProductionHqUnlocked && craftingItems[0] >= 10 && craftingItems[1] >= 5) {
      setIsProductionHqUnlocked(true);
    }
  }, [craftingItems, isProductionHqUnlocked, setIsProductionHqUnlocked]);

  const confirmProductionHqTransition = useCallback(() => {
    const didEnter = productionHqPhaseHook.enterProductionHq();

    if (didEnter) {
      setIsProductionHqTransitionOpen(false);
    }

    return didEnter;
  }, [productionHqPhaseHook]);

  const productionHqLoop = useProductionHqLoop({
    enabled: gamePhase === 'hq_phase',
    hqMaterials,
    setHqMaterials,
    hqComponents,
    setHqComponents,
    hqTier,
    setHqTier,
    hqProgress,
    setHqProgress,
    hqProductionState,
    setHqProductionState,
    hqUpgrades,
    setHqUpgrades,
  });

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
    gamePhase,
    hasEnteredProductionHq,
    hqMaterials,
    hqComponents,
    hqTier,
    hqProgress,
    hqProductionState,
    hqUpgrades,
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
    buyValueUpgrade: wrappedBuyValueUpgrade,
    buyCooldownUpgrade: wrappedBuyCooldownUpgrade,
    unlockInvestments,
    buyInvestment: wrappedBuyInvestment,
    saveGame,
    addQuickMoney: floatingClickHook.addQuickMoney,

    // Premium upgrades
    ...premiumUpgradesHook,
    buyGlobalMultiplier: (quantity = 1) => wrappedPremiumUpgradePurchase(
      premiumUpgradesHook.buyGlobalMultiplier,
      quantity
    ),
    buyGlobalPriceDecrease: (quantity = 1) => wrappedPremiumUpgradePurchase(
      premiumUpgradesHook.buyGlobalPriceDecrease,
      quantity
    ),
    buyOfflineEarningsLevel: (quantity = 1) => wrappedPremiumUpgradePurchase(
      premiumUpgradesHook.buyOfflineEarningsLevel,
      quantity
    ),
    buyCriticalClickChanceLevel: (quantity = 1) => wrappedPremiumUpgradePurchase(
      premiumUpgradesHook.buyCriticalClickChanceLevel,
      quantity
    ),
    buyFloatingClickValue: (quantity = 1) => wrappedPremiumUpgradePurchase(
      premiumUpgradesHook.buyFloatingClickValue,
      quantity
    ),

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
    floatingClickValueAutobuyerUnlocked,
    floatingClickValueAutobuyerEnabled,
    setFloatingClickValueAutobuyerEnabled,

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
    isProductionHqUnlocked,
    canEnterProductionHq: productionHqPhaseHook.canEnterProductionHq,
    productionHqEntryState: productionHqPhaseHook,
    isProductionHqTransitionOpen,
    setIsProductionHqTransitionOpen,
    enterProductionHq: confirmProductionHqTransition,
    
    // Production HQ
    productionHqUpgrades,
    buyProductionHqUpgrade: productionHqHook.buyProductionHqUpgrade,
    autoBuyMaterialsEnabled,
    setAutoBuyMaterialsEnabled,
    autoCraftEnabled,
    setAutoCraftEnabled,
    productionHqMaterialCostMultiplier: productionHqHook.productionHqMaterialCostMultiplier,
    productionHqValueMultiplier: productionHqHook.productionHqValueMultiplier,
    productionHqSpeedMultiplier: productionHqHook.productionHqSpeedMultiplier,
    productionHqRareChanceBonus: productionHqHook.productionHqRareChanceBonus,
    setHqMaterials,
    setHqComponents,
    setHqTier,
    setHqProgress,
    setHqProductionState,
    setHqUpgrades,
    productionHqLoop,
  };
}
