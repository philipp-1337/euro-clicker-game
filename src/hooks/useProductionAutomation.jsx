import { useEffect, useRef } from 'react';
import { gameConfig } from '@constants/gameConfig';

const AUTO_BUY_TARGET_STOCK = 10;
const AUTO_BUY_BATCH_SIZE = 1;
const PRODUCTION_HQ_MILESTONE_ID = 'productionHq';

const productionHqMilestone = gameConfig.unlockRoadmap.find(
  (milestone) => milestone.id === PRODUCTION_HQ_MILESTONE_ID
);

const getAutoCraftTargets = () => {
  return gameConfig.craftingRecipes.reduce((targets, recipe, index) => {
    const matchingSegment = productionHqMilestone?.progressSegments?.find(
      (segment) => segment.key === `craftingItems.${index}`
    );
    const rawTarget = matchingSegment?.target ?? matchingSegment?.value ?? 1;
    const parsedTarget = typeof rawTarget === 'number' ? rawTarget : Number(rawTarget);

    targets[recipe.id] = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : 1;
    return targets;
  }, {});
};

const AUTO_CRAFT_TARGETS = getAutoCraftTargets();

export default function useProductionAutomation({
  enabled = true,
  autoBuyMaterialsEnabled,
  autoCraftEnabled,
  rawMaterials,
  craftingItems,
  buyMaterial,
  craftingProductionState,
  startCraftingProduction,
  claimCraftingProduction,
  productionHqUpgrades,
}) {
  const rawMaterialsRef = useRef(rawMaterials);
  const craftingItemsRef = useRef(craftingItems);
  const craftingProductionStateRef = useRef(craftingProductionState);
  const buyMaterialRef = useRef(buyMaterial);
  const startCraftingProductionRef = useRef(startCraftingProduction);
  const claimCraftingProductionRef = useRef(claimCraftingProduction);

  useEffect(() => {
    rawMaterialsRef.current = rawMaterials;
  }, [rawMaterials]);

  useEffect(() => {
    craftingItemsRef.current = craftingItems;
  }, [craftingItems]);

  useEffect(() => {
    craftingProductionStateRef.current = craftingProductionState;
  }, [craftingProductionState]);

  useEffect(() => {
    buyMaterialRef.current = buyMaterial;
  }, [buyMaterial]);

  useEffect(() => {
    startCraftingProductionRef.current = startCraftingProduction;
  }, [startCraftingProduction]);

  useEffect(() => {
    claimCraftingProductionRef.current = claimCraftingProduction;
  }, [claimCraftingProduction]);

  // Auto-Buy Materials Logic
  useEffect(() => {
    if (!enabled || !autoBuyMaterialsEnabled || productionHqUpgrades?.auto_buy_materials < 1) return;

    const interval = setInterval(() => {
      gameConfig.rawMaterials.forEach(material => {
        const owned = rawMaterialsRef.current[material.id] || 0;
        if (owned < AUTO_BUY_TARGET_STOCK) {
          buyMaterialRef.current?.(material.id, AUTO_BUY_BATCH_SIZE);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, autoBuyMaterialsEnabled, productionHqUpgrades?.auto_buy_materials]);

  // Auto-Craft Logic (Start and Claim)
  useEffect(() => {
    if (!enabled || !autoCraftEnabled || productionHqUpgrades?.auto_craft < 1) return;

    const interval = setInterval(() => {
      const localCraftingItems = Array.isArray(craftingItemsRef.current)
        ? [...craftingItemsRef.current]
        : [];

      gameConfig.craftingRecipes.forEach((recipe, index) => {
        const recipeState = craftingProductionStateRef.current[recipe.id];
        
        // 1. Try to claim if finished
        if (recipeState?.pendingOutcome) {
          const now = Date.now();
          if (now >= recipeState.pendingOutcome.completionTime) {
            const claimedOutcome = claimCraftingProductionRef.current?.(index);
            if (claimedOutcome) {
              localCraftingItems[index] = (localCraftingItems[index] || 0) + 1;
            }
          }
        }
      });

      const startCandidates = gameConfig.craftingRecipes
        .map((recipe, index) => {
          const recipeState = craftingProductionStateRef.current[recipe.id];
          const hasPendingOutcome = Boolean(recipeState?.pendingOutcome);
          const hasAllMaterials = recipe.materials.every(
            (material) => (rawMaterialsRef.current[material.id] || 0) >= material.quantity
          );
          const owned = localCraftingItems[index] || 0;
          const target = AUTO_CRAFT_TARGETS[recipe.id] || 1;
          const relativeStock = owned / target;

          return {
            index,
            recipe,
            hasPendingOutcome,
            hasAllMaterials,
            owned,
            target,
            relativeStock,
          };
        })
        .filter((candidate) => !candidate.hasPendingOutcome && candidate.hasAllMaterials)
        .sort((left, right) => {
          if (left.relativeStock !== right.relativeStock) {
            return left.relativeStock - right.relativeStock;
          }

          if (left.owned !== right.owned) {
            return left.owned - right.owned;
          }

          return left.index - right.index;
        });

      const nextRecipeToStart = startCandidates[0];
      if (nextRecipeToStart) {
        startCraftingProductionRef.current?.(nextRecipeToStart.index);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, autoCraftEnabled, productionHqUpgrades?.auto_craft]);
}
