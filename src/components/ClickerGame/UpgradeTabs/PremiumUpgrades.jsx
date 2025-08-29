import { Percent, HistoryIcon, Euro, Timer, MousePointerClick, TrendingUp, Bot, ActivityIcon } from 'lucide-react';
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
  criticalHitMultiplier,
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
  cooldownAutoBuyerUnlockCost,
  globalMultiplierAutoBuyerUnlocked,
  buyGlobalMultiplierAutoBuyerUnlock,
  globalMultiplierAutoBuyerUnlockCost,
  globalPriceDecreaseAutoBuyerUnlocked,
  buyGlobalPriceDecreaseAutoBuyerUnlock,
  globalPriceDecreaseAutoBuyerUnlockCost,
}) {

  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  // Crafting Unlock

  const globalMultiplierPercentage = getPercentage(
    gameConfig.premiumUpgrades.globalMultiplier.factor,
    String(gameConfig.premiumUpgrades.globalMultiplier.factor).split(".")[1]?.length >= 2
  );

  const globalCostReductionPercentage = getPercentage(
    gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor
  );

  const offlineEarningsEffectPerLevelPercentage = getPercentage(
    1 + gameConfig.premiumUpgrades.offlineEarnings.effectPerLevel, // Convert 0.02 to 2%
    String(gameConfig.premiumUpgrades.offlineEarnings.effectPerLevel).split(".")[1]?.length >= 2
  );

  const criticalClickMultiplierPerLevelPercentage = getPercentage(
    1 + gameConfig.premiumUpgrades.criticalClickChance.multiplierPerLevel, 
    String(gameConfig.premiumUpgrades.criticalClickChance.multiplierPerLevel).split(".")[1]?.length >= 2
  );

  const criticalClickChanceEffectPercentage = getPercentage(
    1 + gameConfig.premiumUpgrades.criticalClickChance.effectPerLevel, 
    String(gameConfig.premiumUpgrades.criticalClickChance.effectPerLevel).split(".")[1]?.length >= 2
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
    if (actualQuantityToBuy <= 0) return Infinity;

    let totalCost = 0;
    let currentLevel = criticalClickChanceLevel;
    const costExponent = gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier;
    for (let i = 0; i < actualQuantityToBuy; i++) {
      totalCost += gameConfig.premiumUpgrades.criticalClickChance.baseCost *
        Math.pow(costExponent, currentLevel + i) *
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

  // Helper-Funktionen am Anfang der Komponente (vor dem return)
  const formatCriticalMultiplier = (multiplier) => {
    const safeMultiplier = isNaN(Number(multiplier)) ? 1.0 : Number(multiplier);
    return safeMultiplier.toLocaleString(undefined, {
      minimumFractionDigits: 1, 
      maximumFractionDigits: 2
    });
  };

  const getCriticalClickButtonState = () => {
    const isMaxLevel = criticalClickChanceLevel >= 100;
    const hasInsufficientFunds = money < totalCriticalClickChanceCost;
    const noBuyableAmount = actualBuyableCriticalClick <= 0;
    
    const isDisabled = hasInsufficientFunds || isMaxLevel || noBuyableAmount;
    
    let buttonText, titleText;
    
    if (isMaxLevel) {
      buttonText = 'Max Level';
      titleText = 'Max Level Reached';
    } else if (noBuyableAmount) {
      buttonText = 'Max Level with this buy';
      titleText = `Buy ${buyQuantity} level(s)`;
    } else {
      buttonText = `${formatNumber(totalCriticalClickChanceCost)} €`;
      titleText = `Buy ${actualBuyableCriticalClick} level(s)`;
    }
    
    return { isDisabled, buttonText, titleText };
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
      <h3 className="section-subtitle" style={{marginTop:24, marginBottom:12}}>Floating Clicker Upgrades</h3>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <MousePointerClick className="premium-icon" />
          <h3>Clicker Value Boost</h3>
        </div>
        <p className="premium-upgrade-description">
          Boosts the value of the Floating Clicker Button. Each level multiplies the value by {gameConfig.premiumUpgrades.floatingClickValue.factor}.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {formatNumber(floatingClickValueLevel) ?? 0} (Current value: {formatNumber(floatingClickValueMultiplier) ?? 1} €)
          </div>
          <button
            onClick={() => buyFloatingClickValue(buyQuantity)}
            disabled={money < totalFloatingClickValueCost}
            className={`premium-upgrade-button ${money < totalFloatingClickValueCost ? 'disabled' : ''}`}
            title={`Buy ${buyQuantity} level(s)`}
          >
            {formatNumber(totalFloatingClickValueCost)} €
          </button>
        </div>
      </div>
      {/* Critical Click Upgrade */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <ActivityIcon className="premium-icon" />
          <h3>Critical Hit Chance</h3>
        </div>
        <p
          className="premium-upgrade-description"
          title={`Cost increases by ${criticalClickChanceCostIncreasePercentage}% of the base cost per level. Max Level: 100.`}
        >
          Enables critical hits for the Floating Clicker Button. Each level increases the chance by {criticalClickChanceEffectPercentage}% and the multiplier by {criticalClickMultiplierPerLevelPercentage}. Max level: 100.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {formatNumber(criticalClickChanceLevel)} (Chance: {formatNumber(currentCriticalClickChance * 100)}%, Multiplier: {formatCriticalMultiplier(criticalHitMultiplier * 100)}%)
          </div>
          <button
            onClick={() => buyCriticalClickChanceLevel(buyQuantity)}
            disabled={getCriticalClickButtonState().isDisabled}
            className={`premium-upgrade-button ${getCriticalClickButtonState().isDisabled ? 'disabled' : ''}`}
            title={getCriticalClickButtonState().titleText}
          >
            {getCriticalClickButtonState().buttonText}
          </button>
        </div>
      </div>
      <h3 className="section-subtitle" style={{marginTop:24, marginBottom:12}}>Global Clicker Upgrades</h3>
      {/* Global Multiplier Upgrade */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <TrendingUp className="premium-icon" />
          <h3>Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${globalMultiplierCostIncreasePercentage}% per level.`}>
          Increases the value of all coloured Clicker Buttons by {globalMultiplierPercentage}% per level.
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
      {/* Global Price Decrease Upgrade */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Percent className="premium-icon" />
          <h3>Upgrade Discount</h3>
        </div>
        <p className="premium-upgrade-description" title={`Cost increases by ${globalPriceDecreaseCostIncreasePercentage}% per level.`}>
          Reduces the cost of all basic upgrades by {globalCostReductionPercentage}% per level.
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
      <h3 className="section-subtitle" style={{marginTop:24, marginBottom:12}}>Passive Upgrades</h3>
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
      <h3 className="section-subtitle" style={{marginTop:24, marginBottom:12}}>Automation Upgrades</h3>
      {/* Premium Upgrade: AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Euro className="premium-icon" />
          <h3>Auto-Buyer: Value</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the Value Upgrade Auto-Buyer. Automatically purchases the cheapest value upgrade when enabled via the <Bot size={12}/> icon in the header.
        </p>
        <div className="premium-upgrade-info auto-buyer-info">
          <button
            onClick={buyAutoBuyerUnlock}
            disabled={autoBuyerUnlocked || money < autoBuyerUnlockCost}
            className={`premium-upgrade-button ${autoBuyerUnlocked || money < autoBuyerUnlockCost ? 'disabled' : ''}`}
            title={autoBuyerUnlocked ? 'Already unlocked' : 'Unlock Auto-Buyer: Value'}
          >
            {autoBuyerUnlocked ? 'Unlocked' : `${formatNumber(autoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>

      {/* Premium Upgrade: Cooldown AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Timer className="premium-icon" />
          <h3>Auto-Buyer: Cooldown</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the Cooldown Upgrade Auto-Buyer. Automatically purchases the cheapest cooldown upgrade when enabled via the <Bot size={12}/> icon in the header.
        </p>
        <div className="premium-upgrade-info auto-buyer-info">
          <button
            onClick={buyCooldownAutoBuyerUnlock}
            disabled={cooldownAutoBuyerUnlocked || money < cooldownAutoBuyerUnlockCost}
            className={`premium-upgrade-button ${cooldownAutoBuyerUnlocked || money < cooldownAutoBuyerUnlockCost ? 'disabled' : ''}`}
            title={cooldownAutoBuyerUnlocked ? 'Already unlocked' : 'Unlock Auto-Buyer: Cooldown'}
          >
            {cooldownAutoBuyerUnlocked ? 'Unlocked' : `${formatNumber(cooldownAutoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>

      {/* Premium Upgrade: Global Multiplier AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <TrendingUp className="premium-icon" />
          <h3>Auto-Buyer: Multiplier</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the Global Value Multiplier Auto-Buyer. Automatically purchases the global value multiplier premium upgrade when enabled via the <Bot size={12}/> icon in the header.
        </p>
        <div className="premium-upgrade-info auto-buyer-info">
          <button
            onClick={buyGlobalMultiplierAutoBuyerUnlock}
            disabled={globalMultiplierAutoBuyerUnlocked || money < globalMultiplierAutoBuyerUnlockCost}
            className={`premium-upgrade-button ${globalMultiplierAutoBuyerUnlocked || money < globalMultiplierAutoBuyerUnlockCost ? 'disabled' : ''}`}
            title={globalMultiplierAutoBuyerUnlocked ? 'Already unlocked' : 'Unlock Auto-Buyer: Multiplier'}
          >
            {globalMultiplierAutoBuyerUnlocked ? 'Unlocked' : `${formatNumber(globalMultiplierAutoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>

      {/* Premium Upgrade: Global Price Decrease AutoBuyer Unlock */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Percent className="premium-icon" />
          <h3>Auto-Buyer: Discount</h3>
        </div>
        <p className="premium-upgrade-description">
          Unlocks the Global Discount Auto-Buyer. Automatically purchases the global discount premium upgrade when enabled via the <Bot size={12}/> icon in the header.
        </p>
        <div className="premium-upgrade-info auto-buyer-info">
          <button
            onClick={buyGlobalPriceDecreaseAutoBuyerUnlock}
            disabled={globalPriceDecreaseAutoBuyerUnlocked || money < globalPriceDecreaseAutoBuyerUnlockCost}
            className={`premium-upgrade-button ${globalPriceDecreaseAutoBuyerUnlocked || money < globalPriceDecreaseAutoBuyerUnlockCost ? 'disabled' : ''}`}
            title={globalPriceDecreaseAutoBuyerUnlocked ? 'Already unlocked' : 'Unlock Auto-Buyer: Discount'}
          >
            {globalPriceDecreaseAutoBuyerUnlocked ? 'Unlocked' : `${formatNumber(globalPriceDecreaseAutoBuyerUnlockCost)} €`}
          </button>
        </div>
      </div>
    </div>
  );
}
