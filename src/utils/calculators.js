/**
 * Calculates the cost of the next level of an item
 * @param {number} baseCost - The base cost of the item
 * @param {number} currentLevel - The current level of the item
 * @param {number} growthRate - The cost growth rate (default: 1.15)
 * @returns {number} The cost of the next level
 */
export const calculateNextLevelCost = (baseCost, currentLevel, growthRate = 1.15) => {
    return Math.floor(baseCost * Math.pow(growthRate, currentLevel));
  };
  
  /**
   * Calculates the total cost to upgrade from current level to target level
   * @param {number} baseCost - The base cost of the item
   * @param {number} currentLevel - The current level of the item
   * @param {number} targetLevel - The target level to upgrade to
   * @param {number} growthRate - The cost growth rate (default: 1.15)
   * @returns {number} The total cost to reach the target level
   */
  export const calculateUpgradeCost = (baseCost, currentLevel, targetLevel, growthRate = 1.15) => {
    if (targetLevel <= currentLevel) return 0;
    
    let totalCost = 0;
    for (let level = currentLevel; level < targetLevel; level++) {
      totalCost += calculateNextLevelCost(baseCost, level, growthRate);
    }
    
    return totalCost;
  };
  
  /**
   * Calculates the production per second
   * @param {number} baseProduction - The base production value
   * @param {number} level - The current level
   * @param {number} multiplier - Additional multiplier for production
   * @returns {number} The production per second
   */
  export const calculateProduction = (baseProduction, level, multiplier = 1) => {
    return baseProduction * level * multiplier;
  };
  
/**
 * Formats a number for display (e.g., 1000 -> 1.00K)
 * Always returns two decimal places
 * @param {number} num - The number to format
 * @returns {string} The formatted number as a string
 */
