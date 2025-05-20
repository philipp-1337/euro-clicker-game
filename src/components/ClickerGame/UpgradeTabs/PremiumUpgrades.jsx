import { DollarSign, Star, Percent, Landmark, Shield, HistoryIcon, Zap as ZapIcon } from 'lucide-react';
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
  isStateUnlocked,
  unlockState,
  unlockStateCost,
  unlockInterventions,
  isInterventionsUnlocked,
  interventionsUnlockCost,
  offlineEarningsLevel,      // New: Current level of offline earnings
  currentOfflineEarningsFactor, // New: Calculated effective factor
  buyOfflineEarningsLevel,     // New: Function to buy next level
  offlineEarningsLevelCost,   // New: Cost for the next level
  criticalClickChanceLevel,  // New: Current level of critical click chance
  currentCriticalClickChance, // New: Calculated critical click chance
  buyCriticalClickChanceLevel, // New: Function to buy next critical click chance level
  criticalClickChanceCost,   // New: Cost for the next critical click chance level
  managers, // Add managers prop
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

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Clicker Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description">
          Increases the value of all clicks by {globalMultiplierPercentage}% per level. 
          Cost increases by {globalMultiplierCostIncreasePercentage}% per level.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalMultiplierLevel} (Currently: x{formatNumber(globalMultiplier)})
          </div>
          <button
            onClick={buyGlobalMultiplier}
            disabled={money < globalMultiplierCost}
            className={`premium-upgrade-button ${money < globalMultiplierCost ? 'disabled' : ''}`}
          >
            {formatNumber(globalMultiplierCost)} €
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Percent className="premium-icon" />
          <h3>Upgrade Price Decrease</h3>
        </div>
        <p className="premium-upgrade-description">
          Reduces all basic upgrade costs by {globalCostReductionPercentage}% per level. 
          Cost increases by {globalPriceDecreaseCostIncreasePercentage}% per level.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalPriceDecreaseLevel} (Currently: x{(globalPriceDecrease ?? 1).toFixed(2)})
          </div>
          <button
            onClick={buyGlobalPriceDecrease}
            disabled={money < globalPriceDecreaseCost || isNaN(globalPriceDecreaseCost)}
            className={`premium-upgrade-button ${money < globalPriceDecreaseCost ? 'disabled' : ''}`}
          >
            {isNaN(globalPriceDecreaseCost) ? 'Error' : `${formatNumber(globalPriceDecreaseCost)} €`}
          </button>
        </div>
      </div>
      {/* Critical Click Chance Upgrade */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <ZapIcon className="premium-icon" />
          <h3>Critical Click Chance</h3>
        </div>
        <p className="premium-upgrade-description">
          Each click on the floating Euro button has a chance to grant your current income per second instead of +1€. Each level increases this chance by {criticalClickChanceEffectPercentage}%.
          Cost increases by {criticalClickChanceCostIncreasePercentage}% of the base cost per level.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {criticalClickChanceLevel} (Currently: {formatNumber(currentCriticalClickChance * 100)}% chance)
          </div>
          <button
            onClick={buyCriticalClickChanceLevel}
            disabled={money < criticalClickChanceCost || criticalClickChanceLevel >= 100 || !hasAnyManager}
            className={`premium-upgrade-button ${money < criticalClickChanceCost || criticalClickChanceLevel >= 100 || !hasAnyManager ? 'disabled' : ''}`}
            title={!hasAnyManager ? "Requires at least one manager to be purchased." : ""}
          >
            {criticalClickChanceLevel >= 100
              ? 'Max Level'
              : !hasAnyManager
                ? 'Requires Manager'
                : `${formatNumber(criticalClickChanceCost)} €`}
          </button>
        </div>
      </div>
      {/* Unlock Offline Earnings */}
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <HistoryIcon className="premium-icon" />
          <h3>Offline Earnings</h3>
        </div>
        <p className="premium-upgrade-description">
          Earn a percentage of your income per second while away. Each level increases this by {offlineEarningsEffectPerLevelPercentage}%.
          Cost increases by {offlineEarningsCostIncreasePercentage}% per level.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {offlineEarningsLevel} (Currently: {formatNumber(currentOfflineEarningsFactor * 100)}%)
          </div>
          <button
            onClick={buyOfflineEarningsLevel}
            disabled={money < offlineEarningsLevelCost}
            className={`premium-upgrade-button ${money < offlineEarningsLevelCost ? 'disabled' : ''}`}
          >
            {formatNumber(offlineEarningsLevelCost)} €
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
      {isInvestmentUnlocked && ( // Ensure Investments is unlocked before showing State & Infrastructure
        <div className="premium-upgrade-card experimental">
          <div className="premium-upgrade-header">
            <Landmark className="premium-icon" />
            <h3>State & Infrastructure</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the State & Infrastructure tab to build state.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: {isStateUnlocked ? 'Unlocked' : 'Locked'}
            </div>
            <button
              onClick={unlockState}
              disabled={money < unlockStateCost || isStateUnlocked}
              className={`premium-upgrade-button ${money < unlockStateCost || isStateUnlocked ? 'disabled' : ''}`}
            >
              {isStateUnlocked ? 'Unlocked' : `${formatNumber(unlockStateCost)} €`}
            </button>
          </div>
          <div className="experimental-label">
            Experimental Feature
          </div>
        </div>
      )}
      {/* Interventions option, only visible after State is unlocked */}
      {isStateUnlocked && (
        <div className="premium-upgrade-card experimental">
          <div className="premium-upgrade-header">
            <Shield className="premium-icon" />
            <h3>Interventions</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the Interventions tab to access special state interventions.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: {isInterventionsUnlocked ? 'Unlocked' : 'Locked'}
            </div>
            <button
              onClick={unlockInterventions}
              disabled={money < interventionsUnlockCost || isInterventionsUnlocked}
              className={`premium-upgrade-button ${money < interventionsUnlockCost || isInterventionsUnlocked ? 'disabled' : ''}`}
            >
              {isInterventionsUnlocked ? 'Unlocked' : `${formatNumber(interventionsUnlockCost)} €`}
            </button>
          </div>
          <div className="experimental-label">
            Experimental Feature
          </div>
        </div>
      )}
    </div>
  );
}