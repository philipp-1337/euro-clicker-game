import { useCallback, useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import {
  getProductionHqMaterialCostMultiplier,
  subtractProductionHqUpgradeCosts,
} from './useProductionHq.helpers';

export default function useProductionHq({
  craftingItems,
  setCraftingItems,
  productionHqUpgrades,
  setProductionHqUpgrades,
}) {
  const buyProductionHqUpgrade = useCallback((upgradeId) => {
    const upgrade = gameConfig.productionHqUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = productionHqUpgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return;

    const costs = upgrade.getCost(currentLevel);
    
    // Check if player can afford it
    const canAfford = costs.every(cost => (craftingItems[cost.item] || 0) >= Math.ceil(cost.quantity));

    if (canAfford) {
      // Deduct costs
      setCraftingItems(prev => subtractProductionHqUpgradeCosts(prev, costs));

      // Increment upgrade level
      setProductionHqUpgrades(prev => ({
        ...prev,
        [upgradeId]: currentLevel + 1,
      }));
    }
  }, [craftingItems, setCraftingItems, productionHqUpgrades, setProductionHqUpgrades]);

  const productionHqValueMultiplier = useMemo(() => {
    const upgrade = gameConfig.productionHqUpgrades.find(u => u.id === 'crafting_value');
    const level = productionHqUpgrades?.crafting_value || 0;
    return 1 + (upgrade.effectPerLevel * level);
  }, [productionHqUpgrades]);

  const productionHqSpeedMultiplier = useMemo(() => {
    const upgrade = gameConfig.productionHqUpgrades.find(u => u.id === 'crafting_speed');
    const level = productionHqUpgrades?.crafting_speed || 0;
    return 1 - (upgrade.effectPerLevel * level);
  }, [productionHqUpgrades]);

  const productionHqMaterialCostMultiplier = useMemo(() => {
    const upgrade = gameConfig.productionHqUpgrades.find(u => u.id === 'material_cost');
    const level = productionHqUpgrades?.material_cost || 0;
    return getProductionHqMaterialCostMultiplier({
      effectPerLevel: upgrade?.effectPerLevel,
      level,
    });
  }, [productionHqUpgrades]);

  const productionHqRareChanceBonus = useMemo(() => {
    const upgrade = gameConfig.productionHqUpgrades.find(u => u.id === 'rare_result');
    const level = productionHqUpgrades?.rare_result || 0;
    return upgrade?.effectPerLevel * level || 0;
  }, [productionHqUpgrades]);

  return {
    buyProductionHqUpgrade,
    productionHqValueMultiplier,
    productionHqSpeedMultiplier,
    productionHqMaterialCostMultiplier,
    productionHqRareChanceBonus,
  };
}
