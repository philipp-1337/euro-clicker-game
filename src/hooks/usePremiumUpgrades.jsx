import { useCallback, useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';

/**
 * Manages all premium upgrades including:
 * - Global Multiplier upgrade
 * - Global Price Decrease upgrade
 * - Offline Earnings upgrade
 * - Critical Click Chance upgrade
 * - Floating Click Value upgrade
 * - Cost calculations and buy functions for all premium upgrades
 */
export default function usePremiumUpgrades({
  money,
  setMoney,
  easyMode,
  ensureStartTime,
  
  // Global Multiplier
  setGlobalMultiplier,
  globalMultiplierLevel,
  setGlobalMultiplierLevel,

  // Global Price Decrease
  globalPriceDecreaseLevel,
  setGlobalPriceDecreaseLevel,
  setGlobalPriceDecrease,
  
  // Offline Earnings
  offlineEarningsLevel,
  setOfflineEarningsLevel,
  
  // Critical Click Chance
  criticalClickChanceLevel,
  setCriticalClickChanceLevel,
  
  // Floating Click Value
  floatingClickValueLevel,
  setFloatingClickValueLevel,
  setFloatingClickValueMultiplier
}) {
  
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);

  // Global Multiplier Upgrade
  const globalMultiplierCost = useMemo(() =>
    gameConfig.premiumUpgrades.globalMultiplier.baseCost *
    Math.pow(gameConfig.premiumUpgrades.globalMultiplier.costExponent, globalMultiplierLevel) *
    costMultiplier,
    [globalMultiplierLevel, costMultiplier]
  );

  const buyGlobalMultiplier = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = globalMultiplierLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.globalMultiplier.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalMultiplier.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setGlobalMultiplier(prev => prev * gameConfig.premiumUpgrades.globalMultiplier.factor);
        setGlobalMultiplierLevel(prev => prev + 1);
      }
    }
  }, [
    money,
    globalMultiplierLevel,
    setMoney,
    setGlobalMultiplier,
    setGlobalMultiplierLevel,
    ensureStartTime,
    easyMode
  ]);

  // Global Price Decrease Upgrade
  const globalPriceDecreaseCost = useMemo(() =>
    gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
    Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, globalPriceDecreaseLevel) *
    costMultiplier,
    [globalPriceDecreaseLevel, costMultiplier]
  );

  const buyGlobalPriceDecrease = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = globalPriceDecreaseLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setGlobalPriceDecreaseLevel(prev => prev + 1);
        setGlobalPriceDecrease(prev => prev * gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor);
      }
    }
  }, [
    money,
    globalPriceDecreaseLevel,
    setMoney,
    setGlobalPriceDecreaseLevel,
    setGlobalPriceDecrease,
    ensureStartTime,
    easyMode
  ]);

  // Offline Earnings Upgrade
  const offlineEarningsLevelCost = useMemo(() =>
    gameConfig.premiumUpgrades.offlineEarnings.baseCost *
    Math.pow(gameConfig.premiumUpgrades.offlineEarnings.costExponent, offlineEarningsLevel) *
    costMultiplier,
    [offlineEarningsLevel, costMultiplier]
  );

  const buyOfflineEarningsLevel = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = offlineEarningsLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.offlineEarnings.baseCost *
        Math.pow(gameConfig.premiumUpgrades.offlineEarnings.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setOfflineEarningsLevel(prev => prev + 1);
      }
    }
  }, [
    money,
    offlineEarningsLevel,
    setMoney,
    setOfflineEarningsLevel,
    ensureStartTime,
    easyMode
  ]);

  // Critical Click Chance Upgrade
  const criticalClickChanceCost = useMemo(() =>
    gameConfig.premiumUpgrades.criticalClickChance.baseCost *
    Math.pow(gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier, criticalClickChanceLevel) *
    costMultiplier,
    [criticalClickChanceLevel, costMultiplier]
  );

  // Critical Hit Multiplier aus gameConfig
  const baseMultiplier = gameConfig.premiumUpgrades.criticalClickChance.baseMultiplier ?? 1.0;
  const multiplierPerLevel = gameConfig.premiumUpgrades.criticalClickChance.multiplierPerLevel ?? 0.5;
  const criticalHitMultiplier = useMemo(() =>
    baseMultiplier + (criticalClickChanceLevel * multiplierPerLevel),
    [criticalClickChanceLevel, baseMultiplier, multiplierPerLevel]
  );

  const buyCriticalClickChanceLevel = useCallback((quantity = 1) => {
    ensureStartTime?.();
    const maxLevel = 100;
    const actualQuantity = Math.min(quantity, maxLevel - criticalClickChanceLevel);

    if (actualQuantity <= 0) return;

    let totalCalculatedCost = 0;
    let tempLevel = criticalClickChanceLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);
    const costExponent = gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier;

    for (let i = 0; i < actualQuantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.criticalClickChance.baseCost *
        Math.pow(costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < actualQuantity; i++) {
        setCriticalClickChanceLevel(prev => prev + 1);
      }
    }
  }, [
    money,
    criticalClickChanceLevel,
    setMoney,
    setCriticalClickChanceLevel,
    ensureStartTime,
    easyMode
  ]);

  // Floating Click Value Upgrade
  const floatingClickValueCost = useMemo(() =>
    gameConfig.premiumUpgrades.floatingClickValue.baseCost *
    Math.pow(gameConfig.premiumUpgrades.floatingClickValue.costExponent, floatingClickValueLevel) *
      costMultiplier,
    [floatingClickValueLevel, costMultiplier]
    );

  const buyFloatingClickValue = useCallback((quantity = 1) => {
      ensureStartTime?.();
      let totalCalculatedCost = 0;
    let tempLevel = floatingClickValueLevel;
      const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.floatingClickValue.baseCost *
        Math.pow(gameConfig.premiumUpgrades.floatingClickValue.costExponent, tempLevel + i) *
          currentCostMultiplier;
        totalCalculatedCost += costForThisStep;
      }

      if (money >= totalCalculatedCost) {
        setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setFloatingClickValueLevel(prev => prev + 1);
        setFloatingClickValueMultiplier(prev => prev * gameConfig.premiumUpgrades.floatingClickValue.factor);
        }
      }
    }, [
      money,
    floatingClickValueLevel,
      setMoney,
    setFloatingClickValueLevel,
    setFloatingClickValueMultiplier,
    ensureStartTime,
    easyMode
  ]);

  // Utility-Funktionen für die Berechnung der Upgrade-Kosten
  const calculateGlobalMultiplierCost = (level, quantity, config, costMultiplier) => {
    let totalCost = 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += config.premiumUpgrades.globalMultiplier.baseCost *
        Math.pow(config.premiumUpgrades.globalMultiplier.costExponent, level + i) *
        costMultiplier;
    }
    return totalCost;
  };

  const calculateGlobalPriceDecreaseCost = (level, quantity, config, costMultiplier) => {
    let totalCost = 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += config.premiumUpgrades.globalPriceDecrease.baseCost *
        Math.pow(config.premiumUpgrades.globalPriceDecrease.costExponent, level + i) *
        costMultiplier;
    }
    return totalCost;
  };

  const calculateOfflineEarningsCost = (level, quantity, config, costMultiplier) => {
    let totalCost = 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += config.premiumUpgrades.offlineEarnings.baseCost *
        Math.pow(config.premiumUpgrades.offlineEarnings.costExponent, level + i) *
        costMultiplier;
    }
    return totalCost;
  };

  const calculateFloatingClickValueCost = (level, quantity, config, costMultiplier) => {
    let totalCost = 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += config.premiumUpgrades.floatingClickValue.baseCost *
        Math.pow(config.premiumUpgrades.floatingClickValue.costExponent, level + i) *
        costMultiplier;
    }
    return totalCost;
  };

  const calculateCriticalClickChanceCost = (level, quantity, config, costMultiplier) => {
    const maxLevel = 100;
    const actualQuantityToBuy = Math.min(quantity, maxLevel - level);
    if (actualQuantityToBuy <= 0) return Infinity;
    let totalCost = 0;
    const costExponent = config.premiumUpgrades.criticalClickChance.costLevelMultiplier;
    for (let i = 0; i < actualQuantityToBuy; i++) {
      totalCost += config.premiumUpgrades.criticalClickChance.baseCost *
        Math.pow(costExponent, level + i) *
        costMultiplier;
    }
    return totalCost;
  };

  return {
    // Global Multiplier
    globalMultiplierCost,
    buyGlobalMultiplier,
    calculateGlobalMultiplierCost,
    // Global Price Decrease
    globalPriceDecreaseCost,
    buyGlobalPriceDecrease,
    calculateGlobalPriceDecreaseCost,
    // Offline Earnings
    offlineEarningsLevelCost,
    buyOfflineEarningsLevel,
    calculateOfflineEarningsCost,
    // Critical Click Chance
    criticalClickChanceCost,
    buyCriticalClickChanceLevel,
    criticalHitMultiplier,
    calculateCriticalClickChanceCost,
    // Floating Click Value
    floatingClickValueCost,
    buyFloatingClickValue,
    calculateFloatingClickValueCost,
  };
}
