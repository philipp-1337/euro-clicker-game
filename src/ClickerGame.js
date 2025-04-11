import { useState, useEffect } from 'react';
import { RefreshCw, Check, Star, Zap } from 'lucide-react';
import './ClickerGame.css'; // CSS-Datei wird separat erstellt

export default function ClickerGame() {
  const [money, setMoney] = useState(0);
  const [cooldowns, setCooldowns] = useState([0, 0, 0, 0, 0]);
  const [managers, setManagers] = useState([false, false, false, false, false]);
  const [valueMultipliers, setValueMultipliers] = useState([1, 1, 1, 1, 1]);
  const [cooldownReductions, setCooldownReductions] = useState([1, 1, 1, 1, 1]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([0, 0, 0, 0, 0]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([0, 0, 0, 0, 0]);
  
  // Neue Zustände für Premium-Upgrades
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' oder 'premium'
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(0);
  const [autoClickerLevel, setAutoClickerLevel] = useState(0);
  const [autoClickerInterval, setAutoClickerInterval] = useState(null);
  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(0);
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());

  const baseValueUpgradeCosts = [10, 20, 30, 40, 50];
  const baseCooldownUpgradeCosts = [10, 20, 30, 40, 50];

  const valueUpgradeCosts = valueUpgradeLevels.map((lvl, i) => baseValueUpgradeCosts[i] * Math.pow(1.5, lvl));
  const cooldownUpgradeCosts = cooldownUpgradeLevels.map((lvl, i) => baseCooldownUpgradeCosts[i] * Math.pow(1.5, lvl));

  // Premium-Upgrade-Kosten
  const globalMultiplierCost = 1000 * Math.pow(2, globalMultiplierLevel);
  const autoClickerCost = 2000 * Math.pow(1.8, autoClickerLevel);
  const offlineEarningsCost = 5000 * Math.pow(2.2, offlineEarningsLevel);

  const baseButtons = [
    { baseValue: 1, baseCooldownTime: 1, colorClass: 'blue', managerCost: 100 },
    { baseValue: 2, baseCooldownTime: 2, colorClass: 'green', managerCost: 500 },
    { baseValue: 3, baseCooldownTime: 3, colorClass: 'yellow', managerCost: 1000 },
    { baseValue: 4, baseCooldownTime: 4, colorClass: 'red', managerCost: 2000 },
    { baseValue: 5, baseCooldownTime: 5, colorClass: 'purple', managerCost: 5000 }
  ];

  // Berechne tatsächliche Werte basierend auf Upgrades
  const buttons = baseButtons.map((button, index) => {
    const actualValue = button.baseValue * valueMultipliers[index] * globalMultiplier;
    const actualCooldownTime = button.baseCooldownTime * cooldownReductions[index];
    return {
      ...button,
      value: actualValue,
      cooldownTime: actualCooldownTime,
      label: `+${actualValue.toLocaleString("en-GB", { minimumFractionDigits: 1 })} €`
    };
  });

  // Offline-Einnahmen berechnen beim Laden
  useEffect(() => {
    if (offlineEarningsLevel > 0) {
      const now = Date.now();
      const timeDiff = (now - lastOnlineTime) / 1000; // Sekunden seit letztem Besuch
      const maxOfflineTime = 3600 * 8; // Maximal 8 Stunden Offline-Einnahmen
      const effectiveTime = Math.min(timeDiff, maxOfflineTime);
      
      if (effectiveTime > 10) { // Nur anwenden wenn mehr als 10 Sekunden vergangen sind
        // Berechne potenzielle Einnahmen durch Manager während der Abwesenheit
        let offlineEarnings = 0;
        
        buttons.forEach((button, index) => {
          if (managers[index]) {
            // Einnahmen = Button-Wert * (Zeit / Cooldown-Zeit) * Offline-Earnings-Faktor
            const offlineFactor = 0.2 + (offlineEarningsLevel * 0.1); // 20% + 10% pro Level
            const earningsPerSecond = button.value / button.cooldownTime;
            offlineEarnings += earningsPerSecond * effectiveTime * offlineFactor;
          }
        });
        
        if (offlineEarnings > 0) {
          setMoney(prev => prev + offlineEarnings);
          // Hier könnte man eine Benachrichtigung anzeigen
          console.log(`Du hast ${offlineEarnings.toLocaleString("en-GB", { minimumFractionDigits: 2 })} € während deiner Abwesenheit verdient!`);
        }
      }
    }
    
    // Aktuelle Zeit speichern
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('lastOnlineTime', Date.now().toString());
    });
    
    // Zeit aus LocalStorage laden
    const storedTime = localStorage.getItem('lastOnlineTime');
    if (storedTime) {
      setLastOnlineTime(parseInt(storedTime));
    }
    
    return () => {
      localStorage.setItem('lastOnlineTime', Date.now().toString());
    };
  }, []);

  // Cooldown-Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prevCooldowns => 
        prevCooldowns.map((cooldown, index) => {
          // Cooldown-Zeit verringern
          const newCooldown = cooldown > 0 ? cooldown - 0.1 : 0;
          
          // Wenn Manager existiert und Cooldown gerade fertig ist, Auto-Click auslösen
          if (managers[index] && cooldown > 0 && newCooldown <= 0) {
            setTimeout(() => handleClick(index), 0);
          }
          
          return newCooldown;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [managers, buttons]);

  // Manager Auto-Clicking
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

  // Global Auto-Clicker (Premium Upgrade)
  useEffect(() => {
    if (autoClickerLevel > 0) {
      clearInterval(autoClickerInterval);
      
      const newInterval = setInterval(() => {
        // Finde den Button mit dem besten Wert/Zeit-Verhältnis
        let bestIndex = 0;
        let bestValue = 0;
        
        buttons.forEach((button, index) => {
          if (cooldowns[index] <= 0) {
            const valuePerSecond = button.value / button.cooldownTime;
            if (valuePerSecond > bestValue) {
              bestValue = valuePerSecond;
              bestIndex = index;
            }
          }
        });
        
        // Klicke den besten Button, wenn verfügbar
        if (bestValue > 0) {
          handleClick(bestIndex);
        }
      }, 2000 / autoClickerLevel); // Häufigkeit basierend auf Level
      
      setAutoClickerInterval(newInterval);
      
      return () => clearInterval(newInterval);
    }
  }, [autoClickerLevel, buttons, cooldowns]);

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

  // Premium-Upgrade-Handler
  const buyGlobalMultiplier = () => {
    if (money >= globalMultiplierCost) {
      setMoney(prev => prev - globalMultiplierCost);
      setGlobalMultiplier(prev => prev * 1.15); // +15% pro Level
      setGlobalMultiplierLevel(prev => prev + 1);
    }
  };

  const buyAutoClicker = () => {
    if (money >= autoClickerCost) {
      setMoney(prev => prev - autoClickerCost);
      setAutoClickerLevel(prev => prev + 1);
    }
  };

  const buyOfflineEarnings = () => {
    if (money >= offlineEarningsCost) {
      setMoney(prev => prev - offlineEarningsCost);
      setOfflineEarningsLevel(prev => prev + 1);
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
      
      {/* Tabs für Upgrades */}
      <div className="upgrade-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Upgrades
        </button>
        <button 
          className={`tab-button ${activeTab === 'premium' ? 'active' : ''}`}
          onClick={() => setActiveTab('premium')}
        >
          Premium Upgrades
        </button>
      </div>
      
      {/* Basic Upgrades Tab */}
      {activeTab === 'basic' && (
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
                  <span>{(cooldownReductions[index] * 100).toFixed(0)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Premium Upgrades Tab */}
      {activeTab === 'premium' && (
        <div className="upgrade-section premium-section">
          <h2 className="section-title">Premium Upgrades</h2>
          
          <div className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <Star className="premium-icon" />
              <h3>Global Value Multiplier</h3>
            </div>
            <p className="premium-upgrade-description">
              Erhöht den Wert aller Klicks um 15%
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Level: {globalMultiplierLevel} (×{globalMultiplier.toLocaleString("en-GB", { minimumFractionDigits: 2 })})
              </div>
              <button
                onClick={buyGlobalMultiplier}
                disabled={money < globalMultiplierCost}
                className={`premium-upgrade-button ${money < globalMultiplierCost ? 'disabled' : ''}`}
              >
                {globalMultiplierCost.toLocaleString("en-GB")} €
              </button>
            </div>
          </div>
          
          <div className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <Zap className="premium-icon" />
              <h3>Smart Auto-Clicker</h3>
            </div>
            <p className="premium-upgrade-description">
              Klickt automatisch den profitabelsten Button
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Level: {autoClickerLevel} ({autoClickerLevel > 0 ? `${autoClickerLevel} Klick${autoClickerLevel > 1 ? 's' : ''}/2s` : 'Inaktiv'})
              </div>
              <button
                onClick={buyAutoClicker}
                disabled={money < autoClickerCost}
                className={`premium-upgrade-button ${money < autoClickerCost ? 'disabled' : ''}`}
              >
                {autoClickerCost.toLocaleString("en-GB")} €
              </button>
            </div>
          </div>
          
          <div className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <RefreshCw className="premium-icon" />
              <h3>Offline Earnings</h3>
            </div>
            <p className="premium-upgrade-description">
              Verdiene Geld, auch wenn du nicht spielst (max. 8 Stunden)
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Level: {offlineEarningsLevel} ({offlineEarningsLevel > 0 ? `${(20 + offlineEarningsLevel * 10)}% der normalen Rate` : 'Inaktiv'})
              </div>
              <button
                onClick={buyOfflineEarnings}
                disabled={money < offlineEarningsCost}
                className={`premium-upgrade-button ${money < offlineEarningsCost ? 'disabled' : ''}`}
              >
                {offlineEarningsCost.toLocaleString("en-GB")} €
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}