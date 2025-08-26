import { useCallback, useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';

/**
 * Manages all premium upgrades including:
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
    (1 + criticalClickChanceLevel * gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier) *
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

    for (let i = 0; i < actualQuantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.criticalClickChance.baseCost *
        (1 + (tempLevel + i) * gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier) *
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

  return {
    // Global Price Decrease
    globalPriceDecreaseCost,
    buyGlobalPriceDecrease,
    // Offline Earnings
    offlineEarningsLevelCost,
    buyOfflineEarningsLevel,
    // Critical Click Chance
    criticalClickChanceCost,
    buyCriticalClickChanceLevel,
    criticalHitMultiplier,
    // Floating Click Value
    floatingClickValueCost,
    buyFloatingClickValue,
  };
}