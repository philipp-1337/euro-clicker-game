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
   * Calculates offline earnings
   * @param {number} productionPerSecond - Current production per second
   * @param {number} offlineTimeInSeconds - Time spent offline in seconds
   * @param {number} offlineEfficiency - Efficiency of offline earnings (0-1)
   * @returns {number} The total offline earnings
   */
  export const calculateOfflineEarnings = (productionPerSecond, offlineTimeInSeconds, offlineEfficiency = 0.5) => {
    return Math.floor(productionPerSecond * offlineTimeInSeconds * offlineEfficiency);
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
  export const getGlobalMultiplierPercentage = (multiplierFactor) => {
    // Convert factor (e.g. 1.05) to percentage (e.g. 5)
    return Math.round((multiplierFactor - 1) * 100);
  };

  /**
   * Calculates the offline earnings percentage based on level and config
   * @param {number} level - Current level of offline earnings upgrade
   * @param {object} offlineEarningsConfig - Configuration for offline earnings
   * @returns {number} The percentage of normal rate
   */
  export const calculateOfflineEarningsPercentage = (level, offlineEarningsConfig) => {
    if (level <= 0) return 0;
    return offlineEarningsConfig.basePercentage + (level * offlineEarningsConfig.percentagePerLevel);
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