import { useState, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';
import { Factory, Warehouse } from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '@utils/localStorage';

export default function Crafting({ money, rawMaterials, buyCraftingItem, buyMaterial, craftingItems, resourcePurchaseCounts, easyMode = false, buyQuantity = 1, isCraftingUnlocked = false, unlockCrafting, unlockCraftingCost, accumulatedPrestigeShares }) {
  const COOLDOWN_KEY = 'craftingCooldowns';
  const [cooldowns, setCooldowns] = useState(() => {
    const loaded = getLocalStorage(COOLDOWN_KEY, []);
    setLocalStorage(COOLDOWN_KEY, loaded);
    return loaded;
  });
  const [pendingCrafts, setPendingCrafts] = useState(() => cooldowns.map(endTime => !!endTime));
  const DEFAULT_COOLDOWN_SECONDS = gameConfig.craftingCooldownSeconds || 5;
  const [rewardAvailable, setRewardAvailable] = useState(() => cooldowns.map((endTime) => {
    const now = Date.now();
    return endTime && now >= endTime;
  }));

  // Synchronisiere rewardAvailable bei jedem Render
  useEffect(() => {
    const loaded = getLocalStorage(COOLDOWN_KEY, []);
    const now = Date.now();
    setRewardAvailable(loaded.map((endTime) => endTime && now >= endTime));
  }, [cooldowns]);

  // Synchronisiere rewardAvailable nach jedem Tab-Wechsel (Visibility API)
  useEffect(() => {
    const syncRewardAvailable = () => {
      const loaded = getLocalStorage(COOLDOWN_KEY, []);
      const now = Date.now();
      setRewardAvailable(loaded.map((endTime) => endTime && now >= endTime));
    };
    document.addEventListener('visibilitychange', syncRewardAvailable);
    return () => document.removeEventListener('visibilitychange', syncRewardAvailable);
  }, []);

  // Synchronisiere rewardAvailable nach Cloud-Import
  useEffect(() => {
    const onCloudImported = () => {
      const loadedCooldowns = getLocalStorage(COOLDOWN_KEY, []);
      const now = Date.now();
      setRewardAvailable(loadedCooldowns.map((endTime) => endTime && now >= endTime));
      setCooldowns(loadedCooldowns);
      setPendingCrafts(loadedCooldowns.map(endTime => !!endTime));
    };
    window.addEventListener('game:cloudimported', onCloudImported);
    return () => window.removeEventListener('game:cloudimported', onCloudImported);
  }, [buyCraftingItem]);

  // Cooldown-Logik: prüft bei jedem Render, ob ein Cooldown abgelaufen ist und setzt pendingCrafts
  useEffect(() => {
    const now = Date.now();
    cooldowns.forEach((endTime, index) => {
      if (endTime && now >= endTime && pendingCrafts[index]) {
        setPendingCrafts(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }
    });
    // Intervall für Progressbar/Status
    const interval = setInterval(() => {
      setCooldowns(prev => [...prev]);
    }, 250);
    return () => clearInterval(interval);
  }, [cooldowns, pendingCrafts]);

  // Hilfsfunktion: Startet Cooldown für Rezept-Index mit individueller Dauer und speichert im LocalStorage
  const startCooldown = (index, seconds) => {
    const endTime = Date.now() + seconds * 1000;
    setCooldowns(prev => {
      const next = [...prev];
      next[index] = endTime;
      setLocalStorage(COOLDOWN_KEY, next);
      return next;
    });
    setPendingCrafts(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  // Use the same cost calculation wie in useCrafting.js, inklusive easyMode
  // Angepasst: Nutze individuellen costIncreaseFactor pro Material
  const calculateTotalCost = (material) => {
    let total = 0;
    const costMultiplier = gameConfig.getCostMultiplier?.(easyMode) ?? 1;
    let purchaseCount = resourcePurchaseCounts[material.id] || 0;
    const costIncreaseFactor = material.costIncreaseFactor || 1.07;
    for (let i = 0; i < buyQuantity; i++) {
      total += Math.ceil(material.baseCost * Math.pow(costIncreaseFactor, purchaseCount) * costMultiplier);
      purchaseCount++;
    }
    return total;
  };

  const availablePrestige = gameConfig.prestige.minMoneyForModalButton;

  if (!isCraftingUnlocked) {
    return (
      <div className="upgrade-section premium-section">
        <h2 className="section-title">Wealth Production</h2>
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <Warehouse className="premium-icon" />
            <h3>Unlock Wealth Production</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the Wealth Production tab to craft assets and earn money. Requires at least {gameConfig.unlockCraftingPrestige} Prestige. Prestige is available from {formatNumber(availablePrestige)} €.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: Locked
            </div>
            {typeof unlockCrafting === 'function' && typeof unlockCraftingCost === 'number' && (accumulatedPrestigeShares >= gameConfig.unlockCraftingPrestige) && (
              <button
                onClick={unlockCrafting}
                disabled={money < unlockCraftingCost}
                className={`premium-upgrade-button ${money < unlockCraftingCost ? 'disabled' : ''}`}
              >
                {`${formatNumber(unlockCraftingCost)} €`}
              </button>
            )}
            {/* <button onClick={() => console.log(typeof accumulatedPrestigeShares === 'number')}>Log</button> */}
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

      {/* Production Orders mit Cooldown */}
      {gameConfig.craftingRecipes.map((recipe, index) => {
        const canCraft = recipe.materials.every(material => 
          (rawMaterials[material.id] || 0) >= material.quantity
        );
        const materialsList = recipe.materials.map(material => 
          `${material.quantity}x ${gameConfig.rawMaterials.find(rm => rm.id === material.id)?.name || material.id}`
        ).join(', ');
        const now = Date.now();
        const cooldownEnd = cooldowns[index];
        const costMultiplier = gameConfig.getCostMultiplier?.(easyMode) ?? 1;
        const baseCooldown = typeof recipe.cooldownSeconds === 'number' ? recipe.cooldownSeconds : DEFAULT_COOLDOWN_SECONDS;
        const recipeCooldown = baseCooldown * costMultiplier;
        const isOnCooldown = cooldownEnd && now < cooldownEnd;
        const secondsLeft = isOnCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;
        const isRewardReady = rewardAvailable[index];

        // Progressbar-Berechnung
        let progressPercent = 0;
        if (isOnCooldown && cooldownEnd) {
          const total = recipeCooldown * 1000;
          const elapsed = total - (cooldownEnd - now);
          progressPercent = Math.max(0, Math.min(100, (elapsed / total) * 100));
        }

        return (
          <div key={index} className="premium-upgrade-card" style={{position:'relative', overflow:'hidden'}}>
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
                {isOnCooldown && <span style={{marginLeft:8, color:'#888'}}>(in Produktion)</span>}
              </div>
              {isRewardReady ? (
                <button
                  onClick={() => {
                    buyCraftingItem(index, true); // Reward und Counter erhöhen
                    setCooldowns(prev => {
                      const next = [...prev];
                      next[index] = null;
                      setLocalStorage(COOLDOWN_KEY, next);
                      return next;
                    });
                    setPendingCrafts(prev => {
                      const next = [...prev];
                      next[index] = false;
                      return next;
                    });
                    setRewardAvailable(prev => {
                      const next = [...prev];
                      next[index] = false;
                      return next;
                    });
                  }}
                  className="premium-upgrade-button"
                >
                  Request your Reward
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Rohstoffe nur hier abziehen!
                    if (recipe && recipe.materials) {
                      recipe.materials.forEach(material => {
                        if (typeof rawMaterials[material.id] === 'number') {
                          buyMaterial(material.id, -material.quantity);
                        }
                      });
                    }
                    startCooldown(index, recipeCooldown);
                  }}
                  disabled={!canCraft || isOnCooldown}
                  className={`premium-upgrade-button ${(!canCraft || isOnCooldown) ? 'disabled' : ''}`}
                >
                  {isOnCooldown ? `Processing (${secondsLeft}s)` : `Process${formatNumber(recipeCooldown) !== formatNumber(DEFAULT_COOLDOWN_SECONDS) ? ` (${formatNumber(recipeCooldown)}s)` : ''}`}
                </button>
              )}
            </div>
            {/* Progressbar am unteren Rand der Card */}
            {isOnCooldown && (
              <div style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: '6px',
                background: '#eee',
                zIndex: 1
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                  transition: 'width 0.25s linear'
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

