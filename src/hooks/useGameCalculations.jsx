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
  globalPriceDecrease,
  globalPriceDecreaseLevel,
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
      ) * globalPriceDecrease
    ), [valueUpgradeLevels, easyMode, globalPriceDecrease]);
  
  const cooldownUpgradeCosts = useMemo(() => 
    cooldownUpgradeLevels.map((_, i) =>
      calculateCostWithDifficulty(
        gameConfig.baseCooldownUpgradeCosts[i],
        cooldownUpgradeLevels[i],
        gameConfig.upgrades.costIncreaseFactor,
        easyMode,
        gameConfig.getCostMultiplier
      ) * globalPriceDecrease
    ), [cooldownUpgradeLevels, easyMode, globalPriceDecrease]);

    
    // Premium-Upgrade-Kosten
    const globalMultiplierCost = useMemo(() => 
      calculateCostWithDifficulty(
        gameConfig.premiumUpgrades.globalMultiplier.baseCost,
        globalMultiplierLevel,
        gameConfig.premiumUpgrades.globalMultiplier.costExponent,
        easyMode,
        gameConfig.getCostMultiplier
      ), [globalMultiplierLevel, easyMode]);
      
      // Buttons mit aktuellen Werten berechnen
      const buttons = useMemo(() => 
        calculateButtons(
          gameConfig.baseButtons,
          valueMultipliers,
          globalMultiplier,
          cooldownReductions
        ), [valueMultipliers, globalMultiplier, cooldownReductions]);
        
      // Preis für das neue Premium-Upgrade berechnen
      const globalPriceDecreaseCost = useMemo(() =>
        gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, globalPriceDecreaseLevel) *
        gameConfig.getCostMultiplier(easyMode), // <--- Easy Mode berücksichtigen
        [globalPriceDecreaseLevel, easyMode]
      );

  return {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    globalPriceDecreaseCost,
    buttons
  };
}