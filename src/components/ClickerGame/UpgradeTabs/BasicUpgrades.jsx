import { 
  formatNumber, 
  calculateValueUpgradePercentage, 
  calculateCooldownUpgradePercentage 
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import { Check } from 'lucide-react';

export default function BasicUpgrades({ 
    buttons, 
    valueUpgradeCosts, 
    cooldownUpgradeCosts, 
    money, 
    buyValueUpgrade, 
    buyCooldownUpgrade,
    valueMultipliers,
    cooldownReductions,
    managers,
    buyManager,
    managerCosts
}) {
  // Prozentsatz für Value-Upgrade aus der gameConfig berechnen
  const valueUpgradePercentage = calculateValueUpgradePercentage(gameConfig.upgrades.valueMultiplierFactor);
  
  // Prozentsatz für Cooldown-Upgrade aus der gameConfig berechnen
  const cooldownUpgradePercentage = calculateCooldownUpgradePercentage(gameConfig.upgrades.cooldownReductionFactor);

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
              onClick={() => buyValueUpgrade(index)}
              disabled={money < valueUpgradeCosts[index]}
              className={`upgrade-button ${button.colorClass} ${money < valueUpgradeCosts[index] ? 'disabled' : ''}`}
            >
              <div
                className="upgrade-content"
                title={`+${valueUpgradePercentage}% Value`}
              >
                <span>{formatNumber(valueUpgradeCosts[index])} €</span>
                <span>×{formatNumber(valueMultipliers[index])}</span>
              </div>
            </button>
          ))}
        </div>
        <h3 className="section-title">Decrease Cooldown Time</h3>
        <div className="upgrade-buttons">
          {buttons.map((button, index) => (
            <button
              key={`cooldown-${index}`}
              onClick={() => buyCooldownUpgrade(index)}
              disabled={money < cooldownUpgradeCosts[index]}
              className={`upgrade-button ${button.colorClass} ${money < cooldownUpgradeCosts[index] ? 'disabled' : ''}`}
            >
              <div
                className="upgrade-content"
                title={`-${cooldownUpgradePercentage}% Time`}
              >
                <span>{formatNumber(cooldownUpgradeCosts[index])} €</span>
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