import { DollarSign, Star, Percent, Landmark, Shield } from 'lucide-react';
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
  interventionsUnlockCost
}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  const globalMultiplierPercentage = getPercentage(
    gameConfig.upgrades.globalMultiplierFactor
  );

  const globalCostReductionPercentage = getPercentage(
    gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor
  );

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Manager Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description">
          Increases the value of all clicks made by managers by {globalMultiplierPercentage}%.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalMultiplierLevel} (×{formatNumber(globalMultiplier)})
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
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalPriceDecreaseLevel} (Cost Factor: ×{(globalPriceDecrease ?? 1).toFixed(2)})
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