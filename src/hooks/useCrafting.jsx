import { useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';

// rawMaterials: Objekt mit Rohstoff-IDs als Keys und Mengen als Values
// setRawMaterials: Setter für rawMaterials
export default function useCrafting(money, setMoney, craftingItems, setCraftingItems, rawMaterials, setRawMaterials, resourcePurchaseCounts, setResourcePurchaseCounts, ensureStartTime, easyMode) {

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

  // Crafting-Item herstellen
  const buyCraftingItem = useCallback((index, force = false) => {
    const recipe = gameConfig.craftingRecipes[index];
    // Prüfe, ob alle Rohstoffe vorhanden sind
    const hasAllMaterials = recipe.materials.every(material =>
      rawMaterials[material.id] >= material.quantity
    );
    if (!hasAllMaterials && !force) return;

  // Rohstoffe werden NICHT mehr hier abgezogen! (nur beim Button-Klick)

    // Füge Output hinzu (hier: Geld, kann später erweitert werden)
    if (recipe.output.money) {
      setMoney(prev => prev + recipe.output.money);
    }

    // Zähle gecraftete Items
    setCraftingItems(prev => {
      const updated = [...prev];
      updated[index] = (updated[index] || 0) + 1;
      return updated;
    });

    ensureStartTime?.();
  }, [rawMaterials, setMoney, setCraftingItems, ensureStartTime]);

  return { buyCraftingItem, buyMaterial };
}