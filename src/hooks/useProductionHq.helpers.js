const MINIMUM_MATERIAL_COST_MULTIPLIER = 0.1;

export function getProductionHqMaterialCostMultiplier({ effectPerLevel = 0, level = 0 } = {}) {
  const rawMultiplier = 1 - (effectPerLevel * level);
  return Math.max(MINIMUM_MATERIAL_COST_MULTIPLIER, rawMultiplier);
}

export function subtractProductionHqUpgradeCosts(currentItems = [], costs = []) {
  const nextItems = Array.isArray(currentItems) ? [...currentItems] : [];

  costs.forEach((cost) => {
    const itemIndex = cost?.item;
    if (!Number.isInteger(itemIndex)) {
      return;
    }

    const currentValue = nextItems[itemIndex] || 0;
    nextItems[itemIndex] = Math.max(0, currentValue - Math.ceil(cost.quantity || 0));
  });

  return nextItems;
}
