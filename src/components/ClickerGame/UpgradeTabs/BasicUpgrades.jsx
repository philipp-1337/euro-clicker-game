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
                <span>{valueUpgradeCosts[index].toLocaleString("en-GB", { minimumFractionDigits: 1 })} €</span>
                <span>×{valueMultipliers[index].toLocaleString("en-GB", { minimumFractionDigits: 1 })}</span>
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
                <span>{cooldownUpgradeCosts[index].toLocaleString("en-GB", { minimumFractionDigits: 1 })} €</span>
                <span>{cooldownReductions[index].toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }