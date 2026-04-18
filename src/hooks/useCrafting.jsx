import { useCallback } from 'react';
import {
  gameConfig,
  getCraftingProductionModeById,
  normalizeCraftingProductionState,
} from '@constants/gameConfig';
import useCraftingProductionMode from './useCraftingProductionMode';

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

  const getRecipeCooldownSeconds = useCallback((recipe, modeId) => {
    const costMultiplier = gameConfig.getCostMultiplier(easyMode);
    const baseCooldown = typeof recipe?.cooldownSeconds === 'number'
      ? recipe.cooldownSeconds
      : (gameConfig.craftingCooldownSeconds || 5);
    const mode = getCraftingProductionModeById(recipe, modeId);

    return baseCooldown * costMultiplier * (mode?.durationMultiplier ?? 1);
  }, [easyMode]);

  const startCraftingProduction = useCallback((index) => {
    const recipe = gameConfig.craftingRecipes[index];

    if (!recipe || typeof setCraftingProductionState !== 'function') {
      return null;
    }

    const hasAllMaterials = recipe.materials.every((material) =>
      rawMaterials[material.id] >= material.quantity
    );

    if (!hasAllMaterials) {
      return null;
    }

    const normalizedProductionState = normalizeCraftingProductionState(craftingProductionState);
    const recipeProductionState = normalizedProductionState[recipe.id];

    if (recipeProductionState?.pendingOutcome) {
      return null;
    }

    const selectedMode = productionModeHook.getSelectedMode(recipe.id)
      ?? getCraftingProductionModeById(recipe);
    const now = Date.now();
    const completionTime = now + (getRecipeCooldownSeconds(recipe, selectedMode?.id) * 1000);
    const pendingOutcome = {
      recipeId: recipe.id,
      modeId: selectedMode?.id ?? getCraftingProductionModeById(recipe)?.id,
      completionTime,
      qualityBonusApplied: null,
      rareBonusApplied: null,
      money: null,
    };

    setCraftingProductionState((previousState) => {
      const currentState = normalizeCraftingProductionState(previousState);

      return {
        ...currentState,
        [recipe.id]: {
          ...currentState[recipe.id],
          selectedModeId: pendingOutcome.modeId,
          pendingOutcome,
        },
      };
    });

    ensureStartTime?.();

    return {
      recipeId: recipe.id,
      modeId: pendingOutcome.modeId,
      completionTime,
      cooldownSeconds: getRecipeCooldownSeconds(recipe, pendingOutcome.modeId),
    };
  }, [
    craftingProductionState,
    ensureStartTime,
    getRecipeCooldownSeconds,
    productionModeHook,
    rawMaterials,
    setCraftingProductionState,
  ]);

  const claimCraftingProduction = useCallback((index) => {
    const recipe = gameConfig.craftingRecipes[index];

    if (!recipe || typeof setCraftingProductionState !== 'function') {
      return null;
    }

    const claimTime = Date.now();
    const normalizedProductionState = normalizeCraftingProductionState(craftingProductionState);
    const recipeProductionState = normalizedProductionState[recipe.id];
    const pendingOutcome = recipeProductionState?.pendingOutcome;

    if (!pendingOutcome || !Number.isFinite(pendingOutcome.completionTime) || claimTime < pendingOutcome.completionTime) {
      return null;
    }

    const resolvedOutcome = productionModeHook.resolveCraftOutcome(
      {
        ...recipe,
        selectedModeId: pendingOutcome.modeId ?? recipeProductionState?.selectedModeId,
      },
      pendingOutcome.completionTime,
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
            lastCompletionAt: pendingOutcome.completionTime,
            pendingOutcome: null,
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
    setCraftingItems,
    setCraftingProductionState,
    setMoney,
  ]);

  return {
    buyCraftingItem: claimCraftingProduction,
    buyMaterial,
    startCraftingProduction,
    claimCraftingProduction,
    getSelectedProductionMode: productionModeHook.getSelectedMode,
    setSelectedProductionMode: productionModeHook.setSelectedMode,
    resolveCraftOutcome: productionModeHook.resolveCraftOutcome,
  };
}