export const formatNumber = (num) => {
  if (num < 1000) return num.toFixed(2);
  if (num < 1_000_000) return (num / 1_000).toFixed(2) + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  return (num / 1_000_000_000).toFixed(2) + 'B';
};
  
  /**
   * Calculates the maximum affordable level based on available currency
   * @param {number} baseCost - The base cost of the item
   * @param {number} currentLevel - The current level of the item
   * @param {number} availableCurrency - Available currency to spend
   * @param {number} growthRate - The cost growth rate (default: 1.15)
   * @returns {number} The maximum level that can be afforded
   */
  export const calculateMaxAffordableLevel = (baseCost, currentLevel, availableCurrency, growthRate = 1.15) => {
    let level = currentLevel;
    let remainingCurrency = availableCurrency;
    
    while (true) {
      const nextLevelCost = calculateNextLevelCost(baseCost, level, growthRate);
      if (nextLevelCost > remainingCurrency) break;
      
      remainingCurrency -= nextLevelCost;
      level++;
    }
    
    return level;
  };

  /**
   * Calculates the global multiplier increase percentage from a multiplier factor
   * @param {number} multiplierFactor - The multiplication factor (e.g., 1.05)
   * @returns {number} The percentage increase (e.g., 5 for 5%)
   */
  export const getPercentage = (multiplierFactor) => {
    return Math.abs(Math.round((multiplierFactor - 1) * 100));
  };

  /**
   * Berechnet den Prozentsatz für Value-Upgrades
   * @param {number} valueMultiplierFactor - Der Multiplikator-Faktor (z.B. 1.1)
   * @returns {number} Der Prozentsatz (z.B. 10 für 10%)
   */
  export const calculateValueUpgradePercentage = (valueMultiplierFactor) => {
    return Math.round((valueMultiplierFactor - 1) * 100);
  };

  /**
   * Berechnet den Prozentsatz für Cooldown-Upgrades
   * @param {number} cooldownReductionFactor - Der Reduktions-Faktor (z.B. 0.9)
   * @returns {number} Der Prozentsatz (z.B. 10 für 10%)
   */
  export const calculateCooldownUpgradePercentage = (cooldownReductionFactor) => {
    return Math.round((1 - cooldownReductionFactor) * 100);
  };

  /**
   * Berechnet den aktuellen Multiplikator für ein Button-Upgrade
   * @param {number} currentValue - Aktueller Wert des Buttons
   * @param {number} baseValue - Basiswert des Buttons
   * @param {number} globalMultiplier - Globaler Multiplikator
   * @returns {number} Der spezifische Multiplikator für diesen Button
   */
  export const calculateButtonValueMultiplier = (currentValue, baseValue, globalMultiplier) => {
    return currentValue / baseValue / globalMultiplier;
  };

  /**
   * Berechnet die prozentuale Reduzierung der Cooldown-Zeit
   * @param {number} currentCooldown - Aktuelle Cooldown-Zeit
   * @param {number} baseCooldown - Basis-Cooldown-Zeit
   * @returns {number} Prozentuale Cooldown-Zeit (100% = keine Reduzierung)
   */
  export const calculateCooldownReductionPercentage = (currentCooldown, baseCooldown) => {
    return (currentCooldown / baseCooldown) * 100;
  };

  /**
   * Berechnet alle Button-Daten (Wert, Cooldown, Label) basierend auf den Multiplikatoren und Reduktionen
   * @param {Array} baseButtons - Die Basis-Button-Konfigurationen
   * @param {Array} valueMultipliers - Multiplikatoren pro Button
   * @param {number} globalMultiplier - Globaler Multiplikator
   * @param {Array} cooldownReductions - Reduktionsfaktoren pro Button
   * @returns {Array} Liste von Buttons mit berechneten Werten
   */
  export const calculateButtons = (baseButtons, valueMultipliers, globalMultiplier, cooldownReductions) => {
    return baseButtons.map((button, index) => {
      const actualValue = button.baseValue * valueMultipliers[index] * globalMultiplier;
      const actualCooldownTime = button.baseCooldownTime * cooldownReductions[index];
      return {
        ...button,
        value: actualValue,
        cooldownTime: actualCooldownTime,
        label: `+${actualValue.toLocaleString("en-GB", { minimumFractionDigits: 1 })} €`
      };
    });
  };

  /**
   * Berechnet die Upgrade-Kosten unter Berücksichtigung des Schwierigkeitsgrads (z. B. Easy Mode)
   * @param {number} baseCost - Basispreis
   * @param {number} level - Aktueller Level
   * @param {number} growthFactor - Wachstumsfaktor (default: 1.5)
   * @param {boolean} easyMode - Ist Easy Mode aktiv?
   * @param {function} getCostMultiplier - Funktion zur Ermittlung des Kostenmultiplikators
   * @returns {number} Die berechneten Kosten
   */
  export const calculateCostWithDifficulty = (baseCost, level, growthFactor = 1.5, easyMode = false, getCostMultiplier) => {
    const cost = baseCost * Math.pow(growthFactor, level);
    return easyMode ? cost * getCostMultiplier(true) : cost;
  };

  /**
   * Formats a playtime in seconds as Xh Ym Zs, Ym Zs, or Zs
   * @param {number} seconds - Playtime in seconds
   * @param {boolean} [showSecondsAfterHour=true] - Whether to show seconds for times >= 1 hour (only for default format)
   * @param {boolean} [useColonFormat=false] - Whether to use colon-separated format (e.g., 1:31:12)
   * @returns {string} Formatted playtime string
   */
  export function formatPlaytime(seconds, showSecondsAfterHour = true, useColonFormat = false) {
    if (!seconds) return '0s';
    
    // Doppelpunkt-Format nur anwenden, wenn useColonFormat true ist UND die Zeit >= 60 Sekunden beträgt.
    if (useColonFormat && seconds >= 60) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
  
      const s_padded = s.toString().padStart(2, '0');
  
      if (h > 0) {
        const m_padded = m.toString().padStart(2, '0');
        return `${h}:${m_padded}:${s_padded}`;
      } else { // m muss > 0 sein, da seconds >= 60 und h == 0
        return `${m}:${s_padded}`;
      }
    }

    // Standard "langes" Format (Xh Ym Zs) oder Fallback für useColonFormat bei < 60 Sekunden
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // Wenn mehr als eine Stunde und showSecondsAfterHour=false, keine Sekunden anzeigen
    if (hours >= 1 && !showSecondsAfterHour) {
      return [
        hours > 0 ? `${hours}h` : null,
        `${minutes}m`
      ].filter(Boolean).join(' ');
    }
    
    // Ansonsten vollständiges Format mit Sekunden
    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 || hours > 0 ? `${minutes}m` : null,
      `${secs}s`
    ].filter(Boolean).join(' ');
  }