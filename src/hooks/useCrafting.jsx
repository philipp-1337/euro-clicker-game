import { useCallback } from 'react';
import {
  gameConfig,
  normalizeCraftingProductionState,
} from '@constants/gameConfig';
import useCraftingProductionMode from './useCraftingProductionMode';

const hasBrowserStorage = () => typeof window !== 'undefined';

const readLegacyCraftingCooldowns = () => {
  if (!hasBrowserStorage()) {
    return [];
  }

  try {
    const parsedCooldowns = JSON.parse(localStorage.getItem('craftingCooldowns') || '[]');
    return Array.isArray(parsedCooldowns) ? parsedCooldowns : [];
  } catch {
    return [];
  }
};

// rawMaterials: Objekt mit Rohstoff-IDs als Keys und Mengen als Values
// setRawMaterials: Setter für rawMaterials
export default function useCrafting(
  money,
  setMoney,
  craftingItems,
  setCraftingItems,
  rawMaterials,
  setRawMaterials,
  resourcePurchaseCounts,
  setResourcePurchaseCounts,
  ensureStartTime,
  easyMode,
  craftingProductionState = gameConfig.initialState.craftingProductionState,
  setCraftingProductionState
) {
  const productionModeHook = useCraftingProductionMode(
    craftingProductionState,
    setCraftingProductionState
  );

  // Rohstoff kaufen: zieht Geld ab und erhöht Rohstoffmenge
  // Ermöglicht den Kauf von mehreren Einheiten auf einmal
  const buyMaterial = useCallback((materialId, quantity = 1) => {
    const material = gameConfig.rawMaterials.find(m => m.id === materialId);
    if (!material) return;

    // Kaufen von Rohstoffen (quantity > 0)
    if (quantity > 0) {
      let purchaseCount = resourcePurchaseCounts[materialId] || 0;
      let totalCost = 0;
      const costMultiplier = gameConfig.getCostMultiplier(easyMode);
      const costIncreaseFactor = material.costIncreaseFactor || 1.07;
      for (let i = 0; i < quantity; i++) {
        totalCost += Math.ceil(material.baseCost * Math.pow(costIncreaseFactor, purchaseCount) * costMultiplier);
        purchaseCount++;
      }
      if (money >= totalCost) {
        setMoney(prev => prev - totalCost);
        setRawMaterials(prev => ({
          ...prev,
          [materialId]: (prev[materialId] || 0) + quantity
        }));
        setResourcePurchaseCounts(prev => ({
          ...prev,
          [materialId]: (prev[materialId] || 0) + quantity
        }));
        ensureStartTime?.();
      }
    } else if (quantity < 0) {
      // Abziehen von Rohstoffen beim Crafting, aber resourcePurchaseCounts NICHT ändern
      setRawMaterials(prev => ({
        ...prev,
        [materialId]: Math.max(0, (prev[materialId] || 0) + quantity)
      }));
      // resourcePurchaseCounts bleibt unverändert
    }
  }, [money, resourcePurchaseCounts, setMoney, setRawMaterials, setResourcePurchaseCounts, easyMode, ensureStartTime]);

  const resolveLegacyCompletionTime = useCallback((recipeIndex, claimTime) => {
    const legacyCooldowns = readLegacyCraftingCooldowns();
    const legacyCompletionTime = legacyCooldowns[recipeIndex];

    if (!Number.isFinite(legacyCompletionTime) || legacyCompletionTime > claimTime) {
      return null;
    }

    return legacyCompletionTime;
  }, []);

  // Crafting-Item herstellen
  const buyCraftingItem = useCallback((index, force = false) => {
    const recipe = gameConfig.craftingRecipes[index];
    if (!recipe) return null;
    // Prüfe, ob alle Rohstoffe vorhanden sind
    const hasAllMaterials = recipe.materials.every(material =>
      rawMaterials[material.id] >= material.quantity
    );
    if (!hasAllMaterials && !force) return;

    const claimTime = Date.now();
    const normalizedProductionState = normalizeCraftingProductionState(craftingProductionState);
    const recipeProductionState = normalizedProductionState[recipe.id];
    const pendingOutcome = recipeProductionState?.pendingOutcome;
    const completionTime = pendingOutcome?.completionTime
      ?? resolveLegacyCompletionTime(index, claimTime)
      ?? claimTime;
    const resolvedOutcome = Number.isFinite(pendingOutcome?.money)
      ? {
        ...pendingOutcome,
        recipeId: recipe.id,
        claimTime,
        baseMoney: recipe?.output?.money ?? 0,
        money: pendingOutcome.money,
        qualityMultiplier: pendingOutcome.qualityBonusApplied ? (recipe?.qualityMultiplier ?? 1) : 1,
        rareMultiplier: pendingOutcome.rareBonusApplied ? (recipe?.rareBonusMultiplier ?? 1) : 1,
        modeRewardMultiplier: 1,
        durationMultiplier: 1,
      }
      : productionModeHook.resolveCraftOutcome(
        {
          ...recipe,
          selectedModeId: pendingOutcome?.modeId ?? recipeProductionState?.selectedModeId,
        },
        completionTime,
        claimTime
      );

    if (resolvedOutcome?.money) {
      setMoney(prev => prev + resolvedOutcome.money);
    }

    // Zähle gecraftete Items
    setCraftingItems(prev => {
      const updated = [...prev];
      updated[index] = (updated[index] || 0) + 1;
      return updated;
    });

    if (typeof setCraftingProductionState === 'function') {
      setCraftingProductionState((previousState) => {
        const currentState = normalizeCraftingProductionState(previousState);

        return {
          ...currentState,
          [recipe.id]: {
            ...currentState[recipe.id],
            selectedModeId: resolvedOutcome?.modeId ?? currentState[recipe.id]?.selectedModeId,
            lastCompletionAt: completionTime,
            pendingOutcome: force
              ? null
              : {
                recipeId: recipe.id,
                modeId: resolvedOutcome?.modeId ?? currentState[recipe.id]?.selectedModeId,
                completionTime,
                qualityBonusApplied: resolvedOutcome?.qualityBonusApplied ?? null,
                rareBonusApplied: resolvedOutcome?.rareBonusApplied ?? null,
                money: resolvedOutcome?.money ?? null,
              },
          },
        };
      });
    }

    ensureStartTime?.();
    return resolvedOutcome;
  }, [
    craftingProductionState,
    ensureStartTime,
    productionModeHook,
    rawMaterials,
    resolveLegacyCompletionTime,
    setCraftingItems,
    setCraftingProductionState,
    setMoney,
  ]);

  return {
    buyCraftingItem,
    buyMaterial,
    getSelectedProductionMode: productionModeHook.getSelectedMode,
    setSelectedProductionMode: productionModeHook.setSelectedMode,
    resolveCraftOutcome: productionModeHook.resolveCraftOutcome,
  };
}
