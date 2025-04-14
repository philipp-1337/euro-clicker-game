import { 
  formatNumber, 
  calculateValueUpgradePercentage, 
  calculateCooldownUpgradePercentage 
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function BasicUpgrades({ 
    buttons, 
    valueUpgradeCosts, 
    cooldownUpgradeCosts, 
    money, 
    buyValueUpgrade, 
    buyCooldownUpgrade,
    valueMultipliers,
    cooldownReductions
}) {
  // Prozentsatz für Value-Upgrade aus der gameConfig berechnen
  const valueUpgradePercentage = calculateValueUpgradePercentage(gameConfig.upgrades.valueMultiplierFactor);
  
  // Prozentsatz für Cooldown-Upgrade aus der gameConfig berechnen
  const cooldownUpgradePercentage = calculateCooldownUpgradePercentage(gameConfig.upgrades.cooldownReductionFactor);

    return (
      <div className="upgrade-section">
        <h2 className="section-title">Buy Upgrades</h2>
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
      </div>
    );
}