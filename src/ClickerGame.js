import { useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import './ClickerGame.css'; // We'll create this CSS file separately

export default function ClickerGame() {
  const [money, setMoney] = useState(0);
  const [cooldowns, setCooldowns] = useState([0, 0, 0, 0, 0]);
  const [managers, setManagers] = useState([false, false, false, false, false]);
  const [valueMultipliers, setValueMultipliers] = useState([1, 1, 1, 1, 1]);
  const [cooldownReductions, setCooldownReductions] = useState([1, 1, 1, 1, 1]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([0, 0, 0, 0, 0]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([0, 0, 0, 0, 0]);

  const baseValueUpgradeCosts = [10, 20, 30, 40, 50];
  const baseCooldownUpgradeCosts = [10, 20, 30, 40, 50];

  const valueUpgradeCosts = valueUpgradeLevels.map((lvl, i) => baseValueUpgradeCosts[i] * Math.pow(1.5, lvl));
  const cooldownUpgradeCosts = cooldownUpgradeLevels.map((lvl, i) => baseCooldownUpgradeCosts[i] * Math.pow(1.5, lvl));

  const baseButtons = [
    { baseValue: 1, baseCooldownTime: 1, colorClass: 'blue', managerCost: 100 },
    { baseValue: 2, baseCooldownTime: 2, colorClass: 'green', managerCost: 500 },
    { baseValue: 3, baseCooldownTime: 3, colorClass: 'yellow', managerCost: 1000 },
    { baseValue: 4, baseCooldownTime: 4, colorClass: 'red', managerCost: 2000 },
    { baseValue: 5, baseCooldownTime: 5, colorClass: 'purple', managerCost: 5000 }
  ];

  // Calculate actual values based on upgrades
  const buttons = baseButtons.map((button, index) => {
    const actualValue = button.baseValue * valueMultipliers[index];
    const actualCooldownTime = button.baseCooldownTime * cooldownReductions[index];
    return {
      ...button,
      value: actualValue,
      cooldownTime: actualCooldownTime,
      label: `+${actualValue.toLocaleString("en-GB", { minimumFractionDigits: 1 })} €`
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prevCooldowns => 
        prevCooldowns.map((cooldown, index) => {
          // Decrease cooldown time
          const newCooldown = cooldown > 0 ? cooldown - 0.1 : 0;
          
          // If manager exists and cooldown just finished, trigger auto-click
          if (managers[index] && cooldown > 0 && newCooldown <= 0) {
            setTimeout(() => handleClick(index), 0);
          }
          
          return newCooldown;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [managers, buttons]);

  // Managers auto-clicking
  useEffect(() => {
    const autoClickInterval = setInterval(() => {
      managers.forEach((hasManager, index) => {
        if (hasManager && cooldowns[index] <= 0) {
          handleClick(index);
        }
      });
    }, 100);

    return () => clearInterval(autoClickInterval);
  }, [managers, cooldowns, buttons]);

  const handleClick = (index) => {
    if (cooldowns[index] <= 0) {
      setMoney(prevMoney => prevMoney + buttons[index].value);
      
      setCooldowns(prevCooldowns => {
        const newCooldowns = [...prevCooldowns];
        newCooldowns[index] = buttons[index].cooldownTime;
        return newCooldowns;
      });
    }
  };

  const buyManager = (index, cost) => {
    if (money >= cost && !managers[index]) {
      setMoney(prevMoney => prevMoney - cost);
      setManagers(prevManagers => {
        const newManagers = [...prevManagers];
        newManagers[index] = true;
        return newManagers;
      });
    }
  };

  const buyValueUpgrade = (index) => {
    const cost = valueUpgradeCosts[index];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setValueMultipliers(prev => {
        const updated = [...prev];
        updated[index] *= 1.1;
        return updated;
      });
      setValueUpgradeLevels(prev => {
        const updated = [...prev];
        updated[index]++;
        return updated;
      });
    }
  };

  const buyCooldownUpgrade = (index) => {
    const cost = cooldownUpgradeCosts[index];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setCooldownReductions(prev => {
        const updated = [...prev];
        updated[index] *= 0.9;
        return updated;
      });
      setCooldownUpgradeLevels(prev => {
        const updated = [...prev];
        updated[index]++;
        return updated;
      });
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Euro Clicker Game</h1>
      
      <div className="money-display">
        {money.toLocaleString("en-GB", { minimumFractionDigits: 2 })} €
      </div>
      
      {/* Main clicker buttons */}
      <div className="clicker-buttons">
        {buttons.map((button, index) => (
          <div key={index} className="button-container">
            <button
              onClick={() => handleClick(index)}
              disabled={cooldowns[index] > 0}
              className={`clicker-button ${button.colorClass} ${cooldowns[index] > 0 ? 'disabled' : ''}`}
            >
              <span>{button.label}</span>
              {cooldowns[index] > 0 && (
                <div className="cooldown-indicator">
                  <RefreshCw className="spinning-icon" />
                  <span>{cooldowns[index].toLocaleString("en-GB", { minimumFractionDigits: 1 })}s</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Manager buttons */}
      <h2 className="section-title">Buy Managers</h2>
      <div className="manager-buttons">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => buyManager(index, button.managerCost)}
            disabled={money < button.managerCost || managers[index]}
            className={`manager-button ${button.colorClass} ${(money < button.managerCost || managers[index]) ? 'disabled' : ''}`}
          >
            {managers[index] ? (
              <div className="manager-content">
                <Check className="check-icon" />
                <span>Bought</span>
              </div>
            ) : (
              <div className="manager-content">
                <span>{button.managerCost.toLocaleString("en-GB")} €</span>
                <span>Manager</span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Upgrades section */}
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
              <span>{(cooldownReductions[index] * 100).toFixed(0)}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}