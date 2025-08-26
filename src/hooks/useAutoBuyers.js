import { useCallback, useMemo, useEffect } from 'react';
import { calculateCostWithDifficulty } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

/**
 * Manages all auto-buyer functionality including:
 * - Auto-buyer unlocks and costs
 * - Value upgrade auto-buyer
 * - Cooldown upgrade auto-buyer
 * - Auto-buyer settings (interval, buffer, enabled states)
 */
export default function useAutoBuyers({
  money,
  setMoney,
  easyMode,
  globalPriceDecrease,
  buyQuantity,
  ensureStartTime,
  
  // Auto-buyer states
  autoBuyerUnlocked,
  setAutoBuyerUnlocked,
  cooldownAutoBuyerUnlocked,
  setCooldownAutoBuyerUnlocked,
  autoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  autoBuyerInterval,
  autoBuyerBuffer,
  
  // Value upgrades
  valueUpgradeLevels,
  setValueUpgradeLevels,
  setValueMultipliers,
  
  // Cooldown upgrades
  cooldownUpgradeLevels,
  setCooldownUpgradeLevels,
  setCooldownReductions,
}) {
  
  // Auto-buyer unlock costs
  const autoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.autoBuyerUnlock.baseCost *
    Math.pow(gameConfig.premiumUpgrades.autoBuyerUnlock.costExponent, autoBuyerUnlocked ? 1 : 0) *
    gameConfig.getCostMultiplier(easyMode),
    [autoBuyerUnlocked, easyMode]
  );

  const cooldownAutoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.cooldownAutoBuyerUnlock.baseCost *
    Math.pow(gameConfig.premiumUpgrades.cooldownAutoBuyerUnlock.costExponent, cooldownAutoBuyerUnlocked ? 1 : 0) *
    gameConfig.getCostMultiplier(easyMode),
    [cooldownAutoBuyerUnlocked, easyMode]
  );

  // Auto-buyer unlock functions
  const buyAutoBuyerUnlock = useCallback(() => {
    if (!autoBuyerUnlocked && money >= autoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - autoBuyerUnlockCost);
      setAutoBuyerUnlocked(true);
    }
  }, [autoBuyerUnlocked, money, autoBuyerUnlockCost, setMoney, setAutoBuyerUnlocked, ensureStartTime]);

  const buyCooldownAutoBuyerUnlock = useCallback(() => {
    if (!cooldownAutoBuyerUnlocked && money >= cooldownAutoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - cooldownAutoBuyerUnlockCost);
      setCooldownAutoBuyerUnlocked(true);
    }
  }, [cooldownAutoBuyerUnlocked, money, cooldownAutoBuyerUnlockCost, setMoney, setCooldownAutoBuyerUnlocked, ensureStartTime]);

  // Value upgrade auto-buyer
  useEffect(() => {
    if (!autoBuyValueUpgradeEnabled) return;
    
    const interval = setInterval(() => {
      setMoney(prevMoney => {
        let minCost = Infinity;
        let minIndex = -1;
        
        // Find cheapest value upgrade
        valueUpgradeLevels.forEach((level, idx) => {
          const cost = calculateCostWithDifficulty(
            gameConfig.baseValueUpgradeCosts[idx],
            level,
            gameConfig.upgrades.costIncreaseFactor,
            easyMode,
            gameConfig.getCostMultiplier
          ) * globalPriceDecrease;
          
          if (cost < minCost) {
            minCost = cost;
            minIndex = idx;
          }
        });

        if (minIndex !== -1 && minCost > 0) {
          // Calculate total cost for buyQuantity upgrades
          let totalCost = 0;
          let tempLevel = valueUpgradeLevels[minIndex];
          
          for (let i = 0; i < buyQuantity; i++) {
            const costForThisStep = calculateCostWithDifficulty(
              gameConfig.baseValueUpgradeCosts[minIndex],
              tempLevel + i,
              gameConfig.upgrades.costIncreaseFactor,
              easyMode,
              gameConfig.getCostMultiplier
            ) * globalPriceDecrease;
            totalCost += costForThisStep;
          }
          
          if (prevMoney >= totalCost + autoBuyerBuffer) {
            // Apply value multiplier upgrades
            setValueMultipliers(prev => {
              const updated = [...prev];
              for (let i = 0; i < buyQuantity; i++) {
                updated[minIndex] *= gameConfig.upgrades.valueMultiplierFactor;
              }
              return updated;
            });
            
            // Update upgrade levels
            setValueUpgradeLevels(prev => {
              const updated = [...prev];
              updated[minIndex] += buyQuantity;
              return updated;
            });
            
            return prevMoney - totalCost;
          }
        }
        
        return prevMoney;
      });
    }, autoBuyerInterval);
    
    return () => clearInterval(interval);
  }, [
    autoBuyValueUpgradeEnabled,
    valueUpgradeLevels,
    setValueUpgradeLevels,
    setValueMultipliers,
    easyMode,
    globalPriceDecrease,
    setMoney,
    autoBuyerInterval,
    autoBuyerBuffer,
    buyQuantity
  ]);

  // Cooldown upgrade auto-buyer
  useEffect(() => {
    if (!autoBuyCooldownUpgradeEnabled) return;
    
    const interval = setInterval(() => {
      setMoney(prevMoney => {
        let minCost = Infinity;
        let minIndex = -1;
        
        // Find cheapest cooldown upgrade
        cooldownUpgradeLevels.forEach((level, idx) => {
          const cost = calculateCostWithDifficulty(
            gameConfig.baseCooldownUpgradeCosts[idx],
            level,
            gameConfig.upgrades.cooldownCostIncreaseFactor,
            easyMode,
            gameConfig.getCostMultiplier
          ) * globalPriceDecrease;
          
          if (cost < minCost) {
            minCost = cost;
            minIndex = idx;
          }
        });

        if (minIndex !== -1 && minCost > 0) {
          // Calculate total cost for buyQuantity upgrades
          let totalCost = 0;
          let tempLevel = cooldownUpgradeLevels[minIndex];
          
          for (let i = 0; i < buyQuantity; i++) {
            const costForThisStep = calculateCostWithDifficulty(
              gameConfig.baseCooldownUpgradeCosts[minIndex],
              tempLevel + i,
              gameConfig.upgrades.cooldownCostIncreaseFactor,
              easyMode,
              gameConfig.getCostMultiplier
            ) * globalPriceDecrease;
            totalCost += costForThisStep;
          }
          
          if (prevMoney >= totalCost + autoBuyerBuffer) {
            // Apply cooldown reduction upgrades
            setCooldownReductions(prev => {
              const updated = [...prev];
              for (let i = 0; i < buyQuantity; i++) {
                updated[minIndex] *= gameConfig.upgrades.cooldownReductionFactor;
              }
              return updated;
            });
            
            // Update upgrade levels
            setCooldownUpgradeLevels(prev => {
              const updated = [...prev];
              updated[minIndex] += buyQuantity;
              return updated;
            });
            
            return prevMoney - totalCost;
          }
        }
        
        return prevMoney;
      });
    }, autoBuyerInterval);
    
    return () => clearInterval(interval);
  }, [
    autoBuyCooldownUpgradeEnabled,
    cooldownUpgradeLevels,
    setCooldownUpgradeLevels,
    setCooldownReductions,
    easyMode,
    globalPriceDecrease,
    setMoney,
    autoBuyerInterval,
    autoBuyerBuffer,
    buyQuantity
  ]);

  return {
    // Unlock costs and functions
    autoBuyerUnlockCost,
    buyAutoBuyerUnlock,
    cooldownAutoBuyerUnlockCost,
    buyCooldownAutoBuyerUnlock,
  };
}