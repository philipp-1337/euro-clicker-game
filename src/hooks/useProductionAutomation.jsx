import { useEffect, useRef } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useProductionAutomation({
  autoBuyMaterialsEnabled,
  autoCraftEnabled,
  rawMaterials,
  buyMaterial,
  craftingProductionState,
  startCraftingProduction,
  claimCraftingProduction,
  productionHqUpgrades,
}) {
  const rawMaterialsRef = useRef(rawMaterials);
  const craftingProductionStateRef = useRef(craftingProductionState);

  useEffect(() => {
    rawMaterialsRef.current = rawMaterials;
  }, [rawMaterials]);

  useEffect(() => {
    craftingProductionStateRef.current = craftingProductionState;
  }, [craftingProductionState]);

  // Auto-Buy Materials Logic
  useEffect(() => {
    if (!autoBuyMaterialsEnabled || productionHqUpgrades?.auto_buy_materials < 1) return;

    const interval = setInterval(() => {
      gameConfig.rawMaterials.forEach(material => {
        const owned = rawMaterialsRef.current[material.id] || 0;
        if (owned < 10) { // Threshold for auto-buying
          buyMaterial(material.id, 10);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoBuyMaterialsEnabled, buyMaterial, productionHqUpgrades]); // rawMaterials is not a dependency anymore

  // Auto-Craft Logic (Start and Claim)
  useEffect(() => {
    if (!autoCraftEnabled || productionHqUpgrades?.auto_craft < 1) return;

    const interval = setInterval(() => {
      gameConfig.craftingRecipes.forEach((recipe, index) => {
        const recipeState = craftingProductionStateRef.current[recipe.id];
        
        // 1. Try to claim if finished
        if (recipeState?.pendingOutcome) {
          const now = Date.now();
          if (now >= recipeState.pendingOutcome.completionTime) {
            claimCraftingProduction(index);
          }
        } 
        // 2. Try to start if idle
        else {
          const hasAllMaterials = recipe.materials.every(m => (rawMaterialsRef.current[m.id] || 0) >= m.quantity);
          if (hasAllMaterials) {
            startCraftingProduction(index);
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoCraftEnabled, startCraftingProduction, claimCraftingProduction, productionHqUpgrades]); // craftingProductionState and rawMaterials are not dependencies anymore
}
