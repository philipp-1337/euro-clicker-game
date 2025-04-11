import { formatNumber } from '@utils/calculators';

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
                title="+10% Value"
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
                title="-10% Time"
              >
                <span>{formatNumber(cooldownUpgradeCosts[index])} €</span>
                <span>{(cooldownReductions[index] * 100).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
}