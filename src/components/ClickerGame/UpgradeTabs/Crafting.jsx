import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';
import { Anvil, Cpu, Hammer, Unlock, Warehouse } from 'lucide-react';
import CraftingProductionCard from './CraftingProductionCard';

const getMaterialIcon = (materialId) => {
  if (materialId === 'metal') return Anvil;
  if (materialId === 'parts') return Hammer;
  if (materialId === 'tech') return Cpu;
  return Warehouse;
};

export default function Crafting({
  money,
  rawMaterials,
  buyMaterial,
  buyQuantity = 1,
  craftingItems,
  craftingProductionState,
  resourcePurchaseCounts,
  easyMode = false,
  isCraftingUnlocked = false,
  unlockCrafting,
  unlockCraftingCost,
  accumulatedPrestigeShares,
  getSelectedProductionMode,
  setSelectedProductionMode,
  resolveCraftOutcome,
  startCraftingProduction,
  claimCraftingProduction,
  craftingJourneyMessage,
  productionHqMaterialCostMultiplier = 1,
  productionHqValueMultiplier = 1,
  productionHqSpeedMultiplier = 1,
}) {
  const calculateTotalCost = (material) => {
    let total = 0;
    const costMultiplier = gameConfig.getCostMultiplier?.(easyMode) ?? 1;
    let purchaseCount = resourcePurchaseCounts[material.id] || 0;
    const costIncreaseFactor = material.costIncreaseFactor || 1.07;

    for (let index = 0; index < buyQuantity; index += 1) {
      total += Math.ceil(material.baseCost * Math.pow(costIncreaseFactor, purchaseCount) * costMultiplier * productionHqMaterialCostMultiplier);
      purchaseCount += 1;
    }

    return total;
  };

  if (!isCraftingUnlocked) {
    return (
      <div className="upgrade-section premium-section crafting-section">
        <h2 className="section-title">Wealth Production</h2>
        <div className="crafting-journey-card">
          <span className="crafting-journey-card__eyebrow">
            {craftingJourneyMessage?.eyebrow ?? 'Prestige Roadmap'}
          </span>
          <h3>{craftingJourneyMessage?.title ?? 'Turn prestige into production choices'}</h3>
          <p>{craftingJourneyMessage?.body ?? 'Your first prestige unlocks a second layer of economy: production modes, quality timing, and stronger claim moments.'}</p>
          <div className="crafting-journey-card__highlights">
            <span>Choose a production route</span>
            <span>Claim during quality windows</span>
            <span>Hunt rare premium finishes</span>
          </div>
        </div>

        <div className="premium-upgrade-card crafting-unlock-card">
          <div className="premium-upgrade-header">
            <Unlock className="premium-icon" />
            <h3>Unlock Wealth Production</h3>
          </div>
          <p className="premium-upgrade-description">
            Wealth Production starts after prestige and adds deliberate production choices instead of flat payouts.
            Pick faster or higher-value routes, then claim at the right time for stronger finishes.
          </p>
          <div className="crafting-unlock-card__requirements">
            <div className="premium-upgrade-level">
              Prestige Shares: <strong>{formatNumber(accumulatedPrestigeShares ?? 0, { decimals: 0 })}</strong> / {gameConfig.unlockCraftingPrestige} required
            </div>
            <div className="premium-upgrade-level">
              Unlock cost: <strong>{formatNumber(unlockCraftingCost)} €</strong>
            </div>
          </div>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: {accumulatedPrestigeShares >= gameConfig.unlockCraftingPrestige ? 'Ready to fund' : 'Reach prestige first'}
            </div>
            {typeof unlockCrafting === 'function' && typeof unlockCraftingCost === 'number' && accumulatedPrestigeShares >= gameConfig.unlockCraftingPrestige && (
              <button
                onClick={unlockCrafting}
                disabled={money < unlockCraftingCost}
                className={`premium-upgrade-button ${money < unlockCraftingCost ? 'disabled' : ''}`}
              >
                Unlock production routes
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-section premium-section crafting-section">
      <h2 className="section-title">Wealth Production</h2>

      <div className="crafting-journey-card is-live">
        <span className="crafting-journey-card__eyebrow">Production Loop</span>
        <h3>Choose the route, then own the claim moment</h3>
        <p>
          Each run asks two questions: which mode fits your economy right now, and can you claim inside the quality window for a stronger finish?
        </p>
      </div>

      <div className="crafting-materials-grid">
        {gameConfig.rawMaterials.map((material) => {
          const totalCost = calculateTotalCost(material);
          const purchaseCount = resourcePurchaseCounts[material.id] || 0;
          const MaterialIcon = getMaterialIcon(material.id);

          return (
            <div key={material.id} className="premium-upgrade-card crafting-material-card">
              <div className="premium-upgrade-header">
                <MaterialIcon className="premium-icon" />
                <h3>{material.name}</h3>
              </div>
              <div className="crafting-material-card__stats">
                <div className="premium-upgrade-level">
                  Owned: <strong>{rawMaterials[material.id] || 0}</strong>
                </div>
                <div className="premium-upgrade-level">
                  Bought so far: {purchaseCount}
                </div>
              </div>
              <button
                className={`premium-upgrade-button ${money < totalCost ? 'disabled' : ''}`}
                disabled={money < totalCost}
                onClick={() => buyMaterial(material.id, buyQuantity)}
              >
                Buy {buyQuantity} for {formatNumber(totalCost)} €
              </button>
            </div>
          );
        })}
      </div>

      <div className="crafting-production-list">
        {gameConfig.craftingRecipes.map((recipe, index) => (
          <CraftingProductionCard
            key={recipe.id}
            index={index}
            recipe={recipe}
            rawMaterials={rawMaterials}
            craftedCount={craftingItems?.[index] || 0}
            recipeState={craftingProductionState?.[recipe.id]}
            easyMode={easyMode}
            getSelectedProductionMode={getSelectedProductionMode}
            setSelectedProductionMode={setSelectedProductionMode}
            resolveCraftOutcome={resolveCraftOutcome}
            startCraftingProduction={startCraftingProduction}
            claimCraftingProduction={claimCraftingProduction}
            productionHqValueMultiplier={productionHqValueMultiplier}
            productionHqSpeedMultiplier={productionHqSpeedMultiplier}
          />
        ))}
      </div>
    </div>
  );
}
