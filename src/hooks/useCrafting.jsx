import { useCallback, useRef } from 'react';
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
  setCraftingProductionState,
  productionHqValueMultiplier = 1,
  productionHqSpeedMultiplier = 1
) {
  const productionModeHook = useCraftingProductionMode(
    craftingProductionState,
    setCraftingProductionState,
    productionHqValueMultiplier
  );
  const rawMaterialsRef = useRef(rawMaterials);
  const productionStateRef = useRef(normalizeCraftingProductionState(craftingProductionState));
  const startLocksRef = useRef({});
  const claimLocksRef = useRef({});

  rawMaterialsRef.current = rawMaterials;
  productionStateRef.current = normalizeCraftingProductionState(craftingProductionState);

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

    return baseCooldown * costMultiplier * (mode?.durationMultiplier ?? 1) * productionHqSpeedMultiplier;
  }, [easyMode, productionHqSpeedMultiplier]);

  const startCraftingProduction = useCallback((index) => {
    const recipe = gameConfig.craftingRecipes[index];


    if (!recipe || typeof setCraftingProductionState !== 'function') {
      return null;
    }

    if (startLocksRef.current[recipe.id]) {
      return null;
    }

    startLocksRef.current[recipe.id] = true;

    try {
      const currentMaterials = rawMaterialsRef.current;
      const normalizedProductionState = productionStateRef.current;
      const recipeProductionState = normalizedProductionState[recipe.id];

      const hasAllMaterials = recipe.materials.every((material) =>
        (currentMaterials[material.id] || 0) >= material.quantity
      );

      if (!hasAllMaterials || recipeProductionState?.pendingOutcome) {
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
      const nextMaterials = recipe.materials.reduce((accumulator, material) => ({
        ...accumulator,
        [material.id]: Math.max(0, (accumulator[material.id] || 0) - material.quantity),
      }), { ...currentMaterials });
      const nextProductionState = {
        ...normalizedProductionState,
        [recipe.id]: {
          ...recipeProductionState,
          selectedModeId: pendingOutcome.modeId,
          pendingOutcome,
        },
      };

      rawMaterialsRef.current = nextMaterials;
      productionStateRef.current = nextProductionState;
      setRawMaterials(nextMaterials);
      setCraftingProductionState(nextProductionState);
      ensureStartTime?.();

      return {
        recipeId: recipe.id,
        modeId: pendingOutcome.modeId,
        completionTime,
        cooldownSeconds: getRecipeCooldownSeconds(recipe, pendingOutcome.modeId),
      };
    } finally {
      startLocksRef.current[recipe.id] = false;
    }
  }, [
    ensureStartTime,
    getRecipeCooldownSeconds,
    productionModeHook,
    setRawMaterials,
    setCraftingProductionState,
  ]);

  const claimCraftingProduction = useCallback((index) => {
    const recipe = gameConfig.craftingRecipes[index];

    if (!recipe || typeof setCraftingProductionState !== 'function') {
      return null;
    }

    if (claimLocksRef.current[recipe.id]) {
      return null;
    }

    claimLocksRef.current[recipe.id] = true;

    try {
      const claimTime = Date.now();
      const normalizedProductionState = productionStateRef.current;
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
      const nextProductionState = {
        ...normalizedProductionState,
        [recipe.id]: {
          ...recipeProductionState,
          selectedModeId: resolvedOutcome?.modeId ?? recipeProductionState?.selectedModeId,
          lastCompletionAt: pendingOutcome.completionTime,
          pendingOutcome: null,
        },
      };

      productionStateRef.current = nextProductionState;
      setCraftingProductionState(nextProductionState);

      if (resolvedOutcome?.money) {
        setMoney(prev => prev + resolvedOutcome.money);
      }

      setCraftingItems(prev => {
        const updated = [...prev];
        updated[index] = (updated[index] || 0) + 1;
        return updated;
      });

      ensureStartTime?.();
      return resolvedOutcome;
    } finally {
      claimLocksRef.current[recipe.id] = false;
    }
  }, [
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
