import React from 'react';
import {
  formatNumber, 
  calculateValueUpgradePercentage, 
  calculateCooldownUpgradePercentage,
  calculateCostWithDifficulty // Import this
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import useSoundEffects from '@hooks/useSoundEffects'; // Import the new hook
import { Check } from 'lucide-react';

// Load sound effect

export default function BasicUpgrades({ 
    buttons,
    // valueUpgradeCosts, // No longer directly used for display/logic if always calculating total
    cooldownUpgradeCosts, // Used for single cooldown upgrades
    money, 
    buyValueUpgrade, 
    buyCooldownUpgrade,
    cooldownReductions,
    managers,
    buyManager,
    managerCosts,
    valueMultipliers,
    soundEffectsEnabled,
    // Need props for cost calculation of value upgrades:
    valueUpgradeLevels, // Added
    easyMode, // Added
    globalPriceDecrease, // Added
    cooldownUpgradeLevels, // Added for consistency if cooldown costs were to be calculated here
    buyQuantity // New prop
}) {
  const { playSound } = useSoundEffects(soundEffectsEnabled); // Use the sound effects hook

  // Prozentsatz für Value-Upgrade aus der gameConfig berechnen
  const valueUpgradePercentage = calculateValueUpgradePercentage(gameConfig.upgrades.valueMultiplierFactor);
  
  // Prozentsatz für Cooldown-Upgrade aus der gameConfig berechnen
  const cooldownUpgradePercentage = calculateCooldownUpgradePercentage(gameConfig.upgrades.cooldownReductionFactor);

  // Helper to calculate total cost for 'n' value upgrades
  const calculateTotalValueUpgradeCost = (buttonIndex, quantity) => {
    let totalCost = 0;
    let currentLevel = valueUpgradeLevels[buttonIndex];
    for (let i = 0; i < quantity; i++) {
      totalCost += calculateCostWithDifficulty(
        gameConfig.baseValueUpgradeCosts[buttonIndex],
        currentLevel + i,
        gameConfig.upgrades.costIncreaseFactor,
        easyMode,
        gameConfig.getCostMultiplier
      ) * globalPriceDecrease;
    }
    return totalCost;
  };

  // Helper to calculate total cost for 'n' cooldown upgrades
  const calculateTotalCooldownUpgradeCost = (buttonIndex, quantity) => {
    let totalCost = 0;
    let currentLevel = cooldownUpgradeLevels[buttonIndex];
    for (let i = 0; i < quantity; i++) {
      totalCost += calculateCostWithDifficulty(
        gameConfig.baseCooldownUpgradeCosts[buttonIndex],
        currentLevel + i,
        gameConfig.upgrades.costIncreaseFactor,
        easyMode,
        gameConfig.getCostMultiplier
      ) * globalPriceDecrease;
    }
    return totalCost;
  };

  const handleValueUpgradeClick = (index) => {
    playSound('valueUpgrade'); // Play sound effect when value upgrade is bought
    buyValueUpgrade(index, buyQuantity); // Pass the quantity
  };

  const handleCooldownUpgradeClick = (index) => {
    playSound('valueUpgrade'); // Play sound effect when cooldown upgrade is bought // TODO: Consider different sound
    buyCooldownUpgrade(index, buyQuantity); // Pass the quantity
  };

  if (!managerCosts || managerCosts.length === 0) {
    return null; // Oder ein Lade-Indikator, falls du möchtest
  }
    return (
      <div className="upgrade-section">
        <h2 className="section-title">Basic Upgrades</h2>

        <h3 className="section-title">Increase Value</h3>
        <div className="upgrade-buttons">
          {buttons.map((button, index) => (
            <button
              key={`value-${index}`}
              onClick={() => handleValueUpgradeClick(index)}
              disabled={money < calculateTotalValueUpgradeCost(index, buyQuantity)}
              className={`upgrade-button ${button.colorClass} ${money < calculateTotalValueUpgradeCost(index, buyQuantity) ? 'disabled' : ''}`}
            >
              <div
                className="upgrade-content"
                title={`+${valueUpgradePercentage}% Wert (x${buyQuantity})`}
              >
                <span>{formatNumber(calculateTotalValueUpgradeCost(index, buyQuantity))} €</span>
                <span>×{formatNumber(valueMultipliers[index])}</span>
              </div>
            </button>
          ))}
        </div>

        <h3 className="section-title">Decrease Cooldown</h3>
        <div className="upgrade-buttons">
          {buttons.map((button, index) => (
            <button
              key={`cooldown-${index}`}
              onClick={() => handleCooldownUpgradeClick(index)}
              disabled={money < calculateTotalCooldownUpgradeCost(index, buyQuantity)}
              className={`upgrade-button ${button.colorClass} ${money < calculateTotalCooldownUpgradeCost(index, buyQuantity) ? 'disabled' : ''}`}
            >
              <div
                className="upgrade-content"
                title={`-${cooldownUpgradePercentage}% Zeit (x${buyQuantity})`}
              >
                <span>{formatNumber(calculateTotalCooldownUpgradeCost(index, buyQuantity))} €</span>
                <span>{(cooldownReductions[index]).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>
        <h3 className="section-title">Buy Managers</h3>
        <div className="upgrade-buttons">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => buyManager(index, managerCosts[index])}
              disabled={money < managerCosts[index] || managers[index]}
              className={`upgrade-button ${button.colorClass} ${(money < managerCosts[index] || managers[index]) ? 'disabled' : ''}`}
            >
              {managers[index] ? (
                <div className="upgrade-content">
                  <Check className="check-icon" />
                  <span>Bought</span>
                </div>
              ) : (
                <div className="upgrade-content">
                  <span>{formatNumber(managerCosts[index])} €</span>
                  <span>Manager</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
}