
import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import { Hammer, ShoppingCart } from 'lucide-react'; // Using Hammer for crafting recipes, ShoppingCart for materials

export default function Crafting({ money, rawMaterials, buyCraftingItem, buyMaterial, craftingItems }) {
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Crafting</h2>

      {/* Rohstoff-Anzeige und Kauf */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <ShoppingCart className="premium-icon" />
          <h3>Raw Materials</h3>
        </div>
        <div className="raw-materials-list">
          {gameConfig.rawMaterials.map((mat) => (
            <div key={mat.id} className="raw-material-item">
              <span>{mat.name}: <strong>{rawMaterials[mat.id] || 0}</strong></span>
              <button
                className="premium-upgrade-button"
                disabled={money < mat.baseCost}
                onClick={() => buyMaterial(mat.id, mat.baseCost)}
              >
                Buy 1 for {formatNumber(mat.baseCost)} €
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Crafting Rezepte */}
      {gameConfig.craftingRecipes.map((recipe, index) => {
        const canCraft = recipe.materials.every(material => 
          (rawMaterials[material.id] || 0) >= material.quantity
        );
        const materialsList = recipe.materials.map(material => 
          `${material.quantity} x ${gameConfig.rawMaterials.find(rm => rm.id === material.id)?.name || material.id}`
        ).join(', ');

        return (
          <div key={index} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <Hammer className="premium-icon" />
              <h3>{recipe.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              <strong>Materials:</strong> {materialsList}
            </p>
            <p className="premium-upgrade-description">
              <strong>Output:</strong> {formatNumber(recipe.output.money)} €
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
                Craft
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
