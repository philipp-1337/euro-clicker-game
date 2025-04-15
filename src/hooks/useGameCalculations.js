import { useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { calculateButtons, calculateCostWithDifficulty } from '@utils/calculators';

export default function useGameCalculations(
  valueUpgradeLevels,
  cooldownUpgradeLevels,
  valueMultipliers,
  cooldownReductions,
  globalMultiplier,
  globalMultiplierLevel,
  offlineEarningsLevel,
  easyMode = false
) {
  // Kosten für Upgrades berechnen
  const valueUpgradeCosts = useMemo(() => 
    valueUpgradeLevels.map((_, i) =>
      calculateCostWithDifficulty(
        gameConfig.baseValueUpgradeCosts[i],
        valueUpgradeLevels[i],
        gameConfig.upgrades.costIncreaseFactor,
        easyMode,
        gameConfig.getCostMultiplier
      )
    ), [valueUpgradeLevels, easyMode]);
  
  const cooldownUpgradeCosts = useMemo(() => 
    cooldownUpgradeLevels.map((_, i) =>
      calculateCostWithDifficulty(
        gameConfig.baseCooldownUpgradeCosts[i],
        cooldownUpgradeLevels[i],
        gameConfig.upgrades.costIncreaseFactor,
        easyMode,
        gameConfig.getCostMultiplier
      )
    ), [cooldownUpgradeLevels, easyMode]);
  
  // Premium-Upgrade-Kosten
  const globalMultiplierCost = useMemo(() => 
    calculateCostWithDifficulty(
      gameConfig.premiumUpgrades.globalMultiplier.baseCost,
      globalMultiplierLevel,
      gameConfig.premiumUpgrades.globalMultiplier.costExponent,
      easyMode,
      gameConfig.getCostMultiplier
    ), [globalMultiplierLevel, easyMode]);
  
  const offlineEarningsCost = useMemo(() => 
    calculateCostWithDifficulty(
      gameConfig.premiumUpgrades.offlineEarnings.baseCost,
      offlineEarningsLevel,
      gameConfig.premiumUpgrades.offlineEarnings.costExponent,
      easyMode,
      gameConfig.getCostMultiplier
    ), [offlineEarningsLevel, easyMode]);

  // Buttons mit aktuellen Werten berechnen
  const buttons = useMemo(() => 
    calculateButtons(
      gameConfig.baseButtons,
      valueMultipliers,
      globalMultiplier,
      cooldownReductions
    ), [valueMultipliers, globalMultiplier, cooldownReductions]);

  return {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    offlineEarningsCost,
    buttons
  };
}