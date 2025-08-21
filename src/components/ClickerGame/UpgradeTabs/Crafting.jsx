import PropTypes from 'prop-types';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';
import { Factory, Warehouse } from 'lucide-react';


export default function Crafting({ money, rawMaterials, buyCraftingItem, buyMaterial, craftingItems, resourcePurchaseCounts, easyMode = false, buyQuantity = 1, isCraftingUnlocked = false, unlockCrafting, craftingUnlockCost, accumulatedPrestigeShares }) {
Crafting.propTypes = {
  money: PropTypes.number.isRequired,
  rawMaterials: PropTypes.object.isRequired,
  buyCraftingItem: PropTypes.func.isRequired,
  buyMaterial: PropTypes.func.isRequired,
  craftingItems: PropTypes.array.isRequired,
  resourcePurchaseCounts: PropTypes.object.isRequired,
  easyMode: PropTypes.bool,
  buyQuantity: PropTypes.number
};
  // Use the same cost calculation wie in useCrafting.js, inklusive easyMode
  const calculateTotalCost = (material) => {
    let total = 0;
    const costMultiplier = gameConfig.getCostMultiplier?.(easyMode) ?? 1;
    let purchaseCount = resourcePurchaseCounts[material.id] || 0;
    for (let i = 0; i < buyQuantity; i++) {
      total += Math.ceil(material.baseCost * Math.pow(gameConfig.resourceCostIncreaseFactor, purchaseCount) * costMultiplier);
      purchaseCount++;
    }
    return total;
  };

  const availablePrestige = gameConfig.prestige.minMoneyForModalButton;

  if (!isCraftingUnlocked) {
    // You may need to pass unlockCrafting, craftingUnlockCost, accumulatedPrestigeShares as props from parent
    return (
      <div className="upgrade-section premium-section">
        <h2 className="section-title">Wealth Production</h2>
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <Warehouse className="premium-icon" />
            <h3>Unlock Wealth Production</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the Wealth Production tab to craft assets and earn money. Requires at least 1 Prestige. Prestige is available from {formatNumber(availablePrestige)} €.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: Locked
            </div>
            {typeof unlockCrafting === 'function' && typeof craftingUnlockCost === 'number' && (accumulatedPrestigeShares >= 1) && (
              <button
                onClick={unlockCrafting}
                disabled={money < craftingUnlockCost}
                className={`premium-upgrade-button ${money < craftingUnlockCost ? 'disabled' : ''}`}
              >
                {`${formatNumber(craftingUnlockCost)} €`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Wealth Production</h2>

      {/* Resource display and purchase */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Warehouse className="premium-icon" />
          <h3>Assets</h3>
        </div>
        <div className="raw-materials-list">
          {gameConfig.rawMaterials.map((mat) => {
            const totalCost = calculateTotalCost(mat);
            return (
              <div key={mat.id} className="raw-material-item">
                <span>{mat.name}: <strong>{rawMaterials[mat.id] || 0}</strong></span>
                <button
                  className={`premium-upgrade-button ${money < totalCost ? 'disabled' : ''}`}
                  disabled={money < totalCost}
                  onClick={() => buyMaterial(mat.id, buyQuantity)}
                >
                  Buy {buyQuantity} for {formatNumber(totalCost)} €
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Orders */}
      {gameConfig.craftingRecipes.map((recipe, index) => {
        const canCraft = recipe.materials.every(material => 
          (rawMaterials[material.id] || 0) >= material.quantity
        );
        const materialsList = recipe.materials.map(material => 
          `${material.quantity}x ${gameConfig.rawMaterials.find(rm => rm.id === material.id)?.name || material.id}`
        ).join(', ');

        return (
          <div key={index} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <Factory className="premium-icon" />
              <h3>{recipe.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              <strong>Requires:</strong> {materialsList}
            </p>
            <p className="premium-upgrade-description">
              <strong>Return:</strong> {formatNumber(recipe.output.money)} €
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Crafted: {(craftingItems && craftingItems[index]) || 0}
              </div>
              <button
                onClick={() => buyCraftingItem(index)}
                disabled={!canCraft}
                className={`premium-upgrade-button ${!canCraft ? 'disabled' : ''}`}
              >
                Invest
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

