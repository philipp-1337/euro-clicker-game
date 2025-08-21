import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';
import { Factory, Warehouse } from 'lucide-react';


export default function Crafting({ money, rawMaterials, buyCraftingItem, buyMaterial, craftingItems, resourcePurchaseCounts, easyMode = false, buyQuantity = 1, isCraftingUnlocked = false, unlockCrafting, unlockCraftingCost, accumulatedPrestigeShares }) {
  // Cooldown State: Array mit Endzeitpunkt pro Rezept
  const [cooldowns, setCooldowns] = useState([]);
  const [processing, setProcessing] = useState([]); // Merkt sich laufende Prozesse
  const cooldownTimers = useRef([]);
  const DEFAULT_COOLDOWN_SECONDS = gameConfig.craftingCooldownSeconds || 5; // Default 5 Sekunden

  // Timer zum Aktualisieren der Cooldowns
  useEffect(() => {
    // Clear Timer on unmount
    const timers = cooldownTimers.current;
    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, []);

  // Hilfsfunktion: Startet Cooldown für Rezept-Index mit individueller Dauer
  const startCooldown = (index, seconds) => {
    const endTime = Date.now() + seconds * 1000;
    setCooldowns(prev => {
      const next = [...prev];
      next[index] = endTime;
      return next;
    });
    setProcessing(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    // Timer für Ablauf
    if (cooldownTimers.current[index]) clearInterval(cooldownTimers.current[index]);
    cooldownTimers.current[index] = setInterval(() => {
      setCooldowns(prev => {
        const now = Date.now();
        if (prev[index] && now >= prev[index]) {
          // Nach Ablauf: Crafting durchführen, aber nur wenn Prozess aktiv war
          clearInterval(cooldownTimers.current[index]);
          let shouldCraft = false;
          setProcessing(procPrev => {
            const nextProc = [...procPrev];
            if (nextProc[index]) {
              shouldCraft = true;
              nextProc[index] = false;
            }
            return nextProc;
          });
          if (shouldCraft) {
            buyCraftingItem(index);
          }
          const next = [...prev];
          next[index] = null;
          return next;
        }
        return prev;
      });
    }, 250);
  };
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
        const isOnCooldown = cooldownEnd && now < cooldownEnd;
        const secondsLeft = isOnCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;
        const costMultiplier = gameConfig.getCostMultiplier?.(easyMode) ?? 1;
        const baseCooldown = typeof recipe.cooldownSeconds === 'number' ? recipe.cooldownSeconds : DEFAULT_COOLDOWN_SECONDS;
        const recipeCooldown = baseCooldown * costMultiplier;
        const isProcessing = processing[index];

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
                {isProcessing && isOnCooldown && <span style={{marginLeft:8, color:'#888'}}>(in Produktion)</span>}
              </div>
              <button
                onClick={() => {
                  // Rohstoffe nur hier abziehen!
                  const recipe = gameConfig.craftingRecipes[index];
                  if (recipe && recipe.materials) {
                    recipe.materials.forEach(material => {
                      if (typeof rawMaterials[material.id] === 'number') {
                        buyMaterial(material.id, -material.quantity);
                      }
                    });
                  }
                  startCooldown(index, recipeCooldown);
                }}
                disabled={!canCraft || isOnCooldown || isProcessing}
                className={`premium-upgrade-button ${(!canCraft || isOnCooldown || isProcessing) ? 'disabled' : ''}`}
              >
                {isOnCooldown ? `Processing (${secondsLeft}s)` : `Process${formatNumber(recipeCooldown) !== formatNumber(DEFAULT_COOLDOWN_SECONDS) ? ` (${formatNumber(recipeCooldown)})` : ''}`}
              </button>
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

