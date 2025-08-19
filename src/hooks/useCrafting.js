import { gameConfig } from '@constants/gameConfig';

// rawMaterials: Objekt mit Rohstoff-IDs als Keys und Mengen als Values
// setRawMaterials: Setter für rawMaterials
export default function useCrafting(money, setMoney, craftingItems, setCraftingItems, rawMaterials, setRawMaterials, resourcePurchaseCounts, setResourcePurchaseCounts, ensureStartTime) {

  // Rohstoff kaufen: zieht Geld ab und erhöht Rohstoffmenge
  const buyMaterial = (materialId) => {
    const material = gameConfig.rawMaterials.find(m => m.id === materialId);
    if (!material) return;

    const purchaseCount = resourcePurchaseCounts[materialId] || 0;
    const cost = Math.ceil(material.baseCost * Math.pow(gameConfig.resourceCostIncreaseFactor, purchaseCount));

    if (money >= cost) {
      setMoney(prev => prev - cost);
      setRawMaterials(prev => ({
        ...prev,
        [materialId]: (prev[materialId] || 0) + 1
      }));
      setResourcePurchaseCounts(prev => ({
        ...prev,
        [materialId]: (prev[materialId] || 0) + 1
      }));
      ensureStartTime?.();
    }
  };

  // Crafting-Item herstellen
  const buyCraftingItem = (index) => {
    const recipe = gameConfig.craftingRecipes[index];
    // Prüfe, ob alle Rohstoffe vorhanden sind
    const hasAllMaterials = recipe.materials.every(material =>
      rawMaterials[material.id] >= material.quantity
    );
    if (!hasAllMaterials) return;

    // Ziehe Rohstoffe ab
    setRawMaterials(prev => {
      const updated = { ...prev };
      recipe.materials.forEach(material => {
        updated[material.id] = (updated[material.id] || 0) - material.quantity;
      });
      return updated;
    });

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
  };

  return { buyCraftingItem, buyMaterial };
}
