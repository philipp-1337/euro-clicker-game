import { Star, Percent, HistoryIcon, Zap as ZapIcon } from 'lucide-react';
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
  offlineEarningsLevel,
  currentOfflineEarningsFactor,
  buyOfflineEarningsLevel,
  offlineEarningsLevelCost,
  criticalClickChanceLevel,
  currentCriticalClickChance,
  buyCriticalClickChanceLevel,
  criticalClickChanceCost,
  managers,
  buyQuantity,
  easyMode,
  floatingClickValueLevel,
  floatingClickValueMultiplier,
  buyFloatingClickValue,
  currentFloatingClickValue,
  autoBuyerUnlocked,
  buyAutoBuyerUnlock,
  autoBuyerUnlockCost,
  cooldownAutoBuyerUnlocked,
  buyCooldownAutoBuyerUnlock,
  cooldownAutoBuyerUnlockCost

}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  // Crafting Unlock

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

  // Floating Click Value Premium Upgrade
  // Helper to calculate total cost for 'n' Floating Click Value upgrades
  const calculateTotalFloatingClickValueCost = (quantity) => {
    let totalCost = 0;
    let currentLevel = floatingClickValueLevel ?? 0;
    for (let i = 0; i < quantity; i++) {
      totalCost += gameConfig.premiumUpgrades.floatingClickValue.baseCost *
        Math.pow(gameConfig.premiumUpgrades.floatingClickValue.costExponent, currentLevel + i) *
        costMultiplier;
    }
    return totalCost;
  };
  const totalFloatingClickValueCost = calculateTotalFloatingClickValueCost(buyQuantity);

  // Costs for current buyQuantity
  const totalGlobalMultiplierCost = calculateTotalGlobalMultiplierCost(buyQuantity);
  const totalGlobalPriceDecreaseCost = calculateTotalGlobalPriceDecreaseCost(buyQuantity);
  const totalCriticalClickChanceCost = calculateTotalCriticalClickChanceCost(buyQuantity);
  const totalOfflineEarningsCost = calculateTotalOfflineEarningsCost(buyQuantity);


  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      {/* Premium Upgrade: AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Value AutoBuyer Unlock</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the automatic Value Upgrade buyer. Once purchased, you can enable the AutoBuyer in the Basic Upgrades tab.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            {autoBuyerUnlocked ? 'Unlocked' : 'Locked'}
          </div>
          <button
            onClick={buyAutoBuyerUnlock}
            disabled={autoBuyerUnlocked || money < autoBuyerUnlockCost}
            className={`premium-upgrade-button ${autoBuyerUnlocked || money < autoBuyerUnlockCost ? 'disabled' : ''}`}
            title={autoBuyerUnlocked ? 'Already unlocked' : 'Unlock AutoBuyer'}
          >
            {autoBuyerUnlocked ? 'Unlocked' : `${formatNumber(autoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>

      {/* Premium Upgrade: Cooldown AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Cooldown AutoBuyer Unlock</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the automatic Cooldown Upgrade buyer. Once purchased, you can enable the Cooldown AutoBuyer in the Basic Upgrades tab.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            {cooldownAutoBuyerUnlocked ? 'Unlocked' : 'Locked'}
          </div>
          <button
            onClick={buyCooldownAutoBuyerUnlock}
            disabled={cooldownAutoBuyerUnlocked || money < cooldownAutoBuyerUnlockCost}
            className={`premium-upgrade-button ${cooldownAutoBuyerUnlocked || money < cooldownAutoBuyerUnlockCost ? 'disabled' : ''}`}
            title={cooldownAutoBuyerUnlocked ? 'Already unlocked' : 'Unlock Cooldown AutoBuyer'}
          >
            {cooldownAutoBuyerUnlocked ? 'Unlocked' : `${formatNumber(cooldownAutoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Floating Click Value</h3>
        </div>
        <p className="premium-upgrade-description">
          Increases the value of the Floating Click Button. Each level multiplies the value by {gameConfig.premiumUpgrades.floatingClickValue.factor}.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {formatNumber(floatingClickValueLevel) ?? 0} (Current value: {formatNumber(floatingClickValueMultiplier) ?? 1} €)
          </div>
          <button
            onClick={() => buyFloatingClickValue(buyQuantity)}
            disabled={money < totalFloatingClickValueCost}
            className={`premium-upgrade-button ${money < totalFloatingClickValueCost ? 'disabled' : ''}`}
            title={`Kaufe ${buyQuantity} Level(s)`}
          >
            {formatNumber(totalFloatingClickValueCost)} €
          </button>
        </div>
      </div>
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
            Level: {formatNumber(globalPriceDecreaseLevel)} (Currently: x{(globalPriceDecrease ?? 1).toFixed(2)})
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
            Level: {formatNumber(criticalClickChanceLevel)} (Currently: {formatNumber(currentCriticalClickChance * 100)}%)
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
            Level: {formatNumber(offlineEarningsLevel)} (Currently: {formatNumber(currentOfflineEarningsFactor * 100)}%)
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
  {/* ...existing code... (removed unlock cards for Investments and Crafting) */}
    </div>
  );
}