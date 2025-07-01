import { DollarSign, Star, Percent, HistoryIcon, Zap as ZapIcon } from 'lucide-react';
import { 
  formatNumber, 
  getPercentage, 
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function PremiumUpgrades({
  money,
  globalMultiplier,
  globalMultiplierLevel,
  globalMultiplierCost,
  globalPriceDecrease,
  globalPriceDecreaseLevel,
  globalPriceDecreaseCost,
  buyGlobalPriceDecrease,
  buyGlobalMultiplier,
  isInvestmentUnlocked,
  unlockInvestments,
  unlockInvestmentCost,
  offlineEarningsLevel,      // New: Current level of offline earnings
  currentOfflineEarningsFactor, // New: Calculated effective factor
  buyOfflineEarningsLevel,     // New: Function to buy next level
  offlineEarningsLevelCost,   // New: Cost for the next level
  criticalClickChanceLevel,  // New: Current level of critical click chance
  currentCriticalClickChance, // New: Calculated critical click chance
  buyCriticalClickChanceLevel, // New: Function to buy next critical click chance level
  criticalClickChanceCost,   // New: Cost for the next critical click chance level
  managers, // Add managers prop
  buyQuantity, // New prop for bulk buying
  easyMode, // New prop for cost calculation
}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  const globalMultiplierPercentage = getPercentage(
    gameConfig.premiumUpgrades.globalMultiplier.factor
  );

  const globalCostReductionPercentage = getPercentage(
    gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor
  );

  const offlineEarningsEffectPerLevelPercentage = getPercentage(
    1 + gameConfig.premiumUpgrades.offlineEarnings.effectPerLevel // Convert 0.02 to 2%
  );

  const criticalClickChanceEffectPercentage = getPercentage(
    1 + gameConfig.premiumUpgrades.criticalClickChance.effectPerLevel 
  );

  // Cost increase percentages
  const globalMultiplierCostIncreasePercentage = getPercentage(
    gameConfig.premiumUpgrades.globalMultiplier.costExponent
  );

  const globalPriceDecreaseCostIncreasePercentage = getPercentage(
    gameConfig.premiumUpgrades.globalPriceDecrease.costExponent
  );

  const criticalClickChanceCostIncreasePercentage = getPercentage(
    gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier
  );
  const offlineEarningsCostIncreasePercentage = getPercentage(
    gameConfig.premiumUpgrades.offlineEarnings.costExponent
  );

  // Check if any manager is bought
  const hasAnyManager = managers ? managers.some(manager => manager === true) : false;
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);

  // Helper to calculate total cost for 'n' Global Multiplier upgrades
  const calculateTotalGlobalMultiplierCost = (quantity) => {
    let totalCost = 0;
    let currentLevel = globalMultiplierLevel;
    for (let i = 0; i < quantity; i++) {
      totalCost += gameConfig.premiumUpgrades.globalMultiplier.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalMultiplier.costExponent, currentLevel + i) *
        costMultiplier; // easyMode is handled by costMultiplier here
    }
    return totalCost;
  };

  // Helper to calculate total cost for 'n' Global Price Decrease upgrades
  const calculateTotalGlobalPriceDecreaseCost = (quantity) => {
    let totalCost = 0;
    let currentLevel = globalPriceDecreaseLevel;
    for (let i = 0; i < quantity; i++) {
      totalCost += gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, currentLevel + i) *
        costMultiplier;
    }
    return totalCost;
  };

  // Helper to calculate total cost for 'n' Critical Click Chance upgrades
  const calculateTotalCriticalClickChanceCost = (quantity) => {
    const maxLevel = 100;
    const actualQuantityToBuy = Math.min(quantity, maxLevel - criticalClickChanceLevel);
    if (actualQuantityToBuy <= 0) return Infinity; // Cannot buy more

    let totalCost = 0;
    let currentLevel = criticalClickChanceLevel;
    for (let i = 0; i < actualQuantityToBuy; i++) {
      totalCost += gameConfig.premiumUpgrades.criticalClickChance.baseCost *
        (1 + (currentLevel + i) * gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier) *
        costMultiplier;
    }
    return totalCost;
  };

    // Determine actual buyable quantity for Critical Click Chance
    const actualBuyableCriticalClick = Math.min(buyQuantity, 100 - criticalClickChanceLevel);


  // Helper to calculate total cost for 'n' Offline Earnings upgrades
  const calculateTotalOfflineEarningsCost = (quantity) => {
    let totalCost = 0;
    let currentLevel = offlineEarningsLevel;
    for (let i = 0; i < quantity; i++) {
      totalCost += gameConfig.premiumUpgrades.offlineEarnings.baseCost *
        Math.pow(gameConfig.premiumUpgrades.offlineEarnings.costExponent, currentLevel + i) *
        costMultiplier;
    }
    return totalCost;
  };

  // Costs for current buyQuantity
  const totalGlobalMultiplierCost = calculateTotalGlobalMultiplierCost(buyQuantity);
  const totalGlobalPriceDecreaseCost = calculateTotalGlobalPriceDecreaseCost(buyQuantity);
  const totalCriticalClickChanceCost = calculateTotalCriticalClickChanceCost(buyQuantity);
  const totalOfflineEarningsCost = calculateTotalOfflineEarningsCost(buyQuantity);


  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Clicker Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${globalMultiplierCostIncreasePercentage}% per level.`}>
          Increases the value of all clicks by {globalMultiplierPercentage}% per level. 
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {formatNumber(globalMultiplierLevel)} (Currently: x{formatNumber(globalMultiplier)})
          </div>
          <button
            onClick={() => buyGlobalMultiplier(buyQuantity)}
            disabled={money < totalGlobalMultiplierCost}
            className={`premium-upgrade-button ${money < totalGlobalMultiplierCost ? 'disabled' : ''}`}
            title={`Buy ${buyQuantity} level(s)`}
          >
            {formatNumber(totalGlobalMultiplierCost)} €
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Percent className="premium-icon" />
          <h3>Upgrade Price Decrease</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${globalPriceDecreaseCostIncreasePercentage}% per level.`}>
          Reduces all basic upgrade costs by {globalCostReductionPercentage}% per level. 
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalPriceDecreaseLevel} (Currently: x{(globalPriceDecrease ?? 1).toFixed(2)})
          </div>
          <button
            onClick={() => buyGlobalPriceDecrease(buyQuantity)}
            disabled={money < totalGlobalPriceDecreaseCost || isNaN(totalGlobalPriceDecreaseCost)}
            className={`premium-upgrade-button ${money < totalGlobalPriceDecreaseCost ? 'disabled' : ''}`}
            title={`Buy ${buyQuantity} level(s)`}
          >
            {isNaN(totalGlobalPriceDecreaseCost) ? 'Error' : `${formatNumber(totalGlobalPriceDecreaseCost)} €`}
          </button>
        </div>
      </div>
      {/* Critical Click Chance Upgrade */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <ZapIcon className="premium-icon" />
          <h3>Critical Click Chance</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${criticalClickChanceCostIncreasePercentage}% of the base cost per level. Max Level: 100.`}>
          Each click on the floating Euro button has a chance to grant your current income per second instead of +1€. Each level increases this chance by {criticalClickChanceEffectPercentage}%.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {criticalClickChanceLevel} (Currently: {formatNumber(currentCriticalClickChance * 100)}%)
          </div>
          <button
            onClick={() => buyCriticalClickChanceLevel(buyQuantity)}
            disabled={money < totalCriticalClickChanceCost || criticalClickChanceLevel >= 100 || !hasAnyManager || actualBuyableCriticalClick <= 0}
            className={`premium-upgrade-button ${money < totalCriticalClickChanceCost || criticalClickChanceLevel >= 100 || !hasAnyManager || actualBuyableCriticalClick <= 0 ? 'disabled' : ''}`}
            title={!hasAnyManager ? "Requires at least one manager." : (criticalClickChanceLevel >= 100 ? "Max Level Reached" : `Buy ${actualBuyableCriticalClick > 0 ? actualBuyableCriticalClick : buyQuantity} level(s)`)}
          >
            {criticalClickChanceLevel >= 100
              ? 'Max Level'
              : !hasAnyManager
                ? 'Requires Manager'
                : (actualBuyableCriticalClick <= 0 ? 'Max Level with this buy' : `${formatNumber(totalCriticalClickChanceCost)} €`)}
          </button>
        </div>
      </div>
      {/* Unlock Offline Earnings */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <HistoryIcon className="premium-icon" />
          <h3>Offline Earnings</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${offlineEarningsCostIncreasePercentage}% per level.`}>
          Earn a percentage of your income per second while away. Each level increases this by {offlineEarningsEffectPerLevelPercentage}%.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {offlineEarningsLevel} (Currently: {formatNumber(currentOfflineEarningsFactor * 100)}%)
          </div>
          <button
            onClick={() => buyOfflineEarningsLevel(buyQuantity)}
            disabled={money < totalOfflineEarningsCost}
            className={`premium-upgrade-button ${money < totalOfflineEarningsCost ? 'disabled' : ''}`}
            title={`Buy ${buyQuantity} level(s)`}
          >
            {formatNumber(totalOfflineEarningsCost)} €
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
        <DollarSign className="premium-icon" />
          <h3>Investments</h3>
        </div>
        <p className="premium-upgrade-description">
        Unlock the Investments tab to invest in companies.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Status: {isInvestmentUnlocked ? 'Unlocked' : 'Locked'}
          </div>
          <button
            onClick={() => {
              console.log('Button clicked, money:', money, 'cost:', unlockInvestmentCost);
              unlockInvestments();
            }}
            disabled={money < unlockInvestmentCost || isInvestmentUnlocked}
            className={`premium-upgrade-button ${money < unlockInvestmentCost || isInvestmentUnlocked ? 'disabled' : ''}`}
          >
            {isInvestmentUnlocked ? 'Unlocked' : `${formatNumber(unlockInvestmentCost)} €`}
          </button>
        </div>
      </div>
    </div>
  );
}